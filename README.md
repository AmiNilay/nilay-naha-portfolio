<div align="center">

# 🚀 Nilay Naha | Premium Developer Portfolio

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](#)

[![Live Demo](https://img.shields.io/badge/Live_Demo-View_Site-success?style=for-the-badge&logo=vercel)](https://nilay-naha-portfolio.vercel.app)
[![Profile Views](https://komarev.com/ghpvc/?username=AmiNilay-portfolio&label=Repo+Views&color=blueviolet&style=for-the-badge)](https://github.com/AmiNilay/nilay-naha-portfolio)

A high-performance, full-stack developer portfolio built with **Next.js 14 (App Router)**. Featuring a custom-built headless CMS, Progressive Web App (PWA) capabilities, Web Push Notifications, and an AI-powered interactive Chatbot.

[View Live Site](https://nilay-naha-portfolio.vercel.app) · [Report Bug](https://github.com/AmiNilay/nilay-naha-portfolio/issues) · [Request Feature](https://github.com/AmiNilay/nilay-naha-portfolio/issues)

</div>

---

## ✨ Key Features

This isn't just a static website; it's a fully functional web application designed to showcase engineering skills.

*   **🛠️ Custom Headless CMS (Admin Panel):** A secure, authenticated dashboard to manage Projects, Blog Posts, Hero content, and Chatbot rules without touching code.
*   **📱 Progressive Web App (PWA):** Installable on desktop and mobile devices with offline fallback support.
*   **🔔 Web Push Notifications:** Admin broadcast center to send real-time push notifications to subscribed users/recruiters.
*   **🤖 Interactive Chatbot:** A glassmorphic, rule-based AI assistant with fuzzy keyword matching, auto-suggest, and quick replies.
*   **⌨️ Command Palette (Cmd+K):** Spotlight-style global search for instant navigation across the site and blog posts.
*   **🖼️ Advanced Image Handling:** GitHub-based image storage with automatic Google Drive fallbacks and strict anti-download protections (no right-click/drag).
*   **📝 Rich Text Blog & Project Editor:** Integrated ReactQuill editor with live preview modals, image cropping, and automatic SEO metadata generation.
*   **🛡️ Security Hardened:** Next.js Middleware route protection, encrypted session cookies, and IP-based rate limiting on APIs.

---

## 💻 Tech Stack

| Category | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 14, React, TypeScript, Tailwind CSS, Framer Motion |
| **Backend** | Next.js Route Handlers (REST API), Node.js |
| **Database** | MongoDB Atlas, Mongoose |
| **Storage** | GitHub API (Raw Content), Google Drive (Fallback) |
| **PWA & Push** | `next-pwa`, `web-push`, Service Workers |
| **Security** | DOMPurify (Sanitization), Next.js Middleware |

---

## 🚀 Getting Started

Want to run this project locally? Follow these steps:

### 1. Prerequisites
*   Node.js (v18.17+ recommended)
*   MongoDB Atlas URI
*   GitHub Personal Access Token (for image uploads)
*   VAPID Keys (for Push Notifications)

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/AmiNilay/nilay-naha-portfolio.git
cd nilay-naha-portfolio
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory and add the following:

<details>
<summary><b>Click to view required environment variables</b></summary>

```env
# Database
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/portfolio

# Admin Authentication
ADMIN_EMAIL=your-email@example.com
ADMIN_PASSWORD=your-secure-password
ADMIN_SECRET=a-random-long-secret-string

# GitHub Storage (For uploading images via Admin Panel)
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_USERNAME=AmiNilay
GITHUB_REPO=nilay-naha-portfolio

# Web Push Notifications (Generate via `npx web-push generate-vapid-keys`)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
VAPID_SUBJECT=mailto:your-email@example.com
```
</details>

### 4. Run the Development Server

```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. To access the CMS, navigate to `/admin/login`.

---

## 📂 Project Architecture

<details>
<summary><b>Click to expand folder structure</b></summary>

```text
📦 src
 ┣ 📂 app
 ┃ ┣ 📂 (admin)        # Protected CMS routes (Dashboard, Editors, Broadcast)
 ┃ ┣ 📂 (public)       # Public-facing portfolio pages
 ┃ ┣ 📂 api            # REST API endpoints (Blog, Projects, Push, Contact)
 ┃ ┣ 📜 layout.tsx     # Root layout with PWA & Theme providers
 ┃ ┗ 📜 template.tsx   # Framer Motion page transitions
 ┣ 📂 components
 ┃ ┣ 📂 admin          # CMS UI components (Sidebar, Editors)
 ┃ ┣ 📂 layout         # Navbar, Swipe Navigation
 ┃ ┣ 📂 sections       # Hero, About, Contact sections
 ┃ ┗ 📂 ui             # Chatbot, Command Palette, Toast, Buttons
 ┣ 📂 lib              # Utilities (DB connection, GitHub upload, Markdown)
 ┣ 📂 models           # Mongoose Schemas (Post, Project, Hero, Subscription)
 ┗ 📜 middleware.ts    # Route protection & Auth logic
```
</details>

---

## 📈 Performance & SEO

*   **Lighthouse Score:** 100/100 (Accessibility, Best Practices, SEO)
*   **Dynamic Sitemap & Robots.txt:** Auto-generated for optimal search engine indexing.
*   **Optimized Assets:** Next/Image component utilized for automatic WebP conversion and lazy loading.

---

## 📬 Contact

**Nilay Naha** - Software Developer (Python)

*   **LinkedIn:** [linkedin.com/in/nilay-naha]
*   **GitHub:** [@AmiNilay](https://github.com/AmiNilay)
*   **Portfolio:** [nilay-naha-portfolio.vercel.app](https://nilay-naha-portfolio.vercel.app)

---
<div align="center">
  <i>Built with ❤️ by Nilay Naha</i>
</div>
```