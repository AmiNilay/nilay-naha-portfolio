# ⭐ Standout Features — Nilay Naha Portfolio

> **Last updated:** 2026-10-29 00:14 IST · **Live site:** https://nilay-naha-portfolio.vercel.app
>
> What each feature is, why it's here, why it stands out in 2026, how to run it and how to use it. A roadmap of AI-era features to add next is at the end.

---

## 🚀 Run the whole project

```bash
git clone https://github.com/AmiNilay/nilay-naha-portfolio.git
cd nilay-naha-portfolio
npm install
# create .env.local (see README.md → Quick Start for every variable)
npm run dev          # http://localhost:3000
npx tsc --noEmit     # type check (must pass with zero errors)
npm run build && npm start   # production build (enables the PWA service worker)
```

Admin panel: `http://localhost:3000/admin`. Log in with `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

---

## Contents

1. [Free AI Portfolio Assistant](#1-free-ai-portfolio-assistant)
2. [Chatbot Auto-Navigation](#2-chatbot-auto-navigation)
3. [3D Avatar with Emotions](#3-3d-avatar-with-emotions)
4. [Admin MCP Server](#4-admin-mcp-server)
5. [AI Discoverability (llms.txt, JSON-LD, AI crawlers)](#5-ai-discoverability)
6. [Custom Headless CMS](#6-custom-headless-cms)
7. [Asset Pipeline (GitHub CDN + Google Drive)](#7-asset-pipeline)
8. [Progressive Web App + Push Notifications](#8-progressive-web-app--push-notifications)
9. [App-Like Navigation with Reload Memory](#9-app-like-navigation-with-reload-memory)
10. [Ghost Cursor Background](#10-ghost-cursor-background)
11. [Command Palette (Ctrl/Cmd + K)](#11-command-palette)
12. [User-Flow Analytics](#12-user-flow-analytics)
13. [Recommendations (Testimonials)](#13-recommendations)
14. [Experience Timeline with Company Logos](#14-experience-timeline-with-company-logos)
15. [AI Tools & LLMs Skill Stack](#15-ai-tools--llms-skill-stack)
16. [Markdown + KaTeX Blog Engine](#16-markdown--katex-blog-engine)
17. [Content Protection](#17-content-protection)
18. [Performance: ISR, Cache Priming, Prefetch](#18-performance)
19. [AI-Era Roadmap — What to Add Next](#-ai-era-roadmap--what-to-add-next-2026)

---

## 1. Free AI Portfolio Assistant

| | |
| :--- | :--- |
| **What** | A chat assistant that answers recruiter questions (projects, experience, skills, education, blog, contact, availability) from the **live CMS content**. |
| **Why I added it** | Recruiters skim. A chat box lets them ask "Does he know Docker?" and get an answer in one second instead of hunting through pages. |
| **Why it stands out** | Most 2026 portfolio bots are a paid LLM API wrapped in a prompt. They cost money per message, can stop working when the key runs out, and can invent facts. This engine costs ₹0 and needs no API key. It ranks content with BM25 full-text search plus intent detection. It never claims anything the portfolio doesn't say: unknown topics get an honest "not listed" answer. |
| **How it works** | `POST /api/chat` → `src/lib/chatEngine.ts`. Knowledge rebuilds on every CMS save. Rate-limited to 60 questions per IP per hour. |
| **How to use** | Click the avatar bubble (bottom corner) and ask anything. Type **resume** or **cv** to get an instant résumé download (falls back to the generated one-page résumé when no PDF is uploaded). On phones the chat opens full-screen; on tablets, desktops and TVs it floats. While it works, Claude-style spinner verbs ("Pondering…", "Rummaging through projects…") rotate beside the typing dots *(added 2026-10-28 23:20 IST)*. *(Updated 2026-10-28 23:05 IST)* In the admin panel, **Admin → Chatbot** lets you add curated answers for soft questions and test the bot exactly as visitors see it. |

## 2. Chatbot Auto-Navigation

| | |
| :--- | :--- |
| **What** | Ask about a specific project or article and the assistant replies, then **opens that page for you** ("Opening it for you…"). |
| **Why I added it** | It turns the chatbot from a Q&A box into a guide that takes action for the visitor. |
| **Why it stands out** | Agentic UX (an assistant that acts, not just talks) is the 2026 trend. Few portfolios do it, and this one does it with zero LLM cost. |
| **How it works** | The engine returns `navigate: "/projects/<slug>"`. The widget calls `router.push` after 1.2 s. Follow-up suggestion chips skip questions already asked and top up from a pool, so the conversation keeps moving. |
| **How to use** | Ask "Tell me about ShortDesk" or "Show me your article on …". |

## 3. 3D Avatar with Emotions

| | |
| :--- | :--- |
| **What** | A 3D-shaded human assistant with a headset. It has gradient lighting, glossy eyes and ambient shadows, and its head turns toward your cursor. It has 9 expressions: neutral, happy, excited, thinking, confused, sad, surprised, sleepy and annoyed. |
| **Why I added it** | Personality makes the site memorable, and emotions show the bot's state (thinking, can't find it, happy). |
| **Why it stands out** | It is pure SVG + Framer Motion, with no 3D model download. It loads instantly on mobile and still looks 3D. It reacts: it gets sleepy after 45 s idle and annoyed after 5 rapid clicks. It can play soft sounds made with the Web Audio API, so there are no audio files. |
| **How to use** | Move your mouse around and the avatar follows. Use the speaker icon in the chat header to turn sounds on or off. |

## 4. Admin MCP Server

| | |
| :--- | :--- |
| **What** | A **Model Context Protocol** server at `/api/mcp`. AI agents (Claude Code, Claude Desktop, Cursor, …) can manage your portfolio for you: create, update, publish and delete projects and blog posts, and edit your About and Home content. |
| **Why I added it** | You can say "Add my new project X with this description and publish it" to an AI agent and it's done without opening the admin panel. |
| **Why it stands out** | MCP is the 2026 standard for connecting AI agents to tools. A personal portfolio that is itself an MCP server shows you understand the AI-native stack, not just how to use ChatGPT. It is free, token-protected and has no SDK dependency. |
| **Tools** | `list_projects`, `get_project`, `create_project`, `update_project`, `delete_project`, `list_posts`, `get_post`, `create_post`, `update_post`, `delete_post`, `get_about`, `update_about`, `get_hero`, `update_hero` |
| **How to use** | Connect once from Claude Code: |

```bash
claude mcp add --transport http portfolio https://nilay-naha-portfolio.vercel.app/api/mcp \
  --header "Authorization: Bearer <ADMIN_SECRET>"
