/** @type {import('next').NextConfig} */

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  buildExcludes: [/middleware-manifest\.json$/, /app-build-manifest\.json$/],
  disable: process.env.NODE_ENV === 'development',
  // Admin pages always come from the network so CMS UI changes (e.g. new
  // fields) appear right after a deploy instead of from a stale SW cache.
  runtimeCaching: [
    { urlPattern: ({ url }) => url.pathname.startsWith('/admin'), handler: 'NetworkOnly' },
    ...require('next-pwa/cache'),
  ],
});

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "raw.githubusercontent.com" },
      { protocol: "https", hostname: "drive.google.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" }, // ✅ Added new G-Drive image host
    ],
  },
};

module.exports = withPWA(nextConfig );
