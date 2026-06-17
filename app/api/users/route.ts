import { sql } from '@vercel/postgres';
import bcrypt from 'bcrypt';

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
    const { userId, fullname, email, role, password } = await request.json();

    if (!userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Validasi field yang diisi
    if (fullname !== undefined && fullname.trim().length < 3) {
      return Response.json({ error: 'Full name must be at least 3 characters' }, { status: 400 });
    }
    if (email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return Response.json({ error: 'Invalid email format' }, { status: 400 });
      }
    }
    if (password !== undefined && password.length > 0 && password.length < 6) {
      return Response.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }
    if (role !== undefined && !['guest', 'user', 'operator'].includes(role)) {
      return Response.json({ error: 'Invalid role. Allowed roles: guest, user, operator' }, { status: 400 });
    }

    // Build dynamic update
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (fullname !== undefined) { fields.push(`fullname = $${idx++}`); values.push(fullname.trim()); }
    if (email !== undefined) { fields.push(`email = $${idx++}`); values.push(email.trim().toLowerCase()); }
    if (role !== undefined) { fields.push(`role = $${idx++}`); values.push(role); }
    if (password && password.length > 0) {
      const hashed = await bcrypt.hash(password, 10);
      fields.push(`password = $${idx++}`); values.push(hashed);
    }

    if (fields.length === 0) {
      return Response.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(userId);
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, fullname, email, role`;
    const result = await sql.query(query, values);

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
