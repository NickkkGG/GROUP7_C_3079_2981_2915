import { getAllShipments } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const shipments = await getAllShipments();

    if (search) {
      const filtered = shipments.filter(
        (s) =>
          s.tracking_number?.toLowerCase().includes(search.toLowerCase()) ||
          s.origin?.toLowerCase().includes(search.toLowerCase()) ||
          s.destination?.toLowerCase().includes(search.toLowerCase())
      );
      return Response.json(filtered);
    }

    return Response.json(shipments);
  } catch (error) {
    console.error('Error fetching shipments:', error);
    return Response.json({ error: 'Failed to fetch shipments' }, { status: 500 });
  }
}
