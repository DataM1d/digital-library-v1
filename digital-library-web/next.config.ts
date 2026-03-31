import type { NextConfig } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080';
const apiUrl = new URL(API_URL);
const protocol = apiUrl.protocol.replace(':', '') as 'http' | 'https';
const hostname = apiUrl.hostname;
const port = apiUrl.port;

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol,
        hostname,
        port: port || (protocol === 'https' ? '' : '80'),
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/uploads/**',
      },
    ],
  },
  poweredByHeader: false, 
  reactStrictMode: true,
  trailingSlash: false,
};

export default nextConfig;