/** @type {import('next').NextConfig} */

import { createCivicAuthPlugin } from '@civic/auth/nextjs'
import { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'hmaruxdkibsjvhit.public.blob.vercel-storage.com',
            port: '',
            pathname: '/**',
          },
        ],
      },
};

const withCivicAuth = createCivicAuthPlugin({
  clientId: '54545817-b989-48e1-a7e0-0af35d5ff315',
  loginUrl: '/auth',
});

export default withCivicAuth(nextConfig)
