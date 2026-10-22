import { connectToDB } from "@/lib/connectToDB";
import { clientIp, hashIp } from "@/lib/adminAuth";
import AuditLog from "@/models/AuditLog";

/**
 * Records a security-relevant event. Never throws: auditing must not break the
 * request it describes. Raw IPs are never stored, only a keyed hash.
 */
export async function audit(
  req: Request,
  entry: { actor: "admin" | "mcp" | "visitor"; action: string; target?: string; ok?: boolean }
) {
  try {
    await connectToDB();
    await AuditLog.create({
      ...entry,
      target: (entry.target || "").slice(0, 200),
      ipHash: await hashIp(clientIp(req)),
      ua: (req.headers.get("user-agent") || "").slice(0, 200),
    });
  } catch (err) {
    console.error("Audit log failed:", err);
  }
}

/** Removes Mongo operators (`$…`) and dotted keys from untrusted input, recursively. */
export function sanitizeMongo<T>(value: T): T {
  if (Array.isArray(value)) return value.map((v) => sanitizeMongo(v)) as unknown as T;
  if (value && typeof value === "object" && !(value instanceof Date)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (k.startsWith("$") || k.includes(".") || k === "__proto__" || k === "constructor") continue;
      out[k] = sanitizeMongo(v);
    }
    return out as T;
  }
  return value;
}

/** Keeps only whitelisted top-level fields (after sanitizing). */
export function pickFields(body: unknown, allowed: readonly string[]): Record<string, unknown> {
  const clean = sanitizeMongo((body && typeof body === "object" ? body : {}) as Record<string, unknown>);
  return Object.fromEntries(Object.entries(clean).filter(([k]) => allowed.includes(k)));
}

export const isObjectId = (id: unknown): id is string => typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);
