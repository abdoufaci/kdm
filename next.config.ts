import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "algeria-world-export.b-cdn.net",
      },
      {
        protocol: "https",
        hostname: "easymoney2.b-cdn.net",
      },
    ],
  },
};

export default nextConfig;
