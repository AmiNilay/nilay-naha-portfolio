import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  content: { type: String, required: true },
  techStack: [String],
  features: [String],
  githubUrl: String,
  liveUrl: String,
  images: [String],
  snippets: [{
    title: String,
    language: String,
    code: String
  }],
}, { timestamps: true });

// Check if model exists before compiling to prevent overwrite error in dev
export const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);