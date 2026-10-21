import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/connectToDB";
import PageVisit from "@/models/PageVisit";

export const dynamic = "force-dynamic";

interface NodeStats {
  path: string;
  visits: number;
  entries: number;
  exits: number;
}

export async function GET(req: NextRequest) {
  try {
    await connectToDB();

    const days = Math.min(365, Math.max(1, Number(req.nextUrl.searchParams.get("days")) || 30));
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const visits = await PageVisit.find({ createdAt: { $gte: since } })
      .select("sessionId path referrerPath createdAt")
      .sort({ createdAt: 1 })
      .lean();

    const nodes = new Map<string, NodeStats>();
    const edges = new Map<string, { from: string; to: string; count: number }>();
    const lastPathBySession = new Map<string, string>();

    const touchNode = (path: string) => {
      if (!nodes.has(path)) nodes.set(path, { path, visits: 0, entries: 0, exits: 0 });
      return nodes.get(path)!;
    };

    for (const v of visits as any[]) {
      const node = touchNode(v.path);
      node.visits += 1;
      if (!v.referrerPath) {
        node.entries += 1;
      } else {
        const key = `${v.referrerPath}=>${v.path}`;
        if (!edges.has(key)) edges.set(key, { from: v.referrerPath, to: v.path, count: 0 });
        edges.get(key)!.count += 1;
        touchNode(v.referrerPath); // ensure referrer path exists as a node even if never an entry
      }
      lastPathBySession.set(v.sessionId, v.path);
    }

    Array.from(lastPathBySession.values()).forEach((lastPath) => {
      touchNode(lastPath).exits += 1;
    });

    const nodeList = Array.from(nodes.values())
      .map((n) => ({ ...n, exitRate: n.visits > 0 ? n.exits / n.visits : 0 }))
      .sort((a, b) => b.visits - a.visits);

    const edgeList = Array.from(edges.values()).sort((a, b) => b.count - a.count);

    return NextResponse.json({
      rangeDays: days,
      totalSessions: lastPathBySession.size,
      totalPageViews: visits.length,
      nodes: nodeList,
      edges: edgeList,
    });
  } catch (err) {
    console.error("Failed to aggregate analytics:", err);
    return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
  }
}
