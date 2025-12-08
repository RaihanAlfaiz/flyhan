import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.external.push("@node-rs/bcrypt");
    return config;
  },
};

export default nextConfig;
