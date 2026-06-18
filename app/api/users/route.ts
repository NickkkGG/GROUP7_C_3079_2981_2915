import { sql } from '@vercel/postgres';
import bcrypt from 'bcrypt';
import { requireOperator } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requesterEmail = searchParams.get('requesterEmail');

    const auth = await requireOperator(requesterEmail, 'users');
    if (!auth.ok) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

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
    const { userId, fullname, email, role, password, requesterEmail } = await request.json();

    const auth = await requireOperator(requesterEmail, 'users');
    if (!auth.ok) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

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

    // Cegah operator terakhir di-downgrade jadi non-operator (sistem bisa terkunci tanpa operator)
    if (role !== undefined && role !== 'operator') {
      const targetCheck = await sql`SELECT role FROM users WHERE id = ${userId};`;
      if (targetCheck.rows.length > 0 && targetCheck.rows[0].role === 'operator') {
        const operatorCount = await sql`SELECT COUNT(*) as count FROM users WHERE role = 'operator';`;
        if (parseInt(operatorCount.rows[0].count) <= 1) {
          return Response.json(
            { error: 'Cannot change the role of the last operator. At least one operator must remain.' },
            { status: 400 }
          );
        }
      }
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
    const requesterEmail = searchParams.get('requesterEmail');

    const auth = await requireOperator(requesterEmail, 'users');
    if (!auth.ok) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }
    if (!userId) {
      return Response.json({ error: 'User ID required' }, { status: 400 });
    }

    // Cek target user — kalau dia operator, pastikan bukan operator terakhir
    const target = await sql`SELECT role FROM users WHERE id = ${userId};`;
    if (target.rows.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    if (target.rows[0].role === 'operator') {
      const operatorCount = await sql`SELECT COUNT(*) as count FROM users WHERE role = 'operator';`;
      if (parseInt(operatorCount.rows[0].count) <= 1) {
        return Response.json(
          { error: 'Cannot delete the last operator account. At least one operator must remain.' },
          { status: 400 }
        );
      }
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
