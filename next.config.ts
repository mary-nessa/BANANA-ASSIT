import type { NextConfig } from "next";

// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://13.217.166.111:8080S:path*',
      },
    ];
  },
};

module.exports = nextConfig;