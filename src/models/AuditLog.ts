import { Schema, model, models } from "mongoose";

// Security audit trail: admin/MCP mutations and login attempts. Auto-expires after 180 days.
const AuditLogSchema = new Schema({
  at: { type: Date, default: Date.now, index: { expires: 60 * 60 * 24 * 180 } },
  actor: { type: String, enum: ["admin", "mcp", "visitor"], required: true },
  action: { type: String, required: true },
  target: { type: String, default: "" },
  ok: { type: Boolean, default: true },
  ipHash: { type: String, default: "" },
  ua: { type: String, default: "" },
});

const AuditLog = models.AuditLog || model("AuditLog", AuditLogSchema);
export default AuditLog;
