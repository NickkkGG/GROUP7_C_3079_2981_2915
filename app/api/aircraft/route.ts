import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireOperator } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Build search query
    let query = `
      SELECT * FROM aircraft
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND (
        registration ILIKE $${paramIndex} OR
        model ILIKE $${paramIndex} OR
        airline ILIKE $${paramIndex} OR
        status ILIKE $${paramIndex}
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
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await sql.query(query, params);

    return NextResponse.json({
      aircraft: result.rows,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching aircraft:', error);
    return NextResponse.json({ error: 'Failed to fetch aircraft' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { registration, model, airline, capacity, status, requesterEmail } = body;

    const auth = await requireOperator(requesterEmail, 'aircraft');
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // Validate required fields
    if (!registration || !model) {
      return NextResponse.json({ error: 'Registration and model are required' }, { status: 400 });
    }

    // Check if registration already exists
    const existingAircraft = await sql.query(
      'SELECT id FROM aircraft WHERE registration = $1',
      [registration]
    );

    if (existingAircraft.rows.length > 0) {
      return NextResponse.json({ error: 'Aircraft registration already exists' }, { status: 400 });
    }

    // Insert new aircraft
    const result = await sql.query(
      `INSERT INTO aircraft (registration, model, airline, capacity, status, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [
        registration.toUpperCase().trim(),
        model.trim(),
        airline?.trim() || null,
        capacity ? parseInt(capacity) : null,
        status || 'active'
      ]
    );

    return NextResponse.json({
      success: true,
      aircraft: result.rows[0]
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating aircraft:', error);
    return NextResponse.json({ error: 'Failed to create aircraft' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, registration, model, airline, capacity, status, requesterEmail } = body;

    const auth = await requireOperator(requesterEmail, 'aircraft');
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // Validate required fields
    if (!id || !registration || !model) {
      return NextResponse.json({ error: 'ID, registration, and model are required' }, { status: 400 });
    }

    // Check if registration exists for another aircraft
    const existingAircraft = await sql.query(
      'SELECT id FROM aircraft WHERE registration = $1 AND id != $2',
      [registration, id]
    );

    if (existingAircraft.rows.length > 0) {
      return NextResponse.json({ error: 'Aircraft registration already exists' }, { status: 400 });
    }

    // Update aircraft
    const result = await sql.query(
      `UPDATE aircraft SET
        registration = $1,
        model = $2,
        airline = $3,
        capacity = $4,
        status = $5
      WHERE id = $6
      RETURNING *`,
      [
        registration.toUpperCase().trim(),
        model.trim(),
        airline?.trim() || null,
        capacity ? parseInt(capacity) : null,
        status || 'active',
        id
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Aircraft not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      aircraft: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating aircraft:', error);
    return NextResponse.json({ error: 'Failed to update aircraft' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const requesterEmail = searchParams.get('requesterEmail');

    const auth = await requireOperator(requesterEmail, 'aircraft');
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    if (!id) {
      return NextResponse.json({ error: 'Aircraft ID is required' }, { status: 400 });
    }

    // Check if aircraft is assigned to any flights
    const flightsCheck = await sql.query(
      'SELECT COUNT(*) FROM flights WHERE aircraft_id = $1',
      [id]
    );

    if (parseInt(flightsCheck.rows[0].count) > 0) {
      return NextResponse.json({
        error: 'Cannot delete aircraft that is assigned to flights'
      }, { status: 400 });
    }

    // Delete aircraft
    const result = await sql.query(
      'DELETE FROM aircraft WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Aircraft not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Aircraft deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting aircraft:', error);
    return NextResponse.json({ error: 'Failed to delete aircraft' }, { status: 500 });
  }
}
