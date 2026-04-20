import { createTables } from '@/lib/db';

export async function GET() {
  try {
    await createTables();
    return Response.json({ success: true, message: 'Database initialized' });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: 'Failed to initialize database' }, { status: 500 });
  }
}
