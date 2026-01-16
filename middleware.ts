import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple in-memory rate limiter
// Note: In serverless environments (like Vercel), this map is not shared across lambda instances.
// For production, consider using Redis (e.g., Upstash Ratelimit).
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Apply rate limiting to Auth Actions (POST)
  // Note: Server Actions use POST to the same URL or specific internal endpoints.
  // Next.js Server Actions usually hit the page URL via POST.
  if (
    (pathname === "/signin" || pathname === "/signup") &&
    request.method === "POST"
  ) {
    const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";

    // Limits: 10 attempts per minute per IP
    const limit = 10;
    const windowMs = 60 * 1000;

    const now = Date.now();
    const record = rateLimitMap.get(ip) || { count: 0, lastReset: now };

    if (now - record.lastReset > windowMs) {
      record.count = 0;
      record.lastReset = now;
    }

    if (record.count >= limit) {
      return new NextResponse(
        JSON.stringify({
          errorTitle: "Too many requests",
          errorDesc: "Please try again in a minute.",
        }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    record.count += 1;
    rateLimitMap.set(ip, record);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
