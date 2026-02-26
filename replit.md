# Max Flis & Bad AS - Business Card Website

## Overview
A professional bilingual (Norwegian/English) business card website for Max Flis & Bad AS, a tile installation company. Features a black and yellow color scheme with portfolio showcase, blog, services pages, contact form, and customer reviews. All content is stored in PostgreSQL and managed through an admin panel with full bilingual support. Home page sections randomize featured content on each page load.

## Tech Stack
- Frontend: React + TypeScript + Vite + TailwindCSS + Shadcn UI
- Backend: Express.js + Node.js
- Database: PostgreSQL with Drizzle ORM
- Session: express-session + connect-pg-simple
- Routing: wouter
- SEO: react-helmet-async (meta tags, OG, Twitter, JSON-LD)

## Pages
- `/` - Home page (hero, services, featured portfolio, reviews, contact form) - randomized content
- `/services` - All services grid
- `/services/:slug` - Individual service detail
- `/portfolio` - All portfolio projects grid
- `/portfolio/:slug` - Individual project detail with image gallery
- `/blog` - Blog listing page
- `/blog/:slug` - Individual blog post
- `/#contact` - Contact form section on home page
- `/admin/login` - Admin login page
- `/admin` - Admin panel (dashboard, portfolio, blog, services, reviews, hero content, settings, contacts)

## Bilingual Support
- Language context (`client/src/lib/language.tsx`) with NO/EN toggle
- Default language: Norwegian (no)
- All content tables have `_no` and `_en` field suffixes
- `t(item, field)` helper picks correct language variant
- `ui(key, lang)` for static UI text translations
- Language switcher in navbar (globe icon)

## Key Files
- `shared/schema.ts` - Database schema (portfolioProjects, blogPosts, services, reviews, heroContent, siteSettings, contactSubmissions)
- `server/routes.ts` - All API routes with session auth middleware, robots.txt, sitemap.xml
- `server/storage.ts` - Database storage layer (full CRUD for all types)
- `server/seed.ts` - Seed script for initial bilingual data
- `server/db.ts` - Database connection
- `client/src/lib/language.tsx` - Language context, provider, helper functions, UI text dictionary
- `client/src/components/seo.tsx` - SEO head component (title, meta, OG, JSON-LD)
- `client/src/App.tsx` - Main app with routing (admin pages skip navbar/footer)
- `client/src/pages/admin.tsx` - Full admin panel (all content types with bilingual forms)
- `client/src/pages/admin-login.tsx` - Admin login page
- `client/src/components/navbar.tsx` - Navigation bar with language switcher
- `client/src/components/footer.tsx` - Footer with social links from settings

## Database Tables
- `portfolio_projects` - titleNo/En, descriptionNo/En, shortDescriptionNo/En, categoryNo/En, slug, coverImage, images[], featured
- `blog_posts` - titleNo/En, excerptNo/En, contentNo/En, categoryNo/En, slug, coverImage, publishedAt
- `services` - titleNo/En, excerptNo/En, contentNo/En, slug, image, icon, featured
- `reviews` - authorName, rating, textNo/En, featured
- `hero_content` - pageKey (unique), titleNo/En, subtitleNo/En, descriptionNo/En
- `site_settings` - key (unique), valueNo, valueEn
- `contact_submissions` - name, email, phone, message, createdAt

## API Endpoints
### Public
- GET `/api/portfolio` - List all portfolio projects
- GET `/api/portfolio/featured` - List featured projects
- GET `/api/portfolio/:slug` - Get project by slug
- GET `/api/blog` - List all blog posts
- GET `/api/blog/:slug` - Get blog post by slug
- GET `/api/services` - List all services
- GET `/api/services/featured` - List featured services
- GET `/api/services/:slug` - Get service by slug
- GET `/api/reviews` - List all reviews
- GET `/api/reviews/featured` - List featured reviews
- GET `/api/hero/:pageKey` - Get hero content for page
- GET `/api/hero` - List all hero content
- GET `/api/settings` - List all site settings
- POST `/api/contact` - Submit contact form
- GET `/robots.txt` - SEO robots file
- GET `/sitemap.xml` - Dynamic sitemap

### Admin (auth required)
- POST `/api/admin/login` - Admin login
- POST `/api/admin/logout` - Admin logout
- GET `/api/admin/me` - Check admin auth status
- CRUD for: portfolio, blog, services, reviews, hero content, settings
- GET `/api/admin/contacts` - List contact submissions

## Authentication
- Single admin user with credentials stored in environment variables (ADMIN_USERNAME, ADMIN_PASSWORD)
- Session-based auth using express-session with PostgreSQL session store
- SESSION_SECRET stored as a secret

## SEO
- Every public page has unique title, meta description, canonical URL
- Open Graph and Twitter card tags on all pages
- JSON-LD structured data (LocalBusiness, BlogPosting, Service)
- robots.txt disallows /admin and /api
- sitemap.xml dynamically generated from database content
- Admin pages have noindex meta tag

## Design
- Color scheme: Black background with yellow (#f4cb45, HSL 46 90% 61%) primary accent
- Dark theme throughout (zinc-950 background)
- Open Sans font family
- Admin panel uses sidebar navigation (no public navbar/footer)
- Bilingual admin forms with side-by-side NO/EN fields
