import {
  type PortfolioProject, type InsertPortfolioProject,
  type BlogPost, type InsertBlogPost,
  type Service, type InsertService,
  type Review, type InsertReview,
  type HeroContent, type InsertHeroContent,
  type SiteSetting, type InsertSiteSetting,
  type ContactSubmission,
  portfolioProjects, blogPosts, services, reviews, heroContent, siteSettings, contactSubmissions,
} from "@shared/schema";
import { db } from "./db";
import { asc, desc, eq } from "drizzle-orm";

export interface IStorage {
  getPortfolioProjects(): Promise<PortfolioProject[]>;
  getPortfolioProjectById(id: number): Promise<PortfolioProject | undefined>;
  getPortfolioProjectBySlug(slug: string): Promise<PortfolioProject | undefined>;
  getFeaturedPortfolioProjects(): Promise<PortfolioProject[]>;
  createPortfolioProject(project: InsertPortfolioProject): Promise<PortfolioProject>;
  updatePortfolioProject(id: number, project: Partial<InsertPortfolioProject>): Promise<PortfolioProject | undefined>;
  deletePortfolioProject(id: number): Promise<boolean>;

  getBlogPosts(): Promise<BlogPost[]>;
  getBlogPostById(id: number): Promise<BlogPost | undefined>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: number): Promise<boolean>;

  getServices(): Promise<Service[]>;
  getServiceById(id: number): Promise<Service | undefined>;
  getServiceBySlug(slug: string): Promise<Service | undefined>;
  getFeaturedServices(): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: number): Promise<boolean>;

  getReviews(): Promise<Review[]>;
  getReviewById(id: number): Promise<Review | undefined>;
  getFeaturedReviews(): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: number, review: Partial<InsertReview>): Promise<Review | undefined>;
  deleteReview(id: number): Promise<boolean>;

  getHeroContent(pageKey: string): Promise<HeroContent | undefined>;
  getAllHeroContent(): Promise<HeroContent[]>;
  upsertHeroContent(content: InsertHeroContent): Promise<HeroContent>;
  deleteHeroContent(id: number): Promise<boolean>;

  getSettings(): Promise<SiteSetting[]>;
  getSetting(key: string): Promise<SiteSetting | undefined>;
  upsertSetting(setting: InsertSiteSetting): Promise<SiteSetting>;
  deleteSetting(id: number): Promise<boolean>;

  createContactSubmission(contact: { name: string; email: string; phone?: string; message: string }): Promise<ContactSubmission>;
  getContactSubmissions(): Promise<ContactSubmission[]>;
  updateContactSubmissionReadStatus(id: number, isRead: boolean): Promise<ContactSubmission | undefined>;
  deleteContactSubmission(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getPortfolioProjects(): Promise<PortfolioProject[]> {
    return db.select().from(portfolioProjects);
  }
  async getPortfolioProjectById(id: number): Promise<PortfolioProject | undefined> {
    const [project] = await db.select().from(portfolioProjects).where(eq(portfolioProjects.id, id));
    return project;
  }
  async getPortfolioProjectBySlug(slug: string): Promise<PortfolioProject | undefined> {
    const [project] = await db.select().from(portfolioProjects).where(eq(portfolioProjects.slug, slug));
    return project;
  }
  async getFeaturedPortfolioProjects(): Promise<PortfolioProject[]> {
    return db.select().from(portfolioProjects).where(eq(portfolioProjects.featured, true));
  }
  async createPortfolioProject(project: InsertPortfolioProject): Promise<PortfolioProject> {
    const [created] = await db.insert(portfolioProjects).values(project).returning();
    return created;
  }
  async updatePortfolioProject(id: number, project: Partial<InsertPortfolioProject>): Promise<PortfolioProject | undefined> {
    const [updated] = await db.update(portfolioProjects).set(project).where(eq(portfolioProjects.id, id)).returning();
    return updated;
  }
  async deletePortfolioProject(id: number): Promise<boolean> {
    const result = await db.delete(portfolioProjects).where(eq(portfolioProjects.id, id)).returning();
    return result.length > 0;
  }

  async getBlogPosts(): Promise<BlogPost[]> {
    return db.select().from(blogPosts);
  }
  async getBlogPostById(id: number): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return post;
  }
  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return post;
  }
  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const [created] = await db.insert(blogPosts).values(post).returning();
    return created;
  }
  async updateBlogPost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost | undefined> {
    const [updated] = await db.update(blogPosts).set(post).where(eq(blogPosts.id, id)).returning();
    return updated;
  }
  async deleteBlogPost(id: number): Promise<boolean> {
    const result = await db.delete(blogPosts).where(eq(blogPosts.id, id)).returning();
    return result.length > 0;
  }

  async getServices(): Promise<Service[]> {
    return db.select().from(services);
  }
  async getServiceById(id: number): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service;
  }
  async getServiceBySlug(slug: string): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.slug, slug));
    return service;
  }
  async getFeaturedServices(): Promise<Service[]> {
    return db.select().from(services).where(eq(services.featured, true));
  }
  async createService(service: InsertService): Promise<Service> {
    const [created] = await db.insert(services).values(service).returning();
    return created;
  }
  async updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined> {
    const [updated] = await db.update(services).set(service).where(eq(services.id, id)).returning();
    return updated;
  }
  async deleteService(id: number): Promise<boolean> {
    const result = await db.delete(services).where(eq(services.id, id)).returning();
    return result.length > 0;
  }

  async getReviews(): Promise<Review[]> {
    return db.select().from(reviews);
  }
  async getReviewById(id: number): Promise<Review | undefined> {
    const [review] = await db.select().from(reviews).where(eq(reviews.id, id));
    return review;
  }
  async getFeaturedReviews(): Promise<Review[]> {
    return db.select().from(reviews).where(eq(reviews.featured, true));
  }
  async createReview(review: InsertReview): Promise<Review> {
    const [created] = await db.insert(reviews).values(review).returning();
    return created;
  }
  async updateReview(id: number, review: Partial<InsertReview>): Promise<Review | undefined> {
    const [updated] = await db.update(reviews).set(review).where(eq(reviews.id, id)).returning();
    return updated;
  }
  async deleteReview(id: number): Promise<boolean> {
    const result = await db.delete(reviews).where(eq(reviews.id, id)).returning();
    return result.length > 0;
  }

  async getHeroContent(pageKey: string): Promise<HeroContent | undefined> {
    const [content] = await db.select().from(heroContent).where(eq(heroContent.pageKey, pageKey));
    return content;
  }
  async getAllHeroContent(): Promise<HeroContent[]> {
    return db.select().from(heroContent);
  }
  async upsertHeroContent(content: InsertHeroContent): Promise<HeroContent> {
    const existing = await this.getHeroContent(content.pageKey);
    if (existing) {
      const [updated] = await db.update(heroContent).set(content).where(eq(heroContent.pageKey, content.pageKey)).returning();
      return updated;
    }
    const [created] = await db.insert(heroContent).values(content).returning();
    return created;
  }
  async deleteHeroContent(id: number): Promise<boolean> {
    const result = await db.delete(heroContent).where(eq(heroContent.id, id)).returning();
    return result.length > 0;
  }

  async getSettings(): Promise<SiteSetting[]> {
    return db.select().from(siteSettings);
  }
  async getSetting(key: string): Promise<SiteSetting | undefined> {
    const [setting] = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
    return setting;
  }
  async upsertSetting(setting: InsertSiteSetting): Promise<SiteSetting> {
    const existing = await this.getSetting(setting.key);
    if (existing) {
      const [updated] = await db.update(siteSettings).set(setting).where(eq(siteSettings.key, setting.key)).returning();
      return updated;
    }
    const [created] = await db.insert(siteSettings).values(setting).returning();
    return created;
  }
  async deleteSetting(id: number): Promise<boolean> {
    const result = await db.delete(siteSettings).where(eq(siteSettings.id, id)).returning();
    return result.length > 0;
  }

  async createContactSubmission(contact: { name: string; email: string; phone?: string; message: string }): Promise<ContactSubmission> {
    const [created] = await db.insert(contactSubmissions).values(contact).returning();
    return created;
  }
  async getContactSubmissions(): Promise<ContactSubmission[]> {
    return db
      .select()
      .from(contactSubmissions)
      .orderBy(
        asc(contactSubmissions.isRead),
        desc(contactSubmissions.createdAt),
        desc(contactSubmissions.id),
      );
  }
  async updateContactSubmissionReadStatus(id: number, isRead: boolean): Promise<ContactSubmission | undefined> {
    const [updated] = await db
      .update(contactSubmissions)
      .set({ isRead })
      .where(eq(contactSubmissions.id, id))
      .returning();
    return updated;
  }
  async deleteContactSubmission(id: number): Promise<boolean> {
    const result = await db
      .delete(contactSubmissions)
      .where(eq(contactSubmissions.id, id))
      .returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
