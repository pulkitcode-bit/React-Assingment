import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Edge Middleware for Route Protection.
 * Checks for the presence of the `auth_token` cookie.
 * - Unauthenticated requests to /products or subpaths are redirected to /login.
 * - Authenticated requests accessing /login are redirected to /products.
 * - Root path / is redirected to /products.
 */
export function middleware(request: NextRequest) {
  const authToken = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith('/login');
  const isProtectedPath = pathname.startsWith('/products');
  const isRoot = pathname === '/';

  // Redirect root path to /products
  if (isRoot) {
    if (authToken) {
      return NextResponse.redirect(new URL('/products', request.url));
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Redirect unauthenticated user trying to access protected paths
  if (isProtectedPath && !authToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated user away from login page back to dashboard
  if (isAuthPage && authToken) {
    return NextResponse.redirect(new URL('/products', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/products/:path*'],
};
