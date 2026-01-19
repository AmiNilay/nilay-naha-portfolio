import mongoose from "mongoose";

const AboutSchema = new mongoose.Schema({
  title: String,
  description: String,
  skills: [String], // Array of strings for skills
  imageUrl: String,
}, { timestamps: true });

export default mongoose.models.About || mongoose.model("About", AboutSchema);