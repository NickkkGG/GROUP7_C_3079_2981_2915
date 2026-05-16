import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';

    // Get flight stats
    const flightStats = await sql`
      SELECT
        COUNT(*) FILTER (WHERE status = 'on-time') as on_time,
        COUNT(*) FILTER (WHERE status = 'delayed') as delayed,
        COUNT(*) FILTER (WHERE status = 'boarding' OR status = 'departed') as ready_to_land
      FROM flights;
    `;

    // Get shipment stats
    const shipmentStats = await sql`
      SELECT COUNT(*) as total FROM shipments;
    `;

    // Get active shipments with optional search
    let shipmentsQuery = `
      SELECT s.*, f.flight_number, f.departure_city, f.arrival_city
      FROM shipments s
      LEFT JOIN flights f ON s.flight_id = f.id
      WHERE s.status IN ('booked', 'received', 'in_transit')
    `;

    const params: any[] = [];
    if (search) {
      shipmentsQuery += ` AND (
        s.tracking_number ILIKE $1 OR
        s.origin ILIKE $1 OR
        s.destination ILIKE $1 OR
        f.flight_number ILIKE $1
      )`;
      params.push(`%${search}%`);
    }

    shipmentsQuery += ` ORDER BY s.created_at DESC LIMIT 5`;

    const activeShipments = await sql.query(shipmentsQuery, params);

    return NextResponse.json({
      totalShipments: shipmentStats.rows[0].total,
      shipmentsChange: '+12%',
      onTime: flightStats.rows[0].on_time,
      onTimeChange: '+5%',
      delayed: flightStats.rows[0].delayed,
      delayedChange: '-2%',
      readyToLand: flightStats.rows[0].ready_to_land,
      activeShipments: activeShipments.rows
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
