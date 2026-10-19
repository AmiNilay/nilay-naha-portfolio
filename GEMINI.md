# 🤖 Gemini & Antigravity Project Instructions

> **CRITICAL DIRECTIVE:**
> Every time you are instructed to add, update, debug, or refactor anything in this project:
> 1. Consult and follow [**`CLAUDE.md`**](file:///e:/my-portfolio/CLAUDE.md) & [**`RULES.md`**](file:///e:/my-portfolio/RULES.md) for strict architectural rules.
> 2. Consult [**`CODEBASE_MAP.md`**](file:///e:/my-portfolio/CODEBASE_MAP.md) to understand existing file logic, models, and dependencies.
> 3. Verify changes with `npx tsc --noEmit` before marking any task as complete.

---

## 📌 Non-Negotiable Invariants:
- **Database:** Only `@/lib/connectToDB` (never `@/lib/db`). Active models from `@/models/*` (never `src/lib/models/*`).
- **Middleware:** Register any new public mutation API routes in `publicApiRoutes` in `src/middleware.ts`.
- **Assets:** GitHub upload via `uploadToGithub` in `@/lib/githubUpload.ts`. Delete old files with `deleteFromGithub`.
- **Security:** Maintain `ContentProtection.tsx`.
- **Documentation:** Keep `CODEBASE_MAP.md` synchronized whenever file purposes or routes change.
- **Autonomous Execution:** Proactively perform standard file edits, verifications, and git syncs without asking basic permissions. Only pause for confirmation on truly destructive operations (DB drops, force resets).

