import { sql } from '@vercel/postgres';
import bcrypt from 'bcrypt';
import { requireUserOrOperator } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const requesterEmail = searchParams.get('requesterEmail');

    const auth = await requireUserOrOperator(requesterEmail, email);
    if (!auth.ok) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const result = await sql`
      SELECT id, fullname, email, role FROM users WHERE email = ${email!.toLowerCase().trim()};
    `;

    if (result.rows.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    return Response.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return Response.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { email, fullname, newPassword, currentPassword, requesterEmail } = body;
    const normalizedEmail = typeof email === 'string' ? email.toLowerCase().trim() : '';
    const normalizedFullname = typeof fullname === 'string' ? fullname.trim() : '';

    if (!normalizedEmail) {
      return Response.json({ error: 'Email required' }, { status: 400 });
    }

    const auth = await requireUserOrOperator(requesterEmail, normalizedEmail);
    if (!auth.ok) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    // Get current user
    const userResult = await sql`
      SELECT id, password FROM users WHERE email = ${normalizedEmail};
    `;

    if (userResult.rows.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const user = userResult.rows[0];

    // Update password if provided
    if (newPassword && currentPassword) {
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return Response.json({ error: 'Current password is incorrect' }, { status: 401 });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const result = await sql`
        UPDATE users SET password = ${hashedPassword} WHERE email = ${email.toLowerCase().trim()} RETURNING id, fullname, email, role;
      `;

      return Response.json({
        success: true,
        user: result.rows[0],
      });
    }

    // Update fullname if provided
    if (fullname !== undefined) {
      if (!normalizedFullname) {
        return Response.json({ error: 'Full name cannot be empty' }, { status: 400 });
      }

      const result = await sql`
        UPDATE users SET fullname = ${normalizedFullname} WHERE email = ${normalizedEmail} RETURNING id, fullname, email, role;
      `;

      return Response.json({
        success: true,
        user: result.rows[0],
      });
    }

    return Response.json({ error: 'No fields to update' }, { status: 400 });
  } catch (error) {
    console.error('Error updating profile:', error);
    return Response.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
