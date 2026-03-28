import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "*.ngrok-free.dev",
    "*.ngrok.io",
  ],
  async rewrites() {
    return [
      {
        source: "/@:username",
        destination: "/:username",
      },
    ];
  },
};

export default nextConfig;
