import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

const VALID_TYPES = ['track', 'download'];

// GET /api/history?email=...  -> list this user's activity (newest first)
export async function GET(request: NextRequest) {
  try {
    const email = (request.nextUrl.searchParams.get('email') || '').toLowerCase().trim();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const result = await sql`
      SELECT DISTINCT ON (a.activity_type, a.tracking_number)
             a.id, a.activity_type, a.tracking_number, a.created_at,
             s.origin, s.destination, s.status
      FROM user_activity a
      LEFT JOIN shipments s ON s.tracking_number = a.tracking_number
      WHERE a.user_email = ${email}
      ORDER BY a.activity_type, a.tracking_number, a.created_at DESC
      LIMIT 100;
    `;

    // Urutkan hasil akhir berdasarkan aktivitas terbaru (DISTINCT ON memaksa urut per grup dulu)
    const activities = [...result.rows].sort(
      (x, y) => new Date(y.created_at).getTime() - new Date(x.created_at).getTime()
    );

    return NextResponse.json({ activities });
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}

// POST /api/history  body { email, type: 'track'|'download', trackingNumber }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body?.email === 'string' ? body.email.toLowerCase().trim() : '';
    const type = typeof body?.type === 'string' ? body.type.trim() : '';
    const trackingNumber = typeof body?.trackingNumber === 'string' ? body.trackingNumber.trim().toUpperCase() : '';

    if (!email || !type || !trackingNumber) {
      return NextResponse.json({ error: 'email, type and trackingNumber are required' }, { status: 400 });
    }
    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: 'Invalid activity type' }, { status: 400 });
    }

    // Kalau aktivitas (type + AWB) yang sama sudah pernah dicatat user ini,
    // naikkan ke paling atas dengan update timestamp-nya — jangan bikin row dupe.
    const updated = await sql`
      UPDATE user_activity
      SET created_at = NOW()
      WHERE id = (
        SELECT id FROM user_activity
        WHERE user_email = ${email}
          AND activity_type = ${type}
          AND tracking_number = ${trackingNumber}
        ORDER BY created_at DESC
        LIMIT 1
      )
      RETURNING id;
    `;
    if (updated.rows.length > 0) {
      return NextResponse.json({ success: true, bumped: true });
    }

    await sql`
      INSERT INTO user_activity (user_email, activity_type, tracking_number)
      VALUES (${email}, ${type}, ${trackingNumber});
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving history:', error);
    return NextResponse.json({ error: 'Failed to save history' }, { status: 500 });
  }
}
