# 📋 Project Rules & Agent Execution Protocol

> **Target Audience:** All AI Coding Agents (Claude Code, Antigravity, Cursor, Windsurf, Copilot) and Human Contributors.
> **Scope:** Defines behavioral standards, coding conventions, architectural invariants, security rules, and verification checklists for the `nilay-naha-portfolio` codebase.

---

## 🔁 1. The Agentic Loop & Working Principles

Every AI assistant working on this codebase must adhere to the three-phase agentic cycle:

```
    ┌──────────────────────┐
    │  1. Gather Context   │ ──► Read CODEBASE_MAP.md & inspect relevant files
    └──────────┬───────────┘
               │
               ▼
    ┌──────────────────────┐
    │   2. Take Action     │ ──► Make targeted, surgical edits preserving types
    └──────────┬───────────┘
               │
               ▼
    ┌──────────────────────┐
    │  3. Verify Results   │ ──► Run `npx tsc --noEmit` & test edge cases
    └──────────┬───────────┘
               │
               ▼
    ┌──────────────────────┐
    │ 4. Sync & Ship       │ ──► ALWAYS `git pull --rebase` before `git push`
    └──────────────────────┘
```

### Core Working Rules:
1. **Context-First, Not Assumptions:**
   - Before editing any feature, consult [`CODEBASE_MAP.md`](file:///e:/my-portfolio/CODEBASE_MAP.md) to understand dependencies, data models, and API interactions.
   - Do not guess file structures or reinvent existing utilities.
2. **Delegate, Don't Dictate:**
   - Focus on user goals, outcomes, and edge cases. Work iteratively and communicate decisions clearly.
3. **Surgical Diffs:**
   - Make minimal, targeted changes. Do not reformat entire files or delete unrelated comments, imports, or docstrings.
4. **Preserve Documentation Integrity:**
   - Maintain existing docstrings and comments. If a modification alters behavior, update the corresponding documentation immediately.

---

## 🧠 2. Context Window & Compaction Instructions

### Compact Instructions
When Claude Code or any agent compacts or summarizes conversation context, the following elements **MUST ALWAYS BE PRESERVED**:
- Active database collection schemas (`Post`, `Project`, `Hero`, `About`, `Subscription`, `Chatbot`).
- Middleware authorization rules and the `publicApiRoutes` whitelist.
- The dual asset upload pipeline specifications (GitHub REST API + Google Drive parser).
- Ongoing user-specified architectural constraints and bug fixes.
- Current task status and verified file modifications.

### Token Economy:
- MCP and subagent tools should be queried on-demand.
- For broad architectural questions, refer to `CODEBASE_MAP.md` rather than doing deep recursive dumps of source directories.

---

## 🛡️ 3. Checkpoints, Safety & Permissions

1. **Autonomous Execution (Don't Ask for Basic Permissions):**
   - Automatically execute standard code edits, file updates, tests, type checks (`npx tsc --noEmit`), and git workflows without prompting the user for approval.
   - Proactively solve issues and proceed autonomously.
2. **Critical Confirmation Gate (Ask Only for Truly Dangerous Actions):**
   - Only stop to ask for explicit confirmation before:
     - Dropping or wiping MongoDB collections / production database data.
     - Destructive Git commands (`git reset --hard`, `git push --force`, deleting remote branches).
     - Deleting critical project directories or files outside normal refactoring.
3. **Environment Variable Security:**
   - **NEVER** hardcode, echo, log, or commit secret values from `.env.local` (`MONGODB_URI`, `GITHUB_TOKEN`, `ADMIN_SECRET`, `VAPID_PRIVATE_KEY`).

---

## ⚙️ 4. Technology Stack & Invariants

| Layer | Standard | Invariant / Rule |
| :--- | :--- | :--- |
| **Framework** | Next.js 14.1.0 (App Router) | All routes reside in `src/app`. No `pages/` directory. |
| **Language** | TypeScript 5 (Strict Mode) | Zero type errors (`npx tsc --noEmit` must always pass). |
| **Styling** | Tailwind CSS 3.3.0 | Use Tailwind classes; merge with `cn()` from `@/lib/utils`. |
| **Database** | MongoDB Atlas via Mongoose 8.1.1 | Must use `@/lib/connectToDB` connection cache. |
| **Animation** | Framer Motion 11.0.3 | Hardware-accelerated (`transform`, `opacity`). |
| **PWA** | `next-pwa` + Web Push API | Manifest exclusions in `next.config.js` are mandatory. |
| **Icons** | Lucide React + React Icons | `lucide-react` for UI; `react-icons` for brand & tech logos. |

---

## 📐 5. Architecture & Code Conventions

### A. Database & Models Rule
1. **Single Connection Point:**
   - **ALWAYS** import `connectToDB` from [`@/lib/connectToDB`](file:///e:/my-portfolio/src/lib/connectToDB.ts).
   - **NEVER** call `mongoose.connect()` independently in route handlers.
   - **NEVER** use the deprecated [`@/lib/db.ts`](file:///e:/my-portfolio/src/lib/db.ts).
2. **Active Schema Directory:**
   - **ALWAYS** import Mongoose models from [`@/models/*`](file:///e:/my-portfolio/src/models/).
     - `Post` from `@/models/Post` (for blog posts)
     - `Project` from `@/models/Project`
     - `Hero` from `@/models/Hero`
     - `About` from `@/models/About`
     - `Subscription` from `@/models/Subscription`
     - `Chatbot` from `@/models/Chatbot`
   - **NEVER** import from `src/lib/models/*` (legacy schemas).

### B. Security & Middleware Rules
1. **Edge Middleware Integrity:**
   - [`src/middleware.ts`](file:///e:/my-portfolio/src/middleware.ts) protects all `/admin/*` routes and blocks unauthorized mutating API requests.
2. **Public API Whitelisting:**
   - Any new public API endpoint that accepts `POST`, `PUT`, or `DELETE` requests from unauthenticated visitors **MUST** be explicitly appended to `publicApiRoutes` in `src/middleware.ts`:
     ```typescript
     const publicApiRoutes = [
       '/api/contact',
       '/api/auth/login',
       '/api/push/subscribe',
       '/api/views',
       // Add new public mutating routes here
     ];
     ```
3. **Content Protection Guard:**
   - [`ContentProtection.tsx`](file:///e:/my-portfolio/src/components/ui/ContentProtection.tsx) enforces anti-theft rules (disabling context menu, image dragging, text selection, and devtool shortcuts). Do not disable or circumvent this guard unless explicitly asked by the user.

### C. Asset Storage & File Uploads
1. **GitHub Dedicated CDN Repo:**
   - Binary assets (images, resumes) are committed to the dedicated assets repository [`AmiNilay/my-portfolio-assets`](https://github.com/AmiNilay/my-portfolio-assets) via `uploadToGithub` in [`@/lib/githubUpload.ts`](file:///e:/my-portfolio/src/lib/githubUpload.ts).
   - This keeps the main codebase repository completely decoupled from binary file bloat.
   - When an asset is replaced or deleted in the CMS, invoke `deleteFromGithub(oldUrl)`.
2. **Always Pull Before Push Invariant:**
   - Before executing `git push`, **ALWAYS** run `git pull --rebase origin main` to ensure local is in sync with remote commits without conflict.
3. **Google Drive Fallback:**
   - Google Drive URLs must be parsed through regex to generate working thumbnail URLs (`thumbnail?id=...` or `lh3.googleusercontent.com`) or embed URLs (`preview`). Do not use deprecated `uc?export=view` URLs.

### D. Navigation & Gestures
1. **Swipe Sensitivity Thresholds:**
   - When modifying [`PageNavigation.tsx`](file:///e:/my-portfolio/src/components/layout/PageNavigation.tsx) or [`HomeClient.tsx`](file:///e:/my-portfolio/src/app/(public)/HomeClient.tsx), preserve the anti-ghost-swiping thresholds:
     - Distance $> 100\text{ px}$
     - Touch duration $< 600\text{ ms}$
     - $|\Delta X| > 2 \cdot |\Delta Y|$ (horizontal movement strictly dominates vertical movement).

### E. AI Chatbot Development
1. **Answer Engine Standards:**
   - Answers come from [`src/lib/chatEngine.ts`](file:///e:/my-portfolio/src/lib/chatEngine.ts) via `POST /api/chat` — free, no LLM or API key. Factual answers must be composed from live CMS data, never hardcoded facts; curated `Chatbot` rules cover soft questions.
   - Never make the assistant claim something the portfolio content doesn't support; unknown topics get an honest "not on the portfolio" reply.
   - Any modification must preserve the instant résumé trigger (`resume`, `cv`, `résumé`) in [`Chatbot.tsx`](file:///e:/my-portfolio/src/components/ui/Chatbot.tsx), which uses the live résumé from `/api/hero`.

### F. Markdown & KaTeX Rendering
1. **Sanitization & IDs:**
   - Markdown articles and project details use Unified / Remark / Rehype pipeline in [`src/lib/markdownProcessor.ts`](file:///e:/my-portfolio/src/lib/markdownProcessor.ts).
   - Headings must receive auto-generated slug IDs to maintain sticky Table of Contents functionality.

---

## ✅ 6. Pre-Commit & Verification Checklist

Before reporting any task complete or delivering code changes, perform the following verification steps:

- [ ] **Type Check:** Run `npx tsc --noEmit` from the root directory. Ensure **zero** compile errors.
- [ ] **Import Audit:** Ensure all models are imported from `@/models/*` and database connections use `@/lib/connectToDB`.
- [ ] **Middleware Audit:** If any new public API endpoint was added, verify it is registered in `publicApiRoutes` in `src/middleware.ts`.
- [ ] **Client/Server Boundary:** Verify `"use client"` directive is present on all components using React hooks (`useState`, `useEffect`, `useRouter`, `usePathname`) or browser APIs.
- [ ] **Responsive Design:** Ensure changes display properly on mobile screens ($< 768\text{ px}$) and desktop displays.
- [ ] **Theme Safety:** Confirm UI components support both dark and light mode color tokens.

