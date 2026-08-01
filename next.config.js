/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  // Suppress Next.js 15 dynamic API warnings from third-party libraries
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  // Increase body size limit for server actions (file uploads)
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
};

module.exports = nextConfig;
