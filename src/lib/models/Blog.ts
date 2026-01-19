import mongoose from 'mongoose';

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  coverImage: String,
  content: { type: String, required: true },
  tags: [String],
  readTime: { type: Number, default: 5 },
  published: { type: Boolean, default: false }
}, { timestamps: true });

export const Blog = mongoose.models.Blog || mongoose.model('Blog', BlogSchema);