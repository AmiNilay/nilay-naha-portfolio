import { MetadataRoute } from 'next';
import { connectToDB } from '@/lib/connectToDB';
import Project from '@/models/Project';
import Post from '@/models/Post';
import { PUBLISHED_POST, PUBLISHED_PROJECT } from '@/lib/visibility';

const SITE_URL = "https://nilay-naha-portfolio.vercel.app";

export default async function sitemap( ): Promise<MetadataRoute.Sitemap> {
  try {
    await connectToDB();

    // Published projects and posts only (drafts never reach search engines).

    let projectUrls: MetadataRoute.Sitemap = [];
    let postUrls: MetadataRoute.Sitemap = [];

    {
      const projects = await Project.find(PUBLISHED_PROJECT).select('slug updatedAt');
      projectUrls = projects.map((project) => ({
        url: `${SITE_URL}/projects/${project.slug}`,
        lastModified: project.updatedAt || new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
    }

    {
      const posts = await Post.find(PUBLISHED_POST).select('slug updatedAt');
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
      { url: `${SITE_URL}/match`, lastModified: new Date(), priority: 0.8 },
      { url: `${SITE_URL}/ai`, lastModified: new Date(), priority: 0.7 },
      { url: `${SITE_URL}/api-docs`, lastModified: new Date(), priority: 0.6 },
    ];
  }
}
