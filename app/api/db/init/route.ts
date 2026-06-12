import { createTables } from '@/lib/db';

// SECURITY: Endpoint ini bisa MENGHAPUS (DROP) semua tabel.
// Proteksi berlapis supaya tidak bisa di-trigger sembarangan:
//   1. Hanya menerima POST (buka URL di browser = GET, otomatis ditolak).
//   2. Wajib mengirim header 'x-db-admin-secret' yang cocok dengan env DB_ADMIN_SECRET.
//   3. Jika DB_ADMIN_SECRET belum di-set, endpoint dinonaktifkan total (default aman).
function isAuthorized(request: Request): boolean {
  const secret = process.env.DB_ADMIN_SECRET;
  if (!secret) return false; // belum dikonfigurasi -> tolak semua
  const provided = request.headers.get('x-db-admin-secret');
  return provided === secret;
}

// Tolak GET supaya membuka URL .../api/db/init di browser tidak melakukan apa-apa.
export async function GET() {
  return Response.json(
    { error: 'Method not allowed. This destructive endpoint is disabled for GET requests.' },
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
    await createTables();
    return Response.json({ success: true, message: 'Database initialized' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Database init error:', errorMessage);
    return Response.json({
      error: 'Failed to initialize database',
      details: errorMessage
    }, { status: 500 });
  }
}
