import { NextResponse } from "next/server";

/**
 * Minimal MCP server core (Streamable HTTP, stateless JSON-RPC) shared by
 * the admin server (/api/mcp) and the public read-only one (/api/mcp/public).
 */

export type Json = Record<string, any>;

export interface McpTool {
  name: string;
  description: string;
  inputSchema: Json;
  annotations?: Json;
  run: (args: Json) => Promise<unknown>;
}

export interface McpServer {
  name: string;
  instructions: string;
  tools: McpTool[];
  /** Runs before each tool call (e.g. connecting to the database). */
  beforeCall?: () => Promise<unknown>;
}

const PROTOCOL_VERSION = "2025-06-18";

type RpcRequest = { jsonrpc: "2.0"; id?: string | number | null; method: string; params?: any };

const ok = (id: RpcRequest["id"], result: unknown) => ({ jsonrpc: "2.0", id, result });
export const rpcError = (id: RpcRequest["id"], code: number, message: string) => ({ jsonrpc: "2.0", id, error: { code, message } });

async function handle(server: McpServer, msg: RpcRequest) {
  switch (msg.method) {
    case "initialize":
      return ok(msg.id, {
        protocolVersion: msg.params?.protocolVersion || PROTOCOL_VERSION,
        capabilities: { tools: {} },
        serverInfo: { name: server.name, version: "1.0.0" },
        instructions: server.instructions,
      });
    case "ping":
      return ok(msg.id, {});
    case "tools/list":
      return ok(msg.id, {
        tools: server.tools.map(({ name, description, inputSchema, annotations }) => ({ name, description, inputSchema, annotations })),
      });
    case "tools/call":
      try {
        const tool = server.tools.find((t) => t.name === msg.params?.name);
        if (!tool) throw new Error(`Unknown tool: ${msg.params?.name}`);
        await server.beforeCall?.();
        const result = await tool.run(msg.params?.arguments || {});
        return ok(msg.id, { content: [{ type: "text", text: JSON.stringify(result ?? null, null, 2) }] });
      } catch (err: any) {
        return ok(msg.id, { content: [{ type: "text", text: err?.message || "Tool failed" }], isError: true });
      }
    default:
      return rpcError(msg.id, -32601, `Method not found: ${msg.method}`);
  }
}

/** Parses a JSON-RPC request (single or batch) and returns the HTTP response. */
export async function handleMcpRequest(req: Request, server: McpServer) {
  let body: RpcRequest | RpcRequest[];
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(rpcError(null, -32700, "Parse error"), { status: 400 });
  }
  const batch = Array.isArray(body) ? body : [body];
  // Notifications (no id) get no response.
  const replies = await Promise.all(batch.filter((m) => m.id !== undefined && m.id !== null).map((m) => handle(server, m)));
  if (!replies.length) return new NextResponse(null, { status: 202 });
  return NextResponse.json(Array.isArray(body) ? replies : replies[0]);
}

// Stateless server: no server-initiated SSE stream.
export const methodNotAllowed = () => new NextResponse(null, { status: 405, headers: { Allow: "POST" } });
