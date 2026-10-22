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

// ── Security headers ─────────────────────────────────────────────────────────
// CSP allow-list: Transformers.js + its WASM runtime (jsDelivr) and model files
// (Hugging Face) for on-device smart search; Drive/YouTube/etc. for content embeds.
// 'unsafe-inline' scripts are required by Next's inline bootstrap (no nonces);
// 'unsafe-eval' only in development (React Refresh).
const isDev = process.env.NODE_ENV === 'development';
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://cdn.jsdelivr.net${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net", // Swagger UI CSS on /api-docs
  "img-src 'self' data: blob: https:",
  "media-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://cdn.jsdelivr.net https://huggingface.co https://*.huggingface.co https://*.hf.co https://api.github.com",
  "frame-src 'self' https://drive.google.com https://docs.google.com https://www.youtube-nocookie.com https://www.youtube.com https://player.vimeo.com https://codepen.io https://codesandbox.io https://stackblitz.com https://cal.com https://app.cal.com",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  ...(isDev ? [] : ['upgrade-insecure-requests']),
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), geolocation=(), payment=(), usb=(), microphone=(self)' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
];

const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      // Admin and API responses must never be cached by shared caches.
      { source: '/admin/:path*', headers: [{ key: 'Cache-Control', value: 'no-store' }, { key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
    ];
  },
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
