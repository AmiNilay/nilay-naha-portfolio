# 🏗️ Project Architecture & Engineering Documentation

This document outlines the technical decisions, architecture, and problem-solving strategies implemented in the development of this portfolio.

## 1. System Architecture

The application is built on the **Next.js 14 App Router**, utilizing a full-stack architecture where the frontend and backend (API Route Handlers) coexist in the same repository. 

*   **Database:** MongoDB Atlas is used for its flexible document schema, allowing rapid iteration of Blog, Project, and Chatbot Rule models.
*   **Asset Pipeline:** To avoid heavy cloud storage costs, assets (images/resumes) are uploaded directly to a private GitHub repository via the GitHub API. A Google Drive fallback system is implemented to ensure 100% uptime if the GitHub API rate limits are hit.
*   **Authentication:** The `/admin` routes are protected at the edge using Next.js Middleware. A secure, HTTP-only cookie is verified before any admin page or protected API route is rendered.

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

## 3. Performance & Security

*   **Security:** 
    *   All public media assets are protected using `onContextMenu` overrides, `draggable={false}`, and CSS `user-select: none`.
    *   API routes are secured against unauthorized POST/PUT/DELETE requests via token validation.
*   **Performance:** 
    *   Framer Motion animations are hardware-accelerated.
    *   The Hero section utilizes a strict `100dvh` layout with `overflow-hidden` to prevent layout shifts and scroll-jank.
    *   Data fetching utilizes Next.js caching and revalidation strategies to ensure fast TTFB (Time to First Byte).

## 4. Future Roadmap
*   **Phase 2:** Implement WebSockets for real-time live chat fallback when the AI bot cannot answer a query.
*   **Phase 3:** Add an analytics dashboard to the CMS to track user flow and interaction heatmaps.