import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:8787';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/login', '/signup'],
      disallow: [
        '/workspace',
        '/teams',
        '/people',
        '/profile',
        '/settings',
        '/invite',
        '/chat',
        '/api',
        '/tasks',
        '/board',
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
