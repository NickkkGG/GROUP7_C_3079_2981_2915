import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ flightNumber: string }> }
) {
  try {
    const { flightNumber } = await params;

    // Get flight details
    const flightResult = await sql`
      SELECT f.*, a.registration, a.model, a.airline
      FROM flights f
      LEFT JOIN aircraft a ON f.aircraft_id = a.id
      WHERE f.flight_number = ${flightNumber};
    `;

    if (flightResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Flight not found' },
        { status: 404 }
      );
    }

    // Get all shipments for this flight
    const shipmentsResult = await sql`
      SELECT tracking_number, sender, origin, destination, weight, status
      FROM shipments
      WHERE flight_id = (SELECT id FROM flights WHERE flight_number = ${flightNumber})
      ORDER BY tracking_number ASC;
    `;

    return NextResponse.json({
      flight: flightResult.rows[0],
      shipments: shipmentsResult.rows,
    });
  } catch (error) {
    console.error('Error fetching flight manifest:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flight manifest' },
      { status: 500 }
    );
  }
}
