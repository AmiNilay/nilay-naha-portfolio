import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get("admin_token")?.value;
  const isValidToken = token ? await verifySessionToken(token) : false;

  // Protect all /admin routes except the login page
  if (path.startsWith("/admin") && path !== "/admin/login") {
    if (!isValidToken) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // Protect API routes from unauthorized non-GET requests
  const publicApiRoutes = [
    "/api/contact",
    "/api/auth/login",
    "/api/auth/step",
    "/api/push/subscribe",
    "/api/views",
  ];

  if (path.startsWith("/api/") && !publicApiRoutes.includes(path)) {
    if (request.method !== "GET" && !isValidToken) {
      return NextResponse.json(
        { error: "Unauthorized Access" },
        { status: 401 }
      );
    }
  }

  // Add security headers
  const response = NextResponse.next();

  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};