import { getUserByEmail } from '@/lib/db';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validasi field kosong
    if (!email && !password) {
      return Response.json({
        error: 'ALTUS Login Error: Email and password are required'
      }, { status: 400 });
    }

    if (!email) {
      return Response.json({
        error: 'ALTUS Login Error: Email cannot be empty'
      }, { status: 400 });
    }

    if (!password) {
      return Response.json({
        error: 'ALTUS Login Error: Password cannot be empty'
      }, { status: 400 });
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json({
        error: 'ALTUS Login Error: Invalid email format. Use format: name@domain.com'
      }, { status: 400 });
    }

    // Get user from database
    const user = await getUserByEmail(email.toLowerCase().trim());

    if (!user) {
      return Response.json({
        error: 'ALTUS Login Error: Email not registered in ALTUS system. Please register first.'
      }, { status: 401 });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return Response.json({
        error: 'ALTUS Login Error: Incorrect password. Please check your password.'
      }, { status: 401 });
    }

    // Login successful
    return Response.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        fullname: user.fullname,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return Response.json({
      error: 'ALTUS System Error: Server error occurred. Please try again later.'
    }, { status: 500 });
  }
}
