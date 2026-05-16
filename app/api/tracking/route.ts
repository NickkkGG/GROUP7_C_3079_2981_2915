import { NextRequest, NextResponse } from 'next/server';
import { getShipmentByTracking, getTrackingHistory } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const awb = searchParams.get('awb');

    if (!awb) {
      return NextResponse.json({ error: 'AWB number is required' }, { status: 400 });
    }

    // Get shipment details
    const shipment = await getShipmentByTracking(awb);

    if (!shipment) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
    }

    // Get tracking history
    const history = await getTrackingHistory(awb);

    return NextResponse.json({
      shipment,
      history
    });
  } catch (error) {
    console.error('Error fetching tracking data:', error);
    return NextResponse.json({ error: 'Failed to fetch tracking data' }, { status: 500 });
  }
}
