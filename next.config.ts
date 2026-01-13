import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
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
