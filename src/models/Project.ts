import mongoose, { Schema, model, models } from "mongoose";

const ProjectSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    image: { type: String },
    gDriveImage: { type: String }, // ✅ ADDED G-DRIVE FALLBACK
    tags: [{ type: String }],
    githubLink: { type: String },
    liveLink: { type: String },
    appLink: { type: String }, 
    featured: { type: Boolean, default: false },
    publishDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Project = models.Project || model("Project", ProjectSchema);

export default Project;
