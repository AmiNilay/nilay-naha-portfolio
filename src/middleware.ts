import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get('admin_token')?.value;
  
  // Validate against your ADMIN_SECRET
  const isValidToken = token === process.env.ADMIN_SECRET;

  // 1. Protect all /admin routes (except the login page itself)
  if (path.startsWith('/admin') && path !== '/admin/login') {
    if (!isValidToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // 2. Protect API routes from unauthorized POST/PUT/DELETE requests
  if (path.startsWith('/api/') && path !== '/api/contact' && path !== '/api/auth/login') {
    if (request.method !== 'GET' && !isValidToken) {
      return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
