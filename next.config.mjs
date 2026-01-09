/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Next.js automatically serves files from public/ folder
  // URLs like /product/f001.jpg will work if file exists in public/product/f001.jpg
}

export default nextConfig
