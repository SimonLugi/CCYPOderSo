import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
import MillionLint from "@million/lint";
import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: 'build',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.themodcraft.net',
        pathname: '/resources/assets/images/**',
      },
    ],
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
  },
  webpack(config) {
    config.resolve.plugins = config.resolve.plugins || [];

    config.resolve.plugins.push(
        new TsconfigPathsPlugin({
          configFile: './jsconfig.json',
          extensions: config.resolve.extensions,
          baseUrl: path.resolve('./'),
        })
    );
    return config;
  },
  turbopack: {},
  experimental: {
    serverActions: true,
    serverMinification: true,
  },
};

export default MillionLint.next({ rsc: true })(nextConfig);