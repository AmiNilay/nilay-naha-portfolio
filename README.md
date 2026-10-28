# 🚀 Nilay Naha | Premium Developer Portfolio

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-black?style=for-the-badge&logo=framer)](https://www.framer.com/motion/)

**A high-performance, full-stack Progressive Web App (PWA) portfolio featuring a custom headless CMS, AI-powered chatbot, and Web Push Notifications.**

🌐 **[View Live Portfolio](https://nilay-naha-portfolio.vercel.app)**

![Profile Views](https://komarev.com/ghpvc/?username=AmiNilay&label=Repo%20Views&color=0e75b6&style=flat-square)

</div>

---

## ✨ Standout Features

- 📱 **Progressive Web App (PWA):** Fully installable on desktop and mobile with offline capabilities and native Web Push Notifications.
- 🔐 **Custom Headless CMS:** A secure, bespoke admin panel protected by Next.js Middleware and JWT cookies. Features a live-preview Markdown/HTML editor.
- 🤖 **Portfolio Assistant:** A free, self-hosted chatbot (no LLM or API key) that answers recruiter questions from the live site content — projects, experience, skills, education, blog — with an expressive human avatar, emotions, optional soft sounds, and instant résumé download.
- 🛡️ **Anti-Theft Asset Protection:** Strict anti-download, no-right-click, and no-drag protections on all media, backed by a dual GitHub/Google Drive fallback system.
- 🧭 **App-Like Navigation:** Swipe and arrow-key based page transitions powered by Framer Motion (no traditional scrolling on the Hero page).
- 🔍 **Command Palette:** Global `Cmd + K` spotlight search for instant navigation and blog querying.
- ✨ **Ghost Cursor:** A Three.js shader-based smoke trail that follows the pointer across the site, tuned separately for light and dark mode.
- 📊 **User Flow Analytics:** First-party, cookie-free page-flow tracking with a CMS dashboard showing page-to-page transitions and drop-off rates.
- 💬 **Recommendations:** Testimonials managed from the CMS and shown on the About page.
- 🏢 **Rich Experience Timeline:** Company logos (uploaded or linked, never cropped) and LinkedIn links per role.
- 🧠 **AI Tools Stack:** 20+ AI tools (Claude, Claude Code, Cursor, Copilot, Gemini, DeepSeek, Qwen…) selectable in the CMS, with theme-aware icon contrast.
- 🔎 **Discoverable:** schema.org Person JSON-LD, a generated social preview image, and `/llms.txt` so AI assistants get accurate, current facts; robots.txt explicitly welcomes AI crawlers (GPTBot, ClaudeBot, PerplexityBot…).
- 🔌 **Admin MCP Server:** `/api/mcp` lets AI agents (Claude, Cursor…) list, create, update, publish and delete projects and blog posts and edit About/Hero on your behalf — free, token-protected, no SDK. Connect with `claude mcp add --transport http portfolio https://nilay-naha-portfolio.vercel.app/api/mcp --header "Authorization: Bearer <ADMIN_SECRET>"`.
- 🧑‍🚀 **3D Assistant Avatar & Auto-Navigation:** the chatbot's 3D-shaded avatar turns toward your cursor; ask about a project or article and it opens that page for you, then suggests fresh follow-up questions.
- 🔄 **Reload-Safe Sections:** refreshing keeps you on the same home section and scroll position (`/#about`, `/#projects`…).

---

## 🛠️ Tech Stack

| Category | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 14 (App Router), React, TypeScript, Tailwind CSS |
| **Backend** | Next.js Route Handlers (REST API), Node.js |
| **Database** | MongoDB Atlas, Mongoose |
| **Storage** | GitHub API (Primary), Google Drive (Fallback) |
| **Animations** | Framer Motion, CSS Keyframes, Three.js (shader-based cursor effect) |
| **Infrastructure** | Vercel, next-pwa, Web Push API |

---

## 🏗️ Architecture & Engineering

This project goes beyond a standard static portfolio. It is engineered as a complete SaaS-like application to demonstrate advanced full-stack capabilities.

### 1. System Architecture

- **Codebase & File Logic Map:** Detailed file-by-file logic and architectural reference is documented in [**`CODEBASE_MAP.md`**](file:///e:/my-portfolio/CODEBASE_MAP.md).
- **Project Rules & Agent Protocol:** Engineering invariants and Claude Code / AI Agent rules are defined in [**`CLAUDE.md`**](file:///e:/my-portfolio/CLAUDE.md) and [**`RULES.md`**](file:///e:/my-portfolio/RULES.md).
- **Framework:** Built on the **Next.js 14 App Router**, utilizing a full-stack architecture where the frontend and backend (API Route Handlers) coexist.
- **Database:** MongoDB Atlas is used for its flexible document schema, allowing rapid iteration of Blog, Project, and Chatbot Rule models.
- **Asset Pipeline:** To avoid heavy cloud storage costs, assets (images/resumes) are uploaded directly to a private GitHub repository via the GitHub API. A Google Drive fallback system ensures 100% uptime if GitHub API rate limits are hit.
- **Authentication:** The `/admin` routes are protected at the edge using Next.js Middleware. A secure, HTTP-only cookie is verified before any admin page or protected API route is rendered.
- **Analytics:** A first-party `PageFlowTracker` records the sequence of pages a visitor moves through in a browser session (via `sessionStorage`, no cookies, no third-party telemetry). Events feed a `PageVisit` collection, aggregated into page-to-page transition counts and per-page drop-off rates at `/admin/analytics`.

### 2. Technical Challenges & Solutions

#### Challenge A: PWA Service Worker Caching Conflicts

- **The Problem:** Next.js 14's aggressive hot-reloading and internal build manifests (`app-build-manifest.json`) were causing the `next-pwa` Service Worker to throw 404 errors and crash the Push Notification subscription flow.
- **The Solution:** Implemented a custom `worker/index.js` to gracefully handle missing manifests and added a robust fallback in the UI that waits for the `navigator.serviceWorker.ready` state before attempting to subscribe to the PushManager.

#### Challenge B: Chatbot Keyword Hijacking

- **The Problem:** The initial chatbot used a "First Match" algorithm. Common stop words (e.g., "what", "you") in user queries were triggering incorrect rules.
- **The Solution:** Engineered a custom **Levenshtein Distance** fuzzy matching algorithm. The bot now tokenizes the input, strips common stop words, and calculates the edit distance between keywords, ensuring highly accurate intent recognition even with typos.

#### Challenge C: "Ghost Swiping" on Mobile

- **The Problem:** The custom swipe-navigation system was too sensitive. Users attempting to tap links on mobile were accidentally triggering horizontal page transitions.
- **The Solution:** Implemented an X/Y delta threshold logic in the `touchstart` and `touchend` event listeners. The router now only triggers if the horizontal swipe distance exceeds 50 pixels *and* is significantly greater than the vertical swipe distance.

#### Challenge D: Google Drive Image Embedding Blocks

- **The Problem:** Google deprecated the `uc?export=view` endpoint, causing fallback images to break.
- **The Solution:** Built a dynamic URL parser in the API that intercepts Google Drive links and converts them to use the hidden `lh3.googleusercontent.com` endpoint for thumbnails, and `<iframe>` embeds for larger project previews.

#### Challenge E: Full-Viewport Cursor Shader Breaking Theme Rendering

- **The Problem:** The Ghost Cursor effect used Three.js's `UnrealBloomPass` for glow. That pass hardcodes its output alpha to `1.0` and additively blends it in, saturating the canvas's alpha across the *entire* viewport rather than just near the cursor — harmless under `screen` blend mode against a near-black source, but it washed the whole page in a gray veil under `multiply` (light theme), and over-brightened dark mode on at least one real GPU badly enough to make text unreadable.
- **The Solution:** Removed the bloom pass entirely instead of continuing to retune it. The shader's own localized alpha, with no post-processing, renders correctly across both themes and environments.

### 3. Performance & Security

- **Security:** All public media assets are protected using `onContextMenu` overrides, `draggable={false}`, and CSS `user-select: none`. API routes are secured against unauthorized POST/PUT/DELETE requests via token validation.
- **Performance:** Framer Motion animations are hardware-accelerated. The Hero section utilizes a strict `100dvh` layout with `overflow-hidden` to prevent layout shifts and scroll-jank.

---

## 🚀 Quick Start (Local Development)

**1. Clone the repository:**

```bash
git clone https://github.com/AmiNilay/nilay-naha-portfolio.git
cd nilay-naha-portfolio
```

**2. Install dependencies:**

```bash
npm install
```

**3. Set up Environment Variables:**

Create a `.env.local` file in the root directory and add the following:

```env
MONGODB_URI=your_mongodb_connection_string
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_USERNAME=your_github_username
GITHUB_REPO=your_repo_name
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
ADMIN_SECRET=your_jwt_secret_key
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:your_email@example.com
```

**4. Run the development server:**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📝 Changelog

- **2026-10-28 23:54 IST** — Easier reading on blog and project pages: wider text column on laptops/desktops, comfortable line length, larger text on phones, cleaner list indentation.
- **2026-10-28 23:51 IST** — All blog posts and project pages rewritten in the site's own style: they now work in dark mode, show a table of contents, and every project has a case-study section.
- **2026-10-28 23:44 IST** — New blog post: "How I Built My Portfolio". Fixed new posts having no publish date (they sorted last), and pages left open during a deploy now reload themselves instead of erroring.
- **2026-10-28 23:37 IST** — Fixed: publishing a blog post from the admin panel now actually makes it public (tags save too).
- **2026-10-28 23:31 IST** — Chatbot mascot is now one simple image (3D model and animations removed) so the site loads faster in every browser.
- **2026-10-28 23:20 IST** — Chatbot shows Claude-style playful loading words ("Pondering…", "Connecting the dots…") while preparing an answer.
- **2026-10-28 23:05 IST** — Chatbot: answers "tell me about him" and "quick overview" correctly, always offers a résumé (generated one-page résumé when no PDF is uploaded), mascot no longer shows a broken image on phones, and the chat window is full-screen on mobile and sized for tablets, desktops and TVs.
- **2026-10-28 22:54 IST** — Faster loading: public APIs served from a server cache instead of hitting the database on every visit, lighter blog list, and 3D effects load after the page is ready.
- **2026-10-22 11:44 IST** — Security upgrade to Next.js 14.2.35 (fixes the CVE-2025-29927 middleware bypass and other known issues).
- **2026-10-22 11:38 IST** — Fixed the 3D mascot showing grey: its colours now load in light and dark mode.
- **2026-10-22 11:33 IST** — Real 3D chatbot mascot model (generated from the reference with TRELLIS, 266 KB) and a "Check job fit" button on the home page.
- **2026-10-22 11:23 IST** — Added portfolio rating and round-2 feature ideas to STANDOUT_FEATURES.md.
- **2026-10-22 11:17 IST** — Chatbot mascot is now a transparent cut-out figure (no background disc), same in light and dark mode.
- **2026-10-22 10:54 IST** — New chatbot mascot based on the reference design (theme-aware icon + expressions); automatically upgrades to a real 3D model when `public/models/chatbot-mascot.glb` is added (see `MASCOT_PIPELINE.md`).
- **2026-10-22 10:42 IST** — Swagger/OpenAPI API docs at `/api-docs`, click-to-select logo picker for the Home tech marquee, tech catalog expanded to 286 (2026 AI agents, frameworks, LLMOps, inference, modern web).
- **2026-10-22 10:34 IST** — Security hardening (signed admin sessions, login throttling, rate limits, CSP/HSTS headers, audit log), drafts hidden from the public, chat insights dashboard, live GitHub activity, book-a-call, interactive project demos, Claude-style chatbot with a real 3D avatar, duplicate files removed.
- **2026-10-22 10:21 IST** — Rich HTML/CSS content with Google Drive image/GIF/video embeds (see `AI_CONTENT_PROMPT.md`), admin panel always light, separate Home/About media (GIF/video), Drive link fixes, automatic deploy-time "Last updated". Setup checklist (env vars, VAPID keys) in `STANDOUT_FEATURES.md`.
- **2026-10-22 10:11 IST** — Recruiter tools: public read-only MCP server (`/api/mcp/public`), job-description matcher (`/match`), tailored résumé PDF (`/resume/tailored`), on-device AI smart search (Ctrl+K), `/ai` workflow page; chatbot voice input, read-aloud and 9 languages; realistic 3D avatar; project case studies & evaluation benchmarks; college photo/location/LinkedIn; 172-skill catalog; auto-scrolling hero tech marquee (speed editable).
- **2026-10-22 09:50 IST** — Admin MCP server, AI-crawler robots rules, Instagram link, 3D avatar, chatbot auto-navigation & smarter follow-ups, reload keeps section, cursor effect behind content, urgent-contact copy. Full history in [CODEBASE_MAP.md](CODEBASE_MAP.md#change-log).

---

## 🔮 Roadmap

- **WebSockets (Planned):** Implement real-time live chat fallback when the AI bot cannot answer a query.
- **User Flow Analytics (✅ Shipped):** CMS dashboard at `/admin/analytics` tracking page-to-page transitions and drop-off rates.

---

<div align="center">
  <i>Designed and Engineered by Nilay Naha</i>
</div>