```

Then ask your agent things like *"Create a draft blog post about my sign-language research"* or *"Mark ShortDesk as featured"*. Keep `ADMIN_SECRET` private: anyone with it can edit your site.

## 5. AI Discoverability

| | |
| :--- | :--- |
| **What** | **`/llms.txt`**: a markdown summary of you (role, experience, education, skills, projects, contact, LinkedIn, GitHub, Instagram), generated from the live CMS. **Person JSON-LD**: structured data with your name, job, school, skills and social profiles. **robots.txt** explicitly allows AI crawlers: GPTBot, ChatGPT-User, ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended and CCBot. A generated social preview image is included too. |
| **Why I added it** | In 2026, people ask ChatGPT, Claude or Perplexity "Who is Nilay Naha?" instead of Googling. Those tools should answer from *your* site, with accurate facts. |
| **Why it stands out** | Most portfolios only do classic SEO. This one is optimised for AI answer engines (GEO, Generative Engine Optimization). |
| **How to use** | Nothing to do: it updates automatically when you edit the CMS. Check it at `/llms.txt` and `/robots.txt`. Fill in **Admin → Home → social links** (including Instagram) so they appear. AI crawlers decide on their own when to re-crawl, so changes can take weeks to show up in their answers. |

## 6. Custom Headless CMS

| | |
| :--- | :--- |
| **What** | My own admin panel at `/admin`: Dashboard, Home (hero, socials, résumé), Projects, Blog (live-preview Markdown editor), About, Chatbot, Testimonials, Notifications and Analytics. |
| **Why I added it** | I can update the portfolio from my phone in seconds without touching code or redeploying. |
| **Why it stands out** | Most portfolios hard-code content or rent a SaaS CMS. This one is built from scratch with Next.js 14, MongoDB and Edge Middleware auth (HTTP-only cookie), and shows full-stack ability end to end. |
| **How to use** | Go to `/admin` and log in. Every save instantly refreshes the public pages and the chatbot's knowledge. |

## 7. Asset Pipeline

| | |
| :--- | :--- |
| **What** | Uploaded images and résumés are committed to a dedicated GitHub repo (`AmiNilay/my-portfolio-assets`) through the GitHub REST API. Google Drive links are converted into working thumbnail or embed URLs as a fallback. |
| **Why I added it** | It gives me free, permanent hosting without bloating the main code repo. |
| **Why it stands out** | It's a creative ₹0 CDN. Old assets are deleted automatically when replaced. |
| **How to use** | Upload in any admin form, or paste a Google Drive share link. |

## 8. Progressive Web App + Push Notifications

| | |
| :--- | :--- |
| **What** | The site installs like a native app on desktop and mobile, works offline for visited pages, and sends Web Push notifications (VAPID). |
| **Why I added it** | Followers can subscribe and get notified when I publish a new article or project. |
| **Why it stands out** | Very few portfolios are installable apps with their own notification channel. |
| **How to use** | Visitors use the browser's **Install** button and the bell button to subscribe. You use **Admin → Notifications** to send a broadcast. The service worker only runs in production builds. |

## 9. App-Like Navigation with Reload Memory

| | |
| :--- | :--- |
| **What** | The home page is a slide deck (Home → Projects → Blog → About → Contact) navigated by swipe, arrow keys or the navbar. A refresh keeps you on the same section and scroll position (`/#about`, `/#projects`, …). |
| **Why I added it** | It feels like a mobile app, and a refresh shouldn't throw you back to the top. |
| **Why it stands out** | Anti-ghost-swipe thresholds: a swipe must be over 100 px, shorter than 600 ms, and at least twice as horizontal as vertical, so scrolling never flips the page by accident. |
| **How to use** | Swipe left or right on mobile, or use ← → on desktop. |

## 10. Ghost Cursor Background

| | |
| :--- | :--- |
| **What** | A Three.js shader smoke trail that follows the cursor, tuned separately for light mode (multiply blend) and dark mode (screen blend). |
| **Why I added it** | It's a signature visual touch. |
| **Why it stands out** | It's a real GPU shader rendered *behind* all content (z-index −1), so it never covers text or images. |
| **How to use** | Move the mouse. |

> **Topic filters (added 2026-10-28 23:59 IST):** blog and project pages filter by a shared set of 7 topics (AI & Machine Learning, Web Development, Backend & APIs, Mobile Apps, Desktop Apps, Security & Privacy, Career & Learning) with item counts; every post and project carries 1–3. Admin editors add them with one click (`src/lib/topics.ts`). The topic bar scrolls left/right with arrow buttons, mouse wheel or swipe *(added 2026-10-29 00:05 IST)*.

## 11. Command Palette

| | |
| :--- | :--- |
| **What** | Spotlight-style global search across pages and blog posts. |
| **Why it stands out** | It's a developer-native UX pattern (VS Code, Linear, Raycast) on a portfolio. |
| **How to use** | Press **Ctrl + K** (Windows) or **⌘ + K** (Mac). |

## 12. User-Flow Analytics

| | |
| :--- | :--- |
| **What** | First-party, cookie-free tracking of page-to-page journeys and drop-off rates, with a dashboard at **Admin → Analytics** (7, 30 or 90 days). |
| **Why it stands out** | It respects privacy (no Google Analytics, no cookie banner) and the data is fully owned. |
| **How to use** | Open **Admin → Analytics**. |

