import { MetadataRoute } from 'next';

const SITE_URL = "https://nilay-naha-portfolio.vercel.app";

export default function robots( ): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/', 
          '/api/', 
          '/_next/', 
          '/admin/*'
        ],
      },
      // AI assistants and answer engines: explicitly welcome, so questions
      // about "Nilay Naha" can be answered from this site (see /llms.txt).
      {
        userAgent: ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-User', 'Claude-SearchBot', 'PerplexityBot', 'Google-Extended', 'Applebot-Extended', 'CCBot'],
        allow: ['/', '/llms.txt'],
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
