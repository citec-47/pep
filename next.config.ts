import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root so Turbopack ignores stray lockfiles elsewhere on
  // the machine and treats this folder as the project root.
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns: [
      // Product photos & video posters uploaded by the admin.
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

export default nextConfig;
