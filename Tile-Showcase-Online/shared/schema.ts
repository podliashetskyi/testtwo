import { sql } from "drizzle-orm";
import { pgTable, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const portfolioProjects = pgTable("portfolio_projects", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  slug: text("slug").notNull().unique(),
  titleNo: text("title_no").notNull(),
  titleEn: text("title_en").notNull(),
  descriptionNo: text("description_no").notNull(),
  descriptionEn: text("description_en").notNull(),
  shortDescriptionNo: text("short_description_no").notNull(),
  shortDescriptionEn: text("short_description_en").notNull(),
  categoryNo: text("category_no").notNull(),
  categoryEn: text("category_en").notNull(),
  coverImage: text("cover_image").notNull(),
  images: text("images").array().notNull().default(sql`'{}'::text[]`),
  featured: boolean("featured").default(false),
});

export const blogPosts = pgTable("blog_posts", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  slug: text("slug").notNull().unique(),
  titleNo: text("title_no").notNull(),
  titleEn: text("title_en").notNull(),
  excerptNo: text("excerpt_no").notNull(),
  excerptEn: text("excerpt_en").notNull(),
  contentNo: text("content_no").notNull(),
  contentEn: text("content_en").notNull(),
  coverImage: text("cover_image").notNull(),
  categoryNo: text("category_no").notNull(),
  categoryEn: text("category_en").notNull(),
  publishedAt: timestamp("published_at").defaultNow(),
});

export const services = pgTable("services", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  slug: text("slug").notNull().unique(),
  titleNo: text("title_no").notNull(),
  titleEn: text("title_en").notNull(),
  excerptNo: text("excerpt_no").notNull(),
  excerptEn: text("excerpt_en").notNull(),
  contentNo: text("content_no").notNull(),
  contentEn: text("content_en").notNull(),
  image: text("image"),
  icon: text("icon"),
  featured: boolean("featured").default(false),
});

export const reviews = pgTable("reviews", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  authorName: text("author_name").notNull(),
  rating: integer("rating").notNull(),
  textNo: text("text_no").notNull(),
  textEn: text("text_en").notNull(),
  featured: boolean("featured").default(true),
});

export const heroContent = pgTable("hero_content", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  pageKey: text("page_key").notNull().unique(),
  titleNo: text("title_no").notNull(),
  titleEn: text("title_en").notNull(),
  subtitleNo: text("subtitle_no"),
  subtitleEn: text("subtitle_en"),
  descriptionNo: text("description_no"),
  descriptionEn: text("description_en"),
});

export const siteSettings = pgTable("site_settings", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  key: text("key").notNull().unique(),
  valueNo: text("value_no").notNull(),
  valueEn: text("value_en").notNull(),
});

export const contactSubmissions = pgTable("contact_submissions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPortfolioSchema = createInsertSchema(portfolioProjects);
export const insertBlogPostSchema = createInsertSchema(blogPosts);
export const insertServiceSchema = createInsertSchema(services);
export const insertReviewSchema = createInsertSchema(reviews);
export const insertHeroContentSchema = createInsertSchema(heroContent);
export const insertSiteSettingSchema = createInsertSchema(siteSettings);

export type PortfolioProject = typeof portfolioProjects.$inferSelect;
export type InsertPortfolioProject = z.infer<typeof insertPortfolioSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type HeroContent = typeof heroContent.$inferSelect;
export type InsertHeroContent = z.infer<typeof insertHeroContentSchema>;
export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = z.infer<typeof insertSiteSettingSchema>;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;
