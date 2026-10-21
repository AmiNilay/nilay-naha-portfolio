import { ImageResponse } from "next/og";

// Serves /og-image.png — the social preview image referenced across the site's
// metadata (link previews on LinkedIn, X, WhatsApp, Slack…). Edge runtime:
// Next 14.1's Node.js image renderer resolves its bundled font path wrongly on
// Windows. Cached for a day by browsers and the CDN.
export const runtime = "edge";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "linear-gradient(135deg, #0B0F14 0%, #111827 55%, #0F766E 140%)",
          color: "#F9FAFB",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: "linear-gradient(135deg, #F59E0B, #FBBF24)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              fontWeight: 900,
              color: "#0B0F14",
            }}
          >
            N
          </div>
          <div style={{ display: "flex", fontSize: 28, fontWeight: 700, color: "#9CA3AF" }}>nilay-naha-portfolio.vercel.app</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", fontSize: 84, fontWeight: 900, letterSpacing: -2 }}>Nilay Naha</div>
          <div style={{ display: "flex", fontSize: 44, fontWeight: 700 }}>
            Software Engineer<span style={{ color: "#F59E0B", marginLeft: 16 }}>· Full-Stack · AI/ML</span>
          </div>
          <div style={{ display: "flex", fontSize: 28, color: "#9CA3AF", maxWidth: 940 }}>
            Building secure REST APIs, scalable backends, and intelligent full-stack applications.
          </div>
        </div>

        <div style={{ display: "flex", gap: 14 }}>
          {["Projects", "Case studies", "Blog", "AI assistant"].map((tag) => (
            <div
              key={tag}
              style={{
                display: "flex",
                padding: "10px 22px",
                borderRadius: 999,
                border: "2px solid rgba(255,255,255,0.18)",
                fontSize: 24,
                color: "#E5E7EB",
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: { "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800" },
    }
  );
}
