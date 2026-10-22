"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpen, Copy, Check, FileJson, Bot, ShieldCheck, Zap } from "lucide-react";

// Swagger UI assets load from jsDelivr only on this page (pinned version).
const SWAGGER_VERSION = "5.17.14";
const CDN = `https://cdn.jsdelivr.net/npm/swagger-ui-dist@${SWAGGER_VERSION}`;

declare global {
  interface Window {
    SwaggerUIBundle?: any;
  }
}

function loadSwagger(): Promise<void> {
  if (window.SwaggerUIBundle) return Promise.resolve();
  if (!document.querySelector(`link[href="${CDN}/swagger-ui.css"]`)) {
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = `${CDN}/swagger-ui.css`;
    document.head.appendChild(css);
  }
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${CDN}/swagger-ui-bundle.js"]`);
    const script = existing || document.createElement("script");
    script.addEventListener("load", () => resolve());
    script.addEventListener("error", () => reject(new Error("Swagger UI failed to load")));
    if (!existing) {
      script.src = `${CDN}/swagger-ui-bundle.js`;
      script.async = true;
      document.body.appendChild(script);
    }
  });
}

function CopyLine({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-white/70 dark:bg-white/[0.04] p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#9CA3AF] mb-1.5">{label}</p>
      <div className="flex items-start gap-2">
        <code className="flex-1 min-w-0 text-[11.5px] leading-relaxed font-mono break-all text-[#111827] dark:text-[#E5E7EB]">{value}</code>
        <button
          type="button"
          aria-label={`Copy ${label}`}
          onClick={() => {
            navigator.clipboard?.writeText(value).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            });
          }}
          className="shrink-0 p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-[#0F766E] dark:text-[#F59E0B]"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}

