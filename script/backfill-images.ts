import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { eq } from "drizzle-orm";
import { db, pool } from "../server/db";
import { blogPosts, portfolioProjects, services } from "../shared/schema";
import {
  IMAGE_LARGE_QUALITY,
  IMAGE_LARGE_WIDTH,
  IMAGE_PREVIEW_QUALITY,
  IMAGE_PREVIEW_WIDTH,
  isCanonicalLocalImageUrl,
  isPreviewImageUrl,
  toPreviewImageUrl,
} from "../server/image-utils";

const ROOT = process.cwd();
const PUBLIC_IMAGES_DIR = path.join(ROOT, "client/public/images");
const DIST_PUBLIC_IMAGES_DIR = path.join(ROOT, "dist/public/images");
const UPLOADS_DIR = path.join(ROOT, "uploads");
const SUPPORTED_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp"]);

type BackfillStats = {
  converted: number;
  dbRowsUpdated: number;
  deletedOriginals: number;
  deletedDistOriginals: number;
  skippedMissing: number;
  skippedUnsupported: number;
};

const stats: BackfillStats = {
  converted: 0,
  dbRowsUpdated: 0,
  deletedOriginals: 0,
  deletedDistOriginals: 0,
  skippedMissing: 0,
  skippedUnsupported: 0,
};

const canonicalUrlCache = new Map<string, Promise<string>>();
const sourceFilesForDeletion = new Set<string>();
const distFilesForDeletion = new Set<string>();
let mirrorDistPublicImages = false;

function normalizeUrl(rawUrl: string) {
  return rawUrl.trim().split("?")[0].split("#")[0];
}

function toCanonicalLargeUrl(rawUrl: string): string {
  const normalized = normalizeUrl(rawUrl);
  const withoutPreview = normalized.endsWith("-sm.webp")
    ? normalized.replace(/-sm\.webp$/, ".webp")
    : normalized;
  if (withoutPreview.endsWith(".webp")) return withoutPreview;

  const ext = path.extname(withoutPreview);
  if (!ext) return `${withoutPreview}.webp`;
  return `${withoutPreview.slice(0, -ext.length)}.webp`;
}

function resolveImageFilePathFromUrl(rawUrl: string): string | null {
  const normalized = normalizeUrl(rawUrl);
  if (!normalized.startsWith("/images/")) return null;

  const relativePath = normalized.slice("/images/".length);
  if (relativePath.startsWith("uploads/")) {
    return path.join(UPLOADS_DIR, relativePath.slice("uploads/".length));
  }
  return path.join(PUBLIC_IMAGES_DIR, relativePath);
}

function isStaticPublicImageUrl(rawUrl: string): boolean {
  const normalized = normalizeUrl(rawUrl);
  return normalized.startsWith("/images/") && !normalized.startsWith("/images/uploads/");
}

