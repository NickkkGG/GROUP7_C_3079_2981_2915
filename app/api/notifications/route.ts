import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// GET: fetch notifications for a user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const result = await sql`
      SELECT id, tracking_number, message, is_read, created_at
      FROM notifications
      WHERE user_email = ${email}
      ORDER BY created_at DESC
      LIMIT 50;
    `;

    const unreadCount = await sql`
      SELECT COUNT(*) as count
      FROM notifications
      WHERE user_email = ${email} AND is_read = FALSE;
    `;

    return NextResponse.json({
      notifications: result.rows,
      unreadCount: parseInt(unreadCount.rows[0].count) || 0
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

// PATCH: mark notification as read
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, email } = body;

    if (!id || !email) {
      return NextResponse.json({ error: 'ID and email required' }, { status: 400 });
    }

    await sql`
      UPDATE notifications
      SET is_read = TRUE
      WHERE id = ${id} AND user_email = ${email};
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}

// DELETE: clear all notifications for a user
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    await sql`
      DELETE FROM notifications
      WHERE user_email = ${email};
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    return NextResponse.json({ error: 'Failed to clear notifications' }, { status: 500 });
  }
}
