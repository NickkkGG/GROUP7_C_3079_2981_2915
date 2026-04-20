import { sql } from '@vercel/postgres';
import bcrypt from 'bcrypt';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return Response.json({ error: 'Email required' }, { status: 400 });
    }

    const result = await sql`
      SELECT id, fullname, email, role FROM users WHERE email = ${email.toLowerCase().trim()};
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
    const { email, fullname, newPassword, currentPassword } = body;

    if (!email) {
      return Response.json({ error: 'Email required' }, { status: 400 });
    }

    // Get current user
    const userResult = await sql`
      SELECT id, password FROM users WHERE email = ${email.toLowerCase().trim()};
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
    if (fullname) {
      const result = await sql`
        UPDATE users SET fullname = ${fullname} WHERE email = ${email.toLowerCase().trim()} RETURNING id, fullname, email, role;
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
