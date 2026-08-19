import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Protected private routes requiring active session
const PROTECTED_ROUTES = [
  "/profile",
  "/publisher/dashboard",
  "/publisher/apply",
  "/publisher/upload",
  "/admin",
];

// Guest-only auth routes
const GUEST_ONLY_ROUTES = ["/login", "/signup", "/forgot-password"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken")?.value;
  const isAuthenticated = Boolean(accessToken);

  // 1. Guest-only routes: redirect logged-in users to /profile
  if (GUEST_ONLY_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    if (isAuthenticated) {
      const redirectUrl = new URL("/profile", request.url);
      return NextResponse.redirect(redirectUrl);
    }
    return NextResponse.next();
  }

  // 2. Public creator profile check: /profile/:idOrUserName is PUBLIC
  if (pathname.startsWith("/profile/") && pathname !== "/profile") {
    // Public creator/publisher profile page
    return NextResponse.next();
  }

  // 3. Exact /profile or other private routes: must be authenticated
  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
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
     * - favicon.ico, favicon.svg, brand/ assets
     */
    "/((?!api|_next/static|_next/image|favicon.ico|favicon.svg|brand/|.*\\..*).*)",
  ],
};
