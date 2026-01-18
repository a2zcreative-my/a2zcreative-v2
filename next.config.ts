import type { NextConfig } from "next";
import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-48391ed48a91437f9391d8228555a06a.r2.dev',
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/auth/login',
        permanent: true,
      },
      {
        source: '/register',
        destination: '/auth/register',
        permanent: true,
      },
      {
        source: '/forgot-password',
        destination: '/auth/forgot-password',
        permanent: true,
      },
    ]
  },
};

if (process.env.NODE_ENV === 'development') {
  (async () => {
    try {
      await setupDevPlatform();
    } catch (e) {
      console.error('Failed to setup Cloudflare Dev Platform:', e);
    }
  })();
}

export default nextConfig;
