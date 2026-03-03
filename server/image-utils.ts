import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

export const IMAGE_LARGE_WIDTH = 1600;
export const IMAGE_PREVIEW_WIDTH = 480;
export const IMAGE_LARGE_QUALITY = 78;
export const IMAGE_PREVIEW_QUALITY = 72;

function splitUrl(input: string) {
  const trimmed = input.trim();
  const qIndex = trimmed.indexOf("?");
  const hIndex = trimmed.indexOf("#");
  const cutIndex = [qIndex, hIndex].filter((idx) => idx >= 0).sort((a, b) => a - b)[0];
  if (cutIndex === undefined) return { pathOnly: trimmed, suffix: "" };
  return {
    pathOnly: trimmed.slice(0, cutIndex),
    suffix: trimmed.slice(cutIndex),
  };
}

export function isPreviewImageUrl(input: string): boolean {
  const { pathOnly } = splitUrl(input);
  return pathOnly.endsWith("-sm.webp");
}

export function toPreviewImageUrl(input: string): string {
  const { pathOnly, suffix } = splitUrl(input);
  if (pathOnly.endsWith("-sm.webp")) return input;
  if (pathOnly.endsWith(".webp")) return `${pathOnly.slice(0, -5)}-sm.webp${suffix}`;
  return input;
}

export function isCanonicalLocalImageUrl(input: string): boolean {
  const trimmed = input.trim();
  if (!trimmed.startsWith("/images/")) return false;
  if (trimmed.includes("://") || trimmed.startsWith("//")) return false;
  if (trimmed.includes("..") || trimmed.includes("\\")) return false;
  if (isPreviewImageUrl(trimmed)) return false;
  return true;
}

export async function writeOptimizedVariantsFromBuffer(
  buffer: Buffer,
  outputDir: string,
  baseName: string,
) {
  await fs.mkdir(outputDir, { recursive: true });

  const largeFilename = `${baseName}.webp`;
  const previewFilename = `${baseName}-sm.webp`;
  const largeFilePath = path.join(outputDir, largeFilename);
  const previewFilePath = path.join(outputDir, previewFilename);

  await sharp(buffer)
    .rotate()
    .resize({
      width: IMAGE_LARGE_WIDTH,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: IMAGE_LARGE_QUALITY })
    .toFile(largeFilePath);

  await sharp(buffer)
    .rotate()
    .resize({
      width: IMAGE_PREVIEW_WIDTH,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: IMAGE_PREVIEW_QUALITY })
    .toFile(previewFilePath);

  return {
    largeFilename,
    previewFilename,
    largeFilePath,
    previewFilePath,
    url: `/images/uploads/${largeFilename}`,
    previewUrl: `/images/uploads/${previewFilename}`,
  };
}

