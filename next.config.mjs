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
  // Keep heavy WASM / Node ORT packages out of the server graph
  experimental: {
    serverComponentsExternalPackages: [
      '@imgly/background-removal',
      'onnxruntime-web',
      'onnxruntime-node',
      'sharp',
    ],
  },
  webpack: (config, { isServer, webpack }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      sharp$: false,
      'onnxruntime-node$': false,
      // Node-only ORT entry uses `import { createRequire } from "module"` —
      // webpack cannot parse it. Force the browser build instead.
      'onnxruntime-web/dist/ort.node.min.js': false,
      'onnxruntime-web/dist/ort.node.min.mjs': false,
    }

    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^onnxruntime-node$/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /ort\.node\.min\.m?js$/,
      })
    )

    if (isServer) {
      const externals = Array.isArray(config.externals)
        ? config.externals
        : config.externals
          ? [config.externals]
          : []
      config.externals = [
        ...externals,
        '@imgly/background-removal',
        'onnxruntime-web',
        'onnxruntime-node',
        'sharp',
      ]
    }

    return config
  },
}

export default nextConfig
