import { getAllAircraft } from '@/lib/db';

export async function GET() {
  try {
    const aircraft = await getAllAircraft();
    return Response.json(aircraft);
  } catch (error) {
    console.error('Error fetching aircraft:', error);
    return Response.json({ error: 'Failed to fetch aircraft' }, { status: 500 });
  }
}
