import { getAllFlights, getAllShipments } from '@/lib/db';

export async function GET() {
  try {
    const flights = await getAllFlights();
    const shipments = await getAllShipments();

    const onTimeFlights = flights.filter((f) => f.status === 'scheduled' || f.status === 'active').length;
    const delayedFlights = flights.filter((f) => f.status === 'delayed').length;
    const totalShipments = shipments.length;
    const departedShipments = shipments.filter((s) => s.status === 'departed').length;

    return Response.json({
      totalShipments,
      shipmentsChange: '+12%',
      onTime: onTimeFlights,
      onTimeChange: '+5%',
      delayed: delayedFlights,
      delayedChange: '-2%',
      readyToLoad: departedShipments,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return Response.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
