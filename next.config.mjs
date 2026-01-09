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
  // Rewrite /product/* requests to Supabase Storage
  // This allows URLs like https://fearinsight.com/product/f001.jpg
  // to actually serve from Supabase Storage
  async rewrites() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl) return []

    return [
      {
        source: '/product/:path*',
        destination: `${supabaseUrl}/storage/v1/object/public/products/:path*`,
      },
    ]
  },
}

export default nextConfig
