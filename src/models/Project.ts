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
    // Case study (markdown) + headline impact metrics
    problem: { type: String, default: "" },
    approach: { type: String, default: "" },
    results: { type: String, default: "" },
    metrics: [{ label: String, value: String, hint: String, _id: false }],
    // Evaluation showcase for ML / LLM projects
    evaluation: {
      dataset: { type: String, default: "" },
      method: { type: String, default: "" },
      results: { type: String, default: "" },
      benchmarks: [{ name: String, score: Number, baseline: Number, _id: false }],
    },
  },
  { timestamps: true }
);

const Project = models.Project || model("Project", ProjectSchema);
export default Project;
