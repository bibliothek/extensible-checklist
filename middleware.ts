import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isAuthenticated = !!req.auth

  // Public routes that don't require authentication
  if (req.nextUrl.pathname === "/") {
    return NextResponse.next()
  }

  // Redirect unauthenticated users to sign in via OIDC
  if (!isAuthenticated) {
    const signInUrl = new URL("/api/auth/signin", req.nextUrl.origin)
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Match all paths except static files, images, and auth API routes
    "/((?!_next/static|_next/image|favicon.ico|api/auth|api/health|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
