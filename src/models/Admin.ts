import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    totpSecret: { type: String, required: true }, // AES-256-GCM encrypted
    setupComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);