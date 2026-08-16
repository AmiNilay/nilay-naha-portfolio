import { MetadataRoute } from 'next';

const SITE_URL = "https://nilay-naha-portfolio.vercel.app";

export default function robots( ): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/', 
        '/api/', 
        '/_next/', 
        '/admin/*'
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
