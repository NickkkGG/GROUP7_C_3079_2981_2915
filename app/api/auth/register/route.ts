import { insertUser, saveVerificationCode, verifyCode, getUserByEmail } from '@/lib/db';
import { validateRegisterStepOne, validateRegisterStepTwo } from '@/lib/validation';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, password, code, verificationCode: userCode, step } = body;

    if (step === 1) {
      const validation = validateRegisterStepOne({ fullName, email, password, code });
      if (!validation.ok) {
        return Response.json({ error: validation.error }, { status: 400 });
      }

      const { fullName: normalizedFullName, email: normalizedEmail, password: normalizedPassword, code: normalizedCode } = validation.sanitized;

      const existingUser = await getUserByEmail(normalizedEmail);
      if (existingUser) {
        return Response.json({
          error: 'ALTUS Register Error: Email already registered in ALTUS system. Please login or use another email.'
        }, { status: 409 });
      }

      await saveVerificationCode(normalizedEmail, normalizedCode!);

      return Response.json({
        success: true,
        message: 'Code saved. Please verify.',
        step: 1,
        fullName: normalizedFullName,
        email: normalizedEmail,
        password: normalizedPassword
      });
    }

    if (step === 2) {
      const validation = validateRegisterStepTwo({
        fullName,
        email,
        password,
        verificationCode: userCode,
      });

      if (!validation.ok) {
        return Response.json({ error: validation.error }, { status: 400 });
      }

      const {
        fullName: normalizedFullName,
        email: normalizedEmail,
        password: normalizedPassword,
        verificationCode: normalizedVerificationCode,
      } = validation.sanitized;

      const existingUser = await getUserByEmail(normalizedEmail);
      if (existingUser) {
        return Response.json({
          error: 'ALTUS Register Error: Email already registered in ALTUS system. Please login or use another email.'
        }, { status: 409 });
      }

      const isValid = await verifyCode(normalizedEmail, normalizedVerificationCode);
      if (!isValid) {
        return Response.json({
          error: 'ALTUS Register Error: Verification code is incorrect or expired.'
        }, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(normalizedPassword, 10);

      try {
        const user = await insertUser(normalizedFullName, normalizedEmail, hashedPassword);

        return Response.json({
          success: true,
          message: 'Account created successfully',
          user
        });
      } catch (dbError: any) {
        console.error('Database error:', dbError);

        if ((dbError.message && dbError.message.includes('unique')) || dbError.code === 'SQLITE_CONSTRAINT') {
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
