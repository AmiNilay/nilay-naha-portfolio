# 🤖 Agent Rules & Execution Invariants

> **MANDATORY FOR ALL CODING AGENTS (Antigravity, Claude Code, Cursor, Windsurf):**
> Before adding, editing, or refactoring anything in this project, you **MUST** read and strictly adhere to:
> 1. [**`CLAUDE.md`**](file:///e:/my-portfolio/CLAUDE.md) / [**`RULES.md`**](file:///e:/my-portfolio/RULES.md) (Engineering Rules & Protocol)
> 2. [**`CODEBASE_MAP.md`**](file:///e:/my-portfolio/CODEBASE_MAP.md) (File Logic Dictionary & Architecture)

---

## 🔁 The Mandatory Agent Workflow

1. **Context First:** Check `CODEBASE_MAP.md` to see existing utilities, models, and routes before creating or modifying code. Never guess or duplicate existing functionality.
2. **Database Invariant:**
   - **Always** import `connectToDB` from `@/lib/connectToDB`.
   - **Never** import from `@/lib/db`.
   - **Always** import Mongoose models from `@/models/*` (`Post`, `Project`, `Hero`, `About`, `Subscription`, `Chatbot`).
   - **Never** import from `src/lib/models/*` (legacy schemas).
3. **Middleware & Security:**
   - All `/admin/*` routes are protected.
   - Any new public mutating endpoint (`POST`, `PUT`, `DELETE`) **must** be added to `publicApiRoutes` in `src/middleware.ts`.
   - Never disable or bypass `ContentProtection.tsx` (anti-theft media rules).
4. **Asset Storage:**
   - Primary asset uploads use GitHub API via `uploadToGithub` in `@/lib/githubUpload.ts`.
   - When replacing an asset in CMS, call `deleteFromGithub(oldUrl)`.
   - Google Drive links must be parsed into thumbnail / embed URLs.
5. **Always Verify:**
   - Run `npx tsc --noEmit` after every modification. Ensure **0 compile errors** before completing any task.
6. **Preserve Documentation Integrity:**
   - Update `CODEBASE_MAP.md` whenever adding or changing the purpose of any file.

