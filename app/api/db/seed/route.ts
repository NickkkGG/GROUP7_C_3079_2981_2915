import { seedDatabase } from '@/lib/seed';

export async function GET() {
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
