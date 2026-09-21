import path from "node:path";
import type { NextConfig } from "next";

// Served from GitHub Pages as a project site, so everything hangs off
// /<repo>. `trailingSlash` is required or Pages 404s on a refresh.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
  // Pin the workspace root; sibling lockfiles otherwise confuse inference.
  turbopack: { root: path.dirname(new URL(import.meta.url).pathname) },
};

export default nextConfig;