## 13. Recommendations

| | |
| :--- | :--- |
| **What** | Testimonials managed in **Admin → Testimonials** (draft or publish, order) and shown on the About page. The chatbot can quote them. |
| **How to use** | Add a recommendation, then publish it. The section is hidden while nothing is published. |

## 14. Experience Timeline with Company Logos

| | |
| :--- | :--- |
| **What** | Each role shows the company logo (uploaded or linked, never cropped) and the company's LinkedIn page. |
| **How to use** | Go to **Admin → About → Experience**, then **Upload logo** or paste a URL or Drive link, then **Save**. If the fields don't appear, hard refresh with Ctrl + Shift + R. |

## 15. AI Tools & LLMs Skill Stack

| | |
| :--- | :--- |
| **What** | 20+ selectable AI tools (Claude, Claude Code, Cursor, Copilot, Gemini, DeepSeek, Qwen…) with theme-aware icons. |
| **Why it stands out** | In 2026, recruiters screen for AI-tool fluency, and this makes it visible at a glance. |
| **How to use** | Go to **Admin → About → Skills**. |

## 16. Markdown + KaTeX Blog Engine

| | |
| :--- | :--- |
| **What** | A Unified/Remark/Rehype pipeline with math (KaTeX), syntax-highlighted code, auto heading IDs and a sticky table of contents. |
| **How to use** | Write Markdown in **Admin → Blog**. Use `$…$` for inline math and `$$…$$` for block math. |

## 17. Content Protection

| | |
| :--- | :--- |
| **What** | Blocks right-click, image dragging, text selection and devtools shortcuts on public pages. |
| **Why I added it** | It discourages copy-paste theft of my work and images. |

## 18. Performance

| | |
| :--- | :--- |
| **What** | ISR caching, server data primed into the client cache, idle-time prefetch of other pages, a 60 s client cache expiry, and instant page purges on CMS edits. Pages left open across a deploy recover automatically: if they request a script from the old build, the site reloads once to the new version *(added 2026-10-28 23:44 IST)*. Public APIs are served from a server data cache (no database trip per visitor), the blog list skips article bodies, and the 3D effects (cursor trail, mascot) load only after the page is ready — never on touch devices for the cursor trail. *(Added 2026-10-28 22:54 IST)* |
| **Why it stands out** | Navigation between sections is near-instant, and edits still go live immediately. |

---

## 🆕 Features added on 2026-10-22 (second and third rounds)

Same format: **What · Why I added it · Why it stands out · How to use.**

## 19. Public Read-Only MCP Server (for recruiters' AI agents)

| | |
| :--- | :--- |
| **What** | `POST /api/mcp/public`: an MCP server anyone's AI agent can connect to with no login. Tools: `get_profile`, `list_projects`, `get_project`, `list_posts`, `get_post`, `search_portfolio`, `match_job_description`. It returns published content only and is rate-limited to 120 requests per IP per hour. |
| **Why I added it** | Recruiters in 2026 screen candidates with AI agents. My portfolio can answer those agents directly and accurately. |
| **Why it stands out** | Almost no personal portfolio exposes itself as an MCP tool. It shows I build *for* the agent ecosystem, not just with it. |
| **How to use** | `claude mcp add --transport http nilay-portfolio https://nilay-naha-portfolio.vercel.app/api/mcp/public`, then ask *"Is Nilay a fit for this job description: …?"* It is also advertised in `/llms.txt`. |

## 20. Job-Description Matcher

| | |
| :--- | :--- |
| **What** | `/match`: a recruiter pastes a job description and gets a 0–100 score, the skills I match with evidence, the missing skills (listed honestly), and my most relevant projects and experience. |
| **Why I added it** | It answers a recruiter's first question, "Is he a fit?", in 5 seconds. |
| **Why it stands out** | Deterministic and explainable: every claim links to real portfolio content. It handles synonyms (JS→JavaScript, k8s→Kubernetes) and needs no LLM bill. |
| **How to use** | Visit `/match`, or press Ctrl+K → *Job Match*. The chatbot also links to it from its "is he available?" answers. |

## 21. Tailored Résumé Generator

| | |
| :--- | :--- |
| **What** | `/resume/tailored`: a one-page A4 résumé that puts the skills and projects matching the job description first, built only from CMS data. |
| **Why it stands out** | A personalised résumé per job, generated instantly and free. |
| **How to use** | From a `/match` result, click *Tailored résumé* → **Download PDF**. This opens the browser's print dialog; choose *Save as PDF*. |

## 22. On-Device AI Smart Search

| | |
| :--- | :--- |
| **What** | A Ctrl+K → *Smart search* toggle that ranks results by meaning (Transformers.js + MiniLM embeddings running in the browser). |
| **Why it stands out** | Semantic search with zero server cost and zero data leaving the visitor's device. It adds nothing to page load until it's switched on. |
| **How to use** | Press Ctrl+K and switch on *Smart search*. The first use downloads a model of about 25 MB, which the browser then caches. |

## 23. Chatbot Voice Mode

| | |
| :--- | :--- |
| **What** | A mic button (speech → text) and a "read answers aloud" speaker toggle, using the browser's Web Speech API. |
| **Why I added it** | It makes the site hands-free and accessible, and memorable in a demo. |
| **Why it stands out** | Free, with no audio API. The avatar shows a "listening" expression. |
| **How to use** | Open the chat: tap 🎤 to speak, and use the speaker icon in the header to hear replies. The mic is hidden in browsers that don't support speech input. |

## 24. Multilingual Chatbot (9 languages)

| | |
| :--- | :--- |
| **What** | English, हिन्दी, বাংলা, தமிழ், తెలుగు, मराठी, Español, Français and Deutsch. Hindi, Bengali, Tamil and Telugu are auto-detected from the script. |
| **Why it stands out** | Uses Chrome's **on-device** Translator API: free, private, and no API key. |
| **How to use** | Pick a language in the chat header, or just type in Hindi or Bengali. Translation needs Chrome or Edge 138+; other browsers get English with a note. |

