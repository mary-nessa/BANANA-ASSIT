// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value;

  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Note: Cookies should be set with HttpOnly, Secure, and SameSite=Strict attributes
    // on the server side in a production environment.
    if (!token || role?.toUpperCase() !== 'ADMIN') {
      // Redirect to signin with the intended path as a query parameter
      const redirectUrl = new URL('/signin', request.url);
      redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};