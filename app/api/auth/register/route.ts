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
    const { fullName, email, password, code, verificationCode: userCode, step } = body;

    // STEP 1: Generate and save verification code
    if (step === 1) {
      if (!fullName || !email || !password) {
        return Response.json({ error: 'Missing required fields' }, { status: 400 });
      }

      if (!code) {
        return Response.json({ error: 'Code generation failed' }, { status: 400 });
      }

      // Save code to database
      await saveVerificationCode(email, code);

      return Response.json({
        success: true,
        message: 'Code saved. Please verify.',
        step: 1
      });
    }

    // STEP 2: Verify code and create user
    if (step === 2) {
      if (!fullName || !email || !password || !userCode) {
        return Response.json({ error: 'Missing required fields' }, { status: 400 });
      }

      // Verify the code
      const isValid = await verifyCode(email, userCode);
      if (!isValid) {
        console.log('Verification failed for:', { email, userCode });
        return Response.json({ error: 'Invalid or expired verification code' }, { status: 400 });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user (default role: 'user')
      const user = await insertUser(fullName, email, hashedPassword);

      return Response.json({
        success: true,
        message: 'Account created successfully',
        user
      });
    }

    return Response.json({ error: 'Invalid request' }, { status: 400 });

  } catch (error) {
    console.error('Registration error:', error);
    return Response.json({ error: 'Registration failed' }, { status: 500 });
  }
}
