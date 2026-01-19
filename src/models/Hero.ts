import mongoose from "mongoose";

const HeroSchema = new mongoose.Schema({
  tagline: String,
  headline: String,
  subheadline: String,
  description: String,
}, { timestamps: true });

// Prevent recompilation error
export default mongoose.models.Hero || mongoose.model("Hero", HeroSchema);