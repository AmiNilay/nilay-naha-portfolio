import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { MCP_TOOLS, callTool } from "@/lib/mcpTools";

export const dynamic = "force-dynamic";

/**
 * Admin MCP server (Streamable HTTP, stateless JSON-RPC).
 * Lets AI agents (Claude, Cursor, …) manage portfolio content on Nilay's behalf.
 * Auth: `Authorization: Bearer <ADMIN_SECRET>`. Whitelisted in middleware
 * because agents can't hold the admin cookie; this route checks the token itself.
 */

const PROTOCOL_VERSION = "2025-06-18";

function authorized(req: NextRequest) {
  const secret = process.env.ADMIN_SECRET;
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  if (!secret || !token) return false;
  const a = Buffer.from(token);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

type RpcRequest = { jsonrpc: "2.0"; id?: string | number | null; method: string; params?: any };

const ok = (id: RpcRequest["id"], result: unknown) => ({ jsonrpc: "2.0", id, result });
const fail = (id: RpcRequest["id"], code: number, message: string) => ({ jsonrpc: "2.0", id, error: { code, message } });

async function handle(msg: RpcRequest) {
  switch (msg.method) {
    case "initialize":
      return ok(msg.id, {
        protocolVersion: msg.params?.protocolVersion || PROTOCOL_VERSION,
        capabilities: { tools: {} },
        serverInfo: { name: "nilay-portfolio-admin", version: "1.0.0" },
        instructions:
          "Manage Nilay Naha's portfolio CMS: projects, blog posts, About and Hero content. Read before updating; deletes are permanent.",
      });
    case "ping":
      return ok(msg.id, {});
    case "tools/list":
      return ok(msg.id, {
        tools: MCP_TOOLS.map(({ name, description, inputSchema, annotations }) => ({ name, description, inputSchema, annotations })),
      });
    case "tools/call":
      try {
        const result = await callTool(msg.params?.name, msg.params?.arguments);
        return ok(msg.id, { content: [{ type: "text", text: JSON.stringify(result ?? null, null, 2) }] });
      } catch (err: any) {
        return ok(msg.id, { content: [{ type: "text", text: err?.message || "Tool failed" }], isError: true });
      }
    default:
      return fail(msg.id, -32601, `Method not found: ${msg.method}`);
  }
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json(fail(null, -32001, "Unauthorized"), { status: 401 });
  }
  let body: RpcRequest | RpcRequest[];
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(fail(null, -32700, "Parse error"), { status: 400 });
  }
  const batch = Array.isArray(body) ? body : [body];
  // Notifications (no id) get no response.
  const replies = await Promise.all(batch.filter((m) => m.id !== undefined && m.id !== null).map(handle));
  if (!replies.length) return new NextResponse(null, { status: 202 });
  return NextResponse.json(Array.isArray(body) ? replies : replies[0]);
}

// Stateless server: no server-initiated SSE stream.
export async function GET() {
  return new NextResponse(null, { status: 405, headers: { Allow: "POST" } });
}
