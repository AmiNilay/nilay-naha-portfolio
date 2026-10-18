# 🗺️ Codebase Map & Logic Reference Guide

> **Purpose:** This document is the definitive technical directory and logic manual for the **Nilay Naha Portfolio & CMS** application. It serves as an exhaustive reference for both human engineers and AI coding agents to immediately understand every directory, file, data model, API endpoint, and architectural sub-system without having to scan the entire codebase.

---

## 📑 Table of Contents
1. [System Architecture Overview](#system-architecture-overview)
2. [High-Level Directory Topology](#high-level-directory-topology)
3. [Core Subsystem Architectures](#core-subsystem-architectures)
   - [Authentication & Edge Middleware](#1-authentication--edge-middleware)
   - [Database Connection & DNS Workaround](#2-database-connection--dns-workaround)
   - [Hybrid Asset Pipeline (GitHub API + Google Drive)](#3-hybrid-asset-pipeline-github-api--google-drive)
   - [AI Chatbot Engine (Fuzzy Matching & Resume Triggers)](#4-ai-chatbot-engine-fuzzy-matching--resume-triggers)
   - [App-Like Page Navigation & Touch Thresholding](#5-app-like-page-navigation--touch-thresholding)
   - [Web Push Notification Lifecycle](#6-web-push-notification-lifecycle)
   - [Content Protection & Anti-Theft Guard](#7-content-protection--anti-theft-guard)
   - [Markdown, KaTeX & Syntax Highlighting Engine](#8-markdown-katex--syntax-highlighting-engine)
4. [Exhaustive File-by-File Dictionary](#exhaustive-file-by-file-dictionary)
   - [Root Configuration Files](#root-configuration-files)
   - [Public Static Assets (`public/`)](#public-static-assets-public)
   - [Application Entrypoints & Layouts (`src/app/`)](#application-entrypoints--layouts-srcapp)
   - [Admin CMS Suite (`src/app/(admin)/`)](#admin-cms-suite-srcappadmin)
   - [Public Facing Pages (`src/app/(public)/`)](#public-facing-pages-srcapppublic)
   - [Backend REST API Route Handlers (`src/app/api/`)](#backend-rest-api-route-handlers-srcappapi)
   - [UI & Layout Component Library (`src/components/`)](#ui--layout-component-library-srccomponents)
   - [Core Utilities & Libraries (`src/lib/`)](#core-utilities--libraries-srclib)
   - [Data Models (`src/models/` & `src/lib/models/`)](#data-models-srcmodels--srclibmodels)
   - [TypeScript Definitions (`src/types/`)](#typescript-definitions-srctypes)
5. [Technical Pitfalls & Agent Gotchas](#technical-pitfalls--agent-gotchas)

---

## System Architecture Overview

The project is built on **Next.js 14 App Router** (Full-Stack Monolith) written in **TypeScript**, styled with **Tailwind CSS**, animated via **Framer Motion**, and backed by **MongoDB Atlas (Mongoose)**.

```
                    ┌──────────────────────────────────────────┐
                    │               Client Browser             │
                    │   (PWA, Touch Gestures, Anti-Theft Guard)│
                    └─────────────────────┬────────────────────┘
                                          │ HTTP / Cookie
                                          ▼
                    ┌──────────────────────────────────────────┐
                    │       Next.js 14 Edge Middleware         │
                    │       (Admin Auth & API Protection)      │
                    └──────────────┬───────────────────┬───────┘
                                   │                   │
                  ┌────────────────┴──────┐   ┌────────┴─────────────┐
                  ▼                       ▼   ▼                      ▼
        ┌──────────────────┐    ┌─────────────────┐    ┌──────────────────┐
        │  (public) Pages  │    │  (admin) CMS    │    │  /api/ Handlers  │
        │  Home / Blog /   │    │  Admin Suite &  │    │  CRUD, Auth,     │
        │  About / Contact │    │  Visual Editors │    │  Push, Upload    │
        └──────────────────┘    └─────────────────┘    └─────────┬────────┘
                                                                 │
                                          ┌──────────────────────┼──────────────────────┐
                                          ▼                      ▼                      ▼
                                ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
                                │  MongoDB Atlas   │   │  GitHub REST API │   │ Google Drive CDN │
                                │  (Persistent DB) │   │  (Free CDN/Files)│   │  (Failover View) │
                                └──────────────────┘   └──────────────────┘   └──────────────────┘
```

---

## High-Level Directory Topology

```
my-portfolio/
├── .env.local                   # Environment secrets (MongoDB, GitHub, VAPID, Admin)
├── index.js                     # Root PWA Service Worker (Web Push & Notification clicks)
├── next.config.js               # Next.js configuration wrapped with next-pwa and remote image hosts
├── package.json                 # Dependency manifests and scripts
├── tailwind.config.js           # Tailwind CSS theme, font family, and animation extensions
├── tsconfig.json                # TypeScript compiler config with `@/*` path mapping
├── public/                      # Static icons, manifest.json, and fallback resume PDF
└── src/
    ├── middleware.ts            # Edge router protecting `/admin/*` and mutation API routes
    ├── app/                     # App Router core: layouts, global styles, sitemaps, robots
    │   ├── (admin)/             # Route group: Protected Admin CMS dashboard & managers
    │   ├── (public)/            # Route group: Public portfolio pages & slide layout
    │   └── api/                 # REST Route Handlers for Auth, CRUD, Push, and Views
    ├── components/              # Modular UI components
    │   ├── admin/               # CMS forms, sidebars, headers, and live preview editors
    │   ├── blog/                # Reading progress, TOC, search & category controls
    │   ├── layout/              # Navbar, Footer, PageNavigation gestures
    │   ├── providers/           # ThemeProvider wrapper
    │   ├── sections/            # Hero, FeaturedProjects, Skills, ContactCTA
    │   └── ui/                  # Buttons, Cards, Chatbot, CommandPalette, Modals, etc.
    ├── lib/                     # Database connector, GitHub API client, Markdown parser, Auth
    ├── models/                  # Active Mongoose schemas (About, Post, Project, Hero, etc.)
    └── types/                   # Shared TypeScript interfaces (IProject, IBlog)
```

---

## Core Subsystem Architectures

### 1. Authentication & Edge Middleware
* **Location:** [`src/middleware.ts`](file:///e:/my-portfolio/src/middleware.ts), [`src/app/api/auth/login/route.ts`](file:///e:/my-portfolio/src/app/api/auth/login/route.ts)
* **Logic:**
  1. Incoming requests to `/admin/*` (except `/admin/login`) require the `admin_token` cookie to match `ADMIN_SECRET`. Non-matching requests are redirected to `/admin/login`.
  2. All state-mutating requests (`POST`, `PUT`, `DELETE`) hitting `/api/*` are blocked unless:
     - They match the explicit whitelist: `['/api/contact', '/api/auth/login', '/api/push/subscribe', '/api/views']`
     - OR the client provides a valid `admin_token` cookie matching `ADMIN_SECRET`.
  3. Login sets an `httpOnly`, `sameSite: "lax"`, 7-day cookie named `admin_token`.

### 2. Database Connection & DNS Workaround
* **Location:** [`src/lib/connectToDB.ts`](file:///e:/my-portfolio/src/lib/connectToDB.ts)
* **Logic:**
  - Standard Node.js DNS lookups frequently fail on Windows or custom networks for MongoDB SRV records (`_mongodb._tcp...`).
  - `connectToDB.ts` explicitly overrides DNS servers to Google (`8.8.8.8`, `8.8.4.4`) and Cloudflare (`1.1.1.1`) before connecting.
  - Maintains a global cached singleton `global.mongoose` to prevent connection leaks across Next.js Hot Module Replacement (HMR) turns.
  - **Notice:** Always import from `@/lib/connectToDB`. Do **not** use the deprecated `@/lib/db.ts`.

### 3. Hybrid Asset Pipeline (GitHub API + Google Drive)
* **Location:** [`src/lib/githubUpload.ts`](file:///e:/my-portfolio/src/lib/githubUpload.ts), [`next.config.js`](file:///e:/my-portfolio/next.config.js)
* **Logic:**
  - **Primary Storage:** Binary assets (images, resumes) are committed directly to a designated private/public GitHub repository under `public/uploads/` via the GitHub Contents API (`PUT /repos/{owner}/{repo}/contents/{path}`). The returned `raw.githubusercontent.com` URL is stored in MongoDB.
  - **Failover / Fallback:** Admin forms allow pasting Google Drive share links. API handlers automatically normalize Google Drive URLs into:
    - Thumbnails: `https://drive.google.com/thumbnail?id={FILE_ID}&sz=w1000` or `https://lh3.googleusercontent.com`
    - Previews: `https://drive.google.com/file/d/{FILE_ID}/preview`
  - Deletions in admin invoke `deleteFromGithub(url)` which fetches the file SHA and sends a `DELETE` request.

### 4. AI Chatbot Engine & 3D Interactive Cute Mascot
* **Location:** [`src/components/ui/Chatbot.tsx`](file:///e:/my-portfolio/src/components/ui/Chatbot.tsx), [`src/app/api/chatbot/route.ts`](file:///e:/my-portfolio/src/app/api/chatbot/route.ts)
* **Logic:**
  - **3D Cute Bot Mascot:** Replaces the static message icon with a hardware-accelerated 3D tactile companion. Features:
    - Real-time cursor/pointer tracking with smooth 3D head tilt (`rotateX`, `rotateY`) and pupil parallax using Framer Motion springs (`damping: 22, stiffness: 220`).
    - Expressive obsidian glass visor with glowing LED eyes, pupil catchlights, natural periodic blinking, happy smile arcs (`^ ^`), and blushing cheeks on hover.
    - Pulsing antenna beacon and status audio pods.
    - Floating levitation with synchronized breathing ground shadow (`scale`, `opacity`).
    - Rotating translucent Apple-style speech bubble pill prompts with quick-open triggers.
    - Integrated avatars in the chat modal header (thinking/ready modes) and message streams.
  - **Algorithm:** Custom implementation of **Levenshtein Distance** (maximum edit distance $\le 2$).
  - **Preprocessing:** Normalizes input, tokenizes words, and filters out common stop words (`what`, `is`, `the`, `have`, `you`, etc.) to prevent stop-word hijacking.
  - **Scoring:** Compares tokens against keyword arrays registered in the `Chatbot` MongoDB collection. The rule with the highest match score is returned.
  - **Special Triggers:** If tokens fuzzy-match `resume`, `cv`, or `download`, the bot bypasses rule queries and presents a dynamic resume download button linked to the live resume URL fetched from `/api/hero`.

### 5. App-Like Page Navigation & Touch Thresholding
* **Location:** [`src/components/layout/PageNavigation.tsx`](file:///e:/my-portfolio/src/components/layout/PageNavigation.tsx), [`src/app/(public)/HomeClient.tsx`](file:///e:/my-portfolio/src/app/(public)/HomeClient.tsx)
* **Logic:**
  - Provides a presentation-deck / mobile-native feel using Framer Motion slides across pages: `["/", "/projects", "/blog", "/about", "/contact"]`.
  - **Keyboard:** Left and Right arrow keys move across slides/pages (ignored inside `INPUT` and `TEXTAREA`).
  - **Touch / Swipe:** Prevents ghost swiping during normal scrolling by enforcing:
    1. Duration threshold: Swipes taking $> 600\text{ ms}$ are discarded (distinguishes taps/drags).
    2. Distance threshold: $|\Delta X| > 100\text{ px}$.
    3. Directional dominance: Horizontal delta must exceed vertical delta by a 2:1 ratio ($|\Delta X| > 2 \cdot |\Delta Y|$).

### 6. Web Push Notification Lifecycle
* **Location:** [`index.js`](file:///e:/my-portfolio/index.js), [`src/components/ui/PushNotificationButton.tsx`](file:///e:/my-portfolio/src/components/ui/PushNotificationButton.tsx), [`src/app/api/push/`](file:///e:/my-portfolio/src/app/api/push/)
* **Logic:**
  1. Client checks `navigator.serviceWorker.ready` and requests notification permissions.
  2. Browser generates a push subscription with ECDH keys (`p256dh`, `auth`).
  3. Client sends subscription payload to `/api/push/subscribe` (upserted in MongoDB `Subscription` collection).
  4. Admin enters title, body, and URL in `/admin/notifications` and dispatches via `/api/push/broadcast`.
  5. Route handler executes `webpush.sendNotification()` in parallel. If an endpoint returns 404/410 (expired), it is pruned from MongoDB.
  6. Service worker (`index.js`) intercepts `push` events, renders native notification with vibration, and routes users to the target URL on `notificationclick`.

### 7. Content Protection & Anti-Theft Guard
* **Location:** [`src/components/ui/ContentProtection.tsx`](file:///e:/my-portfolio/src/components/ui/ContentProtection.tsx)
* **Logic:**
  - Prevents casual theft and uncredited copying of project content and images.
  - Overrides `contextmenu` (blocks right-click).
  - Overrides `dragstart` on all `img` elements.
  - Intercepts `keydown` to block `Ctrl+C`, `Ctrl+X`, `Ctrl+U` (view source), `Ctrl+S`, `Ctrl+P`, and `F12` (devtools).
  - Globally disables CSS text selection (`user-select: none`), while selectively re-enabling it on `input` and `textarea` so visitors can submit forms.

### 8. Markdown, KaTeX & Syntax Highlighting Engine
* **Location:** [`src/lib/markdownProcessor.ts`](file:///e:/my-portfolio/src/lib/markdownProcessor.ts)
* **Logic:**
  - Uses the **Unified / Remark / Rehype** ecosystem:
    - `remarkParse` -> `remarkGfm` (tables, strikethrough, autolinks) -> `remarkMath`
    - `remarkRehype` -> `rehypeRaw` (allows embedded HTML when safe) -> `rehypeKatex` (LaTeX math rendering)
    - `rehypeHighlight` (highlight.js syntax coloring) -> `rehypeStringify`
  - Runs a post-processor `addHeadingIds` that automatically injects unique `id="slug"` attributes to all `<h1-h6>` elements so `TableOfContents.tsx` can jump to anchors smoothly.

---

## Exhaustive File-by-File Dictionary

### Root Configuration Files

| File | Purpose & Logic |
| :--- | :--- |
| [`.env.local`](file:///e:/my-portfolio/.env.local) | Environment configuration containing database credentials, GitHub tokens, VAPID push keys, and admin authentication secrets. |
| [`.gitignore`](file:///e:/my-portfolio/.gitignore) | Git exclusion patterns (ignores `node_modules`, `.next`, `.env*.local`, PWA service worker outputs, and temporary OS files). |
| [`.hintrc`](file:///e:/my-portfolio/.hintrc) | Webhint configuration for checking accessibility and cross-browser HTML compliance. |
| [`index.js`](file:///e:/my-portfolio/index.js) | **Root PWA Service Worker.** Listens for `push` events to display notifications with badge/vibration and handles `notificationclick` window focus/opening. |
| [`next-env.d.ts`](file:///e:/my-portfolio/next-env.d.ts) | Auto-generated Next.js TypeScript declarations. |
| [`next.config.js`](file:///e:/my-portfolio/next.config.js) | Wraps Next config with `next-pwa`. Whitelists remote image hosts (`avatars.githubusercontent.com`, `raw.githubusercontent.com`, `drive.google.com`, `lh3.googleusercontent.com`) and excludes build manifests from SW cache. |
| [`package.json`](file:///e:/my-portfolio/package.json) | Declares project dependencies (Next 14, React 18, Mongoose, Framer Motion, KaTeX, Unified, Web-Push, Lucide) and npm scripts (`dev`, `build`, `start`, `lint`). |
| [`postcss.config.js`](file:///e:/my-portfolio/postcss.config.js) / [`.mjs`](file:///e:/my-portfolio/postcss.config.mjs) | PostCSS plugin setup for Tailwind CSS and Autoprefixer. |
| [`tailwind.config.js`](file:///e:/my-portfolio/tailwind.config.js) | Tailwind CSS theme definitions, CSS variable bindings (`primary`, `background`, `foreground`), typography plugins, and custom animation keyframes. |
| [`tsconfig.json`](file:///e:/my-portfolio/tsconfig.json) | TypeScript configuration with strict checking and `@/*` alias pointing to `src/*`. |
| [`PROJECT_DOCUMENTATION.md`](file:///e:/my-portfolio/PROJECT_DOCUMENTATION.md) | High-level technical decisions and engineering solutions documentation. |
| [`README.md`](file:///e:/my-portfolio/README.md) | Project showcase, overview, live link, tech stack table, and local quick-start guide. |
| [`CLAUDE.md`](file:///e:/my-portfolio/CLAUDE.md) | Persistent rules and agentic loop protocol for Claude Code and coding agents. |
| [`RULES.md`](file:///e:/my-portfolio/RULES.md) | Developer guidelines and invariant rules quick-reference. |
| [`AGENTS.md`](file:///e:/my-portfolio/AGENTS.md) | Workspace rules recognized by Antigravity, Claude Code, and agentic assistants. |
| [`GEMINI.md`](file:///e:/my-portfolio/GEMINI.md) | Workspace rules discovered and loaded by Antigravity on every turn. |
| [`CODEBASE_MAP.md`](file:///e:/my-portfolio/CODEBASE_MAP.md) | Definitive file-by-file logic guide and system architecture map. |

---

### Public Static Assets (`public/`)

| File | Purpose |
| :--- | :--- |
| [`apple-touch-icon.png`](file:///e:/my-portfolio/public/apple-touch-icon.png) | iOS home-screen bookmark icon. |
| [`favicon.ico`](file:///e:/my-portfolio/public/favicon.ico) | Browser tab shortcut icon. |
| [`icon-dark.png`](file:///e:/my-portfolio/public/icon-dark.png) | Dark-mode specific favicon/app icon. |
| [`icon-light.png`](file:///e:/my-portfolio/public/icon-light.png) | Light-mode specific favicon/app icon. |
| [`manifest.json`](file:///e:/my-portfolio/public/manifest.json) | Web App Manifest configuration for PWA installation (name, icons, display mode `standalone`, theme colors). |
| [`resume.pdf`](file:///e:/my-portfolio/public/resume.pdf) | Local fallback static copy of the developer's resume PDF. |

---

### Application Entrypoints & Layouts (`src/app/`)

| File | Purpose & Logic |
| :--- | :--- |
| [`src/middleware.ts`](file:///e:/my-portfolio/src/middleware.ts) | Edge execution interceptor. Validates admin cookies for `/admin` pages and enforces authorization on mutating API routes while preserving public POST endpoints. |
| [`src/app/globals.css`](file:///e:/my-portfolio/src/app/globals.css) | Global stylesheet. Configures Tailwind base utilities, CSS theme variables, code block highlight styling, and custom scrollbar overrides. |
| [`src/app/layout.tsx`](file:///e:/my-portfolio/src/app/layout.tsx) | Root application layout. Injects Google Inter font, OpenGraph & Twitter SEO metadata, PWA manifest links, `ThemeProvider`, `Navbar`, `PageNavigation`, `CommandPalette`, and `Chatbot`. |
| [`src/app/loading.tsx`](file:///e:/my-portfolio/src/app/loading.tsx) | Global fallback loading spinner using Lucide icons during React Suspense page transitions. |
| [`src/app/not-found.tsx`](file:///e:/my-portfolio/src/app/not-found.tsx) | Custom animated 404 error page with quick navigation back to home. |
| [`src/app/robots.ts`](file:///e:/my-portfolio/src/app/robots.ts) | Metadata route generating `robots.txt` dynamically; disallows search crawlers from accessing `/admin/` and `/api/`. |
| [`src/app/sitemap.ts`](file:///e:/my-portfolio/src/app/sitemap.ts) | Metadata route generating XML sitemap dynamically by fetching all active Blog slugs and Project slugs from MongoDB. |
| [`src/app/template.tsx`](file:///e:/my-portfolio/src/app/template.tsx) | Page transition wrapper animating opacity and Y-translation on every route change with Framer Motion. |

---

### Admin CMS Suite (`src/app/(admin)/`)

| File | Purpose & Logic |
| :--- | :--- |
| [`layout.tsx`](file:///e:/my-portfolio/src/app/(admin)/layout.tsx) | Wraps all admin pages with `AdminLayoutClient` for unified sidebar, navigation, and auth guard. |
| [`admin/page.tsx`](file:///e:/my-portfolio/src/app/(admin)/admin/page.tsx) | Root admin redirector. Automatically navigates users to `/admin/dashboard`. |
| [`admin/login/page.tsx`](file:///e:/my-portfolio/src/app/(admin)/admin/login/page.tsx) | macOS Security-inspired login interface with frosted glass card, ambient radial mesh glow, window traffic controls, and spring unlock button. |
| [`admin/dashboard/page.tsx`](file:///e:/my-portfolio/src/app/(admin)/admin/dashboard/page.tsx) | Apple Bento metrics dashboard displaying real-time project counts, blog post metrics, unread inquiries counter, segmented filters, and direct reply/delete actions. |
| [`admin/home/page.tsx`](file:///e:/my-portfolio/src/app/(admin)/admin/home/page.tsx) | Visual Hero Studio. Frosted cards for headline, availability status, social links, live stat counters, profile picture cropper, and GitHub + Google Drive PDF resume uploaders. |
| [`admin/about/page.tsx`](file:///e:/my-portfolio/src/app/(admin)/admin/about/page.tsx) | Visual About Me Studio. Manages bio, location, Google Drive portrait fallback, reorderable academic journey cards, categorized technical skills, experience entries, and certifications. |
| [`admin/projects/page.tsx`](file:///e:/my-portfolio/src/app/(admin)/admin/projects/page.tsx) | Apple-designed project inventory with live search toolbar, status filter pills (All, Published, Draft, Featured), fitted thumbnails without crop, and spring delete confirmation modals. |
| [`admin/projects/[id]/page.tsx`](file:///e:/my-portfolio/src/app/(admin)/admin/projects/[id]/page.tsx) | Comprehensive project authoring tool. Features auto-slug generator, direct image uploader accepting any aspect ratio uncut with optional reframe/crop modal, Google Drive fallback processor, macOS browser frame switcher, fitted containment stages, tag management, and QuickLook preview modal. |
| [`admin/blog/page.tsx`](file:///e:/my-portfolio/src/app/(admin)/admin/blog/page.tsx) | Editorial post manager with search toolbar, category filter pills, reading time badges, copy link feedback, featured toggle, and delete confirmation modal. |
| [`admin/blog/[id]/page.tsx`](file:///e:/my-portfolio/src/app/(admin)/admin/blog/[id]/page.tsx) | Markdown & rich-text blog post editor. Features macOS QuickLook preview, auto-slug generator, cover image upload to GitHub, Google Drive fallback, tag management, project linker, word/reading counter, and SEO social metadata accordion. |
| [`admin/chatbot/page.tsx`](file:///e:/my-portfolio/src/app/(admin)/admin/chatbot/page.tsx) | Chatbot rule intelligence panel. Frosted rule composer with fuzzy keyword tag manager, bot answer preview bubbles, quick reply chips, and dynamic inline link manager. |
| [`admin/notifications/page.tsx`](file:///e:/my-portfolio/src/app/(admin)/admin/notifications/page.tsx) | Web Push notification broadcaster. Audience reach metric card, broadcast composer, and real-time interactive **Apple iOS lock-screen push notification preview**. |

---

### Public Facing Pages (`src/app/(public)/`)

| File | Purpose & Logic |
| :--- | :--- |
| [`page.tsx`](file:///e:/my-portfolio/src/app/(public)/page.tsx) | Server component shell for the homepage; provides SEO metadata and renders `HomeClient`. |
| [`HomeClient.tsx`](file:///e:/my-portfolio/src/app/(public)/HomeClient.tsx) | App-like full-screen slider containing `<Hero />`, `<ProjectsPage />`, `<BlogPage />`, `<AboutPage />`, and `<ContactPage />` with touch swipe and arrow key pagination. |
| [`about/page.tsx`](file:///e:/my-portfolio/src/app/(public)/about/page.tsx) | Server component shell providing OpenGraph metadata and rendering `AboutClient`. |
| [`about/AboutClient.tsx`](file:///e:/my-portfolio/src/app/(public)/about/AboutClient.tsx) | Apple-designed interactive executive profile featuring sticky frosted segmented sub-nav, squircle portrait card with live activity chip, At-a-Glance bento metrics, experience and academic achievement timeline cards, hardware-inspired technical arsenal, verified credentials, and Apple Studio CTA banner. |
| [`projects/page.tsx`](file:///e:/my-portfolio/src/app/(public)/projects/page.tsx) | Public projects catalog page shell with metadata. |
| [`projects/ProjectsClient.tsx`](file:///e:/my-portfolio/src/app/(public)/projects/ProjectsClient.tsx) | Apple-designed engineering works showcase featuring Spotlight live search, critically damped spring segmented filter pills (`layoutId="projectActiveFilter"`), marquee featured case study hero, tactile bento cards with macOS window chrome, and direct GitHub/Live link chips. |
| [`projects/new/page.tsx`](file:///e:/my-portfolio/src/app/(public)/projects/new/page.tsx) | Project submission form interface. |
| [`projects/[slug]/page.tsx`](file:///e:/my-portfolio/src/app/(public)/projects/[slug]/page.tsx) | Dynamic server component generating OpenGraph metadata directly via MongoDB `Project` model and rendering `ProjectDetailsClient`. |
| [`projects/[slug]/ProjectDetailsClient.tsx`](file:///e:/my-portfolio/src/app/(public)/projects/[slug]/ProjectDetailsClient.tsx) | Apple-grade case study reader featuring top reading progress bar, floating glassmorphic reading dock, Focus Mode toggle, executive summary bento metrics, macOS Terminal code blocks with copy feedback, macOS browser mockup frame, linked deep-dive blog publication card, and sticky Table of Contents. |
| [`blog/page.tsx`](file:///e:/my-portfolio/src/app/(public)/blog/page.tsx) | Blog archive server shell with metadata. |
| [`blog/BlogClient.tsx`](file:///e:/my-portfolio/src/app/(public)/blog/BlogClient.tsx) | Apple-designed editorial publication index featuring App Store Today-style featured editorial hero, translucent glassmorphic segmented controls, critically damped physics springs, Spotlight-style reactive search, and tactile physical press feedback. |
| [`blog/[slug]/page.tsx`](file:///e:/my-portfolio/src/app/(public)/blog/[slug]/page.tsx) | Dynamic server component generating OpenGraph metadata directly via MongoDB and rendering BlogPostClient. |
| [`blog/[slug]/BlogPostClient.tsx`](file:///e:/my-portfolio/src/app/(public)/blog/[slug]/BlogPostClient.tsx) | Apple-designed long-form article reader with top reading progress bar, floating translucent toolbar (back navigation, reading time, live view count, Focus Mode toggle, clipboard share), macOS window code blocks with copy action, ergonomic line-length typography, sticky Table of Contents, author profile card, and linked project case studies. |
| [`contact/page.tsx`](file:///e:/my-portfolio/src/app/(public)/contact/page.tsx) | Public contact page shell with metadata. |
| [`contact/ContactClient.tsx`](file:///e:/my-portfolio/src/app/(public)/contact/ContactClient.tsx) | Apple-designed single-screen communications studio featuring macOS window chrome composer, compact bento cards, zero-scroll desktop viewport fitting, critically damped spring physics for tactile interactions, clipboard HUD toast, and privacy guarantee capsule. |
| [`resume/page.tsx`](file:///e:/my-portfolio/src/app/(public)/resume/page.tsx) | Dedicated resume view and download page with fallbacks between dynamic uploaded resume and local static PDF. |

---

### Backend REST API Route Handlers (`src/app/api/`)

| File | Methods | Purpose & Logic |
| :--- | :--- | :--- |
| [`about/route.ts`](file:///e:/my-portfolio/src/app/api/about/route.ts) | `GET`, `PUT` | Fetches and updates developer profile information (bio, skills, education, experience). |
| [`auth/check/route.ts`](file:///e:/my-portfolio/src/app/api/auth/check/route.ts) | `GET` | Validates admin status against `x-admin-secret` header using `@/lib/auth`. |
| [`auth/login/route.ts`](file:///e:/my-portfolio/src/app/api/auth/login/route.ts) | `POST` | Validates credentials against `ADMIN_EMAIL` and `ADMIN_PASSWORD`. Sets `admin_token` cookie. |
| [`auth/logout/route.ts`](file:///e:/my-portfolio/src/app/api/auth/logout/route.ts) | `POST` | Invalidates session by setting an expired `admin_token` cookie with `maxAge: 0`. |
| [`blog/route.ts`](file:///e:/my-portfolio/src/app/api/blog/route.ts) | `GET`, `POST`, `PUT`, `DELETE` | Full CRUD for blog posts. Handles multipart form data, parses Google Drive URLs, and uploads images to GitHub via `@/lib/githubUpload`. |
| [`blog/[id]/route.ts`](file:///e:/my-portfolio/src/app/api/blog/[id]/route.ts) | `GET`, `PUT`, `DELETE` | Specific blog post lookups and mutations by MongoDB ID. |
| [`chatbot/route.ts`](file:///e:/my-portfolio/src/app/api/chatbot/route.ts) | `GET`, `POST`, `PUT`, `DELETE` | CRUD endpoints for chatbot response rules, keyword arrays, quick replies, and suggested links. |
| [`contact/route.ts`](file:///e:/my-portfolio/src/app/api/contact/route.ts) | `POST`, `GET` | Handles contact form submissions with an in-memory IP rate limiter (max 3 messages per hour). Saves messages to MongoDB `Contact` model. |
| [`hero/route.ts`](file:///e:/my-portfolio/src/app/api/hero/route.ts) | `GET`, `PUT` | Gets and updates Hero banner data, social links, stats, profile pictures, and uploaded PDF resumes. Handles asset deletion on replace. |
| [`projects/route.ts`](file:///e:/my-portfolio/src/app/api/projects/route.ts) | `GET`, `POST`, `PUT`, `DELETE` | CRUD for portfolio projects. Supports lookup by slug or ID, image upload to GitHub, and Google Drive thumbnail conversion. |
| [`push/subscribe/route.ts`](file:///e:/my-portfolio/src/app/api/push/subscribe/route.ts) | `POST` | Stores or updates Web Push subscriptions (`endpoint`, `p256dh`, `auth`) in the MongoDB `Subscription` collection. |
| [`push/broadcast/route.ts`](file:///e:/my-portfolio/src/app/api/push/broadcast/route.ts) | `GET`, `POST` | `GET` returns subscriber count. `POST` transmits push messages using VAPID keys via `web-push`, automatically pruning expired/unregistered endpoints. |
| [`views/route.ts`](file:///e:/my-portfolio/src/app/api/views/route.ts) | `POST` | Atomic counter route. Uses MongoDB `$inc: { views: 1 }` on `Post` models identified by slug. |

---

### UI & Layout Component Library (`src/components/`)

#### Admin Components (`src/components/admin/`)
* [`AdminLayoutClient.tsx`](file:///e:/my-portfolio/src/components/admin/AdminLayoutClient.tsx): macOS Sequoia-styled studio layout featuring frosted glass materials, breadcrumb navigation, production status indicators, theme adaptation, and responsive mobile drawer.
* [`AdminSidebar.tsx`](file:///e:/my-portfolio/src/components/admin/AdminSidebar.tsx): macOS dock & sidebar with window traffic light dots, categorized navigation groups (Overview, Content Studio, Intelligence), Apple spring active pill (`layoutId="adminSidebarPill"`), live portfolio link, and integrated sign-out trigger.
* [`BlogForm.tsx`](file:///e:/my-portfolio/src/components/admin/BlogForm.tsx): Apple-styled standalone post authoring component with frosted input cards and macOS QuickLook modal.
* [`AboutEditor.tsx`](file:///e:/my-portfolio/src/components/admin/AboutEditor.tsx): Legacy controlled form handling bio, skills, education, work experience, and certifications.
* [`AdminNav.tsx`](file:///e:/my-portfolio/src/components/admin/AdminNav.tsx): Legacy top header bar component.
* [`HomeEditor.tsx`](file:///e:/my-portfolio/src/components/admin/HomeEditor.tsx): Legacy hero form component.

#### Blog Components (`src/components/blog/`)
* [`BlogControls.tsx`](file:///e:/my-portfolio/src/components/blog/BlogControls.tsx): Filter toolbar with search input and category filter chips.
* [`ReadingProgress.tsx`](file:///e:/my-portfolio/src/components/blog/ReadingProgress.tsx): Fixed top horizontal progress bar tracking scroll depth through an article.
* [`TableOfContents.tsx`](file:///e:/my-portfolio/src/components/blog/TableOfContents.tsx): Sticky sidebar that extracts headings (`h2`, `h3`) from article content and highlights active heading on scroll.

#### Layout Components (`src/components/layout/`)
* [`Footer.tsx`](file:///e:/my-portfolio/src/components/layout/Footer.tsx): Global footer with copyright, status, and external social links.
* [`Navbar.tsx`](file:///e:/my-portfolio/src/components/layout/Navbar.tsx): Sticky header navigation with immediate tactile feedback, prefetching (`prefetch={true}`), custom event slide coordination on `/`, theme toggle, and responsive mobile drawer.
* [`PageNavigation.tsx`](file:///e:/my-portfolio/src/components/layout/PageNavigation.tsx): High-performance swipe and arrow-key listener orchestrating horizontal slide navigation, clickable desktop dot indicators, and edge hints on mobile.

#### Section Components (`src/components/sections/`)
* [`AboutPreview.tsx`](file:///e:/my-portfolio/src/components/sections/AboutPreview.tsx): Compact biography teaser with link to the complete `/about` page.
* [`ContactCTA.tsx`](file:///e:/my-portfolio/src/components/sections/ContactCTA.tsx): Call-to-action banner driving recruiter inquiries to `/contact`.
* [`FeaturedProjects.tsx`](file:///e:/my-portfolio/src/components/sections/FeaturedProjects.tsx): Apple-designed curated showcase card grid with continuous corners, macOS browser frame accents, direct case study links, and responsive CTAs.
* [`Hero.tsx`](file:///e:/my-portfolio/src/components/sections/Hero.tsx): Dynamic hero section with animated headlines, profile avatar, status pill, CTA buttons, and tech stack tags.
* [`ProjectsSection.tsx`](file:///e:/my-portfolio/src/components/sections/ProjectsSection.tsx): Modular project listing section.
* [`Skills.tsx`](file:///e:/my-portfolio/src/components/sections/Skills.tsx): Category-based skill grid with technology icons and proficiency badges.

#### UI Components (`src/components/ui/`)
* [`AnimatedSection.tsx`](file:///e:/my-portfolio/src/components/ui/AnimatedSection.tsx): Framer Motion scroll-reveal container.
* [`BackToTop.tsx`](file:///e:/my-portfolio/src/components/ui/BackToTop.tsx): Floating scroll-to-top button with smooth scroll behavior.
* [`Button.tsx`](file:///e:/my-portfolio/src/components/ui/Button.tsx): Reusable button with variants (`primary`, `outline`, `ghost`, `secondary`).
* [`Card.tsx`](file:///e:/my-portfolio/src/components/ui/Card.tsx): Border-gradient glassmorphic card container.
* [`Chatbot.tsx`](file:///e:/my-portfolio/src/components/ui/Chatbot.tsx): Interactive 3D Cute Bot companion with cursor/head tracking, blinking LED eyes, speech bubble teasers, Levenshtein fuzzy matching, and resume download automation.
* [`CodeBlock.tsx`](file:///e:/my-portfolio/src/components/ui/CodeBlock.tsx): Syntax-highlighted code block with language indicator and one-click copy button.
* [`CommandPalette.tsx`](file:///e:/my-portfolio/src/components/ui/CommandPalette.tsx): Global `Cmd+K` / `Ctrl+K` spotlight modal search for instant page navigation and blog search.
* [`ContentProtection.tsx`](file:///e:/my-portfolio/src/components/ui/ContentProtection.tsx): Anti-theft module disabling context menu, text selection, image drag, and devtools shortcut keys.
* [`Input.tsx`](file:///e:/my-portfolio/src/components/ui/Input.tsx): Standardized text field input with focus rings and dark mode compatibility.
* [`Modal.tsx`](file:///e:/my-portfolio/src/components/ui/Modal.tsx): Accessible dialog overlay with backdrop blur and escape key listener.
* [`PushNotificationButton.tsx`](file:///e:/my-portfolio/src/components/ui/PushNotificationButton.tsx): Bell icon button allowing visitors to subscribe/unsubscribe to Web Push alerts.
* [`SkillKeyboard.tsx`](file:///e:/my-portfolio/src/components/ui/SkillKeyboard.tsx): Interactive virtual keyboard where pressing physical or on-screen keys triggers skill highlights.
* [`StaggerContainer.tsx`](file:///e:/my-portfolio/src/components/ui/StaggerContainer.tsx): Framer Motion animation parent that staggers child item entrances.
* [`Toast.tsx`](file:///e:/my-portfolio/src/components/ui/Toast.tsx): Lightweight toast notification component for alerts.

---

### Core Utilities & Libraries (`src/lib/`)

| File | Purpose & Logic |
| :--- | :--- |
| [`auth.ts`](file:///e:/my-portfolio/src/lib/auth.ts) | Helper function `isAuthenticated(req)` checking the `x-admin-secret` header against `process.env.ADMIN_SECRET`. |
| [`connectToDB.ts`](file:///e:/my-portfolio/src/lib/connectToDB.ts) | **Active Mongoose connector.** Configures Google/Cloudflare DNS servers, manages cached connection pool, and connects to the `portfolio` database. |
| [`db.ts`](file:///e:/my-portfolio/src/lib/db.ts) | Legacy database connection utility (kept for backward compatibility; prefer `connectToDB.ts`). |
| [`githubUpload.ts`](file:///e:/my-portfolio/src/lib/githubUpload.ts) | GitHub REST API integration for uploading binary files (`uploadToGithub`) and deleting files (`deleteFromGithub`). |
| [`markdownProcessor.ts`](file:///e:/my-portfolio/src/lib/markdownProcessor.ts) | Unified / Remark / Rehype pipeline converting raw markdown to sanitized HTML with KaTeX math and automatic heading IDs. |
| [`sanitize.ts`](file:///e:/my-portfolio/src/lib/sanitize.ts) | Pass-through sanitizer stub replacing DOMPurify to prevent Vercel ESM deployment issues. |
| [`skillData.ts`](file:///e:/my-portfolio/src/lib/skillData.ts) | Master taxonomy of technical skills categorized into AI/ML, Backend, Databases, and DevOps with React Icons and brand colors. |
| [`utils.ts`](file:///e:/my-portfolio/src/lib/utils.ts) | Export of `cn(...)` combining `clsx` and `tailwind-merge` for safe conditional class construction. |
| [`models/Admin.ts`](file:///e:/my-portfolio/src/lib/models/Admin.ts) | Legacy/duplicate schema for Admin credentials. |
| [`models/Blog.ts`](file:///e:/my-portfolio/src/lib/models/Blog.ts) | Legacy/duplicate schema for Blog. |
| [`models/Project.ts`](file:///e:/my-portfolio/src/lib/models/Project.ts) | Legacy/duplicate schema for Project. |

---

### Data Models (`src/models/` & `src/lib/models/`)

> **IMPORTANT:** Always import active models from `@/models/*`. The models inside `src/lib/models/*` are legacy definitions.

| Model File | Collection | Fields & Schema Summary |
| :--- | :--- | :--- |
| [`About.ts`](file:///e:/my-portfolio/src/models/About.ts) | `abouts` | `title`, `bio`, `location`, `availability`, `skills`, `image`, `gDriveProfilePic`, `education[]`, `experience[]`, `certifications[]`. |
| [`Chatbot.ts`](file:///e:/my-portfolio/src/models/Chatbot.ts) | `chatbots` | `keywords` (string array of triggers), `answer` (bot response text). |
| [`Hero.ts`](file:///e:/my-portfolio/src/models/Hero.ts) | `heroes` | `badge`, `title`, `subtitle`, `profilePic`, `resumeUrl`, `gDriveProfilePic`, `gDriveResume`, `showAvailability`, `line1Bold`, `line1Accent`, `line2Bold`, `line2Accent`, `socialGithub`, `socialLinkedin`, `socialTwitter`, `socialEmail`, `techStack`, `stat1-3`, `portfolioLastUpdated`. |
| [`Post.ts`](file:///e:/my-portfolio/src/models/Post.ts) | `posts` | `title`, `slug` (unique), `excerpt`, `content`, `coverImage`, `gDriveImage`, `category`, `tags[]`, `published`, `readTime`, `views`, `relatedProject`. |
| [`Project.ts`](file:///e:/my-portfolio/src/models/Project.ts) | `projects` | `title`, `slug` (unique), `description`, `image`, `gDriveImage`, `tags[]`, `githubLink`, `liveLink`, `appLink`, `role`, `status`, `frameStyle`, `featured`, `publishDate`, `relatedBlog`. |
| [`Subscription.ts`](file:///e:/my-portfolio/src/models/Subscription.ts) | `subscriptions` | `endpoint` (unique push service URL), `keys: { p256dh, auth }`. |

---

### TypeScript Definitions (`src/types/`)

| File | Interface | Description |
| :--- | :--- | :--- |
| [`src/types/index.ts`](file:///e:/my-portfolio/src/types/index.ts) | `IProject` | Defines project attributes: `title`, `slug`, `description`, `content`, `techStack`, `features`, `githubUrl`, `liveUrl`, `images`, `snippets`. |
| [`src/types/index.ts`](file:///e:/my-portfolio/src/types/index.ts) | `IBlog` | Defines blog attributes: `title`, `slug`, `coverImage`, `description`, `content`, `tags`, `readTime`, `published`. |

---

## Technical Pitfalls & Agent Gotchas

1. **Duplicate Models Trap:**
   - Do **NOT** use `src/lib/models/Blog.ts` or `src/lib/models/Project.ts`.
   - Always use `src/models/Post.ts` for blogs and `src/models/Project.ts` for projects.
2. **Middleware API Whitelist:**
   - If you create a new public API endpoint that accepts `POST`, `PUT`, or `DELETE` requests from non-admin users (e.g., a newsletter or feedback form), you **MUST** add its path to `publicApiRoutes` in `src/middleware.ts`. Otherwise, the middleware will reject it with a 401 Unauthorized status.
3. **PWA Build Manifests Collision:**
   - `next-pwa` must never cache Next.js build manifests. Keep `buildExcludes: [/middleware-manifest\.json$/, /app-build-manifest\.json$/]` in `next.config.js`.
4. **Google Drive URLs:**
   - Direct `drive.google.com/uc?export=view` links are throttled or blocked by Google. Always format them to `thumbnail?id=...` or `lh3.googleusercontent.com` using the helper in API routes.
5. **DOMPurify / ESM Crash:**
   - Do not reintroduce `isomorphic-dompurify` directly in client components; it causes server-side rendering crashes in Vercel Node 18/20 environments. Use the unified pipeline or lightweight regex sanitizers.

