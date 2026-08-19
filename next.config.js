/** @type {import('next').NextConfig} */
const apiBase = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
).replace(/\/$/, '');

const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiBase}/:path*`,
      },
    ];
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.output = {
        ...config.output,
        chunkLoadTimeout: 120000,
      };
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'bizweb.dktcdn.net',
      },
    ],
  },
};

module.exports = nextConfig;