## 25. Realistic 3D Avatar

| | |
| :--- | :--- |
| **What** | A rebuilt avatar with a real jawline, key light and cyan rim light, ambient occlusion, realistic eyes and lips, and a CSS-3D head turn. It looks around on its own when idle. |
| **Why it stands out** | It looks 3D but is pure SVG, so there is no 3D model download and it stays fast on mobile. |
| **How to use** | Automatic. After a deploy, reload once so the browser picks up the new version. |

## 26. Project Case Studies & Evaluation Benchmarks

| | |
| :--- | :--- |
| **What** | Optional Problem → Approach → Results sections, metric tiles (e.g. "Latency 120 ms"), and an Evaluation block (dataset, method, benchmark bars of score vs baseline). |
| **Why I added it** | Recruiters hire for impact and rigour, not a list of technologies. |
| **Why it stands out** | Evals are the #1 senior-AI-engineer signal in 2026, and few portfolios show them. |
| **How to use** | Admin → Projects → edit a project → *Case Study & Impact* and *Evaluation (ML / LLM)* cards. AI agents can also set these through the admin MCP server. |

## 27. "How I Use AI" Page

| | |
| :--- | :--- |
| **What** | `/ai`: my AI-assisted engineering workflow, written in Markdown. |
| **How to use** | Admin → About → *How I Use AI*. If it's empty, the page honestly lists the AI tools I've selected. |

## 28. Education Media, 172-Skill Catalog, Auto-Scrolling Tech Marquee

| | |
| :--- | :--- |
| **What** | Each college gets a large photo banner, a location and its LinkedIn page. The skill catalog grows to 172 entries (mobile, automation and scraping, Bitbucket and dev tools, cloud and DevOps, testing, AI/ML). The hero's tech chips scroll continuously, and the hero no longer clips at mid-size or short windows. |
| **How to use** | Admin → About → *Academic Journey* and *Skills*. Admin → Home → *Stats Counters & Tech Stack* has the chip list and a speed slider (seconds per loop; default 40). |

## 29. Rich HTML/CSS Content + Google Drive Media Embeds

| | |
| :--- | :--- |
| **What** | Blog posts, project write-ups and the About bio accept safe HTML and CSS plus ready-made design classes (callouts, cards, grids, badges, gradient text…). You can drop **images, GIFs and videos from Google Drive links** anywhere in the text. |
| **Why I added it** | Demos belong *inside* the write-up ("here's the demo ↓"), and AI-written content often uses HTML. |
| **Why it stands out** | Free media hosting through Google Drive, with no storage bill and no uploads. It's sanitised, so it is safe even when AI writes the HTML. |
| **How to use** | See **[AI_CONTENT_PROMPT.md](AI_CONTENT_PROMPT.md)**: paste that prompt plus your notes into any AI, then paste the result into Admin → Blog or Projects. Set every Drive file to *Anyone with the link → Viewer*. |

## 30. Admin Always Light · Separate Home/About Photos · Auto "Last Updated"

| | |
| :--- | :--- |
| **What** | The admin panel always stays light, whatever theme the public site uses. Home and About have **separate** profile media, each accepting an image, an animated GIF or a video (upload or Drive link). The admin dashboard's "Last updated" time comes from the latest deployed git commit, so it updates on every push. |
| **How to use** | Admin → Home → profile media; Admin → About → its own image box. "Last updated" needs no action. |

---

## 31. Claude-Style Chat + Real 3D Avatar

| | |
| :--- | :--- |
| **What** | The chat window is redesigned in a Claude-like style: a warm ivory/stone palette, a serif header, plain-text answers and pill-shaped user bubbles. Settings live in a ⋯ menu, and the message box grows as you type. The avatar is a **real three.js 3D head**: lit skin, glossy eyes that follow the cursor, blinking, 9 emotions and idle breathing, on a transparent background with no backdrop. |
| **Why it stands out** | The 3D head is built in code, so there is no model download. It loads after the page becomes idle, so first paint isn't slowed, and the SVG shows instantly until it's ready. It pauses when off-screen. |
| **How to use** | Click the launcher. The ⋯ menu has language, read-aloud, sounds and new chat. Enter sends; Shift+Enter adds a new line. |

## 32. Security Hardening

| | |
| :--- | :--- |
| **What** | Signed, expiring admin sessions (HMAC) instead of a raw secret in the cookie, and login brute-force throttling. Every public endpoint is rate-limited, and cookie writes must come from your own site. There are CSP, HSTS and other security headers, MongoDB injection filtering, a contact-form honeypot, and an **audit log** of every admin and AI-agent change. Several real leaks are closed: the contact messages API and the push subscriber count were public. |
| **Why it stands out** | Portfolios now expose AI agents with write access (MCP), so guardrails and an audit trail are a senior-engineering signal. |
| **How to use** | Log in again after this deploy, because old cookies are rejected. Make ADMIN_SECRET at least 16 characters. Review activity at **Admin → Security**. |

## 33. Drafts Hidden Everywhere + Content Protection On

| | |
| :--- | :--- |
| **What** | Unpublished posts and projects never appear publicly: lists, pages (404), the chatbot, the sitemap, llms.txt and the MCP servers. The admin panel still sees them. Anti-copy protection is now active on public pages, while inputs and the chat still allow copy and paste. |
| **How to use** | Untick *Published* (blog) or set status *Draft* (project) to hide an item. |

## 34. Chat Insights Dashboard

| | |
| :--- | :--- |
| **What** | **Admin → Chat Insights**: question volume, top questions and topics, and **unanswered questions**, which are your content gaps. Logs are anonymous (hashed IPs) and auto-delete after 180 days. |
| **Why it stands out** | Your portfolio tells you what recruiters actually want to know. |
| **How to use** | Check it weekly, and turn the unanswered questions into content or chatbot rules. |

