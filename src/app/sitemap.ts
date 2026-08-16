import { MetadataRoute } from 'next';
import { connectToDB } from '@/lib/connectToDB';
import mongoose from 'mongoose';

const SITE_URL = "https://nilay-naha-portfolio.vercel.app";

export default async function sitemap( ): Promise<MetadataRoute.Sitemap> {
  try {
    await connectToDB();

    // Dynamically fetch all Projects and Blog Posts from MongoDB
    const Project = mongoose.models.Project;
    const Post = mongoose.models.Post;

    let projectUrls: MetadataRoute.Sitemap = [];
    let postUrls: MetadataRoute.Sitemap = [];

    if (Project) {
      const projects = await Project.find({}).select('slug updatedAt');
      projectUrls = projects.map((project) => ({
        url: `${SITE_URL}/projects/${project.slug}`,
        lastModified: project.updatedAt || new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
    }

    if (Post) {
      const posts = await Post.find({ status: 'published' }).select('slug updatedAt');
      postUrls = posts.map((post) => ({
        url: `${SITE_URL}/blog/${post.slug}`,
        lastModified: post.updatedAt || new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      }));
    }

    // Define your static routes
    const staticRoutes: MetadataRoute.Sitemap = [
      '', 
      '/about', 
      '/projects', 
      '/blog', 
      '/contact'
    ].map((route) => ({
      url: `${SITE_URL}${route}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: route === '' ? 1.0 : 0.9,
    }));

    return [...staticRoutes, ...projectUrls, ...postUrls];
  } catch (error) {
    console.error("Sitemap generation failed:", error);
    // Fallback to just static routes if DB fails
    return [
      { url: SITE_URL, lastModified: new Date(), priority: 1.0 },
      { url: `${SITE_URL}/about`, lastModified: new Date(), priority: 0.9 },
      { url: `${SITE_URL}/projects`, lastModified: new Date(), priority: 0.9 },
      { url: `${SITE_URL}/blog`, lastModified: new Date(), priority: 0.9 },
      { url: `${SITE_URL}/contact`, lastModified: new Date(), priority: 0.9 },
    ];
  }
}
