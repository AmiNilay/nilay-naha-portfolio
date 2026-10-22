import { Schema, model, models } from "mongoose";

/**
 * One visitor question to the portfolio assistant (/api/chat), for the
 * Admin → Insights page. IPs are stored only as salted hashes; entries
 * auto-expire after 180 days via the TTL index.
 */
const ChatLogSchema = new Schema({
  question: { type: String, required: true, maxlength: 500 },
  normalized: { type: String, index: true },
  context: { type: String, default: "" },
  unanswered: { type: Boolean, default: false, index: true },
  language: { type: String, default: "" },
  path: { type: String, default: "" },
  ipHash: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 180 },
});

const ChatLog = models.ChatLog || model("ChatLog", ChatLogSchema);
export default ChatLog;
