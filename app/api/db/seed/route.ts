import { seedDatabase } from '@/lib/seed';

// SECURITY: Endpoint ini menulis ulang data (seed) dan bisa menimpa isi tabel.
// Proteksi sama seperti /api/db/init:
//   1. Hanya menerima POST (buka URL di browser = GET, otomatis ditolak).
//   2. Wajib mengirim header 'x-db-admin-secret' yang cocok dengan env DB_ADMIN_SECRET.
//   3. Jika DB_ADMIN_SECRET belum di-set, endpoint dinonaktifkan total (default aman).
function isAuthorized(request: Request): boolean {
  const secret = process.env.DB_ADMIN_SECRET;
  if (!secret) return false; // belum dikonfigurasi -> tolak semua
  const provided = request.headers.get('x-db-admin-secret');
  return provided === secret;
}

// Tolak GET supaya membuka URL .../api/db/seed di browser tidak melakukan apa-apa.
export async function GET() {
  return Response.json(
    { error: 'Method not allowed. This endpoint is disabled for GET requests.' },
    { status: 405 }
  );
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json(
      { error: 'Forbidden: missing or invalid admin secret. This endpoint is protected.' },
      { status: 403 }
    );
  }

  try {
    const result = await seedDatabase();
    return Response.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Seed error:', errorMessage);
    return Response.json({
      error: 'Failed to seed database',
      details: errorMessage
    }, { status: 500 });
  }
}
