import { insertUser, saveVerificationCode, verifyCode } from '@/lib/db';
import bcrypt from 'bcrypt';

function generateVerificationCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, password, confirmPassword, verificationCode: userCode } = body;

    // Validate input
    if (!fullName || !email || !password) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return Response.json({ error: 'Passwords do not match' }, { status: 400 });
    }

    // If verification code is provided, complete registration
    if (userCode) {
      // Verify the code
      const isValid = await verifyCode(email, userCode);
      if (!isValid) {
        return Response.json({ error: 'Invalid or expired verification code' }, { status: 400 });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await insertUser(fullName, email, hashedPassword);

      return Response.json({
        success: true,
        message: 'Account created successfully',
        user
      });
    }

    // Generate and save verification code
    const verificationCode = generateVerificationCode();
    await saveVerificationCode(email, verificationCode);

    return Response.json({
      success: true,
      message: 'Verification code sent',
      verificationCode, // In production, don't send this!
      step: 'verify_code'
    });

  } catch (error) {
    console.error('Registration error:', error);
    return Response.json({ error: 'Registration failed' }, { status: 500 });
  }
}
