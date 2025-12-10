import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('access_token')?.value;
  const pathname = request.nextUrl.pathname;

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/about', '/contact', '/login', '/signup'];
  const isPublicRoute = publicRoutes.includes(pathname) || 
    pathname.startsWith('/about') || 
    pathname.startsWith('/contact');

  // Allow public routes to be accessed without authentication
  if (isPublicRoute) {
    // If logged in and trying to access login/signup, redirect to dashboard
    if (accessToken && (pathname === '/login' || pathname === '/signup')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Check if the route is protected
  const isProtectedRoute = pathname.startsWith('/dashboard') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/courses') ||
    pathname.startsWith('/progress') ||
    pathname.startsWith('/achievements');

  // If trying to access protected route without token, redirect to login
  if (isProtectedRoute && !accessToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
