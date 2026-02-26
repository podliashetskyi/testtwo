import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import {
  insertPortfolioSchema, insertBlogPostSchema, insertServiceSchema,
  insertReviewSchema, insertHeroContentSchema, insertSiteSettingSchema,
} from "@shared/schema";
import { z } from "zod";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import multer from "multer";
import path from "path";
import { randomUUID } from "crypto";
import fs from "fs";

const UPLOAD_DIR = path.join(process.cwd(), "client", "public", "images", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${randomUUID()}${ext}`);
    },
  }),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only .jpg, .png, and .webp images are allowed"));
  },
});

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(1),
});

declare module "express-session" {
  interface SessionData {
    isAdmin: boolean;
  }
}

function requireAdmin(req: any, res: any, next: any) {
  if (!req.session?.isAdmin) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const shouldUseSecureSessionCookie =
    process.env.SESSION_COOKIE_SECURE === "true" ||
    (process.env.SESSION_COOKIE_SECURE !== "false" &&
      process.env.NODE_ENV === "production" &&
      (process.env.SITE_URL?.startsWith("https://") ?? false));

  const PgStore = connectPgSimple(session);
  app.use(
    session({
      store: new PgStore({
        conString: process.env.DATABASE_URL,
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET!,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: shouldUseSecureSessionCookie,
        sameSite: "lax",
      },
    })
  );

  app.post("/api/admin/login", (req, res) => {
    const { username, password } = req.body;
    if (
      username === process.env.ADMIN_USERNAME &&
      password === process.env.ADMIN_PASSWORD
    ) {
      req.session.isAdmin = true;
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ message: "Session error" });
        }
        return res.json({ success: true });
      });
      return;
    }
    return res.status(401).json({ message: "Invalid credentials" });
  });

  app.post("/api/admin/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  app.get("/api/admin/me", (req, res) => {
    res.json({ isAdmin: !!req.session?.isAdmin });
  });

  app.post("/api/admin/upload", requireAdmin, (req, res) => {
    upload.single("image")(req, res, (err: any) => {
      if (err) {
        const msg = err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE"
          ? "File too large. Maximum size is 5MB."
          : err.message || "Upload failed";
        return res.status(400).json({ message: msg });
      }
      if (!req.file) return res.status(400).json({ message: "No file provided" });
      const url = `/images/uploads/${req.file.filename}`;
      return res.json({ url });
    });
  });

  app.get("/api/portfolio", async (_req, res) => {
    const projects = await storage.getPortfolioProjects();
    res.json(projects);
  });

  app.get("/api/portfolio/featured", async (_req, res) => {
    const projects = await storage.getFeaturedPortfolioProjects();
    res.json(projects);
  });

  app.get("/api/portfolio/:slug", async (req, res) => {
    const project = await storage.getPortfolioProjectBySlug(req.params.slug);
    if (!project) return res.status(404).json({ message: "Not found" });
    res.json(project);
  });

  app.post("/api/admin/portfolio", requireAdmin, async (req, res) => {
    const parsed = insertPortfolioSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.errors[0]?.message || "Invalid data" });
    }
    const project = await storage.createPortfolioProject(parsed.data);
    res.status(201).json(project);
  });

  app.put("/api/admin/portfolio/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const project = await storage.updatePortfolioProject(id, req.body);
    if (!project) return res.status(404).json({ message: "Not found" });
    res.json(project);
  });

  app.delete("/api/admin/portfolio/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const deleted = await storage.deletePortfolioProject(id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ success: true });
  });

  app.get("/api/blog", async (_req, res) => {
    const posts = await storage.getBlogPosts();
    res.json(posts);
  });

  app.get("/api/blog/:slug", async (req, res) => {
    const post = await storage.getBlogPostBySlug(req.params.slug);
    if (!post) return res.status(404).json({ message: "Not found" });
    res.json(post);
  });

  app.post("/api/admin/blog", requireAdmin, async (req, res) => {
    const parsed = insertBlogPostSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.errors[0]?.message || "Invalid data" });
    }
    const post = await storage.createBlogPost(parsed.data);
    res.status(201).json(post);
  });

  app.put("/api/admin/blog/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const post = await storage.updateBlogPost(id, req.body);
    if (!post) return res.status(404).json({ message: "Not found" });
    res.json(post);
  });

  app.delete("/api/admin/blog/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteBlogPost(id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ success: true });
  });

  app.get("/api/services", async (_req, res) => {
    const allServices = await storage.getServices();
    res.json(allServices);
  });

  app.get("/api/services/featured", async (_req, res) => {
    const featured = await storage.getFeaturedServices();
    res.json(featured);
  });

  app.get("/api/services/:slug", async (req, res) => {
    const service = await storage.getServiceBySlug(req.params.slug);
    if (!service) return res.status(404).json({ message: "Not found" });
    res.json(service);
  });

  app.post("/api/admin/services", requireAdmin, async (req, res) => {
    const parsed = insertServiceSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.errors[0]?.message || "Invalid data" });
    }
    const service = await storage.createService(parsed.data);
    res.status(201).json(service);
  });

  app.put("/api/admin/services/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const service = await storage.updateService(id, req.body);
    if (!service) return res.status(404).json({ message: "Not found" });
    res.json(service);
  });

  app.delete("/api/admin/services/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteService(id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ success: true });
  });

  app.get("/api/reviews", async (_req, res) => {
    const allReviews = await storage.getReviews();
    res.json(allReviews);
  });

  app.get("/api/reviews/featured", async (_req, res) => {
    const featured = await storage.getFeaturedReviews();
    res.json(featured);
  });

  app.post("/api/admin/reviews", requireAdmin, async (req, res) => {
    const parsed = insertReviewSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.errors[0]?.message || "Invalid data" });
    }
    const review = await storage.createReview(parsed.data);
    res.status(201).json(review);
  });

  app.put("/api/admin/reviews/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const review = await storage.updateReview(id, req.body);
    if (!review) return res.status(404).json({ message: "Not found" });
    res.json(review);
  });

  app.delete("/api/admin/reviews/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteReview(id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ success: true });
  });

  app.get("/api/hero/:pageKey", async (req, res) => {
    const content = await storage.getHeroContent(req.params.pageKey);
    if (!content) return res.status(404).json({ message: "Not found" });
    res.json(content);
  });

  app.get("/api/hero", async (_req, res) => {
    const all = await storage.getAllHeroContent();
    res.json(all);
  });

  app.post("/api/admin/hero", requireAdmin, async (req, res) => {
    const parsed = insertHeroContentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.errors[0]?.message || "Invalid data" });
    }
    const content = await storage.upsertHeroContent(parsed.data);
    res.json(content);
  });

  app.put("/api/admin/hero/:id", requireAdmin, async (req, res) => {
    const parsed = insertHeroContentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.errors[0]?.message || "Invalid data" });
    }
    const content = await storage.upsertHeroContent(parsed.data);
    res.json(content);
  });

  app.delete("/api/admin/hero/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteHeroContent(id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ success: true });
  });

  app.get("/api/settings", async (_req, res) => {
    const settings = await storage.getSettings();
    res.json(settings);
  });

  app.post("/api/admin/settings", requireAdmin, async (req, res) => {
    const parsed = insertSiteSettingSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.errors[0]?.message || "Invalid data" });
    }
    const setting = await storage.upsertSetting(parsed.data);
    res.json(setting);
  });

  app.delete("/api/admin/settings/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteSetting(id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ success: true });
  });

  app.get("/api/admin/contacts", requireAdmin, async (_req, res) => {
    const submissions = await storage.getContactSubmissions();
    res.json(submissions);
  });

  app.post("/api/contact", async (req, res) => {
    const parsed = contactSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.errors[0]?.message || "Invalid data" });
    }
    const submission = await storage.createContactSubmission(parsed.data);
    res.status(201).json(submission);
  });

  const SITE_URL = process.env.SITE_URL || "https://maxflisbad.no";

  app.get("/robots.txt", (_req, res) => {
    res.type("text/plain").send(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/
Disallow: /api/

Sitemap: ${SITE_URL}/sitemap.xml
`);
  });

  app.get("/sitemap.xml", async (_req, res) => {
    const projects = await storage.getPortfolioProjects();
    const posts = await storage.getBlogPosts();
    const allServices = await storage.getServices();

    const urls = [
      { loc: "/", priority: "1.0" },
      { loc: "/portfolio", priority: "0.8" },
      { loc: "/blog", priority: "0.8" },
      { loc: "/services", priority: "0.8" },
    ];

    for (const p of projects) {
      urls.push({ loc: `/portfolio/${p.slug}`, priority: "0.6" });
    }
    for (const p of posts) {
      urls.push({ loc: `/blog/${p.slug}`, priority: "0.6" });
    }
    for (const s of allServices) {
      urls.push({ loc: `/services/${s.slug}`, priority: "0.6" });
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${SITE_URL}${u.loc}</loc>
    <priority>${u.priority}</priority>
  </url>`).join("\n")}
</urlset>`;

    res.type("application/xml").send(xml);
  });

  return httpServer;
}
