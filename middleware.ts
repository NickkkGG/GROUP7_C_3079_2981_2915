import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Proteksi semua route /dashboard: wajib ada cookie auth_role (di-set saat login).
// Tanpa cookie -> redirect ke /login.
export function middleware(request: NextRequest) {
  const role = request.cookies.get('auth_role')?.value;

  if (!role) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard', '/dashboard/:path*'],
};
