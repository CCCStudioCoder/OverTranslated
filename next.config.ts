import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  redirects: () => [
    {
      source: '/login',
      destination: '/auth/login',
      permanent: true,
    },
    {
      source: '/auth',
      destination: '/auth/login',
      permanent: true,
    },
  ]
};

export default nextConfig;
