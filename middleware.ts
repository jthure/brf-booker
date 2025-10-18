import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getCurrentUser } from './lib/auth';
import { CognitoUser } from './types/auth';

export async function middleware(request: NextRequest) {
  // Skip middleware for login page and API routes
  if (request.nextUrl.pathname.startsWith('/login') || 
      request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  try {
    const user = await getCurrentUser() as CognitoUser | null;
    
    // If no user is found, redirect to login
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Add user to request headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', user.username);
    requestHeaders.set('x-user-email', user.email);
    requestHeaders.set('x-user-is-admin', user.isAdmin.toString());

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
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
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 
