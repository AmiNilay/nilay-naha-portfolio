import mongoose, { Schema, model, models } from "mongoose";

const PostSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    excerpt: String,
    content: { type: String, required: true },
    coverImage: String,
    category: String,
    tags: [String],
    published: { type: Boolean, default: false },
    readTime: String,
    views: { type: Number, default: 0 }, // ✅ ADDED VIEWS FIELD
  },
  { timestamps: true } // This automatically creates createdAt and updatedAt!
);

const Post = models.Post || model("Post", PostSchema);
export default Post;
