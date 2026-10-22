import { SITE_URL } from "@/lib/profileData";

/**
 * Hand-written OpenAPI 3.1 description of every route under src/app/api.
 * Served at /api/openapi.json and rendered by Swagger UI at /api-docs.
 * Keep in sync when routes, bodies or rate limits change.
 */

type Json = Record<string, any>;

const json = (schema: Json, example?: unknown) => ({
  "application/json": { schema, ...(example !== undefined && { example }) },
});
const body = (schema: Json, example?: unknown, required = true) => ({ required, content: json(schema, example) });
const ok = (description: string, schema: Json = { type: "object" }, example?: unknown) => ({ description, content: json(schema, example) });
const ref = (name: string) => ({ $ref: `#/components/responses/${name}` });
const schemaRef = (name: string) => ({ $ref: `#/components/schemas/${name}` });
const qp = (name: string, description: string, schema: Json = { type: "string" }, required = false) => ({
  name, in: "query", required, description, schema,
});

const ADMIN = [{ adminSession: [] }];
const adminErrors = { 401: ref("Unauthorized"), 403: ref("Forbidden"), 429: ref("TooManyRequests") };
const publicErrors = { 400: ref("BadRequest"), 429: ref("TooManyRequests"), 500: ref("ServerError") };

const rpcExamples = {
  initialize: { summary: "initialize", value: { jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18" } } },
  list: { summary: "tools/list", value: { jsonrpc: "2.0", id: 2, method: "tools/list" } },
};

const formDataBody = (fields: Json, description: string) => ({
  required: true,
  description,
  content: { "multipart/form-data": { schema: { type: "object", properties: fields } } },
});

const PROJECT_FORM = {
  id: { type: "string", description: "PUT only: MongoDB _id or slug" },
  title: { type: "string" }, slug: { type: "string" }, description: { type: "string", description: "Markdown/HTML" },
  tags: { type: "string", description: "Comma-separated" }, githubLink: { type: "string" }, liveLink: { type: "string" },
  appLink: { type: "string" }, role: { type: "string" }, status: { type: "string", enum: ["Published", "Draft"] },
  frameStyle: { type: "string" }, featured: { type: "string", enum: ["true", "false"] }, publishDate: { type: "string", format: "date" },
  gDriveImage: { type: "string", description: "Google Drive share link" }, relatedBlog: { type: "string" },
  problem: { type: "string" }, approach: { type: "string" }, results: { type: "string" },
  metrics: { type: "string", description: "JSON array of {label,value,hint}" },
  evaluation: { type: "string", description: "JSON {dataset,method,results,benchmarks[]}" },
  demoEmbed: { type: "string", description: "Interactive demo URL" },
  image: { type: "string", format: "binary" },
};

const POST_FORM = {
  id: { type: "string", description: "PUT only" }, title: { type: "string" }, slug: { type: "string" },
  excerpt: { type: "string" }, content: { type: "string", description: "Markdown/HTML + media lines" },
  category: { type: "string" }, tags: { type: "string" }, published: { type: "string", enum: ["true", "false"] },
  readTime: { type: "string" }, gDriveImage: { type: "string" }, relatedProject: { type: "string" },
  image: { type: "string", format: "binary" },
};

export function buildOpenApiSpec(): Json {
  return {
    openapi: "3.1.0",
    info: {
      title: "Nilay Naha Portfolio API",
      version: "1.0.0",
      summary: "Public, recruiter, AI-agent and CMS endpoints behind nilay-naha-portfolio.vercel.app",
      description:
        "Free, self-hosted backend for the portfolio (Next.js 14 route handlers + MongoDB).\n\n" +
        "* **Public** endpoints are rate-limited per IP (limits listed per operation; counters are per serverless instance).\n" +
        "* **Admin** endpoints need the signed `admin_token` session cookie (log in at `/admin/login`). Cookie-authenticated writes must be same-origin.\n" +
        "* **MCP**: `/api/mcp/public` (read-only, no auth) and `/api/mcp` (admin, `Authorization: Bearer <ADMIN_SECRET>`) speak MCP JSON-RPC over Streamable HTTP.\n" +
        "* Drafts are never returned publicly.",
      contact: { name: "Nilay Naha", url: `${SITE_URL}/contact` },
    },
    servers: [{ url: SITE_URL, description: "Production" }],
    tags: [
      { name: "Public", description: "Portfolio content read by the site" },
      { name: "Recruiter", description: "Job match and tailored résumé" },
      { name: "AI/MCP", description: "Chat assistant and Model Context Protocol servers" },
      { name: "Content (CMS)", description: "Create/update/delete content — admin session required for writes" },
      { name: "Admin", description: "Authentication, audit, insights, previews, uploads" },
      { name: "Analytics", description: "First-party, cookie-free tracking" },
      { name: "Push", description: "Web Push subscriptions and broadcasts" },
    ],
    paths: {
      "/api/hero": {
        get: { tags: ["Public"], summary: "Home hero content", description: "Headline, intro, social links, résumé, tech marquee, booking URL.", responses: { 200: ok("Hero document", schemaRef("Hero")) } },
        put: { tags: ["Content (CMS)"], summary: "Update hero", security: ADMIN, requestBody: body(schemaRef("Hero")), responses: { 200: ok("Updated hero", schemaRef("Hero")), ...adminErrors } },
      },
      "/api/about": {
        get: { tags: ["Public"], summary: "About page content", description: "Bio (plus rendered `bioHtml`), skills, experience, education, certifications, aiWorkflow.", responses: { 200: ok("About document", schemaRef("About")) } },
        put: { tags: ["Content (CMS)"], summary: "Update About", description: "Only schema fields are accepted; Mongo operators are stripped.", security: ADMIN, requestBody: body(schemaRef("About")), responses: { 200: ok("Updated", schemaRef("About")), ...adminErrors } },
      },
      "/api/projects": {
        get: {
          tags: ["Public"], summary: "List projects or get one",
          parameters: [qp("slug", "Return one project by slug"), qp("id", "Return one project by MongoDB id"), qp("all", "`1` includes drafts (admin session only)", { type: "string", enum: ["1"] })],
          responses: { 200: ok("Projects", { type: "object", properties: { projects: { type: "array", items: schemaRef("Project") }, project: schemaRef("Project") } }), 404: ref("NotFound") },
        },
        post: { tags: ["Content (CMS)"], summary: "Create project", security: ADMIN, requestBody: formDataBody(PROJECT_FORM, "Image uploads go to the GitHub assets repo"), responses: { 201: ok("Created", { type: "object", properties: { project: schemaRef("Project") } }), ...adminErrors } },
        put: { tags: ["Content (CMS)"], summary: "Update project", description: "Only sent fields change.", security: ADMIN, requestBody: formDataBody(PROJECT_FORM, "Include `id`"), responses: { 200: ok("Updated"), 404: ref("NotFound"), ...adminErrors } },
        delete: { tags: ["Content (CMS)"], summary: "Delete project", security: ADMIN, parameters: [qp("id", "MongoDB id or slug", { type: "string" }, true)], responses: { 200: ok("Deleted"), ...adminErrors } },
      },
      "/api/blog": {
        get: {
          tags: ["Public"], summary: "List posts or get one",
          parameters: [qp("slug", "One post by slug"), qp("id", "One post by id"), qp("all", "`1` includes drafts (admin session only)", { type: "string", enum: ["1"] })],
          responses: { 200: ok("Posts", { oneOf: [{ type: "array", items: schemaRef("Post") }, schemaRef("Post")] }), 404: ref("NotFound") },
        },
        post: { tags: ["Content (CMS)"], summary: "Create post", security: ADMIN, requestBody: formDataBody(POST_FORM, "Drafts unless published=true"), responses: { 201: ok("Created"), ...adminErrors } },
        put: { tags: ["Content (CMS)"], summary: "Update post", security: ADMIN, requestBody: formDataBody(POST_FORM, "Include `id`"), responses: { 200: ok("Updated"), ...adminErrors } },
        delete: { tags: ["Content (CMS)"], summary: "Delete post", security: ADMIN, parameters: [qp("id", "Post id", { type: "string" }, true)], responses: { 200: ok("Deleted"), ...adminErrors } },
      },
      "/api/blog/{id}": {
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" }, description: "MongoDB id" }],
        get: { tags: ["Public"], summary: "Get post by id", description: "Drafts only for admin with `?all=1`.", responses: { 200: ok("Post", schemaRef("Post")), 404: ref("NotFound") } },
        put: { tags: ["Content (CMS)"], summary: "Update post by id", security: ADMIN, requestBody: formDataBody(POST_FORM, "Fields to change"), responses: { 200: ok("Updated"), ...adminErrors } },
        delete: { tags: ["Content (CMS)"], summary: "Delete post by id", security: ADMIN, responses: { 200: ok("Deleted"), ...adminErrors } },
      },
      "/api/testimonials": {
        get: { tags: ["Public"], summary: "Published testimonials", parameters: [qp("all", "`1` includes drafts (admin only)", { type: "string", enum: ["1"] })], responses: { 200: ok("Testimonials", { type: "array", items: { type: "object" } }) } },
        post: { tags: ["Content (CMS)"], summary: "Create testimonial", security: ADMIN, requestBody: body({ type: "object", properties: { name: { type: "string" }, role: { type: "string" }, company: { type: "string" }, quote: { type: "string" }, avatar: { type: "string" }, published: { type: "boolean" }, order: { type: "number" } } }), responses: { 200: ok("Created"), ...adminErrors } },
        put: { tags: ["Content (CMS)"], summary: "Update testimonial", security: ADMIN, requestBody: body({ type: "object", required: ["id"], properties: { id: { type: "string" } }, additionalProperties: true }), responses: { 200: ok("Updated"), 400: ref("BadRequest"), ...adminErrors } },
        delete: { tags: ["Content (CMS)"], summary: "Delete testimonial", security: ADMIN, parameters: [qp("id", "Testimonial id", { type: "string" }, true)], responses: { 200: ok("Deleted"), ...adminErrors } },
      },
      "/api/chatbot": {
        get: { tags: ["AI/MCP"], summary: "Curated chatbot rules", responses: { 200: ok("Rules", { type: "object", properties: { rules: { type: "array", items: schemaRef("ChatRule") } } }) } },
        post: { tags: ["Content (CMS)"], summary: "Create rule", security: ADMIN, requestBody: body(schemaRef("ChatRuleInput")), responses: { 200: ok("Created"), ...adminErrors } },
        put: { tags: ["Content (CMS)"], summary: "Update rule", security: ADMIN, requestBody: body({ allOf: [schemaRef("ChatRuleInput"), { type: "object", required: ["id"], properties: { id: { type: "string" } } }] }), responses: { 200: ok("Updated"), 400: ref("BadRequest"), ...adminErrors } },
        delete: { tags: ["Content (CMS)"], summary: "Delete rule", security: ADMIN, parameters: [qp("id", "Rule id", { type: "string" }, true)], responses: { 200: ok("Deleted"), ...adminErrors } },
      },
      "/api/chat": {
        post: {
          tags: ["AI/MCP"], summary: "Ask the portfolio assistant",
          description: "Free answer engine over live CMS content (no LLM). Rate limit: **60 questions / IP / hour**. Questions are logged anonymously (hashed IP, 180-day TTL) for the admin insights page.",
          requestBody: body(
            { type: "object", required: ["question"], properties: { question: { type: "string", maxLength: 500 }, context: { type: "string", description: "`context` from the previous reply, for follow-ups" }, language: { type: "string", example: "en" }, path: { type: "string", example: "/" } } },
            { question: "What projects has he built?", language: "en", path: "/" }
          ),
          responses: { 200: ok("Answer", schemaRef("ChatReply"), { reply: "Here are Nilay's projects: …", links: [{ label: "All projects", url: "/projects" }], quickReplies: ["What's his tech stack?"], context: "projects", emotion: "happy" }), ...publicErrors },
        },
      },
      "/api/match": {
        post: {
          tags: ["Recruiter"], summary: "Match a job description",
          description: "Deterministic, explainable score (75% skill coverage + 25% BM25 relevance). JD capped at 20k chars. Rate limit: **30 / IP / hour**. Send `resume: true` to also get tailored résumé data.",
          requestBody: body(
            { type: "object", required: ["jd"], properties: { jd: { type: "string", maxLength: 20000 }, resume: { type: "boolean" } } },
            { jd: "We're hiring a Full-Stack Engineer with React, Next.js, Node.js, MongoDB and Docker experience…", resume: false }
          ),
          responses: { 200: ok("Match result", schemaRef("MatchResult")), ...publicErrors },
        },
      },
      "/api/mcp/public": {
        post: {
          tags: ["AI/MCP"], summary: "Public MCP server (read-only)",
          description: "MCP JSON-RPC over Streamable HTTP; stateless JSON responses. No auth. Rate limit: **120 / IP / hour**. Tools: `get_profile`, `list_projects`, `get_project`, `list_posts`, `get_post`, `search_portfolio`, `match_job_description`.\n\nConnect: `claude mcp add --transport http nilay-portfolio " + SITE_URL + "/api/mcp/public`",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: schemaRef("JsonRpcRequest"),
                examples: {
                  ...rpcExamples,
                  call: { summary: "tools/call get_profile", value: { jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "get_profile", arguments: {} } } },
                  search: { summary: "tools/call search_portfolio", value: { jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "search_portfolio", arguments: { query: "url shortener" } } } },
                },
              },
            },
          },
          responses: { 200: ok("JSON-RPC response", schemaRef("JsonRpcResponse")), 202: { description: "Notification accepted" }, ...publicErrors },
        },
        get: { tags: ["AI/MCP"], summary: "Not supported (stateless server)", responses: { 405: { description: "Method not allowed" } } },
      },
      "/api/mcp": {
        post: {
          tags: ["AI/MCP"], summary: "Admin MCP server (write access)",
          description: "Same protocol as the public server, but tools can create/update/delete projects and posts and edit About/Hero. Bearer `ADMIN_SECRET`; 10 failed tokens / 15 min locks the IP; **300 calls / hour**. Every write is audit-logged.",
          security: [{ mcpBearer: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: schemaRef("JsonRpcRequest"),
                examples: {
                  ...rpcExamples,
                  create: { summary: "tools/call create_post (draft)", value: { jsonrpc: "2.0", id: 5, method: "tools/call", params: { name: "create_post", arguments: { title: "Hello MCP", content: "# Hi", published: false } } } },
                },
              },
            },
          },
          responses: { 200: ok("JSON-RPC response", schemaRef("JsonRpcResponse")), 401: ref("Unauthorized"), 429: ref("TooManyRequests") },
        },
        get: { tags: ["AI/MCP"], summary: "Not supported (stateless server)", responses: { 405: { description: "Method not allowed" } } },
      },
      "/api/github": {
        get: { tags: ["Public"], summary: "Recent GitHub activity", description: "Recent public events and recently pushed repos for the GitHub user in Hero. Cached 1 hour.", responses: { 200: ok("Activity", { type: "object", properties: { events: { type: "array", items: { type: "object" } }, repos: { type: "array", items: { type: "object" } } } }) } },
      },
      "/api/contact": {
        post: {
          tags: ["Public"], summary: "Send a contact message",
          description: "Rate limit: **3 / IP / hour**. Includes a honeypot (`website` must be empty) and a minimum fill time (`startedAt` ≥ 2.5 s ago).",
          requestBody: body(
            { type: "object", required: ["name", "email", "message"], properties: { name: { type: "string" }, email: { type: "string", format: "email" }, message: { type: "string" }, website: { type: "string", description: "Honeypot — leave empty" }, startedAt: { type: "number", description: "Epoch ms when the form was opened" } } },
            { name: "Jane Recruiter", email: "jane@example.com", message: "Hi Nilay, let's talk!", website: "", startedAt: 1760000000000 }
          ),
          responses: { 200: ok("Sent"), ...publicErrors },
        },
        get: { tags: ["Admin"], summary: "List contact messages", security: ADMIN, responses: { 200: ok("Messages", { type: "array", items: { type: "object" } }), ...adminErrors } },
        patch: { tags: ["Admin"], summary: "Mark message read/unread", security: ADMIN, requestBody: body({ type: "object", required: ["id"], properties: { id: { type: "string" }, read: { type: "boolean" } } }), responses: { 200: ok("Updated"), ...adminErrors } },
        delete: { tags: ["Admin"], summary: "Delete message", security: ADMIN, parameters: [qp("id", "Message id", { type: "string" }, true)], responses: { 200: ok("Deleted"), ...adminErrors } },
      },
      "/api/views": {
        post: { tags: ["Analytics"], summary: "Count a blog post view", description: "Rate limit: **60 / IP / hour**, max one counted view per post per IP per 30 min.", requestBody: body({ type: "object", required: ["slug"], properties: { slug: { type: "string" } } }, { slug: "ai-crop-yield-prediction-xgboost-shap" }), responses: { 200: ok("Counted"), ...publicErrors } },
      },
      "/api/analytics/track": {
        post: { tags: ["Analytics"], summary: "Record a page visit", description: "Cookie-free page-flow tracking. Rate limit: **300 / IP / hour**.", requestBody: body({ type: "object", required: ["sessionId", "path"], properties: { sessionId: { type: "string" }, path: { type: "string" }, referrerPath: { type: "string" } } }), responses: { 200: ok("Recorded"), ...publicErrors } },
      },
      "/api/admin/analytics/flow": {
        get: { tags: ["Analytics"], summary: "User-flow statistics", security: ADMIN, parameters: [qp("days", "Window in days (1–365, default 30)", { type: "integer" })], responses: { 200: ok("Flow stats"), ...adminErrors } },
      },
      "/api/push/subscribe": {
        post: { tags: ["Push"], summary: "Store a Web Push subscription", description: "HTTPS endpoints only. Rate limit: **10 / IP / hour**.", requestBody: body({ type: "object", required: ["endpoint", "keys"], properties: { endpoint: { type: "string", format: "uri" }, keys: { type: "object", properties: { p256dh: { type: "string" }, auth: { type: "string" } } } } }), responses: { 200: ok("Subscribed"), ...publicErrors } },
      },
      "/api/push/broadcast": {
        get: { tags: ["Push"], summary: "Subscriber count", security: ADMIN, responses: { 200: ok("Count", { type: "object", properties: { count: { type: "integer" } } }), ...adminErrors } },
        post: { tags: ["Push"], summary: "Send a push notification to all subscribers", security: ADMIN, requestBody: body({ type: "object", required: ["title"], properties: { title: { type: "string" }, body: { type: "string", maxLength: 400 }, url: { type: "string", description: "Must be a path on this site" } } }), responses: { 200: ok("Sent"), ...adminErrors } },
      },
      "/api/auth/login": {
        post: { tags: ["Admin"], summary: "Admin login", description: "Sets the signed `admin_token` cookie (7 days). Throttled: **5 attempts / IP / 15 min**.", requestBody: body({ type: "object", required: ["email", "password"], properties: { email: { type: "string" }, password: { type: "string", format: "password" } } }), responses: { 200: ok("Logged in"), 401: ref("Unauthorized"), 429: ref("TooManyRequests") } },
      },
      "/api/auth/logout": { post: { tags: ["Admin"], summary: "Clear the admin session", responses: { 200: ok("Logged out") } } },
      "/api/auth/check": { get: { tags: ["Admin"], summary: "Is the current session an admin?", responses: { 200: ok("Authenticated"), 401: ref("Unauthorized") } } },
      "/api/admin/audit": {
        get: { tags: ["Admin"], summary: "Latest audit-log entries", description: "Logins, CMS writes and admin-MCP tool calls (hashed IPs, 180-day TTL).", security: ADMIN, responses: { 200: ok("Entries"), ...adminErrors } },
      },
      "/api/admin/chat-insights": {
        get: { tags: ["Admin"], summary: "Chat assistant insights", security: ADMIN, parameters: [qp("days", "7, 30 or 90", { type: "integer", enum: [7, 30, 90] })], responses: { 200: ok("Totals, top questions/topics, unanswered questions, daily volume"), ...adminErrors } },
      },
      "/api/admin/preview": {
        post: { tags: ["Admin"], summary: "Render content exactly as the public page will", security: ADMIN, requestBody: body({ type: "object", required: ["content"], properties: { content: { type: "string" } } }, { content: "::image[Demo](https://drive.google.com/file/d/<id>/view)" }), responses: { 200: ok("Rendered HTML", { type: "object", properties: { html: { type: "string" } } }), ...adminErrors } },
      },
      "/api/upload": {
        post: { tags: ["Admin"], summary: "Upload an image to the GitHub assets repo", description: "PNG/JPG/WebP/SVG/GIF (and MP4/WebM where enabled), ≤ 3 MB.", security: ADMIN, requestBody: { required: true, content: { "multipart/form-data": { schema: { type: "object", properties: { file: { type: "string", format: "binary" } } } } } }, responses: { 200: ok("Uploaded", { type: "object", properties: { url: { type: "string" } } }), 400: ref("BadRequest"), ...adminErrors } },
      },
      "/api/openapi.json": {
        get: { tags: ["Public"], summary: "This OpenAPI document", responses: { 200: ok("OpenAPI 3.1 spec") } },
      },
    },
    components: {
      securitySchemes: {
        adminSession: { type: "apiKey", in: "cookie", name: "admin_token", description: "Signed session cookie set by /api/auth/login" },
        mcpBearer: { type: "http", scheme: "bearer", description: "ADMIN_SECRET (admin MCP only)" },
      },
      responses: {
        BadRequest: { description: "Invalid input", content: json(schemaRef("Error"), { error: "A question is required" }) },
        Unauthorized: { description: "Missing or invalid credentials", content: json(schemaRef("Error"), { error: "Unauthorized" }) },
        Forbidden: { description: "Cross-origin cookie write rejected", content: json(schemaRef("Error"), { error: "Forbidden" }) },
        NotFound: { description: "Not found (drafts are reported as not found)", content: json(schemaRef("Error"), { error: "Not found" }) },
        TooManyRequests: { description: "Rate limit exceeded — see `Retry-After` header", headers: { "Retry-After": { schema: { type: "integer" } } }, content: json(schemaRef("Error"), { error: "Too many requests" }) },
        ServerError: { description: "Unexpected error", content: json(schemaRef("Error"), { error: "Something went wrong" }) },
      },
      schemas: {
        Error: { type: "object", properties: { error: { type: "string" } } },
        ChatLink: { type: "object", properties: { label: { type: "string" }, url: { type: "string" } } },
        ChatReply: {
          type: "object",
          properties: {
            reply: { type: "string", description: "Markdown-lite answer" },
            links: { type: "array", items: schemaRef("ChatLink") },
            quickReplies: { type: "array", items: { type: "string" } },
            context: { type: "string" },
            navigate: { type: "string", description: "Page the widget opens for the visitor" },
            emotion: { type: "string", enum: ["happy", "thinking", "confused", "excited"] },
          },
        },
        ChatRule: { type: "object", properties: { _id: { type: "string" }, keywords: { type: "array", items: { type: "string" } }, answer: { type: "string" }, quickReplies: { type: "array", items: { type: "string" } }, links: { type: "array", items: schemaRef("ChatLink") } } },
        ChatRuleInput: { type: "object", required: ["keywords", "answer"], properties: { keywords: { type: "string", description: "Comma-separated" }, answer: { type: "string" }, quickReplies: { type: "string", description: "Comma-separated" }, links: { type: "array", items: schemaRef("ChatLink") } } },
        MatchResult: {
          type: "object",
          properties: {
            score: { type: "integer", minimum: 0, maximum: 100 },
            verdict: { type: "string" },
            matched: { type: "array", items: { type: "object", properties: { skill: { type: "string" }, evidence: { type: "array", items: { type: "string" } } } } },
            missing: { type: "array", items: { type: "string" } },
            relevant: { type: "array", items: { type: "object" } },
            summary: { type: "string" },
          },
          additionalProperties: true,
        },
        JsonRpcRequest: { type: "object", required: ["jsonrpc", "method"], properties: { jsonrpc: { const: "2.0" }, id: { type: ["string", "number", "null"] }, method: { type: "string", enum: ["initialize", "ping", "tools/list", "tools/call"] }, params: { type: "object" } } },
        JsonRpcResponse: { type: "object", properties: { jsonrpc: { const: "2.0" }, id: { type: ["string", "number", "null"] }, result: { type: "object" }, error: { type: "object", properties: { code: { type: "integer" }, message: { type: "string" } } } } },
        Hero: { type: "object", additionalProperties: true, properties: { line1Bold: { type: "string" }, socialGithub: { type: "string" }, socialLinkedin: { type: "string" }, socialInstagram: { type: "string" }, socialEmail: { type: "string" }, techStack: { type: "string" }, techMarqueeSpeed: { type: "number" }, bookingUrl: { type: "string" } } },
        About: { type: "object", additionalProperties: true, properties: { bio: { type: "string" }, bioHtml: { type: "string" }, skills: { type: "array", items: { type: "string" } }, experience: { type: "array", items: { type: "object" } }, education: { type: "array", items: { type: "object" } }, aiWorkflow: { type: "string" } } },
        Project: { type: "object", additionalProperties: true, properties: { _id: { type: "string" }, title: { type: "string" }, slug: { type: "string" }, description: { type: "string" }, tags: { type: "array", items: { type: "string" } }, status: { type: "string" }, featured: { type: "boolean" }, metrics: { type: "array", items: { type: "object" } }, evaluation: { type: "object" }, demoEmbed: { type: "string" } } },
        Post: { type: "object", additionalProperties: true, properties: { _id: { type: "string" }, title: { type: "string" }, slug: { type: "string" }, excerpt: { type: "string" }, content: { type: "string" }, published: { type: "boolean" }, tags: { type: "array", items: { type: "string" } }, views: { type: "integer" } } },
      },
    },
  };
}
