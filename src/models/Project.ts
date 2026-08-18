import mongoose, { Schema, model, models } from "mongoose";

const ProjectSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    image: { type: String },
    gDriveImage: { type: String },
    tags: [{ type: String }],
    githubLink: { type: String },
    liveLink: { type: String },
    appLink: { type: String }, 
    role: { type: String },
    status: { type: String, default: "Published" },
    frameStyle: { type: String, default: "Browser" },
    featured: { type: Boolean, default: false },
    publishDate: { type: Date, default: Date.now },
    relatedBlog: { type: String, default: "" }, // ✅ NEW: Link to a Blog Post
  },
  { timestamps: true }
);

const Project = models.Project || model("Project", ProjectSchema);
export default Project;
