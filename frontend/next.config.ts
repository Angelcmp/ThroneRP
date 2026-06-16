import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/ThroneRP",
  assetPrefix: "/ThroneRP/",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  distDir: "out",
};

export default nextConfig;
