import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { MCP_TOOLS } from "@/lib/mcpTools";
import { connectToDB } from "@/lib/connectToDB";
import { handleMcpRequest, methodNotAllowed, rpcError } from "@/lib/mcpProtocol";

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

const SERVER = {
  name: "nilay-portfolio-admin",
  instructions:
    "Manage Nilay Naha's portfolio CMS: projects, blog posts, About and Hero content. Read before updating; deletes are permanent.",
  tools: MCP_TOOLS,
  beforeCall: connectToDB,
};

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json(rpcError(null, -32001, "Unauthorized"), { status: 401 });
  }
  return handleMcpRequest(req, SERVER);
}

export const GET = methodNotAllowed;
