import type { NextConfig } from "next";

// Trigger rebuild

const nextConfig: NextConfig = {
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "3mb",
    },
  },
  webpack: (config) => {
    config.external.push("@node-rs/bcrypt");
    return config;
  },
};

export default nextConfig;
