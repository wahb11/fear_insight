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
  webpack: (config, { webpack }) => {
    // Never compile these — they ship Node ESM / WASM that SWC cannot parse.
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^(onnxruntime-web|onnxruntime-node|@imgly\/background-removal|sharp)$/,
      })
    )
    config.resolve.alias = {
      ...config.resolve.alias,
      sharp: false,
      'onnxruntime-node': false,
      'onnxruntime-web': false,
      '@imgly/background-removal': false,
    }
    return config
  },
}

export default nextConfig
