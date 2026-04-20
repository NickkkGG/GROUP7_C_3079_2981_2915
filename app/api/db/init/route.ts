import { createTables } from '@/lib/db';

export async function GET() {
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
