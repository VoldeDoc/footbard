import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// NextAuth v4 uses a JWT stored in a cookie
const AUTH_COOKIE = "next-auth.session-token";
const SECURE_AUTH_COOKIE = "__Secure-next-auth.session-token";

const publicPaths = ["/", "/login", "/register", "/api/auth"];

function isPublic(pathname: string) {
  return publicPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes and static assets
  if (
    isPublic(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff2?)$/)
  ) {
    return NextResponse.next();
  }

  const token =
    request.cookies.get(AUTH_COOKIE)?.value ||
    request.cookies.get(SECURE_AUTH_COOKIE)?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
