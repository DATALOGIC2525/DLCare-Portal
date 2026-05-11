import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/*.db', '**/*.db-journal', '**/node_modules'],
    };
    return config;
  },
};

export default nextConfig;