export default function ApiDocsClient({ siteUrl }: { siteUrl: string }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    loadSwagger()
      .then(() => {
        if (cancelled || !mountRef.current || !window.SwaggerUIBundle) return;
        window.SwaggerUIBundle({
          url: "/api/openapi.json",
          domNode: mountRef.current,
          deepLinking: true,
          docExpansion: "list",
          defaultModelsExpandDepth: 0,
          displayRequestDuration: true,
          filter: true,
          tryItOutEnabled: false,
          persistAuthorization: false,
          // Requests go to this origin, so a logged-in admin's session cookie is sent automatically.
          requestInterceptor: (req: any) => {
            req.credentials = "same-origin";
            return req;
          },
        });
        setStatus("ready");
      })
      .catch(() => !cancelled && setStatus("error"));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen w-full overflow-y-auto bg-[#FAFAFA] dark:bg-[#0B0F14] pt-24 pb-20 px-4 sm:px-6" data-allow-select>
      <div className="max-w-6xl mx-auto">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#111827]/60 p-6 sm:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#0F766E]/10 dark:bg-[#F59E0B]/10 blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#0F766E]/20 dark:border-[#F59E0B]/25 bg-[#0F766E]/5 dark:bg-[#F59E0B]/10 text-[11px] font-bold tracking-[0.18em] uppercase text-[#0F766E] dark:text-[#F59E0B]">
              <BookOpen className="w-3.5 h-3.5" /> OpenAPI 3.1 · v1.0.0
            </div>
            <h1 className="mt-4 text-3xl sm:text-5xl font-bold tracking-tight text-[#111827] dark:text-white">
              Portfolio <span className="text-[#0F766E] dark:text-[#F59E0B]">API</span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm sm:text-base text-[#4B5563] dark:text-[#9CA3AF] leading-relaxed">
              The backend behind this site: public content, recruiter tools, the AI assistant, two MCP servers and the CMS.
              Public endpoints are rate-limited; admin endpoints need a signed session and are marked with a lock.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <a href="/api/openapi.json" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#111827] dark:bg-white text-white dark:text-[#111827] text-xs font-semibold hover:opacity-90">
                <FileJson className="w-3.5 h-3.5" /> openapi.json
              </a>
              <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-black/[0.08] dark:border-white/[0.1] text-xs text-[#374151] dark:text-[#D1D5DB]"><Zap className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#F59E0B]" /> Free · no API keys</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-black/[0.08] dark:border-white/[0.1] text-xs text-[#374151] dark:text-[#D1D5DB]"><ShieldCheck className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#F59E0B]" /> Rate-limited · audited</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-black/[0.08] dark:border-white/[0.1] text-xs text-[#374151] dark:text-[#D1D5DB]"><Bot className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#F59E0B]" /> MCP-ready</span>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
              <CopyLine label="Connect any AI agent (read-only MCP)" value={`claude mcp add --transport http nilay-portfolio ${siteUrl}/api/mcp/public`} />
              <CopyLine label="Try the assistant" value={`curl -X POST ${siteUrl}/api/chat -H "Content-Type: application/json" -d '{"question":"What projects has he built?"}'`} />
            </div>
          </div>
        </section>

        {/* Swagger UI */}
        <section className="api-docs-swagger mt-6 rounded-3xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#0F141B] p-2 sm:p-4 overflow-hidden">
          {status === "loading" && (
            <div className="p-10 text-center text-sm text-[#6B7280] dark:text-[#9CA3AF]">
              <div className="mx-auto mb-3 w-6 h-6 rounded-full border-2 border-[#0F766E]/30 border-t-[#0F766E] dark:border-[#F59E0B]/30 dark:border-t-[#F59E0B] animate-spin" />
              Loading interactive docs…
            </div>
          )}
          {status === "error" && (
            <div className="p-10 text-center text-sm text-[#6B7280] dark:text-[#9CA3AF]">
              Couldn&apos;t load Swagger UI. The raw spec is at{" "}
              <a className="underline text-[#0F766E] dark:text-[#F59E0B]" href="/api/openapi.json">/api/openapi.json</a>.
            </div>
          )}
          <div ref={mountRef} />
        </section>
      </div>

      {/* Site-themed overrides for Swagger UI (scoped to this page). */}
      <style>{`
        .api-docs-swagger .swagger-ui { font-family: inherit; color: #111827; }
        .api-docs-swagger .swagger-ui .info { margin: 16px 8px; }
        .api-docs-swagger .swagger-ui .info .title { font-size: 22px; }
        .api-docs-swagger .swagger-ui .scheme-container { background: transparent; box-shadow: none; padding: 8px; }
        .api-docs-swagger .swagger-ui .opblock { border-radius: 14px; box-shadow: none; overflow: hidden; }
        .api-docs-swagger .swagger-ui .opblock .opblock-summary { padding: 8px 12px; }
        .api-docs-swagger .swagger-ui .opblock-tag { border-bottom-color: rgba(0,0,0,.06); font-size: 18px; }
        .api-docs-swagger .swagger-ui .btn { border-radius: 999px; }
        .api-docs-swagger .swagger-ui .btn.execute { background: #0F766E; border-color: #0F766E; }
        .api-docs-swagger .swagger-ui .btn.authorize { color: #0F766E; border-color: #0F766E; }
        .api-docs-swagger .swagger-ui .btn.authorize svg { fill: #0F766E; }
        .api-docs-swagger .swagger-ui .filter .operation-filter-input { border-radius: 12px; border-color: rgba(0,0,0,.12); }
        .api-docs-swagger .swagger-ui .highlight-code, .api-docs-swagger .swagger-ui .microlight { border-radius: 10px; }
        .api-docs-swagger .swagger-ui input, .api-docs-swagger .swagger-ui textarea { user-select: text; }

        html.dark .api-docs-swagger .swagger-ui,
        html.dark .api-docs-swagger .swagger-ui .info .title,
        html.dark .api-docs-swagger .swagger-ui .info p,
        html.dark .api-docs-swagger .swagger-ui .info li,
        html.dark .api-docs-swagger .swagger-ui .opblock-tag,
        html.dark .api-docs-swagger .swagger-ui .opblock .opblock-summary-description,
        html.dark .api-docs-swagger .swagger-ui .opblock .opblock-summary-path,
        html.dark .api-docs-swagger .swagger-ui .opblock-description-wrapper p,
        html.dark .api-docs-swagger .swagger-ui .opblock-section-header h4,
        html.dark .api-docs-swagger .swagger-ui .parameter__name,
        html.dark .api-docs-swagger .swagger-ui .parameter__type,
        html.dark .api-docs-swagger .swagger-ui .response-col_status,
        html.dark .api-docs-swagger .swagger-ui .response-col_description,
        html.dark .api-docs-swagger .swagger-ui .responses-inner h4,
        html.dark .api-docs-swagger .swagger-ui .responses-inner h5,
        html.dark .api-docs-swagger .swagger-ui table thead tr th,
        html.dark .api-docs-swagger .swagger-ui table thead tr td,
        html.dark .api-docs-swagger .swagger-ui .tab li,
        html.dark .api-docs-swagger .swagger-ui .model-title,
        html.dark .api-docs-swagger .swagger-ui .model,
        html.dark .api-docs-swagger .swagger-ui label,
        html.dark .api-docs-swagger .swagger-ui .markdown p,
        html.dark .api-docs-swagger .swagger-ui .renderedMarkdown p { color: #E5E7EB; }
        html.dark .api-docs-swagger .swagger-ui .opblock-tag { border-bottom-color: rgba(255,255,255,.08); }
        html.dark .api-docs-swagger .swagger-ui .opblock .opblock-section-header { background: rgba(255,255,255,.04); box-shadow: none; }
        html.dark .api-docs-swagger .swagger-ui section.models,
        html.dark .api-docs-swagger .swagger-ui section.models .model-container { background: rgba(255,255,255,.03); border-color: rgba(255,255,255,.08); }
        html.dark .api-docs-swagger .swagger-ui input,
        html.dark .api-docs-swagger .swagger-ui textarea,
        html.dark .api-docs-swagger .swagger-ui select { background: #111827; color: #E5E7EB; border-color: rgba(255,255,255,.15); }
        html.dark .api-docs-swagger .swagger-ui .btn { color: #E5E7EB; border-color: rgba(255,255,255,.25); }
        html.dark .api-docs-swagger .swagger-ui .btn.execute { background: #F59E0B; border-color: #F59E0B; color: #111827; }
        html.dark .api-docs-swagger .swagger-ui .btn.authorize { color: #F59E0B; border-color: #F59E0B; }
        html.dark .api-docs-swagger .swagger-ui .btn.authorize svg { fill: #F59E0B; }
        html.dark .api-docs-swagger .swagger-ui svg:not(.btn svg) { fill: #9CA3AF; }
        html.dark .api-docs-swagger .swagger-ui .dialog-ux .modal-ux { background: #111827; border-color: rgba(255,255,255,.1); }
        html.dark .api-docs-swagger .swagger-ui .dialog-ux .modal-ux-header h3,
        html.dark .api-docs-swagger .swagger-ui .dialog-ux .modal-ux-content p,
        html.dark .api-docs-swagger .swagger-ui .dialog-ux .modal-ux-content h4 { color: #E5E7EB; }
      `}</style>
    </main>
  );
}
