import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://20.62.15.198:8080/api/:path*', // Fixed URL format
      },
    ];
  },
};

module.exports = nextConfig;