# ✍️ AI Content Prompt — Blog Posts & Project Write-ups

> **Last updated:** 2026-10-22
>
> **How to use:** copy everything inside the **PROMPT** block below. Paste it into any AI (ChatGPT, Claude, Gemini, …), then paste your raw notes, links and screenshots list under `MY NOTES`. Paste the AI's answer into **Admin → Blog → Content** or **Admin → Projects → Description**, and click **Preview** to check it before saving.

---

## Before you start: Google Drive media (free, no uploads)

1. Upload the image, GIF or video to Google Drive.
2. Right-click it → **Share** → **General access** → **Anyone with the link** (Viewer).
3. Copy the link (`https://drive.google.com/file/d/<ID>/view?usp=sharing`) and put it in your notes with a short caption, e.g. `demo video: <link>`.

The site converts these links automatically. Images load from Google's image CDN, GIFs stay animated, and videos play in Drive's player. Without "Anyone with the link" access, the media shows as a broken image.

---

## PROMPT

````text
You are writing content for Nilay Naha's developer portfolio (Next.js site). Turn MY NOTES into a polished,
modern, scannable piece. Output ONLY the content (no explanations), in the exact format below.

WHAT TO WRITE: <blog post | project write-up>   (I'll tell you at the end)

────────────────────────────────────────
1. FORMAT THE SITE SUPPORTS
────────────────────────────────────────
• Markdown (GitHub-flavoured): headings (start at ##, never #), **bold**, *italic*, ~~strike~~, lists,
  task lists, tables, > blockquotes, links, footnotes.
• Code blocks with a language tag: ```python … ``` (syntax-highlighted automatically).
• Math with KaTeX: inline $E = mc^2$, block $$ … $$.
• Raw HTML can be mixed into Markdown. Leave a blank line before and after every HTML block.
  Inside an HTML block, Markdown is NOT parsed, so use HTML tags (<strong>, <em>, <a>, <ul>) there.
• Allowed HTML: div, span, section, figure, figcaption, details, summary, mark, kbd, sub, sup, small,
  table/thead/tbody/tr/th/td, img, video, iframe (YouTube, Vimeo, CodePen, CodeSandbox, StackBlitz,
  Google Drive preview only), blockquote, cite, ol, ul, li, a, strong, em, br, hr, h2–h6, p, code, pre.
• Allowed attributes: class, style (inline CSS), id, href, src, alt, title, width, height, align,
  colspan, rowspan, target.
• A <style> block is allowed. It is auto-scoped to the article, so it can't restyle the rest of the site.
  Prefer the ready-made classes below; keep custom CSS small.

NOT ALLOWED (it will be stripped): <script>, onclick/any on* handlers, forms/inputs/buttons,
external stylesheets (<link>), @import, position:fixed, javascript: links, Tailwind utility classes
(they don't exist at runtime — use the classes below instead).

────────────────────────────────────────
2. MEDIA (Google Drive links — put each on its OWN line)
────────────────────────────────────────
::image[Caption text](https://drive.google.com/file/d/ID/view)
::gif[Caption text](https://drive.google.com/file/d/ID/view)      ← keeps the animation
::video[Caption text](https://drive.google.com/file/d/ID/view)    ← Drive video player, 16:9
::video[Caption text](https://youtu.be/VIDEO_ID)                  ← YouTube works too
A bare Drive or YouTube link alone on a line also becomes an embedded player.
Inline image inside text: ![alt text](drive link). Put "gif" in the alt text for animated GIFs.
Side-by-side media: wrap ::image lines in <div class="grid-2"> … </div> (blank lines inside).
Use ONLY the Drive/YouTube links given in MY NOTES — never invent URLs. Where a visual would help
but I gave none, write a placeholder comment line:  <!-- MEDIA: screenshot of … -->

────────────────────────────────────────
3. READY-MADE DESIGN CLASSES (light + dark mode built in)
────────────────────────────────────────
<div class="callout info|tip|success|warn|danger"><span class="callout-title">Title</span>Text…</div>
<div class="card">…</div>                      bordered card
<div class="grid-2">…</div> / <div class="grid-3">…</div> / <div class="two-col">…</div>   responsive grids
<div class="stat"><strong>94%</strong><span>Accuracy</span></div>   big gradient number (put several in grid-3)
<span class="badge">Python</span>             pill tag
<span class="gradient-text">Text</span>       accent gradient text
<span class="highlight">text</span> or <mark>text</mark>   highlighter
<span class="muted">text</span>               secondary text
<a class="btn-link" href="…">Live demo →</a> gradient button link
<blockquote class="quote">Quote<cite>— Name</cite></blockquote>
<ol class="timeline"><li><strong>Step</strong> — detail</li></ol>   vertical timeline
<details><summary>Click to expand</summary>Hidden details…</details>
<div class="center">…</div>                   centered block
<kbd>Ctrl</kbd> + <kbd>K</kbd>                keyboard keys

────────────────────────────────────────
4. STRUCTURE
────────────────────────────────────────
BLOG POST
  - First line: a 1–2 sentence hook paragraph (no heading).
  - A row of 3–5 <span class="badge"> topic tags.
  - ## sections with clear, specific headings (they become the table of contents).
  - At least one callout, one visual (media or placeholder), code where relevant.
  - ## Key takeaways (bulleted) and a short closing line.
  - 900–1800 words unless MY NOTES say otherwise. Also give, ABOVE the content and separated by ---:
    Title, Slug (kebab-case), Excerpt (≤ 160 chars), Category, Tags (comma list), Read time.

PROJECT WRITE-UP (goes in the project Description)
  - Hook paragraph: what it is and who it's for, in two sentences.
  - <div class="grid-3"> with 3 <div class="stat"> headline numbers (only real numbers from MY NOTES).
  - Demo media (::video or ::gif) near the top.
  - ## The problem · ## How it works (architecture, maybe a table of components) · ## Tech stack (badges)
    · ## Challenges & solutions · ## Results · ## What's next
  - <a class="btn-link"> for the live demo / source code if links are given.
  ALSO output, after the description and separated by ---, the CASE STUDY fields for the admin form:
    Problem: (markdown, 2–4 sentences)
    Approach: (markdown, bullets)
    Results: (markdown, bullets with numbers)
    Metrics: label | value | hint   (one per line, 2–4 rows, real numbers only)
    Evaluation (only for ML/LLM projects): Dataset, Method, Findings (markdown),
      Benchmarks: name | score | baseline

────────────────────────────────────────
5. STYLE
────────────────────────────────────────
Confident, clear, first person ("I built…"). Short paragraphs (≤ 4 lines), lots of whitespace,
scannable lists, concrete numbers. No fluff, no hype words ("revolutionary", "cutting-edge").
Never invent facts, metrics, employers or links — if something is missing, leave a <!-- TODO: … --> comment.

MY NOTES:
<paste notes, links, Drive URLs with captions, numbers here>

WRITE: <blog post | project write-up>
````

---

## Example output (project write-up, abridged)

```markdown
ShortDesk is a privacy-first URL shortener with a glassmorphic dashboard. It turns long links into clean, trackable short links in under a second.

<div class="grid-3">
<div class="stat"><strong>&lt;120 ms</strong><span>Redirect latency</span></div>
<div class="stat"><strong>1.2k</strong><span>Links created</span></div>
<div class="stat"><strong>99.9%</strong><span>Uptime</span></div>
</div>

::video[Creating and sharing a short link](https://drive.google.com/file/d/1AbC…/view)

## The problem

Long tracking URLs break in chats and look untrustworthy. Free shorteners inject ads and sell click data.

<div class="callout tip"><span class="callout-title">Design goal</span>No ads, no third-party trackers, with analytics that stay on my own database.</div>

## How it works

| Layer | Choice | Why |
| :-- | :-- | :-- |
| API | Express + Node.js | Simple, fast redirects |
| Data | MongoDB Atlas | TTL indexes for expiring links |

<span class="badge">Node.js</span> <span class="badge">Express</span> <span class="badge">MongoDB</span>

<div class="grid-2">

::image[Dashboard](https://drive.google.com/file/d/1XyZ…/view)

::gif[Copy-to-clipboard flow](https://drive.google.com/file/d/1QwE…/view)

</div>

<a class="btn-link" href="https://example.com">Live demo →</a>

---
Problem: Long URLs are unreadable and free shorteners track users.
Approach:
- Base62 IDs with collision checks
- MongoDB TTL indexes for expiry
Results:
- Redirects under 120 ms (p95)
Metrics:
Latency | <120 ms | p95 redirect
Links | 1.2k | first 3 months
```

---

## Where this content is rendered

| Area | Field | Notes |
| :--- | :--- | :--- |
| Blog | Admin → Blog → Content | Full support |
| Projects | Admin → Projects → Description | Full support |
| Project case study | Problem / Approach / Results / Evaluation findings | Markdown + media + classes |
| About | Bio | Full support |
| How I use AI (`/ai`) | Admin → About → How I Use AI | Full support |

The processor is `src/lib/markdownProcessor.ts` and the class styles are in `src/app/globals.css` (section "Rich content").
