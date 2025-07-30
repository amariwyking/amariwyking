import { authMiddleware } from '@civic/auth/nextjs/middleware'

export default authMiddleware();

export const config = {
  matcher: [
    // Only execute middleware for routes that have "upload" in their path
    '/(.*upload.*)',
  ]
};