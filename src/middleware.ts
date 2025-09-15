import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@civic/auth/nextjs/middleware';

export default withAuth((request) => {
  const userCookie = request.cookies.get("user")?.value;
  const user = userCookie ? JSON.parse(userCookie) : undefined;

  const adminEmail = process.env.ADMIN_EMAIL;

  if (!user || user.email !== adminEmail) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
})

export const config = {
  matcher: [
    '/api/upload/:path*',
    '/api/gallery/:path*',
    '/api/images/update-caption/:path*',
    '/(.*upload.*)',
    '/admin',
    '/(admin.*)',
  ]
};
