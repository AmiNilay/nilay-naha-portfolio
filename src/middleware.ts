import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/adminAuth';
import { rateLimit, MINUTE } from '@/lib/rateLimit';

// Public endpoints visitors may POST to without an admin session.
// Each one applies its own per-IP rate limit in the route handler.
const publicApiRoutes = [
  '/api/contact',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/push/subscribe',
  '/api/views',
  '/api/analytics/track',
  '/api/chat',
  '/api/mcp', // Bearer-token auth handled in the route itself
  '/api/mcp/public', // Read-only public MCP server
  '/api/match'
];

const MAX_ADMIN_BODY = 25 * 1024 * 1024; // uploads are capped further in their routes

/** Cookie-authenticated mutations must come from this site (CSRF guard). */
function sameOrigin(request: NextRequest) {
  const origin = request.headers.get('origin') || request.headers.get('referer');
  if (!origin) return false;
  try {
    return new URL(origin).host === request.headers.get('host');
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isAdmin = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);

  // 1. Protect all /admin pages (except the login page itself)
  if (path.startsWith('/admin') && path !== '/admin/login') {
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    return NextResponse.next();
  }

  if (!path.startsWith('/api/')) return NextResponse.next();

  // 2. Admin-only reads: /api/admin/** and "?all=1" draft listings
  if ((path.startsWith('/api/admin/') || request.nextUrl.searchParams.get('all') === '1') && !isAdmin) {
    return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
  }

  const mutating = !['GET', 'HEAD', 'OPTIONS'].includes(request.method);
  if (!mutating || publicApiRoutes.includes(path)) return NextResponse.next();

  // 3. Every other mutating API call needs a valid admin session from this origin
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
  }
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: 'Cross-origin request blocked' }, { status: 403 });
  }
  if (Number(request.headers.get('content-length') || 0) > MAX_ADMIN_BODY) {
    return NextResponse.json({ error: 'Request too large' }, { status: 413 });
  }
  // Loose ceiling on admin writes, in case a session is ever stolen
  return rateLimit(request, 'admin-write', 120, MINUTE) ?? NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
