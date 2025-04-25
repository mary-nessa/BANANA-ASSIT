import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Check if the path starts with /admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const authToken = request.cookies.get('authToken');
    const userRole = request.cookies.get('userRole');

    // If no token or role is not ADMIN, redirect to signin
    if (!authToken?.value || userRole?.value !== 'ADMIN') {
      const signinUrl = new URL('/auth/signin', request.url);
      // Add a redirect-to parameter to return after login
      signinUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(signinUrl);
    }

    // Ensure cookies are properly propagated
    if (authToken && userRole) {
      response.cookies.set('authToken', authToken.value, {
        path: '/',
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
      });
      response.cookies.set('userRole', userRole.value, {
        path: '/',
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
      });
    }
  }

  return response;
}
