import mongoose, { Schema, model, models } from "mongoose";

const PostSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true }, // Markdown content
    excerpt: { type: String }, // Short summary
    coverImage: { type: String },
    tags: [{ type: String }],
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Prevent "OverwriteModelError" in development
const Post = models.Post || model("Post", PostSchema);

export default Post;