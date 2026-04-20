'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { inter } from '@/app/ui/fonts';
import Header from '@/components/Header';
import FloatingInput from '@/components/FloatingInput';
import CustomNotification, { useNotification } from '@/components/CustomNotification';
import { RotateCw, User, Mail, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const { notification, show: showNotification } = useNotification();

  const generateCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const validateEmail = (email: string): boolean => {
    return email.includes('@') && email.includes('.');
  };

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [userVerificationCode, setUserVerificationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationStep, setRegistrationStep] = useState(1); // 1 = form, 2 = verify code

  const handleRefreshCode = async () => {
    // Generate new code locally
    const newCode = generateCode();
    setVerificationCode(newCode);
    setUserVerificationCode('');

    // Save new code to database
    try {
      await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.toLowerCase().trim(),
          password,
          refreshCode: true,
          newCode: newCode
        })
      });
    } catch (error) {
      console.error('Error refreshing code:', error);
    }
  };

  // Scroll to top on initial load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  // Smooth Parallax Effect
  useEffect(() => {
    const handleParallax = () => {
      const scrollY = window.scrollY;

      const bgOverlay = document.querySelector('.parallax-bg');
      if (bgOverlay) {
        const transform = scrollY * 0.5;
        (bgOverlay as HTMLElement).style.transform = `translateY(${transform}px)`;
      }

      const heroContent = document.querySelector('.hero-content');
      if (heroContent) {
        const transform = scrollY * 0.25;
        (heroContent as HTMLElement).style.transform = `translateY(${transform}px)`;
        (heroContent as HTMLElement).style.transition = 'transform 0.1s linear';
      }
    };

    window.addEventListener('scroll', handleParallax);
    return () => window.removeEventListener('scroll', handleParallax);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // STEP 1: Generate & Save Code
    if (registrationStep === 1) {
      // Validation
      if (!fullName.trim()) {
        showNotification('Full name is required', 'error');
        return;
      }

      if (!validateEmail(email)) {
        showNotification('Email must contain @ and a domain (e.g., .com)', 'error');
        return;
      }

      if (!password || password.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
      }

      if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
      }

      setIsLoading(true);

      try {
        // Generate new code
        const newCode = generateCode();
        setVerificationCode(newCode);
        setUserVerificationCode('');

        // Save code to database
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: fullName.trim(),
            email: email.toLowerCase().trim(),
            password,
            code: newCode,
            step: 1
          })
        });

        const data = await response.json();

        if (!response.ok) {
          showNotification(data.error || 'Failed to generate code', 'error');
          setIsLoading(false);
          return;
        }

        showNotification('Verification code sent! Enter code to complete registration', 'success');
        setRegistrationStep(2);
        setIsLoading(false);
      } catch (error) {
        console.error('Code generation error:', error);
        showNotification('Failed to generate code. Please try again.', 'error');
        setIsLoading(false);
      }
      return;
    }

    // STEP 2: Verify Code & Create User
    if (registrationStep === 2) {
      if (!userVerificationCode) {
        showNotification('Please enter verification code', 'error');
        return;
      }

      setIsLoading(true);

      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: fullName.trim(),
            email: email.toLowerCase().trim(),
            password,
            verificationCode: userVerificationCode.trim(),
            step: 2
          })
        });

        const data = await response.json();

        if (!response.ok) {
          // Auto-refresh code on error
          const newCode = generateCode();
          setVerificationCode(newCode);
          setUserVerificationCode('');
          showNotification('Code invalid/expired. Code refreshed! Enter new code.', 'error');
          setIsLoading(false);
          return;
        }

        showNotification('Account created successfully! Redirecting to login...', 'success');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      } catch (error) {
        console.error('Verification error:', error);
        showNotification('Verification failed. Please try again.', 'error');
        setIsLoading(false);
      }
    }
  };

  return (
    <main className={`${inter.className} bg-[#0d1c32] overflow-x-hidden`}>
      {notification && (
        <CustomNotification
          message={notification.message}
          type={notification.type}
        />
      )}
      <Header />

      {/* ===== REGISTER SECTION ===== */}
      <section className="relative min-h-screen w-full flex items-center overflow-hidden pt-16 pb-6">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 opacity-70 parallax-bg">
          <Image src="/images/login & register.jpeg" fill alt="background" className="object-cover" priority />
        </div>

        {/* Blur Effects */}
        <div className="absolute top-[-131px] left-[-1005px] w-[1218px] h-[947px] bg-[#0d1d32] rotate-[0.84deg] blur-[199.25px] z-10" />
        <div className="absolute top-[-898px] left-[908px] w-[1259px] h-[1080px] bg-[#0d1d32] blur-[199.25px] z-10" />

        {/* Left Side - Hero Content */}
        <div className="relative z-20 hidden lg:flex lg:w-1/2 flex-col items-start justify-start px-10 pt-20">
          <div className="hero-content max-w-md text-left space-y-6">
            {/* Main Heading */}
            <div className="space-y-2">
              <div className="flex flex-col items-center">
                {/* Line 1 */}
                <h1 className="text-3xl md:text-4xl lg:text-5xl text-white font-black leading-tight tracking-tight opacity-0 animate-fade-up md:translate-x-[-46px]" style={{marginTop: '-330px'}}>
                  Your Shipment,
                </h1>

                {/* Line 2 - Mix of white text and blue ALTUS */}
                <div className="flex items-center justify-start gap-1 opacity-0 animate-fade-up" style={{animationDelay: '50ms'}}>
                  <span className="text-3xl md:text-4xl lg:text-5xl text-white font-black leading-tight tracking-tight whitespace-nowrap md:translate-x-[51px]">
                    Tracked High with
                  </span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#002F75] to-[#002F75] font-black text-3xl md:text-4xl lg:text-5xl leading-tight" style={{transform: 'translateY(1px) translateX(55px)'}}>
                    Altus
                  </span>
                </div>
              </div>
            </div>

            {/* Subtitle */}
            <p className="text-base md:text-lg xl:text-lg text-white/80 font-semibold leading-relaxed opacity-0 animate-fade-up translate-y-[-239px] translate-x-[10px] md:whitespace-nowrap" style={{animationDelay: '50ms'}}>
              Real-time airway bill tracking for seamless cargo operations
            </p>
          </div>
        </div>

        {/* Right Side - Register Form */}
        <div className="relative z-20 w-full lg:w-1/2 flex items-center justify-center px-6 lg:px-10">
          <div className="w-full max-w-sm">
            {/* Heading */}
            <div className="mb-5 opacity-0 animate-fade-up" style={{animationDelay: '100ms'}}>
              <h2 className="text-4xl text-white font-black leading-tight tracking-tight">
                Register
              </h2>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-2 opacity-0 animate-fade-up" style={{animationDelay: '150ms'}}>
              {/* Full Name Field */}
              <FloatingInput
                type="text"
                id="fullName"
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                rightIcon={<User size={18} />}
                required
              />

              {/* Email Field */}
              <FloatingInput
                type="email"
                id="email"
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                rightIcon={<Mail size={18} />}
                required
              />

              {/* Password Field */}
              <FloatingInput
                type={showPassword ? 'text' : 'password'}
                id="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                rightIcon={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                onRightIconClick={() => setShowPassword(!showPassword)}
                required
              />

              {/* Confirm Password Field */}
              <FloatingInput
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                label="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                rightIcon={showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                onRightIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
                required
              />

              {/* Verification Code Section */}
              <div className="space-y-2 pt-2 border-t border-white/20">
                <div className="space-y-1.5">
                  <label className="block text-white/80 font-semibold text-sm">
                    Verification Code
                  </label>
                  <div className="px-4 py-3 rounded-[12px] bg-white/10 border-2 border-white/30 text-white font-mono text-lg font-bold text-center tracking-widest min-h-[50px] flex items-center justify-center">
                    {verificationCode || '--- --- ---'}
                  </div>
                  <p className="text-white/50 text-xs text-center">Code akan di-generate saat Anda tekan Create Account</p>
                </div>

                <FloatingInput
                  type="text"
                  id="verifyCode"
                  label="Enter Code"
                  value={userVerificationCode}
                  onChange={(e) => setUserVerificationCode(e.target.value.toUpperCase())}
                  placeholder="Masukkan kode verifikasi"
                />
              </div>

              {/* Terms & Conditions */}
              <label className="flex items-start gap-3 cursor-pointer group pt-2">
                <input type="checkbox" className="w-4 h-4 rounded bg-white/10 border border-white/20 cursor-pointer accent-[#003fcc] mt-1" required />
                <span className="text-white/60 group-hover:text-white transition-colors text-xs md:text-sm">
                  I agree to the{' '}
                  <Link href="#" className="text-[#003fcc] hover:text-[#0b499a] transition-colors font-semibold">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="#" className="text-[#003fcc] hover:text-[#0b499a] transition-colors font-semibold">
                    Privacy Policy
                  </Link>
                </span>
              </label>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-3 bg-gradient-to-r from-[#003fcc] to-[#0b499a] rounded-[12px] shadow-[0_0_20px_rgba(0,63,204,0.4)] font-bold text-white text-base tracking-wide uppercase btn-enhanced-hover hover:shadow-[0_0_50px_rgba(0,63,204,0.8)] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            {/* Sign In Link */}
            <p className="text-center mt-6 text-white/60 font-medium opacity-0 animate-fade-up" style={{animationDelay: '200ms'}}>
              Already have an account?{' '}
              <Link href="/login" className="text-[#003fcc] hover:text-[#0b499a] transition-colors font-bold">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
