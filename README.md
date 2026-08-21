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
- 🤖 **AI-Powered Chatbot:** Custom-built virtual assistant using Levenshtein distance fuzzy matching to answer recruiter questions and trigger resume downloads.
- 🛡️ **Anti-Theft Asset Protection:** Strict anti-download, no-right-click, and no-drag protections on all media, backed by a dual GitHub/Google Drive fallback system.
- 🧭 **App-Like Navigation:** Swipe and arrow-key based page transitions powered by Framer Motion (no traditional scrolling on the Hero page).
- 🔍 **Command Palette:** Global `Cmd + K` spotlight search for instant navigation and blog querying.

---

## 🛠️ Tech Stack

| Category | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 14 (App Router), React, TypeScript, Tailwind CSS |
| **Backend** | Next.js Route Handlers (REST API), Node.js |
| **Database** | MongoDB Atlas, Mongoose |
| **Storage** | GitHub API (Primary), Google Drive (Fallback) |
| **Animations** | Framer Motion, CSS Keyframes |
| **Infrastructure** | Vercel, next-pwa, Web Push API |

---

## 🏗️ Architecture & Engineering

This project goes beyond a standard static portfolio. It is engineered as a complete SaaS-like application to demonstrate advanced full-stack capabilities.

### 1. System Architecture

- **Framework:** Built on the **Next.js 14 App Router**, utilizing a full-stack architecture where the frontend and backend (API Route Handlers) coexist.
- **Database:** MongoDB Atlas is used for its flexible document schema, allowing rapid iteration of Blog, Project, and Chatbot Rule models.
- **Asset Pipeline:** To avoid heavy cloud storage costs, assets (images/resumes) are uploaded directly to a private GitHub repository via the GitHub API. A Google Drive fallback system ensures 100% uptime if GitHub API rate limits are hit.
- **Authentication:** The `/admin` routes are protected at the edge using Next.js Middleware. A secure, HTTP-only cookie is verified before any admin page or protected API route is rendered.

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

## 🔮 Future Roadmap

- **WebSockets:** Implement real-time live chat fallback when the AI bot cannot answer a query.
- **Analytics:** Add an analytics dashboard to the CMS to track user flow and interaction heatmaps.

---

<div align="center">
  <i>Designed and Engineered by Nilay Naha</i>
</div>