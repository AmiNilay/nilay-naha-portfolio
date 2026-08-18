import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get('admin_token')?.value;

  const secret = process.env.ADMIN_SECRET || "fallback_secret";
  const isValidToken = token === secret;

  // 1. Protect all /admin routes (except the login page itself)
  if (path.startsWith('/admin') && path !== '/admin/login') {
    if (!isValidToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // 2. Protect API routes from unauthorized POST/PUT/DELETE requests
  // 🔥 CRITICAL FIX: Whitelist public POST routes so visitors can subscribe and view blogs!
  const publicApiRoutes = [
    '/api/contact',
    '/api/auth/login',
    '/api/push/subscribe',
    '/api/views'
  ];

  if (path.startsWith('/api/') && !publicApiRoutes.includes(path)) {
    if (request.method !== 'GET' && !isValidToken) {
      return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
