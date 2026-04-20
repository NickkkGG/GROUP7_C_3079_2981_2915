import { getAllFlights } from '@/lib/db';

export async function GET() {
  try {
    const flights = await getAllFlights();
    return Response.json(flights);
  } catch (error) {
    console.error('Error fetching flights:', error);
    return Response.json({ error: 'Failed to fetch flights' }, { status: 500 });
  }
}