## 35. Live GitHub Activity

| | |
| :--- | :--- |
| **What** | A *Currently Building* section on About with recent pushes, PRs and releases, plus your three most recently pushed repos. It's cached for an hour. |
| **How to use** | Automatic, using your GitHub link from Admin → Home. |

## 36. Book a Call

| | |
| :--- | :--- |
| **What** | A prominent *Book a call* card on the Contact page. |
| **How to use** | Create a free Cal.com or Calendly link and paste it into **Admin → Home → Booking URL**. The card appears once it's set. |

## 37. Interactive Project Demos

| | |
| :--- | :--- |
| **What** | *Try the live demo* on project pages. It embeds StackBlitz, CodeSandbox, CodePen, Hugging Face Spaces, Replit, YouTube or your deployed app, loaded only when clicked and sandboxed. |
| **How to use** | Admin → Projects → edit → *Interactive Demo Embed URL*. |

---

## 38. Swagger / OpenAPI API Docs

| | |
| :--- | :--- |
| **What** | `/api-docs`: interactive, themed Swagger UI for the whole backend: 26 endpoints and 48 operations, with auth schemes, rate limits and example requests (chat, job match, MCP JSON-RPC). The raw spec is at `/api/openapi.json`. |
| **Why I added it** | It shows backend professionalism: a documented, testable API like a real product. |
| **Why it stands out** | Very few portfolios publish an OpenAPI contract. Recruiters and engineers can **try endpoints live** in the browser. |
| **How to use** | Open `/api-docs`, pick an endpoint, then **Try it out → Execute**. Admin endpoints work when you're logged in. Import `/api/openapi.json` into Postman, Insomnia or any code generator. |

## 39. Logo Tech Picker on Home + 2026 Tech Catalog (286)

| | |
| :--- | :--- |
| **What** | Admin → Home's scrolling tech strip uses the same **click-to-select logo grid** as About, so every chip shows its logo. The catalog was researched and expanded in one pass to 286 entries, covering AI coding agents, agent frameworks (LangGraph, CrewAI, Claude/OpenAI Agents SDK, A2A), RAG and vector DBs, LLMOps and evals, inference and fine-tuning, modern web (Bun, Hono, tRPC, Astro), backend SaaS, infra and security, and data engineering. |
| **How to use** | Admin → Home → *Stats Counters & Tech Stack*: click logos to add them, use ‹ › to reorder, and set the speed slider. Future updates are just a click; nothing needs adding from scratch. |

### 📚 15 Technologies to Learn Next (2026)

1. **Claude Code**: the most-used coding agent of 2026.
2. **MCP**: the standard for agent-to-tool connections, which you already ship.
3. **LangGraph**: stateful, human-in-the-loop agents.
4. **Claude Agent SDK / OpenAI Agents SDK**: production agent building.
5. **Vercel AI SDK**: streaming AI interfaces in Next.js.
6. **pgvector**: vector search in plain Postgres.
7. **Langfuse**: open-source LLM tracing and observability.
8. **Promptfoo / Ragas**: evals, the senior AI-engineer signal.
9. **vLLM / Ollama**: serve open models yourself.
10. **Unsloth + LoRA**: cheap fine-tuning on one GPU.
11. **Pydantic AI**: type-safe agents that pair with FastAPI.
12. **A2A Protocol**: agent-to-agent communication, alongside MCP.
13. **Bun + Hono**: a fast, edge-ready TypeScript backend.
14. **OpenTelemetry**: one observability standard for apps and LLMs.
15. **Docker Compose + Cloudflare Workers**: reproducible development and free edge deploys.

## 41. Real 3D Mascot Model + "Check job fit" Button (2026-10-22)

> **Removed 2026-10-28 23:31 IST:** the 3D mascot slowed loading in many browsers. The chatbot now shows one static image (see §40). The "Check job fit" button is unchanged.

| | |
| :--- | :--- |
| **What** | The chatbot mascot is now a **real 3D model** (`public/models/chatbot-mascot.glb`, 266 KB), generated from my reference portrait with free **TRELLIS** image-to-3D. It has textured hair, glasses, face and the hoodie with the `</>` logo, viewable from any angle. On the site it turns toward the cursor, breathes, nods when happy and tilts when thinking, on a transparent background. The home hero also has a **Check job fit** button next to *View Work* and *Résumé*, so recruiters reach `/match` in one click. |
| **Why it stands out** | A personal 3D brand character with zero cost. Meshopt geometry plus a JPEG texture keep it to 266 KB, loaded only after the page is idle, and the transparent 2D figure shows instantly until it's ready. |
| **Fix (2026-10-22 11:38)** | The mascot first rendered grey because the CSP blocked the embedded texture (`connect-src` lacked `blob:`) and the file marked the material 100% metallic. Both are fixed: full colour in light and dark mode, and the baked texture glows slightly so colours stay vivid. |
| **Limitations** | Generated from one image, so the back of the head is softer than the front. The model has no skeleton or facial shape keys yet, so expressions are head gestures rather than mouth or eye changes. |
| **How to upgrade** | Optional: open the GLB in Blender, add shape keys (`happy`, `thinking`, `blink`, `mouthOpen`) and a `Head` bone (or rig it with Mixamo), re-export, and replace the file. The component picks these up automatically; see MASCOT_PIPELINE.md (removed). |

## 40. Branded Chatbot Mascot

> **Updated 2026-10-28 23:31 IST:** the mascot is now a **single static image** (`MASCOT_IMAGE` in `src/components/chatbot/mascotConfig.ts`) on the launcher, chat header and messages, with no 3D, animation or expression swaps, so it loads instantly everywhere. To change it, add a new image to `public/` and update that one path. The rows below describe the earlier version.

