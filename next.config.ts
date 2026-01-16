import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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

export default nextConfig;
