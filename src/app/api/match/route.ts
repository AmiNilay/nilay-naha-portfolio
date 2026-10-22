import { NextRequest, NextResponse } from "next/server";
import { matchJobDescription, buildTailoredResume } from "@/lib/jobMatch";
import { createRateLimiter } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

const rateLimited = createRateLimiter(30, 60 * 60 * 1000);

// Public: scores a pasted job description against live portfolio content (src/lib/jobMatch.ts),
// and optionally builds a tailored résumé from it.
export async function POST(req: NextRequest) {
  if (rateLimited(req)) {
    return NextResponse.json({ error: "Too many requests — please try again later." }, { status: 429 });
  }
  try {
    const { jd, resume } = await req.json();
    const hasJd = typeof jd === "string" && jd.trim().length >= 20;
    // `resume: true` also returns a tailored résumé (a general one when no JD is given).
    if (resume) {
      const match = hasJd ? await matchJobDescription(jd) : null;
      return NextResponse.json({ match, resume: await buildTailoredResume(match) });
    }
    if (!hasJd) {
      return NextResponse.json({ error: "Paste a job description (at least a few sentences)." }, { status: 400 });
    }
    return NextResponse.json(await matchJobDescription(jd));
  } catch (error) {
    console.error("Job match error:", error);
    return NextResponse.json({ error: "Matcher unavailable" }, { status: 500 });
  }
}
