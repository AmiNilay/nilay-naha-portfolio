# 📋 Project Rules & Development Guidelines

> This document defines the engineering standards, architecture rules, and development protocols for the **Nilay Naha Portfolio & Headless CMS**.
> For full agentic instructions and context management rules, see [**`CLAUDE.md`**](file:///e:/my-portfolio/CLAUDE.md).
> For the comprehensive file-by-file logic guide, see [**`CODEBASE_MAP.md`**](file:///e:/my-portfolio/CODEBASE_MAP.md).

---

## 🏗️ 1. Architecture Invariants

1. **Framework:** Next.js 14 App Router. All routing occurs under `src/app`. Do not introduce a `pages/` directory.
2. **Language:** TypeScript 5 in Strict Mode. All code must pass `npx tsc --noEmit` without warnings or errors.
3. **Database Single-Source:**
   - Always import the cached database connection: `import { connectToDB } from "@/lib/connectToDB"`.
   - Never import from `@/lib/db`.
   - Never instantiate separate un-cached Mongoose connections.
4. **Active Schemas:**
   - Always import models from `@/models/*` (`Post`, `Project`, `Hero`, `About`, `Subscription`, `Chatbot`).
   - Never import from `src/lib/models/*` (deprecated legacy schemas).
5. **Edge Security & Middleware:**
   - All `/admin/*` pages are protected by `src/middleware.ts` verifying `admin_token` cookie against `ADMIN_SECRET`.
   - All non-GET API requests are rejected by middleware unless the route is explicitly listed in `publicApiRoutes` in `src/middleware.ts` or the request is authenticated.

---

## 🎨 2. Frontend & Styling Conventions

1. **Tailwind CSS:** Use Tailwind utility classes. When combining dynamic classes, use `cn(...)` from `@/lib/utils`.
2. **Theme Support:** Always support both Light and Dark mode using Tailwind `dark:` variants and CSS color tokens (`background`, `foreground`, `primary`).
3. **App-Like Gestures:** Maintain touch and keyboard navigation logic in `PageNavigation.tsx` ($> 100\text{ px}$ horizontal swipe, $< 600\text{ ms}$ duration, $|\Delta X| > 2 \cdot |\Delta Y|$).
4. **Content Protection:** Preserve anti-theft rules in `ContentProtection.tsx` (disable right click, image dragging, devtools shortcut keys, and global user selection).

---

## ☁️ 3. Asset & File Upload Pipeline

1. **Primary GitHub CDN:** Use `uploadToGithub(file)` from `@/lib/githubUpload.ts` to commit binary assets directly into GitHub storage.
2. **Asset Cleanup:** When updating or replacing an existing image/resume in the CMS, invoke `deleteFromGithub(oldUrl)`.
3. **Google Drive Fallback:** When Google Drive URLs are entered, normalize them to `thumbnail?id=...` or `lh3.googleusercontent.com` thumbnail endpoints.

---

## 🤖 4. AI Chatbot Guidelines

1. **Matching Logic:** Fuzzy matching via Levenshtein Distance with stop-word stripping in `Chatbot.tsx`.
2. **Resume Triggers:** Keywords `resume`, `cv`, or `download` must always trigger the dynamic resume button pulling the active resume URL from `/api/hero`.

---

## ✅ 5. Verification Before Delivery

Always run:
```bash
npx tsc --noEmit
```
Ensure zero TypeScript compilation errors before committing or completing tasks.

