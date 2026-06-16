import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Proteksi semua route /dashboard: wajib ada cookie auth_role (di-set saat login).
// Tanpa cookie -> redirect ke /login.
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Blokir semua endpoint seed/init yang sudah dihapus — redirect ke /restricted
  if (
    pathname.startsWith('/api/db/init') ||
    pathname.startsWith('/api/db/seed') ||
    pathname.startsWith('/api/flights/seed') ||
    pathname.startsWith('/api/dashboard/seed-stats')
  ) {
    return NextResponse.redirect(new URL('/restricted', request.url));
  }

  const role = request.cookies.get('auth_role')?.value;

  if (!role) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*',
    '/api/db/:path*',
    '/api/flights/seed',
    '/api/dashboard/seed-stats',
  ],
};
