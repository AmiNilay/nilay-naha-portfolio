# 🏗️ Project Architecture & Engineering Documentation

This document outlines the technical decisions, architecture, and problem-solving strategies implemented in the development of this portfolio.

## 1. System Architecture

The application is built on the **Next.js 14 App Router**, utilizing a full-stack architecture where the frontend and backend (API Route Handlers) coexist in the same repository. 

*   **Codebase Map & File Logic:** For an exhaustive file-by-file directory breakdown, see [**`CODEBASE_MAP.md`**](file:///e:/my-portfolio/CODEBASE_MAP.md).
*   **Rules & Agent Execution Protocol:** For agentic loop conventions and coding invariants, see [**`CLAUDE.md`**](file:///e:/my-portfolio/CLAUDE.md) / [**`RULES.md`**](file:///e:/my-portfolio/RULES.md).
*   **Database:** MongoDB Atlas is used for its flexible document schema, allowing rapid iteration of Blog, Project, and Chatbot Rule models.
*   **Asset Pipeline:** To avoid heavy cloud storage costs, assets (images/resumes) are uploaded directly to a private GitHub repository via the GitHub API. A Google Drive fallback system is implemented to ensure 100% uptime if the GitHub API rate limits are hit.
*   **Authentication:** The `/admin` routes are protected at the edge using Next.js Middleware. A secure, HTTP-only cookie is verified before any admin page or protected API route is rendered.
*   **Analytics (Phase 3):** A first-party, cookie-free user-flow tracker (`PageFlowTracker`) records the sequence of pages a visitor moves through in a browser session via `sessionStorage` — no third-party telemetry, consistent with the privacy guarantee shown on the Contact page. Events are stored in a `PageVisit` collection and aggregated into page-to-page transition counts and per-page drop-off (exit) rates, visualized at `/admin/analytics`.
*   **Ambient Visual Effect:** A Three.js shader-based "Ghost Cursor" smoke trail follows the pointer across every public page, rendered via `GhostCursor`/`CursorTrail`, tuned with separate color/blend settings per theme.

## 2. Technical Challenges & Solutions

### Challenge A: PWA Service Worker Caching Conflicts
**The Problem:** Next.js 14's aggressive hot-reloading and internal build manifests (`app-build-manifest.json`) were causing the `next-pwa` Service Worker to throw 404 errors and crash the Push Notification subscription flow.
**The Solution:** Implemented a custom `worker/index.js` to gracefully handle missing manifests and added a robust fallback in the UI that waits for the `navigator.serviceWorker.ready` state before attempting to subscribe to the PushManager.

### Challenge B: Chatbot Keyword Hijacking
**The Problem:** The initial chatbot used a "First Match" algorithm. Common stop words (e.g., "what", "you") in user queries were triggering incorrect rules (e.g., "Education" instead of "Projects").
**The Solution:** Engineered a custom **Levenshtein Distance** fuzzy matching algorithm. The bot now tokenizes the input, strips common stop words, and calculates the edit distance between keywords, ensuring highly accurate intent recognition even with typos.

### Challenge C: "Ghost Swiping" on Mobile
**The Problem:** The custom swipe-navigation system was too sensitive. Users attempting to tap links on mobile were accidentally triggering horizontal page transitions.
**The Solution:** Implemented an X/Y delta threshold logic in the `touchstart` and `touchend` event listeners. The router now only triggers if the horizontal swipe distance exceeds 50 pixels *and* is significantly greater than the vertical swipe distance.

### Challenge D: Google Drive Image Embedding Blocks
**The Problem:** Google deprecated the `uc?export=view` endpoint, causing fallback images to break.
**The Solution:** Built a dynamic URL parser in the API that intercepts Google Drive links and converts them to use the hidden `lh3.googleusercontent.com` endpoint for thumbnails, and `<iframe>` embeds for larger project previews.

### Challenge E: Full-Viewport Cursor Shader Breaking Theme Rendering
**The Problem:** The Ghost Cursor effect used Three.js's `UnrealBloomPass` for glow. That pass's composite shader hardcodes its output alpha to `1.0` and additively blends it in, which saturates the canvas's alpha to `1` across the *entire* viewport, not just near the cursor. Under `screen` blend mode this is harmless against a near-black source (a documented no-op), which masked the bug in light-weight testing — but it washed the whole page in a gray veil under `multiply` blend (light theme), and on at least one real GPU it over-brightened dark mode badly enough to make all page text unreadable.
**The Solution:** Removed the bloom pass entirely rather than continuing to retune an unreliable post-process stage. The shader's own localized alpha (no post-processing) proved stable across both themes and multiple environments, including a background-radius scale factor (`glowSize`) to keep the smoke trail proportionate on large viewports instead of the original demo's small-container sizing.

## 3. Performance & Security

*   **Security:** 
    *   All public media assets are protected using `onContextMenu` overrides, `draggable={false}`, and CSS `user-select: none`.
    *   API routes are secured against unauthorized POST/PUT/DELETE requests via token validation.
*   **Performance:** 
    *   Framer Motion animations are hardware-accelerated.
    *   The Hero section utilizes a strict `100dvh` layout with `overflow-hidden` to prevent layout shifts and scroll-jank.
    *   Data fetching utilizes Next.js caching and revalidation strategies to ensure fast TTFB (Time to First Byte).

## 4. Roadmap
*   **Phase 2 (Planned):** Implement WebSockets for real-time live chat fallback when the AI bot cannot answer a query.
*   **Phase 3 (✅ Shipped):** User-flow analytics dashboard in the CMS (`/admin/analytics`) — page-to-page transition counts and per-page drop-off rates, backed by a first-party `PageVisit` collection. Scoped to flow/funnel tracking rather than pixel-level interaction heatmaps.
