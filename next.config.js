/** @type {import('next').NextConfig} */

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  // 🔥 THIS IS THE FIX: Tell Workbox to ignore the missing Next.js 14 files
  buildExcludes: [/middleware-manifest\.json$/, /app-build-manifest\.json$/],
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "raw.githubusercontent.com" },
      { protocol: "https", hostname: "drive.google.com" },
    ],
  },
};

module.exports = withPWA(nextConfig );
