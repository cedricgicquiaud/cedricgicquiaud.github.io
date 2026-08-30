import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // `/projets/<slug>/` doit exister comme dossier + index.html pour GitHub Pages.
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
