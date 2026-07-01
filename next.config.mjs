/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // Avoid EMFILE ("too many open files") breaking route discovery in dev on macOS.
  // Without this, Next.js may only compile /_not-found → every page/API returns 404.
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ["**/node_modules/**", "**/.git/**", "**/sandbox/**"],
      };
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "source.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.pexels.com",
      },
    ],
    unoptimized: false, // Enable optimization for better performance
  },
};

export default nextConfig;

