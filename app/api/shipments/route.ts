import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Build search query
    let query = `
      SELECT s.*, f.flight_number, f.departure_city, f.arrival_city
      FROM shipments s
      LEFT JOIN flights f ON s.flight_id = f.id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND (
        s.tracking_number ILIKE $${paramIndex} OR
        s.origin ILIKE $${paramIndex} OR
        s.destination ILIKE $${paramIndex} OR
        s.status ILIKE $${paramIndex} OR
        f.flight_number ILIKE $${paramIndex}
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM (${query}) as filtered`;
    const countResult = await sql.query(countQuery, params);
    const totalItems = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    // Add pagination
    query += ` ORDER BY s.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await sql.query(query, params);

    return NextResponse.json({
      shipments: result.rows,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching shipments:', error);
    return NextResponse.json({ error: 'Failed to fetch shipments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      tracking_number,
      sender,
      sender_contact,
      sender_address,
      receiver,
      recipient_name,
      recipient_contact,
      recipient_address,
      origin,
      destination,
      weight,
      flight_id,
      status,
      notes
    } = body;

    // Validate required fields
    if (!tracking_number || !sender || !recipient_name || !origin || !destination || !weight) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if tracking number already exists
    const existingShipment = await sql.query(
      'SELECT id FROM shipments WHERE tracking_number = $1',
      [tracking_number]
    );

    if (existingShipment.rows.length > 0) {
      return NextResponse.json({ error: 'Tracking number already exists' }, { status: 400 });
    }

    // Insert new shipment
    const result = await sql.query(
      `INSERT INTO shipments (
        tracking_number, sender, sender_contact, sender_address,
        recipient_name, recipient_contact, recipient_address,
        origin, destination, weight, flight_id, status, notes, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
      RETURNING *`,
      [
        tracking_number,
        sender,
        sender_contact || null,
        sender_address || null,
        recipient_name,
        recipient_contact || null,
        recipient_address || null,
        origin,
        destination,
        weight,
        flight_id || null,
        status || 'booked',
        notes || null
      ]
    );

    return NextResponse.json({
      success: true,
      shipment: result.rows[0]
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating shipment:', error);
    return NextResponse.json({ error: 'Failed to create shipment' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      tracking_number,
      sender,
      sender_contact,
      sender_address,
      receiver,
      recipient_name,
      recipient_contact,
      recipient_address,
      origin,
      destination,
      weight,
      flight_id,
      status,
      notes
    } = body;

    // Validate required fields
    if (!id || !tracking_number || !sender || !recipient_name || !origin || !destination || !weight) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if tracking number exists for another shipment
    const existingShipment = await sql.query(
      'SELECT id FROM shipments WHERE tracking_number = $1 AND id != $2',
      [tracking_number, id]
    );

    if (existingShipment.rows.length > 0) {
      return NextResponse.json({ error: 'Tracking number already exists' }, { status: 400 });
    }

    // Update shipment
    const result = await sql.query(
      `UPDATE shipments SET
        tracking_number = $1,
        sender = $2,
        sender_contact = $3,
        sender_address = $4,
        receiver = $5,
        recipient_name = $6,
        recipient_contact = $7,
        recipient_address = $8,
        origin = $9,
        destination = $10,
        weight = $11,
        flight_id = $12,
        status = $13,
        notes = $14
      WHERE id = $15
      RETURNING *`,
      [
        tracking_number,
        sender,
        sender_contact || null,
        sender_address || null,
        receiver || recipient_name,
        recipient_name,
        recipient_contact || null,
        recipient_address || null,
        origin,
        destination,
        weight,
        flight_id || null,
        status,
        notes || null,
        id
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      shipment: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating shipment:', error);
    return NextResponse.json({ error: 'Failed to update shipment' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Shipment ID is required' }, { status: 400 });
    }

    // Delete shipment
    const result = await sql.query(
      'DELETE FROM shipments WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Shipment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting shipment:', error);
    return NextResponse.json({ error: 'Failed to delete shipment' }, { status: 500 });
  }
}
