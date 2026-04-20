import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    const result = await sql`
      SELECT id, fullname, email, role, created_at FROM users ORDER BY created_at DESC;
    `;
    return Response.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    return Response.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { userId, role } = await request.json();

    if (!userId || !role) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await sql`
      UPDATE users SET role = ${role} WHERE id = ${userId} RETURNING id, fullname, email, role;
    `;

    if (result.rows.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    return Response.json({
      success: true,
      user: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return Response.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return Response.json({ error: 'User ID required' }, { status: 400 });
    }

    await sql`
      DELETE FROM users WHERE id = ${userId};
    `;

    return Response.json({ success: true, message: 'User deleted' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return Response.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
