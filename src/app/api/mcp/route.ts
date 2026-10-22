import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { MCP_TOOLS } from "@/lib/mcpTools";
import { connectToDB } from "@/lib/connectToDB";
import { handleMcpRequest, methodNotAllowed, rpcError, type McpServer } from "@/lib/mcpProtocol";
import { clientIp } from "@/lib/adminAuth";
import { hit, peek, rateLimit, tooManyRequests, HOUR, MINUTE } from "@/lib/rateLimit";
import { audit } from "@/lib/audit";

export const dynamic = "force-dynamic";

/**
 * Admin MCP server (Streamable HTTP, stateless JSON-RPC).
 * Lets AI agents (Claude, Cursor, …) manage portfolio content on Nilay's behalf.
 * Auth: `Authorization: Bearer <ADMIN_SECRET>`. Whitelisted in middleware
 * because agents can't hold the admin cookie; this route checks the token itself.
 */

function authorized(req: NextRequest) {
  const secret = process.env.ADMIN_SECRET;
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  if (!secret || !token) return false;
  const a = Buffer.from(token);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

const serverFor = (req: NextRequest): McpServer => ({
  name: "nilay-portfolio-admin",
  instructions:
    "Manage Nilay Naha's portfolio CMS: projects, blog posts, About and Hero content. Read before updating; deletes are permanent.",
  tools: MCP_TOOLS,
  beforeCall: connectToDB,
  // Every write an AI agent makes is recorded in the audit log.
  afterCall: async (tool, args, ok) => {
    if (tool.annotations?.readOnlyHint) return;
    await audit(req, { actor: "mcp", action: `mcp.${tool.name}`, target: String(args.id || args.slug || args.title || ""), ok });
  },
});

export async function POST(req: NextRequest) {
  // Brute-force guard on the bearer token: 10 failed attempts per IP per 15 min.
  // Checked before the token so a locked-out caller learns nothing from further guesses.
  const ip = clientIp(req);
  const locked = peek("mcp-auth-fail", ip, 10, 15 * MINUTE);
  if (locked) return tooManyRequests(locked);
  if (!authorized(req)) {
    hit("mcp-auth-fail", ip, 10, 15 * MINUTE);
    await audit(req, { actor: "visitor", action: "mcp.auth_failed", ok: false });
    return NextResponse.json(rpcError(null, -32001, "Unauthorized"), { status: 401 });
  }
  const limited = rateLimit(req, "mcp-admin", 300, HOUR);
  if (limited) return limited;
  return handleMcpRequest(req, serverFor(req));
}

export const GET = methodNotAllowed;
