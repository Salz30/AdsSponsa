import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function proxy(req: NextRequest) {
  const nextUrl = req.nextUrl
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const isLoggedIn = !!token

  const isAdminRoute = nextUrl.pathname.startsWith('/admin')
  const isDashboardRoute = nextUrl.pathname.startsWith('/dashboard')
  const isAuthRoute =
    nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/register')

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && isLoggedIn) {
    const role = token?.role
    if (role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/dashboard', nextUrl))
    }
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  // Protect admin routes — ADMIN only
  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(`/login?callbackUrl=${nextUrl.pathname}`, nextUrl))
    }
    if (token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', nextUrl))
    }
  }

  // Protect dashboard routes — any authenticated user
  if (isDashboardRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL(`/login?callbackUrl=${nextUrl.pathname}`, nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
