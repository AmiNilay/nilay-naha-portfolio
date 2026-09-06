# Nilay Naha | Premium Developer Portfolio

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

## Table of Contents

- [Standout Features](#-standout-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Project](#running-the-project)
- [Architecture & Engineering](#-architecture--engineering)
- [Performance & Security](#-performance--security)
- [Future Roadmap](#-future-roadmap)

---

## ✨ Standout Features

- **Progressive Web App (PWA):** Fully installable on desktop and mobile with offline capabilities and native Web Push Notifications.
- **Custom Headless CMS:** A secure, bespoke admin panel protected by Next.js Middleware and JWT cookies. Features a live-preview Markdown/HTML editor.
- **AI-Powered Chatbot:** Custom-built virtual assistant using Levenshtein distance fuzzy matching to answer recruiter questions and trigger resume downloads.
- **Anti-Theft Asset Protection:** Strict anti-download, no-right-click, and no-drag protections on all media, backed by a dual GitHub/Google Drive fallback system.
- **App-Like Navigation:** Swipe and arrow-key based page transitions powered by Framer Motion (no traditional scrolling on the Hero page).
- **Command Palette:** Global `Cmd + K` spotlight search for instant navigation and blog querying.

---

## 🛠️ Tech Stack

| Category         | Technologies                                |
| :--------------- | :------------------------------------------ |
| **Frontend**     | Next.js 14 (App Router), React, TypeScript, Tailwind CSS |
| **Backend**      | Next.js Route Handlers (REST API), Node.js  |
| **Database**     | MongoDB Atlas, Mongoose                     |
| **Storage**      | GitHub API (Primary), Google Drive (Fallback) |
| **Animations**   | Framer Motion, CSS Keyframes                |
| **Infrastructure** | Vercel, next-pwa, Web Push API             |

---

## 📁 Project Structure

```
my-portfolio/
├── public/                          # Static assets
│   ├── images/
│   │   └── profile.jpg
│   ├── sounds/
│   │   └── click.mp3
│   ├── uploads/                     # Locally uploaded media
│   ├── manifest.json                # PWA manifest
│   ├── resume.pdf
│   ├── favicon.ico
│   ├── apple-touch-icon.png
│   ├── icon-dark.png
│   └── icon-light.png
│
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── (admin)/                 # Admin route group
│   │   │   ├── layout.tsx           # Admin layout wrapper
│   │   │   └── admin/
│   │   │       ├── page.tsx         # Admin dashboard
│   │   │       ├── about/page.tsx
│   │   │       ├── blog/
│   │   │       │   ├── page.tsx     # Blog management
│   │   │       │   └── [id]/page.tsx
│   │   │       ├── chatbot/page.tsx
│   │   │       ├── dashboard/page.tsx
│   │   │       ├── home/page.tsx
│   │   │       ├── login/page.tsx
│   │   │       ├── notifications/page.tsx
│   │   │       ├── projects/
│   │   │       │   ├── page.tsx     # Project management
│   │   │       │   └── [id]/page.tsx
│   │   │       └── settings/page.tsx
│   │   │
│   │   ├── (public)/                # Public route group
│   │   │   ├── page.tsx             # Home page
│   │   │   ├── HomeClient.tsx
│   │   │   ├── about/
│   │   │   │   ├── page.tsx
│   │   │   │   └── AboutClient.tsx
│   │   │   ├── blog/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── BlogClient.tsx
│   │   │   │   └── [slug]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── BlogPostClient.tsx
│   │   │   ├── contact/
│   │   │   │   ├── page.tsx
│   │   │   │   └── ContactClient.tsx
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── ProjectsClient.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [slug]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── ProjectDetailsClient.tsx
│   │   │   └── resume/page.tsx
│   │   │
│   │   ├── api/                     # API Route Handlers
│   │   │   ├── about/route.ts
│   │   │   ├── auth/
│   │   │   │   ├── check/route.ts
│   │   │   │   └── login/route.ts
│   │   │   ├── blog/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   ├── chatbot/route.ts
│   │   │   ├── contact/route.ts
│   │   │   ├── hero/route.ts
│   │   │   ├── projects/route.ts
│   │   │   ├── push/
│   │   │   │   ├── broadcast/route.ts
│   │   │   │   └── subscribe/route.ts
│   │   │   ├── settings/route.ts
│   │   │   └── views/route.ts
│   │   │
│   │   ├── globals.css
│   │   ├── layout.tsx               # Root layout
│   │   ├── loading.tsx
│   │   ├── not-found.tsx
│   │   ├── robots.ts
│   │   ├── sitemap.ts
│   │   └── template.tsx
│   │
│   ├── components/
│   │   ├── admin/                   # CMS admin components
│   │   │   ├── AboutEditor.tsx
│   │   │   ├── AdminLayoutClient.tsx
│   │   │   ├── AdminNav.tsx
│   │   │   ├── AdminSidebar.tsx
│   │   │   ├── BlogForm.tsx
│   │   │   └── HomeEditor.tsx
│   │   ├── blog/                    # Blog-specific components
│   │   │   ├── BlogControls.tsx
│   │   │   ├── ReadingProgress.tsx
│   │   │   └── TableOfContents.tsx
│   │   ├── layout/                  # Shared layout components
│   │   │   ├── Footer.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── PageNavigation.tsx
│   │   ├── providers/
│   │   │   └── ThemeProvider.tsx
│   │   ├── sections/                # Page sections
│   │   │   ├── AboutPreview.tsx
│   │   │   ├── ContactCTA.tsx
│   │   │   ├── FeaturedProjects.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── ProjectsSection.tsx
│   │   │   └── Skills.tsx
│   │   ├── theme-provider.tsx
│   │   └── ui/                      # Reusable UI primitives
│   │       ├── AnimatedSection.tsx
│   │       ├── BackToTop.tsx
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Chatbot.tsx
│   │       ├── CodeBlock.tsx
│   │       ├── CommandPalette.tsx
│   │       ├── ContentProtection.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       ├── PushNotificationButton.tsx
│   │       ├── SkillKeyboard.tsx
│   │       ├── StaggerContainer.tsx
│   │       └── Toast.tsx
│   │
│   ├── lib/                         # Utility libraries & config
│   │   ├── models/                  # Mongoose models (lib)
│   │   │   ├── Admin.ts
│   │   │   ├── Blog.ts
│   │   │   └── Project.ts
│   │   ├── auth.ts
│   │   ├── clientFonts.ts
│   │   ├── connectToDB.ts
│   │   ├── db.ts
│   │   ├── githubUpload.ts
│   │   ├── markdownProcessor.ts
│   │   ├── navigationDirection.ts
│   │   ├── sanitize.ts
│   │   ├── skillData.ts
│   │   └── utils.ts
│   │
│   ├── models/                      # Mongoose models (root)
│   │   ├── About.ts
│   │   ├── Chatbot.ts
│   │   ├── Hero.ts
│   │   ├── Post.ts
│   │   ├── Project.ts
│   │   ├── Settings.ts
│   │   └── Subscription.ts
│   │
│   ├── middleware.ts                 # Auth & route protection
│   └── types/
│       └── index.ts                 # Shared TypeScript types
│
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── postcss.config.mjs
├── tsconfig.json
├── package.json
└── .hintrc
```

---

## 🚀 Getting Started

### Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** v18.17 or later — [Download](https://nodejs.org/)
- **npm** v9+ (comes with Node.js)
- **MongoDB Atlas** account — [Sign up](https://www.mongodb.com/atlas)
- **GitHub Personal Access Token** — [Generate one](https://github.com/settings/tokens)
- **VAPID Keys** for Web Push Notifications — [Generate here](https://vapidkeys.com/)

### Installation

**1. Clone the repository:**

```bash
git clone https://github.com/AmiNilay/nilay-naha-portfolio.git
cd nilay-naha-portfolio
```

**2. Install dependencies:**

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the root directory and populate it with the following:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# GitHub Asset Storage
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_USERNAME=your_github_username
GITHUB_REPO=your_repo_name

# Admin Authentication
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
ADMIN_SECRET=your_jwt_secret_key

# Web Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:your_email@example.com
```

| Variable                   | Description                                                        |
| :------------------------- | :----------------------------------------------------------------- |
| `MONGODB_URI`              | MongoDB Atlas connection string                                    |
| `GITHUB_TOKEN`             | Personal access token with `repo` scope for asset uploads          |
| `GITHUB_USERNAME`          | GitHub username owning the asset repository                        |
| `GITHUB_REPO`              | Repository name for storing uploaded images/resumes                 |
| `ADMIN_EMAIL`              | Email used to log into the `/admin` CMS panel                      |
| `ADMIN_PASSWORD`           | Password for the admin login                                       |
| `ADMIN_SECRET`             | Secret key used to sign and verify JWT authentication cookies      |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | VAPID public key for browser push subscription                 |
| `VAPID_PRIVATE_KEY`        | VAPID private key for server-side push notification dispatch       |
| `VAPID_SUBJECT`            | Contact email for the VAPID key pair (format: `mailto:you@email.com`) |

### Running the Project

**Development mode:**

```bash
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000). The dev server supports hot reloading.

**Production build:**

```bash
npm run build
npm start
```

**Linting:**

```bash
npm run lint
```

| Command         | Description                              |
| :-------------- | :--------------------------------------- |
| `npm run dev`   | Start the development server             |
| `npm run build` | Create an optimized production build     |
| `npm start`     | Start the production server              |
| `npm run lint`  | Run ESLint to check for code issues      |

---

## 🏗️ Architecture & Engineering

This project is engineered as a complete SaaS-like application to demonstrate advanced full-stack capabilities.

### System Architecture

- **Framework:** Built on the **Next.js 14 App Router**, utilizing a full-stack architecture where the frontend and backend (API Route Handlers) coexist.
- **Database:** MongoDB Atlas is used for its flexible document schema, allowing rapid iteration of Blog, Project, and Chatbot Rule models.
- **Asset Pipeline:** Assets (images/resumes) are uploaded directly to a private GitHub repository via the GitHub API. A Google Drive fallback system ensures 100% uptime if GitHub API rate limits are hit.
- **Authentication:** The `/admin` routes are protected at the edge using Next.js Middleware. A secure, HTTP-only cookie is verified before any admin page or protected API route is rendered.

### Technical Challenges & Solutions

<details>
<summary><strong>Challenge A: PWA Service Worker Caching Conflicts</strong></summary>

**Problem:** Next.js 14's aggressive hot-reloading and internal build manifests (`app-build-manifest.json`) were causing the `next-pwa` Service Worker to throw 404 errors and crash the Push Notification subscription flow.

**Solution:** Implemented a custom `worker/index.js` to gracefully handle missing manifests and added a robust fallback in the UI that waits for the `navigator.serviceWorker.ready` state before attempting to subscribe to the PushManager.
</details>

<details>
<summary><strong>Challenge B: Chatbot Keyword Hijacking</strong></summary>

**Problem:** The initial chatbot used a "First Match" algorithm. Common stop words (e.g., "what", "you") in user queries were triggering incorrect rules.

**Solution:** Engineered a custom **Levenshtein Distance** fuzzy matching algorithm. The bot now tokenizes the input, strips common stop words, and calculates the edit distance between keywords, ensuring highly accurate intent recognition even with typos.
</details>

<details>
<summary><strong>Challenge C: "Ghost Swiping" on Mobile</strong></summary>

**Problem:** The custom swipe-navigation system was too sensitive. Users attempting to tap links on mobile were accidentally triggering horizontal page transitions.

**Solution:** Implemented an X/Y delta threshold logic in the `touchstart` and `touchend` event listeners. The router now only triggers if the horizontal swipe distance exceeds 50 pixels *and* is significantly greater than the vertical swipe distance.
</details>

<details>
<summary><strong>Challenge D: Google Drive Image Embedding Blocks</strong></summary>

**Problem:** Google deprecated the `uc?export=view` endpoint, causing fallback images to break.

**Solution:** Built a dynamic URL parser in the API that intercepts Google Drive links and converts them to use the hidden `lh3.googleusercontent.com` endpoint for thumbnails, and `<iframe>` embeds for larger project previews.
</details>

---

## 🔒 Performance & Security

- **Security:** All public media assets are protected using `onContextMenu` overrides, `draggable={false}`, and CSS `user-select: none`. API routes are secured against unauthorized POST/PUT/DELETE requests via token validation.
- **Performance:** Framer Motion animations are hardware-accelerated. The Hero section utilizes a strict `100dvh` layout with `overflow-hidden` to prevent layout shifts and scroll-jank.

---

## 🔮 Future Roadmap

- **WebSockets:** Implement real-time live chat fallback when the AI bot cannot answer a query.
- **Analytics:** Add an analytics dashboard to the CMS to track user flow and interaction heatmaps.

---

<div align="center">
  <i>Designed and Engineered by Nilay Naha</i>
</div>