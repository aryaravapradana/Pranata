import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function proxy(
  request: NextRequest,
) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(
    "auth-token",
  )?.value;

  const isProtected =
    pathname.startsWith("/hub") ||
    pathname.startsWith("/market");

  // If trying to access protected page without token, redirect to login
  if (isProtected && !token) {
    return NextResponse.redirect(
      new URL("/login", request.url),
    );
  }

  // If already logged in and visiting login/register, redirect based on role
  // NOTE: We don't redirect here anymore to avoid infinite loops.
  // The client-side code in login page handles the redirect after login.

  return NextResponse.next();
}

export const config = {
  matcher: ["/hub/:path*", "/market/:path*"],
};
