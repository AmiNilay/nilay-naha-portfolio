# ⭐ Standout Features — Nilay Naha Portfolio

> **Last updated:** 2026-10-22 · **Live site:** https://nilay-naha-portfolio.vercel.app
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
| **How to use** | Click the avatar bubble (bottom corner) and ask anything. Type **resume** or **cv** to get an instant résumé download. In the admin panel, **Admin → Chatbot** lets you add curated answers for soft questions and test the bot exactly as visitors see it. |

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
| **What** | ISR caching, server data primed into the client cache, idle-time prefetch of other pages, a 60 s client cache expiry, and instant page purges on CMS edits. |
| **Why it stands out** | Navigation between sections is near-instant, and edits still go live immediately. |

---

## 🔮 AI-Era Roadmap — What to Add Next (2026)

Features that would make a software engineer's portfolio stand out in the AI era. ✅ = already done.

| # | Feature | Why it matters in 2026 | Effort | Cost |
| :-: | :--- | :--- | :-: | :-: |
| ✅ | AI assistant answering from live content | Recruiters ask instead of browse | — | Free |
| ✅ | MCP server for the CMS | Proves AI-native engineering | — | Free |
| ✅ | `llms.txt` + JSON-LD + AI crawler rules | Be the source AI answer engines quote | — | Free |
| 1 | **Public read-only MCP server** (`get_profile`, `search_projects`) | Recruiters' own AI agents can query you directly ("compare these 5 candidates") | Small | Free |
| 2 | **Job-description matcher**: paste a JD and get a match score with evidence from your projects | Saves a recruiter time and shows fit instantly | Medium | Free (BM25 engine) |
| 3 | **Tailored résumé generator**: produces a PDF that highlights the projects relevant to a JD | Personalisation at scale | Medium | Free |
| 4 | **Voice mode** for the assistant (Web Speech API speech-to-text and text-to-speech) | Hands-free, accessible, memorable | Small | Free (browser) |
| 5 | **Multilingual answers** (Hindi, Bengali, …) | Wider reach | Medium | Free |
| 6 | **Live GitHub activity + "currently building"** feed | Proves you ship continuously | Small | Free (GitHub API) |
| 7 | **AI project case studies with metrics**: problem → approach → results (latency, accuracy, users) | Recruiters want impact, not tech lists | Content | Free |
| 8 | **Interactive project demos / sandboxes** embedded on project pages | Try-before-you-hire | Medium | Free tiers |
| 9 | **"How I use AI" page**: your workflow with Claude Code, MCP, agents, prompt engineering and evals | The 2026 hiring question is how you work *with* AI | Content | Free |
| 10 | **AI evals showcase**: how you test ML/LLM features (datasets, accuracy, regression checks) | Signals senior-level AI engineering | Medium | Free |
| 11 | **Semantic search** with on-device embeddings (e.g. Transformers.js) | Smarter search with no API bill | Medium | Free |
| 12 | **Book-a-call / availability calendar** (Cal.com embed) | Shortest path from interest to interview | Small | Free tier |
| 13 | **Chat transcript insights** in the admin panel: top questions visitors ask | Tells you what recruiters care about, so you can improve content | Small | Free |
| 14 | **Accessibility & Core Web Vitals badge** (Lighthouse CI in GitHub Actions) | Shows engineering rigor | Small | Free |
| 15 | **Security hardening**: rate limits on all admin routes, audit log of MCP / admin actions, optional 2FA | AI agents with write access need guardrails | Medium | Free |
| 16 | **Open-source the CMS as a template** | Stars and community credibility | Medium | Free |

**Suggested order:** 13 → 1 → 2 → 9 → 7 → 4. The first two reuse code that already exists. Items 9 and 7 are content that speaks directly to 2026 hiring managers.
