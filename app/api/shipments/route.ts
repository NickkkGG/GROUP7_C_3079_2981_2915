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