function resolveDistImageFilePathFromUrl(rawUrl: string): string | null {
  const normalized = normalizeUrl(rawUrl);
  if (!isStaticPublicImageUrl(normalized)) return null;
  const relativePath = normalized.slice("/images/".length);
  return path.join(DIST_PUBLIC_IMAGES_DIR, relativePath);
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function ensureOptimizedVariants(rawUrl: string): Promise<string> {
  const normalized = normalizeUrl(rawUrl);
  if (!normalized.startsWith("/images/")) return rawUrl;

  const canonicalLargeUrl = toCanonicalLargeUrl(normalized);
  const previewUrl = toPreviewImageUrl(canonicalLargeUrl);
  const canonicalLargePath = resolveImageFilePathFromUrl(canonicalLargeUrl);
  const previewPath = resolveImageFilePathFromUrl(previewUrl);

  if (!canonicalLargePath || !previewPath) return rawUrl;

  let sourcePath = resolveImageFilePathFromUrl(normalized);
  if (!sourcePath) return rawUrl;

  if (!(await fileExists(sourcePath))) {
    if (await fileExists(canonicalLargePath)) {
      sourcePath = canonicalLargePath;
    } else {
      console.warn(`Missing source image, skipping: ${normalized}`);
      stats.skippedMissing += 1;
      return rawUrl;
    }
  }

  const sourceExt = path.extname(sourcePath).toLowerCase();
  if (!SUPPORTED_EXTENSIONS.has(sourceExt)) {
    console.warn(`Unsupported extension, skipping: ${normalized}`);
    stats.skippedUnsupported += 1;
    return rawUrl;
  }

  await fs.mkdir(path.dirname(canonicalLargePath), { recursive: true });

  const sourceBuffer = await fs.readFile(sourcePath);

  await sharp(sourceBuffer)
    .rotate()
    .resize({
      width: IMAGE_LARGE_WIDTH,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: IMAGE_LARGE_QUALITY })
    .toFile(canonicalLargePath);

  await sharp(sourceBuffer)
    .rotate()
    .resize({
      width: IMAGE_PREVIEW_WIDTH,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: IMAGE_PREVIEW_QUALITY })
    .toFile(previewPath);

  if (mirrorDistPublicImages && isStaticPublicImageUrl(canonicalLargeUrl)) {
    const distCanonicalPath = resolveDistImageFilePathFromUrl(canonicalLargeUrl);
    const distPreviewPath = resolveDistImageFilePathFromUrl(previewUrl);

    if (distCanonicalPath && distPreviewPath) {
      await fs.mkdir(path.dirname(distCanonicalPath), { recursive: true });
      await fs.mkdir(path.dirname(distPreviewPath), { recursive: true });
      await fs.copyFile(canonicalLargePath, distCanonicalPath);
      await fs.copyFile(previewPath, distPreviewPath);
    }
  }

  if (sourcePath !== canonicalLargePath && sourcePath !== previewPath) {
    sourceFilesForDeletion.add(sourcePath);
    if (mirrorDistPublicImages) {
      const relativeToPublic = path.relative(PUBLIC_IMAGES_DIR, sourcePath);
      if (!relativeToPublic.startsWith("..") && !path.isAbsolute(relativeToPublic)) {
        distFilesForDeletion.add(path.join(DIST_PUBLIC_IMAGES_DIR, relativeToPublic));
      }
    }
  }

  stats.converted += 1;
  return canonicalLargeUrl;
}

async function migrateImageUrl(rawUrl: string): Promise<string> {
  const normalized = normalizeUrl(rawUrl);
  const cached = canonicalUrlCache.get(normalized);
  if (cached) return cached;

  const pending = ensureOptimizedVariants(normalized)
    .then((result) => {
      const canonical = toCanonicalLargeUrl(result);
      return canonical;
    })
    .catch((err) => {
      console.error(`Failed to process image ${normalized}:`, err);
      return rawUrl;
    });

  canonicalUrlCache.set(normalized, pending);
  return pending;
}

async function backfillDatabaseImages() {
  const allProjects = await db.select().from(portfolioProjects);
  for (const project of allProjects) {
    const newCoverImage = await migrateImageUrl(project.coverImage);
    const newImages: string[] = [];
    for (const imageUrl of project.images || []) {
      newImages.push(await migrateImageUrl(imageUrl));
    }

    const imagesChanged =
      newImages.length !== (project.images || []).length ||
      newImages.some((value, idx) => value !== (project.images || [])[idx]);
    if (newCoverImage !== project.coverImage || imagesChanged) {
      await db
        .update(portfolioProjects)
        .set({
          coverImage: newCoverImage,
          images: newImages,
        })
        .where(eq(portfolioProjects.id, project.id));
      stats.dbRowsUpdated += 1;
    }
  }

  const allPosts = await db.select().from(blogPosts);
  for (const post of allPosts) {
    const newCoverImage = await migrateImageUrl(post.coverImage);
    if (newCoverImage !== post.coverImage) {
      await db
        .update(blogPosts)
        .set({ coverImage: newCoverImage })
        .where(eq(blogPosts.id, post.id));
      stats.dbRowsUpdated += 1;
    }
  }

  const allServices = await db.select().from(services);
  for (const service of allServices) {
    if (!service.image) continue;
    const newImage = await migrateImageUrl(service.image);
    if (newImage !== service.image) {
      await db
        .update(services)
        .set({ image: newImage })
        .where(eq(services.id, service.id));
      stats.dbRowsUpdated += 1;
    }
  }
}

async function backfillStaticPublicImages() {
  const entries = await fs.readdir(PUBLIC_IMAGES_DIR, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const ext = path.extname(entry.name).toLowerCase();
    if (!SUPPORTED_EXTENSIONS.has(ext)) continue;
    if (entry.name.endsWith("-sm.webp")) continue;

    const url = `/images/${entry.name}`;
    if (!isCanonicalLocalImageUrl(url) || isPreviewImageUrl(url)) continue;
    await migrateImageUrl(url);
  }
}

async function deleteOriginals() {
  for (const filePath of sourceFilesForDeletion) {
    if (!(await fileExists(filePath))) continue;
    await fs.unlink(filePath);
    stats.deletedOriginals += 1;
  }

  if (mirrorDistPublicImages) {
    for (const distPath of distFilesForDeletion) {
      if (!(await fileExists(distPath))) continue;
      await fs.unlink(distPath);
      stats.deletedDistOriginals += 1;
    }
  }
}

async function main() {
  mirrorDistPublicImages = await fileExists(DIST_PUBLIC_IMAGES_DIR);
  console.log("Backfilling image variants and DB references...");
  console.log(`Dist mirror enabled: ${mirrorDistPublicImages ? "yes" : "no"}`);
  await backfillDatabaseImages();
  await backfillStaticPublicImages();
  await deleteOriginals();

  console.log("Backfill complete.");
  console.log(`Converted sources: ${stats.converted}`);
  console.log(`DB rows updated: ${stats.dbRowsUpdated}`);
  console.log(`Deleted originals: ${stats.deletedOriginals}`);
  console.log(`Deleted dist originals: ${stats.deletedDistOriginals}`);
  console.log(`Skipped missing: ${stats.skippedMissing}`);
  console.log(`Skipped unsupported: ${stats.skippedUnsupported}`);
}

main()
  .catch((err) => {
    console.error("Image backfill failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end().catch(() => undefined);
  });
