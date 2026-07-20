import mongoose, { Schema, model, models } from "mongoose";

const PostSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true }, 
    excerpt: { type: String }, 
    coverImage: { type: String },
    tags: [{ type: String }],
    published: { type: Boolean, default: true },
    publishDate: { type: Date, default: Date.now }, // 🟢 Added Publish Date
  },
  { timestamps: true }
);

const Post = models.Post || model("Post", PostSchema);

export default Post;