import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",   // allow all external domains (dev mode)
      },
    ],
  },
};

export default nextConfig;