| | |
| :--- | :--- |
| **What** | The chatbot uses my own mascot (a young engineer with glasses, a black hoodie and a cyan `</>` logo) as a **transparent cut-out figure**: no background, disc or glow, just the character with a soft shadow, and a faint cool rim in dark mode. It has neutral, happy, thinking, explaining and coding expressions that crossfade as the bot reacts. The component automatically switches to a **real 3D model** once `public/models/chatbot-mascot.glb` is added, with lighting, framing, expressions and animations mapped by name. |
| **Why it stands out** | A consistent personal brand character rather than a generic bot icon. The same figure is used in light and dark mode, the backgrounds were removed locally with free rembg, it loads only ~140 KB of images, and the 3D model is lazy-loaded. |
| **How to use / upgrade** | Follow MASCOT_PIPELINE.md (removed) to make the GLB for free (image → 3D → Blender cleanup → rig → compress), then drop it into `public/models/` and push. No code changes are needed. |

## 42. Framework Security Upgrade (2026-10-22 11:44)

| | |
| :--- | :--- |
| **What** | Next.js 14.1.0 → **14.2.35**, closing CVE-2025-29927 (middleware auth bypass) plus SSRF, cache-poisoning and DoS fixes. |
| **Verified** | Production build, every public page and API returned 200, the admin panel still redirects when logged out (also when the attack header is sent), and unauthenticated writes return 401. |
| **Maintenance** | Every 3–6 months: `npm update` within 14.2.x, then build and push. It takes about 10 minutes, and any AI agent can do it. |

## 🧭 Honest Assessment — How This Portfolio Compares in the 2026 AI Era

**Short version:** it's in the **top tier technically**. Most 2026 portfolios are a template, a paid-API chatbot and a project grid. This one is a full product: its own CMS, two MCP servers, AI-engine discoverability, a free explainable chatbot with voice and languages, recruiter tools (job match, tailored résumé), on-device semantic search, analytics, an audit trail and real security.

**What makes it stand out**
- **AI-native, not AI-decorated:** MCP servers, llms.txt, on-device ML, and an assistant that acts (navigates) instead of only chatting.
- **₹0 running cost**, with no paid LLM keys. That's a design decision you can explain in interviews.
- **Engineering depth:** security, rate limiting, audit logs, caching and PWA. These are things hiring managers rarely see in portfolios.

**Where it can still lose to others (be honest)**
1. **Content beats features.** Recruiters spend 30–90 seconds on a portfolio. Two or three **excellent case studies** with real metrics, demo GIFs and evaluations will matter more than any new feature. Fill them in.
2. **Proof of impact:** real users, stars, deployments, internship results. Add numbers wherever you truthfully can.
3. **Feature overload risk:** keep the home page simple. The advanced features should feel discoverable, not noisy.
4. **Freshness:** a blog post or project update every 2–4 weeks keeps GitHub activity, the sitemap and AI engines current.

## 💡 More Standout Ideas (beyond the roadmap)

| Idea | Why | Effort |
| :--- | :--- | :-: |
| **Architecture diagrams** on project pages (Mermaid rendered in content) | Shows system-design thinking | Small |
| **"Ask about this project"** button that opens the chatbot pre-scoped to the project | Contextual AI help | Small |
| **Changelog / Now page** (`/now`) built automatically from commits and posts | Shows momentum | Small |
| **Generated Open Graph image per project/post** | Better link previews on LinkedIn/X | Small |
| **Uptime and performance badges** for live demos (free status page) | Production mindset | Small |
| **Certifications with verify links** and an Open Badges view | Trust | Small |
| **Recruiter mode:** one-click PDF pack (résumé + top 3 case studies) | Easy to forward internally | Medium |
| **Accessibility audit (WCAG 2.2 AA)** and a statement page | Rare and valued | Medium |
| **Passkey (WebAuthn) login for admin** | Modern, phishing-proof admin | Medium |

## ⭐ Portfolio Rating — 2026-10-22

**Overall: 8.5 / 10.** Engineering and features: **9.5 / 10**. Content and proof: **6.5 / 10**, and this is the gap.

| Area | Score | Why |
| :--- | :-: | :--- |
| AI-native features | 10 | Two MCP servers, `llms.txt` + AI crawler rules, on-device semantic search, an assistant that acts, voice + 9 languages, and job match. Very few portfolios have even one of these. |
| Engineering depth | 9.5 | Custom CMS, signed sessions, rate limits, CSP, audit log, OpenAPI/Swagger, PWA + push, ISR caching. This reads as a product, not a template. |
| Cost & ownership | 10 | ₹0 running cost and no paid LLM keys, with everything self-owned. A strong interview story. |
| Recruiter UX | 8.5 | Job match, tailored résumé, book-a-call and fast navigation. Risk: so many features can feel busy, so keep the home page focused. |
| Visual design & brand | 8 | Clean Apple-style UI and a branded mascot. Per-project OG images would push this to 9+. |
| Content & proof of impact | 6.5 | Case studies, metrics, evals and demo GIFs are still mostly empty. **This decides interviews more than features.** |
| Freshness | 7 | Live GitHub activity helps; regular posts or updates every 2–4 weeks are needed. |

**Why it beats most 2026 portfolios:** most are a template, a paid-API chatbot and a project grid. Yours is **built for AI agents and recruiters at the same time**. AI search engines can quote it, recruiters' agents can query it through MCP, and a recruiter can paste a job description and get evidence-backed fit in seconds. It is also secure, documented (Swagger) and costs nothing to run. Those are senior-level signals.

**How to reach 9.5–10:**
1. Fill in 3 flagship case studies: problem → approach → results with real numbers, a demo GIF/video, and evals for the ML project.
2. ~~Real 3D mascot GLB~~ removed 2026-10-28 23:31 for load speed; the mascot is a static image.
3. Publish 1 post per month, for example how you built the MCP server or the free chatbot engine. These double as proof.
4. ✅ "Check job fit" button added to the home hero (2026-10-22 11:33).

## 🚀 New Feature Ideas — Round 2 (2026)

