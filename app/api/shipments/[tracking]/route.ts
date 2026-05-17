import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tracking: string }> }
) {
  try {
    const { tracking: trackingNumber } = await params;

    // Get shipment details
    const shipmentResult = await sql`
      SELECT s.*, f.flight_number, f.departure_city, f.arrival_city, f.departure_time, f.arrival_time
      FROM shipments s
      LEFT JOIN flights f ON s.flight_id = f.id
      WHERE s.tracking_number = ${trackingNumber};
    `;

    if (shipmentResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Shipment not found' },
        { status: 404 }
      );
    }

    // Get tracking history
    const historyResult = await sql`
      SELECT * FROM tracking_history
      WHERE tracking_number = ${trackingNumber}
      ORDER BY timestamp DESC;
    `;

    return NextResponse.json({
      shipment: shipmentResult.rows[0],
      trackingHistory: historyResult.rows,
    });
  } catch (error) {
    console.error('Error fetching shipment details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shipment details' },
      { status: 500 }
    );
  }
}
