import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/connectToDB";
import { isAdminRequest } from "@/lib/adminAuth";
import ChatLog from "@/models/ChatLog";

export const dynamic = "force-dynamic";

const DAY = 24 * 60 * 60 * 1000;

// Admin-only: aggregated chatbot questions for /admin/insights (?days=7|30|90).
export async function GET(req: Request) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const daysParam = Number(new URL(req.url).searchParams.get("days"));
  const days = [7, 30, 90].includes(daysParam) ? daysParam : 30;
  const since = new Date(Date.now() - days * DAY);

  try {
    await connectToDB();
    const match = { createdAt: { $gte: since } };
    const [total, unansweredCount, visitors, topQuestions, topTopics, gaps, daily] = await Promise.all([
      ChatLog.countDocuments(match),
      ChatLog.countDocuments({ ...match, unanswered: true }),
      ChatLog.distinct("ipHash", match).then((v: string[]) => v.length),
      ChatLog.aggregate([
        { $match: match },
        { $group: { _id: "$normalized", count: { $sum: 1 }, sample: { $last: "$question" } } },
        { $sort: { count: -1 } },
        { $limit: 15 },
      ]),
      ChatLog.aggregate([
        { $match: { ...match, context: { $ne: "" } } },
        // "project:shortdesk" → "project"; plain intents stay as-is.
        { $group: { _id: { $arrayElemAt: [{ $split: ["$context", ":"] }, 0] }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      ChatLog.aggregate([
        { $match: { ...match, unanswered: true } },
        { $group: { _id: "$normalized", count: { $sum: 1 }, sample: { $last: "$question" }, last: { $max: "$createdAt" } } },
        { $sort: { count: -1, last: -1 } },
        { $limit: 25 },
      ]),
      ChatLog.aggregate([
        { $match: match },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "Asia/Kolkata" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    // Fill missing days with zero so the sparkline has a point per day.
    const byDay = new Map(daily.map((d: any) => [d._id, d.count]));
    const series = Array.from({ length: days }, (_, i) => {
      const date = new Date(Date.now() - (days - 1 - i) * DAY).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
      return { date, count: (byDay.get(date) as number) || 0 };
    });

    return NextResponse.json({
      days,
      total,
      unansweredCount,
      visitors,
      topQuestions: topQuestions.map((q: any) => ({ question: q.sample, count: q.count })),
      topTopics: topTopics.map((t: any) => ({ topic: t._id, count: t.count })),
      gaps: gaps.map((g: any) => ({ question: g.sample, count: g.count, last: g.last })),
      series,
    });
  } catch (error) {
    console.error("Chat insights error:", error);
    return NextResponse.json({ error: "Failed to load insights" }, { status: 500 });
  }
}
