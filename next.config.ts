import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Allow Velite to run during build
  serverExternalPackages: ["velite"],
};

export default nextConfig;
