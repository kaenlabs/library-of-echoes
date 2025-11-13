import type { NextConfig } from "next";

// @ts-ignore - next-pwa doesn't have types
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: true, // Disable PWA for now (Next.js 15 compatibility issues)
  publicExcludes: ["!offline.html", "!manifest.json"],
  buildExcludes: [/middleware-manifest\.json$/],
  runtimeCaching: [
    // Cache pages with network-first strategy
    {
      urlPattern: ({ request }: any) => request.mode === 'navigate',
      handler: "NetworkFirst",
      options: {
        cacheName: "pages-cache",
        networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60,
        },
      },
    },
    // Cache API responses
    {
      urlPattern: /^\/api\/.*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "api-cache",
        networkTimeoutSeconds: 5,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 5 * 60, // 5 minutes
        },
      },
    },
    // Cache static assets
    {
      urlPattern: /\.(?:js|css|woff2?|png|jpg|jpeg|svg|gif|webp|ico)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "static-assets",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
  ],
  fallbacks: {
    document: "/offline.html",
  },
});

const nextConfig: NextConfig = {
  /* config options here */
};

export default withPWA(nextConfig);