| # | Feature | Why it stands out in 2026 | Effort | Cost |
| :-: | :--- | :--- | :-: | :-: |
| N1 | **AI mock-interview mode**: the chatbot asks the visitor (or you) technical questions about your own projects and scores the answers against the case study | Turns the portfolio into an interactive interview; memorable for recruiters | Medium | Free |
| N2 | **`/resume.json` (JSON Resume schema) + `/.well-known/` agent card** for A2A/agent discovery | Lets AI hiring agents parse you perfectly; A2A is the emerging agent standard | Small | Free |
| N3 | **WebMCP tools in the browser**: expose "search projects" and "match job" to browser AI assistants via the emerging WebMCP proposal | Very early adopter signal; few sites have it | Medium | Free |
| N4 | **Personalised recruiter landing**: `/?for=Company&role=Backend` highlights matching projects and skills | Feels made for each company; great in cold outreach | Small | Free |
| N5 | **TL;DR + "Explain like I'm a recruiter" toggle on blog posts** (extractive summary, no LLM) | Respects a 30-second attention span | Small | Free |
| N6 | **RSS/Atom feed + email updates** (Buttondown free tier or push) | Followers return; AI engines pick up fresh content | Small | Free |
| N7 | **Terminal mode**: `npx nilay` CLI card and a `/terminal` page you can type commands into | Developer-native personality; goes viral on LinkedIn | Small | Free |
| N8 | **Proof-of-work metrics**: verified GitHub stats (commits, PRs merged, languages) and WakaTime coding hours | Hard numbers instead of claims | Small | Free |
| N9 | **Open-source contributions page** (PRs to other repos via the GitHub API) | Shows you collaborate beyond your own projects | Small | Free |
| N10 | **Project "build log" timelines**: dated milestones and screenshots per project | Shows process and iteration, not just the final result | Small | Free |
| N11 | **Live system status page** (`/status`) for your APIs and demos, using free uptime checks | Production ownership mindset | Small | Free |
| N12 | **Visitor-facing "How this site works" page**: architecture diagram, stack, cost (₹0), security and Swagger links | Turns the portfolio itself into your best case study | Small | Free |
| N13 | **Full-site i18n (Hindi/Bengali)**, not just the chatbot | Reach and accessibility | Medium | Free |
| N14 | **Guestbook / endorsements with GitHub login** (moderated) | Social proof from real developers | Medium | Free |
| N15 | **Lighthouse CI + a public score badge** (from the roadmap) | Visible quality bar | Small | Free |

**Recommended next 5:** N12 → N2 → N4 → N8 → N1.

---

## 🧰 Setup Checklist — Things YOU Need to Do

All of these are **free**. Do each one once.

### 1. Environment variables (Vercel → Project → Settings → Environment Variables)
Add each one to **Production**, **Preview** and **Development**, then **redeploy** (Deployments → ⋯ → Redeploy). Changes apply only after a redeploy.

| Variable | What it is | How to get it |
| :--- | :--- | :--- |
| `MONGODB_URI` | Database connection | MongoDB Atlas → Database → Connect → Drivers → copy the URI. Under Network Access, allow `0.0.0.0/0`, because Vercel's IP addresses change. |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Admin login | Choose them yourself. Use a strong password. |
| `ADMIN_SECRET` | Signs admin sessions **and** is the admin MCP bearer token (must be 16+ characters; after changing it, log in again) | Generate a long random value: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Never share it. |
| `GITHUB_TOKEN` | Uploads images to the assets repo | GitHub → Settings → Developer settings → **Fine-grained token** → Repository access: `my-portfolio-assets` only → Permissions: **Contents: Read and write**. Set a reminder before it expires. |
| `GITHUB_USERNAME` / `GITHUB_REPO` | Asset repo location | `AmiNilay` / `my-portfolio-assets` |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Web Push public key | See step 2 |
| `VAPID_PRIVATE_KEY` | Web Push private key (secret) | See step 2 |
| `VAPID_SUBJECT` | Contact for push services | `mailto:niloynaha2003@gmail.com` |

### 2. Generate VAPID keys (Web Push notifications)
```bash
npx web-push generate-vapid-keys
```
It prints a **Public Key** and a **Private Key**.
1. Put the Public Key in `NEXT_PUBLIC_VAPID_PUBLIC_KEY` and the Private Key in `VAPID_PRIVATE_KEY`, both in Vercel and in your local `.env.local`.
2. Redeploy. `NEXT_PUBLIC_*` values are baked in at build time, so a redeploy is required.
3. Generate the keys **once only**. New keys invalidate every existing subscriber, so visitors would need to subscribe again.
4. Test it: open the site, click the bell to subscribe, then go to Admin → Notifications → send a test.

### 3. Google Drive media (images, GIFs, videos)
1. Upload the file to Google Drive.
2. Right-click → **Share** → General access: **Anyone with the link** → **Viewer**.
3. Copy the link (`https://drive.google.com/file/d/<ID>/view?usp=sharing`) and paste it into any image field or into content, as shown in `AI_CONTENT_PROMPT.md`.
4. Videos play in Drive's player. Large videos can take a few minutes after upload before they will play.

### 4. Connect AI agents
- **Admin (write access):** `claude mcp add --transport http portfolio https://nilay-naha-portfolio.vercel.app/api/mcp --header "Authorization: Bearer <ADMIN_SECRET>"`
- **Public (read-only):** `claude mcp add --transport http nilay-portfolio https://nilay-naha-portfolio.vercel.app/api/mcp/public`

### 5. Content to fill in (Admin panel)
- [ ] Home: Instagram link, the tech marquee list and speed, and the home profile media
- [ ] About: its own profile media, college photos, locations and LinkedIn pages, and *How I Use AI*
- [ ] Projects: case study, metrics and evaluation for your top 2–3 projects, plus demo GIFs or videos inside the descriptions
- [ ] Chatbot: curated answers for soft questions (strengths, teamwork…)

