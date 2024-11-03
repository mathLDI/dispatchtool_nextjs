// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('authToken');
  const { pathname } = request.nextUrl;

  // If there's no authToken and the user is not on the login page, redirect to /login
  if (!token && pathname !== '/login') {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Protect all routes except the login page
export const config = {
  matcher: ['/:path*'], // Apply to all routes
};
