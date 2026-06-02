import { insertUser, saveVerificationCode, verifyCode, getUserByEmail } from '@/lib/db';
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
      // Validasi field kosong
      if (!fullName) {
        return Response.json({
          error: 'ALTUS Register Error: Full name cannot be empty'
        }, { status: 400 });
      }

      if (!email) {
        return Response.json({
          error: 'ALTUS Register Error: Email cannot be empty'
        }, { status: 400 });
      }

      if (!password) {
        return Response.json({
          error: 'ALTUS Register Error: Password cannot be empty'
        }, { status: 400 });
      }

      // Validasi format email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return Response.json({
          error: 'ALTUS Register Error: Invalid email format. Use format: name@domain.com'
        }, { status: 400 });
      }

      // Validasi panjang nama
      if (fullName.trim().length < 3) {
        return Response.json({
          error: 'ALTUS Register Error: Full name must be at least 3 characters'
        }, { status: 400 });
      }

      // Validasi panjang password
      if (password.length < 6) {
        return Response.json({
          error: 'ALTUS Register Error: Password must be at least 6 characters'
        }, { status: 400 });
      }

      // Cek apakah email sudah terdaftar
      const existingUser = await getUserByEmail(email.toLowerCase().trim());
      if (existingUser) {
        return Response.json({
          error: 'ALTUS Register Error: Email already registered in ALTUS system. Please login or use another email.'
        }, { status: 409 });
      }

      if (!code) {
        return Response.json({
          error: 'ALTUS Register Error: Failed to generate verification code. Please try again.'
        }, { status: 400 });
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
      if (!fullName || !email || !password) {
        return Response.json({
          error: 'ALTUS Register Error: Registration data incomplete. Please start over.'
        }, { status: 400 });
      }

      if (!userCode) {
        return Response.json({
          error: 'ALTUS Register Error: Verification code cannot be empty'
        }, { status: 400 });
      }

      // Validasi format kode verifikasi
      if (userCode.trim().length !== 6) {
        return Response.json({
          error: 'ALTUS Register Error: Verification code must be 6 characters'
        }, { status: 400 });
      }

      // Verify the code
      const isValid = await verifyCode(email, userCode);
      if (!isValid) {
        console.log('Verification failed for:', { email, userCode });
        return Response.json({
          error: 'ALTUS Register Error: Verification code is incorrect or expired. New code has been generated.'
        }, { status: 400 });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user (default role: 'user')
      try {
        const user = await insertUser(fullName, email, hashedPassword);

        return Response.json({
          success: true,
          message: 'Account created successfully',
          user
        });
      } catch (dbError: any) {
        console.error('Database error:', dbError);

        // Handle duplicate email error
        if (dbError.message && dbError.message.includes('unique') || dbError.code === 'SQLITE_CONSTRAINT') {
          return Response.json({
            error: 'ALTUS Register Error: Email already registered in system. Use another email.'
          }, { status: 409 });
        }

        return Response.json({
          error: 'ALTUS Database Error: Failed to save data to database. Please try again.'
        }, { status: 500 });
      }
    }

    return Response.json({
      error: 'ALTUS Request Error: Invalid request'
    }, { status: 400 });

  } catch (error) {
    console.error('Registration error:', error);
    return Response.json({
      error: 'ALTUS System Error: Server error occurred. Please try again later.'
    }, { status: 500 });
  }
}
