# Objective
Fix broken uploaded images, add portfolio detail JSON-LD, and dynamic HTML lang attribute.

# Tasks

### T001: Fix broken uploaded images by serving via Express static middleware
- **Blocked By**: []
- **Details**:
  - Currently files are saved to `client/public/images/uploads/` and the URL `/images/uploads/...` is returned. However, Vite's dev server middleware only serves files it knows about at startup — dynamically uploaded files are not picked up.
  - Fix: Add `express.static` middleware in `server/routes.ts` to serve `/images/uploads` from the UPLOAD_DIR before Vite's catch-all route takes over.
  - This also works in production since the built output includes the public directory.
  - Files: `server/routes.ts`
  - Acceptance: After uploading an image through admin, it displays correctly on public pages without needing a server restart

### T002: Add JSON-LD structured data to portfolio detail page
- **Blocked By**: []
- **Details**:
  - Add a `CreativeWork` JSON-LD schema to `client/src/pages/portfolio-detail.tsx` with name, description, image, and author (Max Flis & Bad AS).
  - Files: `client/src/pages/portfolio-detail.tsx`
  - Acceptance: Portfolio detail page renders a valid JSON-LD script tag

### T003: Dynamic HTML lang attribute based on active language
- **Blocked By**: []
- **Details**:
  - Use react-helmet-async in the language provider (`client/src/lib/language.tsx`) to set `<html lang="no">` or `<html lang="en">` dynamically when the user switches language.
  - Also update `client/index.html` default from `lang="en"` to `lang="no"` since Norwegian is the default language.
  - Files: `client/src/lib/language.tsx`, `client/index.html`
  - Acceptance: HTML lang attribute changes when language is switched
