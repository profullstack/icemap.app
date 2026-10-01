import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // Workspace root, so the standalone server lands at apps/web/server.js on
  // every machine (dev1 would otherwise infer ~ from a stray lockfile).
  outputFileTracingRoot: new URL('../../', import.meta.url).pathname,
  experimental: {
    serverActions: {
      bodySizeLimit: '500mb',
    },
    proxyClientMaxBodySize: '500mb',
  },
}

export default nextConfig
