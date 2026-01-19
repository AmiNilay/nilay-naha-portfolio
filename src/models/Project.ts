import mongoose, { Schema, model, models } from "mongoose";

const ProjectSchema = new Schema(
  {
    title: { type: String, required: true },
    // Added Slug: Required and must be unique
    slug: { type: String, required: true, unique: true }, 
    description: { type: String, required: true },
    image: { type: String },
    tags: [{ type: String }],
    githubLink: { type: String },
    liveLink: { type: String },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// This prevents errors when Next.js reloads during development
const Project = models.Project || model("Project", ProjectSchema);

export default Project;