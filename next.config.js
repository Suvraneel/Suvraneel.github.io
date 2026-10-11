/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // GitHub Pages serves the static export in ./out; it has no image optimizer.
  output: "export",
  images: { unoptimized: true },
}

module.exports = nextConfig
