# 🗺️ Codebase Map & Logic Reference Guide

> **Last updated:** 2026-10-22 10:21 IST — see [Change Log](#change-log).
>
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
6. [Change Log](#change-log)

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
     - They match the explicit whitelist: `['/api/contact', '/api/auth/login', '/api/auth/logout', '/api/push/subscribe', '/api/views', '/api/analytics/track', '/api/chat']`
     - OR the client provides a valid `admin_token` cookie matching `ADMIN_SECRET`.
  3. Login sets an `httpOnly`, `sameSite: "lax"`, 7-day cookie named `admin_token`.

### 2. Database Connection & DNS Workaround
* **Location:** [`src/lib/connectToDB.ts`](file:///e:/my-portfolio/src/lib/connectToDB.ts)
* **Logic:**
  - Standard Node.js DNS lookups frequently fail on Windows or custom networks for MongoDB SRV records (`_mongodb._tcp...`).
  - `connectToDB.ts` explicitly overrides DNS servers to Google (`8.8.8.8`, `8.8.4.4`) and Cloudflare (`1.1.1.1`) before connecting.
  - Maintains a global cached singleton `global.mongoose` to prevent connection leaks across Next.js Hot Module Replacement (HMR) turns.
  - **Notice:** Always import from `@/lib/connectToDB`. Do **not** use the deprecated `@/lib/db.ts`.

### 3. Dedicated Asset Pipeline (GitHub API + Google Drive)
* **Location:** [`src/lib/githubUpload.ts`](file:///e:/my-portfolio/src/lib/githubUpload.ts), [`next.config.js`](file:///e:/my-portfolio/next.config.js)
* **Logic:**
  - **Dedicated Storage Repository:** Binary assets (images, resumes) are committed directly to the dedicated asset repository [`AmiNilay/my-portfolio-assets`](https://github.com/AmiNilay/my-portfolio-assets) under `uploads/` via the GitHub Contents API (`PUT /repos/AmiNilay/my-portfolio-assets/contents/{path}`). This completely decouples media assets from the portfolio codebase so deploying code never overwrites or deletes uploaded images.
  - **Permanent CDN Delivery:** The returned `raw.githubusercontent.com/AmiNilay/my-portfolio-assets/main/uploads/{filename}` URL is stored in MongoDB.
  - **Failover / Fallback:** Admin forms allow pasting Google Drive share links. API handlers automatically normalize Google Drive URLs into:
    - Thumbnails: `https://drive.google.com/thumbnail?id={FILE_ID}&sz=w1000` or `https://lh3.googleusercontent.com`
    - Previews: `https://drive.google.com/file/d/{FILE_ID}/preview`
  - Deletions in admin invoke `deleteFromGithub(url)` which parses owner, repository, and path directly from the URL, fetches the file SHA, and sends a `DELETE` request.

### 4. Portfolio Assistant (Chatbot Engine & Human Avatar)
* **Location:** [`src/components/ui/Chatbot.tsx`](file:///e:/my-portfolio/src/components/ui/Chatbot.tsx), [`src/app/api/chatbot/route.ts`](file:///e:/my-portfolio/src/app/api/chatbot/route.ts), [`src/app/api/chat/route.ts`](file:///e:/my-portfolio/src/app/api/chat/route.ts)
* **Smart answers (free, no API key):** `POST /api/chat` (public, 60 questions/IP/hour) runs [`src/lib/chatEngine.ts`](file:///e:/my-portfolio/src/lib/chatEngine.ts), which indexes Hero, About (bio, experience, education, skills, certifications), Projects, Posts, published Testimonials and the curated `Chatbot` rules (rebuilt every 2 min). Answer order: small talk → follow-ups on the previous topic (`context`) → a project/post/company named in the question → "does he know X?" (honest when X isn't listed) → live intents (projects, experience, current role, education, skills, AI tools, contact, location, availability, certifications, blog, testimonials) unless a curated rule matches its full phrase and contains a word live intents don't cover → curated rules → BM25 full-text search → honest fallback. Returns `{ reply, links, quickReplies, context, emotion }`. No LLM; the Anthropic SDK was removed because it breaks the Next 14 build and needed a paid key.
* **Admin:** `/admin/chatbot` shows which topics are answered live, a bank of recruiter questions, and a "Test the assistant" box returning the exact visitor answer ([`ChatbotGuide.tsx`](file:///e:/my-portfolio/src/components/admin/ChatbotGuide.tsx)). Resume/cv/download stays a local, instant trigger in the widget.
* **Logic:**
  - **Human avatar assistant:** [`src/components/chatbot/HumanAvatar.tsx`](file:///e:/my-portfolio/src/components/chatbot/HumanAvatar.tsx) is a 3D-rendered style SVG character (gradient-shaded skin/hair/clothing, ambient occlusion, glossy irises, specular sphere gloss; redesigned 2026-10-22) whose pupils follow the pointer and whose head turns in CSS 3D perspective toward it, blinks naturally, and has 9 expressions: neutral, happy, excited, thinking, confused, sad, surprised, sleepy (45 s idle), annoyed (5 rapid clicks). The widget maps each reply's `emotion` to an expression; "not on the portfolio" answers show *sad*.
  - **Widget:** [`src/components/ui/Chatbot.tsx`](file:///e:/my-portfolio/src/components/ui/Chatbot.tsx) — draggable launcher with rotating teaser, Claude-style chat window (markdown-lite rendering + typewriter reveal via [`MessageContent.tsx`](file:///e:/my-portfolio/src/components/chatbot/MessageContent.tsx)), link chips, follow-up chips, starter questions, Escape to close, full-height sheet on mobile, hidden on `/admin`. Falls back to local keyword matching against `/api/chatbot` rules if `/api/chat` is unreachable.
  - **Sounds:** [`sounds.ts`](file:///e:/my-portfolio/src/components/chatbot/sounds.ts) synthesizes soft tones with the Web Audio API (no audio files). Off by default; the header speaker toggle persists the choice in `localStorage` (`chatbot_sound_enabled`).
  - **Auto-navigation (2026-10-22):** replies about one specific project or article carry `navigate` (`/projects/<slug>` or `/blog/<slug>`); the widget appends "Opening it for you…" and `router.push`es there after 1.2 s (skipped when already on that page).
  - **Smarter follow-ups (2026-10-22):** suggestion chips exclude questions the visitor already asked this session and top up from `FOLLOW_UP_POOL`, so suggestions keep moving the conversation forward.
  - **Fresh knowledge (2026-10-22):** `revalidatePublicPages()` and chatbot-rule CRUD call `invalidateKnowledge()`, so CMS edits reach answers immediately (60 s TTL otherwise).
  - **Special Triggers:** `resume` / `cv` / `résumé` is answered locally and instantly with a download button linked to the live résumé from `/api/hero` (`resumeUrl`, or the Google Drive `gDriveResume` as a view link).

### 5. App-Like Page Navigation & Touch Thresholding
* **Location:** [`src/components/layout/PageNavigation.tsx`](file:///e:/my-portfolio/src/components/layout/PageNavigation.tsx), [`src/app/(public)/HomeClient.tsx`](file:///e:/my-portfolio/src/app/(public)/HomeClient.tsx)
* **Logic:**
  - Provides a presentation-deck / mobile-native feel using Framer Motion slides across pages: `["/", "/projects", "/blog", "/about", "/contact"]`.
  - **Keyboard:** Left and Right arrow keys move across slides/pages (ignored inside `INPUT` and `TEXTAREA`).
  - **Touch / Swipe:** Prevents ghost swiping during normal scrolling by enforcing:
    1. Duration threshold: Swipes taking $> 600\text{ ms}$ are discarded (distinguishes taps/drags).
    2. Distance threshold: $|\Delta X| > 100\text{ px}$.
    3. Directional dominance: Horizontal delta must exceed vertical delta by a 2:1 ratio ($|\Delta X| > 2 \cdot |\Delta Y|$).
  - **Reload persistence (2026-10-22):** the home slider writes the active slide to the URL hash (`/#projects`, `/#blog`, `/#about`, `/#contact`) via `history.replaceState` and saves the slide's scroll offset in `sessionStorage` (`home_slide_scroll`); on load both are restored, so a refresh stays on the same section.

### 6. Web Push Notification Lifecycle
* **Location:** [`public/push-sw.js`](file:///e:/my-portfolio/public/push-sw.js), [`src/components/ui/PushNotificationButton.tsx`](file:///e:/my-portfolio/src/components/ui/PushNotificationButton.tsx), [`src/app/api/push/`](file:///e:/my-portfolio/src/app/api/push/)
* **Logic:**
  1. Button checks support first and shows a specific message when push can't work: insecure origin, unsupported browser, or iPhone/iPad not opened from the Home Screen (iOS only allows web push for installed PWAs, iOS 16.4+).
  2. Requests notification permission, then registers the **dedicated** worker `public/push-sw.js` on scope `/push/` and waits for it to activate.
  3. Subscribes with the VAPID public key (reusing an existing subscription) and POSTs it to `/api/push/subscribe` (upserted in MongoDB `Subscription`).
  4. Admin dispatches from `/admin/notifications` via `/api/push/broadcast`; 404/410 endpoints are pruned.
  5. `push-sw.js` shows the notification and focuses/opens the target URL on `notificationclick`.
* **Why a separate worker:** next-pwa generates `public/sw.js` (caching only, no `push` handler, gitignored) and is disabled in development. A dedicated worker on its own scope works in dev and prod without conflicting with it; push delivery doesn't depend on scope. Don't move push handling into `sw.js`.
* **Mobile UI:** below the `sm` breakpoint the button is an icon-only bell (`h-9 w-9`) so it doesn't crowd the navbar.

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

### 9. Performance: ISR Caching, Cache Priming & Background Prefetch
* **Location:** [`src/lib/publicData.ts`](file:///e:/my-portfolio/src/lib/publicData.ts), [`src/lib/revalidate.ts`](file:///e:/my-portfolio/src/lib/revalidate.ts), [`src/lib/clientCache.ts`](file:///e:/my-portfolio/src/lib/clientCache.ts), [`src/components/providers/CacheWarmer.tsx`](file:///e:/my-portfolio/src/components/providers/CacheWarmer.tsx)
* **Logic:**
  - Home, `/projects/[slug]`, and `/blog/[slug]` use `revalidate = 60`; the detail routes define `generateStaticParams` so every existing slug is pre-rendered at build (new slugs render on first visit, then cache).
  - Every CMS mutation handler calls `revalidatePublicPages()` (`revalidatePath("/", "layout")`) so edits go live immediately.
  - `getHeroData()` (React `cache`) is shared by Home's `generateMetadata` and page; the Hero is server-rendered from it, and `HomeClient` primes the `hero_data` client-cache key during its first render.
  - `clientCache` dedupes in-flight requests per key; `primeCache` is browser-only (the module is a server-wide singleton during SSR).
  - `CacheWarmer` (root layout, skipped on `/admin`) prefetches `hero_data`, `about_data`, `projects_catalog`, `blog_posts`, and `testimonials` at idle time, so later navigation needs no API calls.
  - **Never import `@/lib/markdownProcessor` in a client component** — it pulls unified/remark/rehype/KaTeX/highlight.js (~225 KB) into the browser bundle. Process markdown on the server.
  - The Hero profile photo uses Next image optimization for allow-listed hosts (`canOptimizeImage`), turning the ~465 KB upload into a 19–54 KB WebP.

### 10. User-Flow Analytics (Phase 3)
* **Location:** [`src/components/analytics/PageFlowTracker.tsx`](file:///e:/my-portfolio/src/components/analytics/PageFlowTracker.tsx), [`src/app/api/analytics/track/route.ts`](file:///e:/my-portfolio/src/app/api/analytics/track/route.ts), [`src/app/api/admin/analytics/flow/route.ts`](file:///e:/my-portfolio/src/app/api/admin/analytics/flow/route.ts), [`src/app/(admin)/admin/analytics/page.tsx`](file:///e:/my-portfolio/src/app/(admin)/admin/analytics/page.tsx)
* **Logic:** On each public route change the tracker POSTs `{ sessionId, path, referrerPath }` (session id and previous path live in `sessionStorage`; no cookies, no PII). The admin endpoint aggregates `PageVisit` documents into per-page visits/entries/exits/exit rate and page→page transition counts for the dashboard (7/30/90-day ranges).

### 11. Testimonials / Recommendations
* **Location:** [`src/models/Testimonial.ts`](file:///e:/my-portfolio/src/models/Testimonial.ts), [`src/app/api/testimonials/route.ts`](file:///e:/my-portfolio/src/app/api/testimonials/route.ts), [`src/components/sections/Testimonials.tsx`](file:///e:/my-portfolio/src/components/sections/Testimonials.tsx), [`src/app/(admin)/admin/testimonials/page.tsx`](file:///e:/my-portfolio/src/app/(admin)/admin/testimonials/page.tsx)
* **Logic:** Managed from `/admin/testimonials` (add, edit, publish/unpublish, order, delete). Public `GET` returns only `published: true` entries; `GET ?all=1` includes drafts **only** with a valid `admin_token` cookie (checked in the handler, since middleware doesn't guard GETs). Rendered as a "Recommendations" section on the About page; hidden entirely when nothing is published. Published testimonials also feed the AI chatbot's knowledge base.

### 12. Discoverability (SEO & AI assistants)
* **Location:** [`src/app/og-image.png/route.tsx`](file:///e:/my-portfolio/src/app/og-image.png/route.tsx), [`src/app/llms.txt/route.ts`](file:///e:/my-portfolio/src/app/llms.txt/route.ts), [`src/lib/profileData.ts`](file:///e:/my-portfolio/src/lib/profileData.ts), [`src/app/(public)/page.tsx`](file:///e:/my-portfolio/src/app/(public)/page.tsx)
* **Logic:** `/og-image.png` is generated by `ImageResponse` on the **Edge runtime** (Next 14.1's Node renderer breaks on Windows font paths) and cached for a day; every `og-image.png` metadata reference resolves to it. `getProfile()` feeds both the home page's schema.org `Person` JSON-LD (escaped with `<`) and `/llms.txt` (markdown summary for AI assistants, revalidated hourly). Since 2026-10-22, [`robots.ts`](file:///e:/my-portfolio/src/app/robots.ts) explicitly allows AI crawlers (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-User, Claude-SearchBot, PerplexityBot, Google-Extended, Applebot-Extended, CCBot), and Hero's `socialInstagram` joins GitHub/LinkedIn/X in JSON-LD `sameAs` and `/llms.txt`.

### 13. Admin MCP Server (AI agents manage the CMS) — added 2026-10-22
* **Location:** [`src/app/api/mcp/route.ts`](file:///e:/my-portfolio/src/app/api/mcp/route.ts), [`src/lib/mcpTools.ts`](file:///e:/my-portfolio/src/lib/mcpTools.ts)
* **Protocol:** Model Context Protocol over Streamable HTTP, stateless JSON responses (`initialize`, `ping`, `tools/list`, `tools/call`; notifications get `202`; `GET` is `405`). No SDK dependency, no cost.
* **Auth:** `Authorization: Bearer <ADMIN_SECRET>`, compared with `timingSafeEqual`; refused when `ADMIN_SECRET` is unset. `/api/mcp` is in `publicApiRoutes` only because agents can't hold the `admin_token` cookie — the route enforces auth itself.
* **Tools:** `list_projects`, `get_project`, `create_project`, `update_project`, `delete_project`, `list_posts`, `get_post`, `create_post`, `update_post`, `delete_post`, `get_about`, `update_about`, `get_hero`, `update_hero`. Ids accept a Mongo `_id` or slug; images are URLs / Google Drive links (Drive links converted to thumbnail URLs). Every write calls `revalidatePublicPages()`.
* **Connect (Claude Code):** `claude mcp add --transport http portfolio https://nilay-naha-portfolio.vercel.app/api/mcp --header "Authorization: Bearer <ADMIN_SECRET>"`.
* **Shared protocol:** [`src/lib/mcpProtocol.ts`](file:///e:/my-portfolio/src/lib/mcpProtocol.ts) holds JSON-RPC handling for both MCP routes.
* **Public read-only MCP (2026-10-22):** `POST /api/mcp/public` (no auth, 120 req/IP/hour via [`rateLimit.ts`](file:///e:/my-portfolio/src/lib/rateLimit.ts)) — `get_profile`, `list_projects`, `get_project`, `list_posts`, `get_post`, `search_portfolio`, `match_job_description`. Published content only. Recruiters' AI agents connect with `claude mcp add --transport http nilay-portfolio https://nilay-naha-portfolio.vercel.app/api/mcp/public`.

### 14. Recruiter Tools — added 2026-10-22
* **Job match:** `/match` page + `POST /api/match` (public, 30 req/IP/hour) → [`src/lib/jobMatch.ts`](file:///e:/my-portfolio/src/lib/jobMatch.ts): ~75 canonical skills with aliases (JS→JavaScript, Postgres→PostgreSQL, k8s→Kubernetes). Score = 75% skill coverage + 25% BM25 relevance; returns matched skills with evidence, honestly-listed missing skills, and relevant projects/experience.
* **Tailored résumé:** `/resume/tailored` (noindex) builds a one-page A4 résumé from CMS data prioritising the JD's skills; "Download PDF" = `window.print()` with print CSS. JD comes from `?jd=` or sessionStorage; `POST /api/match {jd, resume: true}` returns the data.
* **Smart search:** Command Palette toggle "Smart search (AI, on-device)" lazy-loads Transformers.js 3.7.6 from jsDelivr + `Xenova/all-MiniLM-L6-v2` ([`semanticSearch.ts`](file:///e:/my-portfolio/src/lib/semanticSearch.ts)); cosine ranking, keyword fallback, zero initial-bundle cost.
* **How I use AI:** `/ai` renders About `aiWorkflow` markdown (Admin → About); empty → honest list of selected AI tools.

### 15. Chatbot Voice & Languages — added 2026-10-22
* [`src/components/chatbot/language.ts`](file:///e:/my-portfolio/src/components/chatbot/language.ts): mic button (Web Speech recognition), read-aloud toggle (`speechSynthesis`, `chatbot_speak_enabled`), language picker (`chatbot_lang`: en, hi, bn, ta, te, mr, es, fr, de). Script-based detection for Indic languages; translation via Chrome's on-device Translator API (138+), English fallback with a note elsewhere. Nothing sent to third parties.

### 16. Project Case Studies & Evals — added 2026-10-22
* `Project` gains `problem`, `approach`, `results` (markdown), `metrics[{label,value,hint}]`, `evaluation{dataset,method,results,benchmarks[{name,score,baseline}]}`. Edited in [`CaseStudyEditor.tsx`](file:///e:/my-portfolio/src/app/(admin)/admin/projects/CaseStudyEditor.tsx); rendered by [`ProjectCaseStudy.tsx`](file:///e:/my-portfolio/src/components/projects/ProjectCaseStudy.tsx) (hidden when empty). Also settable via MCP `PROJECT_FIELDS`.

### 18. Rich Content, Drive Media, Admin Theme & Deploy Timestamp — added 2026-10-22
* **Rich content:** [`markdownProcessor.ts`](file:///e:/my-portfolio/src/lib/markdownProcessor.ts) (exports `processContent`, `mediaFigure`, `scopeCss`) renders blog, project description/case study, About `bioHtml` (from `GET /api/about`) and `/ai`. HTML-first content skips Markdown parsing. Media lines `::image|gif|video|embed[Caption](url)` and bare Drive/YouTube links → `<figure class="media-frame">`. Sanitiser allows design HTML, safe inline styles, scoped `<style>`, iframes only from Drive/Docs/YouTube/Vimeo/CodePen/CodeSandbox/StackBlitz. Design classes live in the *Rich content* section of `globals.css`. Admin editors preview via `POST /api/admin/preview` + [`RichPreview.tsx`](file:///e:/my-portfolio/src/components/admin/RichPreview.tsx). Authoring guide: [`AI_CONTENT_PROMPT.md`](file:///e:/my-portfolio/AI_CONTENT_PROMPT.md).
* **Drive media:** [`driveMedia.ts`](file:///e:/my-portfolio/src/lib/driveMedia.ts) + [`MediaFrame.tsx`](file:///e:/my-portfolio/src/components/ui/MediaFrame.tsx) (image / animated GIF / Drive video preview / mp4 / YouTube). Used for covers, logos, college images, testimonials, Home and About media. `#gif` / `#video` suffix hints on Drive links.
* **Separate Home vs About media:** About renders `About.gDriveProfilePic` → `About.image` → falls back to Hero media only when empty.
* **Admin always light:** inline pre-paint script in `(admin)/layout.tsx` + `AdminLayoutClient` MutationObserver strip `dark` on `/admin`; visitor theme restored on exit.
* **Last updated:** `next.config.js` → `NEXT_PUBLIC_LAST_DEPLOYED` (latest commit time via `git log -1`, fallback build time) via [`lastDeployed.ts`](file:///e:/my-portfolio/src/lib/lastDeployed.ts); shown in Hero (IST) and Admin → Home.

### 17. Hero Tech Marquee & Education Media — added 2026-10-22
* Hero tech chips auto-scroll continuously; list (chip editor, reorder) and `techMarqueeSpeed` (seconds per loop, default 40) edited in Admin → Home. Inline animation so Windows reduced-motion halves speed instead of freezing. Hero no longer clips at md widths/short heights (removed `h-full md:overflow-hidden`; avatar `clamp(132px, min(26vw, 42dvh), 380px)`).
* Education entries gain `institutionLinkedin`, `location`, `image` (large 16:9 banner on About). Skill catalog ([`skillData.ts`](file:///e:/my-portfolio/src/lib/skillData.ts)) expanded 62 → 172 incl. mobile, automation/scraping, Bitbucket, cloud/DevOps, testing.

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
| [`admin/home/page.tsx`](file:///e:/my-portfolio/src/app/(admin)/admin/home/page.tsx) | Visual Hero Studio. Frosted cards for browser tab title/SEO metadata, headline, availability status, social links, live stat counters, profile picture cropper, and GitHub + Google Drive PDF resume uploaders. |
| [`admin/about/page.tsx`](file:///e:/my-portfolio/src/app/(admin)/admin/about/page.tsx) | Visual About Me Studio. Manages bio, location, Google Drive portrait fallback, reorderable academic journey cards, categorized technical skills, experience entries, and certifications. |
| [`admin/projects/page.tsx`](file:///e:/my-portfolio/src/app/(admin)/admin/projects/page.tsx) | Apple-designed project inventory with live search toolbar, status filter pills (All, Published, Draft, Featured), fitted thumbnails without crop, and spring delete confirmation modals. |
| [`admin/projects/[id]/page.tsx`](file:///e:/my-portfolio/src/app/(admin)/admin/projects/[id]/page.tsx) | Comprehensive project authoring tool. Features auto-slug generator, direct image uploader accepting any aspect ratio uncut with optional reframe/crop modal, Google Drive fallback processor, macOS browser frame switcher, fitted containment stages, tag management, and QuickLook preview modal. |
| [`admin/blog/page.tsx`](file:///e:/my-portfolio/src/app/(admin)/admin/blog/page.tsx) | Editorial post manager with search toolbar, category filter pills, reading time badges, copy link feedback, featured toggle, and delete confirmation modal. |
| [`admin/blog/[id]/page.tsx`](file:///e:/my-portfolio/src/app/(admin)/admin/blog/[id]/page.tsx) | Markdown & rich-text blog post editor. Features macOS QuickLook preview, auto-slug generator, cover image upload to GitHub, Google Drive fallback, tag management, project linker, word/reading counter, and SEO social metadata accordion. |
| [`admin/chatbot/page.tsx`](file:///e:/my-portfolio/src/app/(admin)/admin/chatbot/page.tsx) | Chatbot rule intelligence panel. Frosted rule composer with fuzzy keyword tag manager, bot answer preview bubbles, quick reply chips, and dynamic inline link manager. |
| [`admin/analytics/page.tsx`](file:///e:/my-portfolio/src/app/(admin)/admin/analytics/page.tsx) | User-flow dashboard: sessions, page views, top page→page transitions, drop-off by page. |
| [`admin/testimonials/page.tsx`](file:///e:/my-portfolio/src/app/(admin)/admin/testimonials/page.tsx) | Testimonial manager: add/edit, publish/unpublish, ordering, delete. |
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
| [`projects/[slug]/page.tsx`](file:///e:/my-portfolio/src/app/(public)/projects/[slug]/page.tsx) | Dynamic server component pre-fetching project details, neighbor links, and server-side markdown transformation for instantaneous zero-waterfall page rendering with OpenGraph metadata. |
| [`projects/[slug]/ProjectDetailsClient.tsx`](file:///e:/my-portfolio/src/app/(public)/projects/[slug]/ProjectDetailsClient.tsx) | Apple-grade case study reader accepting instant server-prefetched data, top reading progress bar, floating glassmorphic reading dock, Focus Mode toggle, executive summary bento metrics, macOS Terminal code blocks with copy feedback, macOS browser mockup frame, linked deep-dive blog publication card, and sticky Table of Contents. |
| [`blog/page.tsx`](file:///e:/my-portfolio/src/app/(public)/blog/page.tsx) | Blog archive server shell with metadata. |
| [`blog/BlogClient.tsx`](file:///e:/my-portfolio/src/app/(public)/blog/BlogClient.tsx) | Apple-designed editorial publication index featuring App Store Today-style featured editorial hero, translucent glassmorphic segmented controls, critically damped physics springs, Spotlight-style reactive search, instant prefetching on article links, and tactile physical press feedback. |
| [`blog/[slug]/page.tsx`](file:///e:/my-portfolio/src/app/(public)/blog/[slug]/page.tsx) | Dynamic server component pre-fetching article data and author metadata directly on the server to pass to `BlogPostClient` for instantaneous, zero-delay rendering with OpenGraph metadata. |
| [`blog/[slug]/BlogPostClient.tsx`](file:///e:/my-portfolio/src/app/(public)/blog/[slug]/BlogPostClient.tsx) | Apple-designed long-form article reader with instant server hydration, top reading progress bar, floating translucent toolbar (back navigation, reading time, live view count, Focus Mode toggle, clipboard share), macOS window code blocks with copy action, ergonomic line-length typography, sticky Table of Contents, author profile card, and linked project case studies. |
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
| [`chat/route.ts`](file:///e:/my-portfolio/src/app/api/chat/route.ts) | `POST` (public) | Free portfolio assistant (`src/lib/chatEngine.ts`) answering from live CMS content; rate-limited per IP. |
| [`upload/route.ts`](file:///e:/my-portfolio/src/app/api/upload/route.ts) | `POST` (admin) | Image upload (PNG/JPG/WebP/SVG/GIF, ≤3 MB) to the GitHub assets repo; used for company logos. |
| [`testimonials/route.ts`](file:///e:/my-portfolio/src/app/api/testimonials/route.ts) | `GET`, `POST`, `PUT`, `DELETE` | Testimonial CRUD. Public GET = published only; `?all=1` + admin cookie includes drafts. |
| [`analytics/track/route.ts`](file:///e:/my-portfolio/src/app/api/analytics/track/route.ts) | `POST` (public) | Records a `PageVisit` (session id, path, previous path). |
| [`admin/analytics/flow/route.ts`](file:///e:/my-portfolio/src/app/api/admin/analytics/flow/route.ts) | `GET` | Aggregated user-flow stats for `/admin/analytics` (`?days=` 7, 30, or 90). |
| [`mcp/route.ts`](file:///e:/my-portfolio/src/app/api/mcp/route.ts) | `POST` (bearer token) | Admin MCP server for AI agents (see subsystem 13). |
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
* [`Navbar.tsx`](file:///e:/my-portfolio/src/components/layout/Navbar.tsx): Apple-designed floating glass capsule navigation with continuous rounded geometry, Framer Motion sliding spring indicator (`layoutId="navbar-active-pill"`), dual-mode route & slide awareness (`/` slide syncing and standalone route matching), theme switcher, and mobile glass sheet drawer.
* [`PageNavigation.tsx`](file:///e:/my-portfolio/src/components/layout/PageNavigation.tsx): High-performance swipe and arrow-key listener orchestrating horizontal slide navigation, clickable desktop dot indicators synchronized with active slides, and edge hints on mobile.

#### Section Components (`src/components/sections/`)
* [`AboutPreview.tsx`](file:///e:/my-portfolio/src/components/sections/AboutPreview.tsx): Compact biography teaser with link to the complete `/about` page.
* [`ContactCTA.tsx`](file:///e:/my-portfolio/src/components/sections/ContactCTA.tsx): Call-to-action banner driving recruiter inquiries to `/contact`.
* [`FeaturedProjects.tsx`](file:///e:/my-portfolio/src/components/sections/FeaturedProjects.tsx): Apple-designed curated showcase card grid with continuous corners, macOS browser frame accents, direct case study links, and responsive CTAs.
* [`Hero.tsx`](file:///e:/my-portfolio/src/components/sections/Hero.tsx): Dynamic hero section with animated headlines, profile avatar, status pill, CTA buttons, and tech stack tags. Accepts server-rendered `initialData`.
* [`Testimonials.tsx`](file:///e:/my-portfolio/src/components/sections/Testimonials.tsx): "Recommendations" cards on the About page; renders nothing until a testimonial is published.
* [`ProjectsSection.tsx`](file:///e:/my-portfolio/src/components/sections/ProjectsSection.tsx): Modular project listing section.
* [`Skills.tsx`](file:///e:/my-portfolio/src/components/sections/Skills.tsx): Category-based skill grid with technology icons and proficiency badges.

#### UI Components (`src/components/ui/`)
* [`AnimatedSection.tsx`](file:///e:/my-portfolio/src/components/ui/AnimatedSection.tsx): Framer Motion scroll-reveal container.
* [`BackToTop.tsx`](file:///e:/my-portfolio/src/components/ui/BackToTop.tsx): Floating scroll-to-top button with smooth scroll behavior.
* [`Button.tsx`](file:///e:/my-portfolio/src/components/ui/Button.tsx): Reusable button with variants (`primary`, `outline`, `ghost`, `secondary`).
* [`Card.tsx`](file:///e:/my-portfolio/src/components/ui/Card.tsx): Border-gradient glassmorphic card container.
* [`Chatbot.tsx`](file:///e:/my-portfolio/src/components/ui/Chatbot.tsx): Portfolio assistant widget with the human avatar (`src/components/chatbot/`), Claude-style chat window, emotions and optional sounds. Answers come from `/api/chat` (see Core Subsystem 4).
* [`CodeBlock.tsx`](file:///e:/my-portfolio/src/components/ui/CodeBlock.tsx): Syntax-highlighted code block with language indicator and one-click copy button.
* [`CommandPalette.tsx`](file:///e:/my-portfolio/src/components/ui/CommandPalette.tsx): Global `Cmd+K` / `Ctrl+K` spotlight modal search for instant page navigation and blog search.
* [`ContentProtection.tsx`](file:///e:/my-portfolio/src/components/ui/ContentProtection.tsx): Anti-theft module disabling context menu, text selection, image drag, and devtools shortcut keys.
* [`Input.tsx`](file:///e:/my-portfolio/src/components/ui/Input.tsx): Standardized text field input with focus rings and dark mode compatibility.
* [`Modal.tsx`](file:///e:/my-portfolio/src/components/ui/Modal.tsx): Accessible dialog overlay with backdrop blur and escape key listener.
* [`PushNotificationButton.tsx`](file:///e:/my-portfolio/src/components/ui/PushNotificationButton.tsx): "Get Notified" button (icon-only on mobile). Registers `public/push-sw.js`, handles permission/iOS/unsupported cases with specific messages, and saves the subscription.
* [`CursorTrail.tsx`](file:///e:/my-portfolio/src/components/ui/CursorTrail.tsx) / [`GhostCursor.tsx`](file:///e:/my-portfolio/src/components/ui/GhostCursor.tsx): Theme-aware Three.js smoke trail following the pointer site-wide. Bloom is intentionally disabled (it forced full-viewport alpha and broke page rendering).
* [`SkillKeyboard.tsx`](file:///e:/my-portfolio/src/components/ui/SkillKeyboard.tsx): Interactive virtual keyboard where pressing physical or on-screen keys triggers skill highlights.
* [`StaggerContainer.tsx`](file:///e:/my-portfolio/src/components/ui/StaggerContainer.tsx): Framer Motion animation parent that staggers child item entrances.
* [`Toast.tsx`](file:///e:/my-portfolio/src/components/ui/Toast.tsx): Lightweight toast notification component for alerts.

---

### Core Utilities & Libraries (`src/lib/`)

| File | Purpose & Logic |
| :--- | :--- |
| [`auth.ts`](file:///e:/my-portfolio/src/lib/auth.ts) | Helper function `isAuthenticated(req)` checking the `x-admin-secret` header against `process.env.ADMIN_SECRET`. |
| [`clientCache.ts`](file:///e:/my-portfolio/src/lib/clientCache.ts) | In-memory and session storage cache providing instant 0ms data access across in-tab page transitions without redundant network roundtrips. Resets automatically on new tabs or tab close. |
| [`publicData.ts`](file:///e:/my-portfolio/src/lib/publicData.ts) | Server-only `getHeroData()` (React `cache`) returning the same JSON shape as `/api/hero`. |
| [`revalidate.ts`](file:///e:/my-portfolio/src/lib/revalidate.ts) | `revalidatePublicPages()` — purges ISR-cached public pages after CMS edits. |
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
| [`Testimonial.ts`](file:///e:/my-portfolio/src/models/Testimonial.ts) | `testimonials` | `name`, `role`, `company`, `relationship`, `quote`, `avatarUrl`, `linkedinUrl`, `published`, `order`. |
| [`PageVisit.ts`](file:///e:/my-portfolio/src/models/PageVisit.ts) | `pagevisits` | `sessionId`, `path`, `referrerPath` (null = entry page), timestamps. |

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

---

## Change Log

| Date & time (IST) | Change |
| :--- | :--- |
| 2026-10-22 10:21 | Rich HTML/CSS content + Drive image/GIF/video embeds everywhere (AI_CONTENT_PROMPT.md), admin always light, separate Home/About media with GIF/video, Drive URL fixes (incl. blog API), automatic deploy-time "Last updated", setup checklist in STANDOUT_FEATURES.md. |
| 2026-10-22 10:11 | Public read-only MCP, job match, tailored résumé, on-device smart search, /ai page, chatbot voice + 9 languages, realistic 3D avatar, project case studies & evals, education photo/location/LinkedIn, 172-skill catalog, auto-scrolling hero tech marquee with admin speed, hero responsive fix. |
| 2026-10-22 09:50 | Admin MCP server (`/api/mcp`); AI-crawler rules in robots.txt; Instagram social link; 3D-style chatbot avatar; chatbot auto-navigation and non-repeating follow-ups; home slider keeps section/scroll on reload; ghost cursor moved behind content (z-index -1); urgent-contact copy (email/LinkedIn) replaces the 24 h reply promise; admin pages network-only in the service worker; client cache 60 s expiry. |
| 2026-10-22 03:27 | Social preview image fix, Person JSON-LD, `/llms.txt`. |
| 2026-10-22 03:21 | Human avatar assistant with emotions, sounds and Claude-style chat UI. |
| 2026-10-22 03:11 | Free chat engine answering from live portfolio content. |
| 2026-10-22 03:00 | Company logos and LinkedIn links for work experience. |
| 2026-10-22 02:53 | AI Tools & LLMs skill stack; icon contrast fixes. |
| 2026-10-22 02:46 | Push notification fixes, testimonials CMS, user-flow analytics, performance overhaul. |
| 2026-10-20 01:18 | In-memory routing, loading screens, responsive home layout. |
