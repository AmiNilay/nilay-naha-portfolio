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

// "Last updated" on the home page = time of the latest pushed commit, captured
// at build (every push to main triggers a Vercel build). Falls back to the
// build time when git metadata isn't available.
const lastDeployed = (() => {
  try {
    return require('child_process').execSync('git log -1 --format=%cI', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return '';
  }
})() || new Date().toISOString();

const nextConfig = {
  env: {
    NEXT_PUBLIC_LAST_DEPLOYED: lastDeployed,
  },
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