### 6. After every deploy
- Hard refresh the admin panel once (Ctrl + Shift + R) so the installed PWA picks up new admin screens.
- AI search engines re-read `/llms.txt` on their own schedule, which can take days to weeks.

---

## 🔮 AI-Era Roadmap — What to Add Next (2026)

Features that would make a software engineer's portfolio stand out in the AI era. ✅ = already done.

| # | Feature | Why it matters in 2026 | Effort | Cost |
| :-: | :--- | :--- | :-: | :-: |
| ✅ | AI assistant answering from live content | Recruiters ask instead of browse | — | Free |
| ✅ | MCP server for the CMS | Proves AI-native engineering | — | Free |
| ✅ | `llms.txt` + JSON-LD + AI crawler rules | Be the source AI answer engines quote | — | Free |
| ✅ 1 | **Public read-only MCP server** (`/api/mcp/public`) (`get_profile`, `search_projects`) | Recruiters' own AI agents can query you directly ("compare these 5 candidates") | Small | Free |
| ✅ 2 | **Job-description matcher** (`/match`): paste a JD and get a match score with evidence from your projects | Saves a recruiter time and shows fit instantly | Medium | Free (BM25 engine) |
| ✅ 3 | **Tailored résumé generator** (`/resume/tailored`): produces a PDF that highlights the projects relevant to a JD | Personalisation at scale | Medium | Free |
| ✅ 4 | **Voice mode** for the assistant (Web Speech API speech-to-text and text-to-speech) | Hands-free, accessible, memorable | Small | Free (browser) |
| ✅ 5 | **Multilingual answers** (9 languages, on-device) (Hindi, Bengali, …) | Wider reach | Medium | Free |
| 6 | **Live GitHub activity + "currently building"** feed | Proves you ship continuously | Small | Free (GitHub API) |
| ✅ 7 | **AI project case studies with metrics**: problem → approach → results (latency, accuracy, users) | Recruiters want impact, not tech lists | Content | Free |
| 8 | **Interactive project demos / sandboxes** embedded on project pages | Try-before-you-hire | Medium | Free tiers |
| ✅ 9 | **"How I use AI" page** (`/ai`): your workflow with Claude Code, MCP, agents, prompt engineering and evals | The 2026 hiring question is how you work *with* AI | Content | Free |
| ✅ 10 | **AI evals showcase**: how you test ML/LLM features (datasets, accuracy, regression checks) | Signals senior-level AI engineering | Medium | Free |
| ✅ 11 | **Semantic search** (Ctrl+K → Smart search) with on-device embeddings (e.g. Transformers.js) | Smarter search with no API bill | Medium | Free |
| 12 | **Book-a-call / availability calendar** (Cal.com embed) | Shortest path from interest to interview | Small | Free tier |
| 13 | **Chat transcript insights** in the admin panel: top questions visitors ask | Tells you what recruiters care about, so you can improve content | Small | Free |
| 14 | **Accessibility & Core Web Vitals badge** (Lighthouse CI in GitHub Actions) | Shows engineering rigor | Small | Free |
| 15 | **Security hardening**: rate limits on all admin routes, audit log of MCP / admin actions, optional 2FA | AI agents with write access need guardrails | Medium | Free |
| 16 | **Open-source the CMS as a template** | Stars and community credibility | Medium | Free |

**Shipped 2026-10-22:** 1, 2, 3, 4, 5, 7, 9, 10, 11 — see below. **Next suggested:** 13 → 6 → 12 → 15.

### How to use the new recruiter & AI features

| Feature | How to use |
| :--- | :--- |
| Public MCP | Anyone's AI agent: `claude mcp add --transport http nilay-portfolio https://nilay-naha-portfolio.vercel.app/api/mcp/public` then ask *"Is Nilay a fit for this JD?"* |
| Job match | Visit `/match` (or Ctrl+K → Job Match), paste a JD → score, evidence, gaps. |
| Tailored résumé | From the match result → *Tailored résumé* → **Download PDF** (browser print, A4). |
| Voice & languages | Chat header: language picker, speaker toggle; mic button in the input bar. Translation needs Chrome/Edge 138+. |
| Case studies & evals | Admin → Projects → edit → *Case Study & Impact* and *Evaluation* cards. |
| How I use AI | Admin → About → *How I Use AI* (markdown) → shown at `/ai`. |
| Smart search | Ctrl+K → toggle *Smart search* (one-time ~25 MB model download, cached by the browser). |
| Hero tech marquee | Admin → Home → *Stats Counters & Tech Stack*: chips + speed slider. |
| College details | Admin → About → *Academic Journey*: photo, location, college LinkedIn. |

### 🔜 What's good to add next (recommended order)

| Priority | Feature | Why now | Effort |
| :-: | :--- | :--- | :-: |
| ✅ 1 | **Chat transcript insights** (#13) | You already get chatbot traffic; seeing the top questions tells you exactly what content recruiters want. | Small |
| ✅ 2 | **Hide drafts site-wide** | Draft posts/projects are currently visible on public list pages and to the chatbot; only the public MCP and job match exclude them. | Small |
| ✅ 3 | **Live GitHub activity** (#6) | A "currently building" feed proves you ship every week. | Small |
| ✅ 4 | **Book-a-call** (#12, Cal.com free) | Turns a good job match straight into an interview slot. | Small |
| ✅ 5 | **Security hardening** (#15): MCP/admin audit log + login rate limit | AI agents now have write access; log every change. | Medium |
| 6 | **Lighthouse CI badge** (#14) | Free GitHub Action; visible proof of performance and accessibility. | Small |
| ✅ 7 | **Interactive demos** (#8): embed StackBlitz/CodeSandbox/Hugging Face Spaces in project pages | Try-before-you-hire. The new content embeds make this easy. | Medium |
| ✅ 8 | **Enable Content Protection** | `ContentProtection.tsx` exists but is not mounted anywhere yet. | Tiny |
