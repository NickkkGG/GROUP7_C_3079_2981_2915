'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { inter } from '@/app/ui/fonts';
import Header from '@/components/Header';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login process
    setTimeout(() => {
      setIsLoading(false);
      // Handle login logic here
      console.log('Login attempted with:', { email, password });
    }, 1000);
  };

  const handleGuestLogin = () => {
    window.location.href = '/dashboard?role=guest';
  };

  const handleOperatorLogin = () => {
    window.location.href = '/dashboard?role=operator';
  };

  return (
    <main className={`${inter.className} bg-[#0d1c32] overflow-x-hidden`}>
      <Header />

      {/* ===== LOGIN SECTION ===== */}
      <section className="relative min-h-screen w-full flex items-center overflow-hidden pt-32 pb-6">
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
              <div className="flex flex-col items-start">
                {/* Line 1 */}
                <h1 className="text-3xl md:text-4xl lg:text-5xl text-white font-black leading-tight tracking-tight opacity-0 animate-fade-up" style={{marginTop: '-325px'}}>
                  Your Shipment,
                </h1>

                {/* Line 2 - Mix of white text and blue ALTUS */}
                <div className="flex items-center justify-start gap-1 opacity-0 animate-fade-up" style={{animationDelay: '50ms'}}>
                  <span className="text-3xl md:text-4xl lg:text-5xl text-white font-black leading-tight tracking-tight whitespace-nowrap">
                    Tracked High with
                  </span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#002F75] to-[#002F75] font-black text-3xl md:text-4xl lg:text-5xl leading-tight" style={{transform: 'translateY(1px) translateX(5px)'}}>
                    Altus
                  </span>
                </div>
              </div>
            </div>

            {/* Subtitle */}
            <p className="text-base md:text-lg xl:text-lg text-white/80 font-semibold leading-relaxed opacity-0 animate-fade-up translate-y-[-235px] translate-x-[10px] md:whitespace-nowrap" style={{animationDelay: '50ms'}}>
              Real-time airway bill tracking for seamless cargo operations
            </p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="relative z-20 w-full lg:w-1/2 flex items-center justify-center px-6 lg:px-10 -mt-20">
          <div className="w-full max-w-sm">
            {/* Heading */}
            <div className="mb-10 opacity-0 animate-fade-up" style={{animationDelay: '100ms'}}>
              <h2 className="text-4xl text-white font-black leading-tight tracking-tight">
                Login
              </h2>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5 opacity-0 animate-fade-up" style={{animationDelay: '150ms'}}>
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-white/80 font-semibold text-sm">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-[12px] bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-[#003fcc] focus:bg-white/15 transition-all duration-300 font-medium"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-white/80 font-semibold text-sm">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 rounded-[12px] bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-[#003fcc] focus:bg-white/15 transition-all duration-300 font-medium"
                  required
                />
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded bg-white/10 border border-white/20 cursor-pointer accent-[#003fcc]" />
                  <span className="text-white/60 group-hover:text-white transition-colors">Remember Me</span>
                </label>
                <Link href="#" className="text-[#003fcc] hover:text-[#0b499a] transition-colors font-semibold">
                  Forgot Password?
                </Link>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-3 bg-gradient-to-r from-[#003fcc] to-[#0b499a] rounded-[12px] shadow-[0_0_20px_rgba(0,63,204,0.4)] font-bold text-white text-base tracking-wide uppercase btn-enhanced-hover hover:shadow-[0_0_50px_rgba(0,63,204,0.8)] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>

              {/* Continue as Guest Button */}
              <button
                type="button"
                onClick={handleGuestLogin}
                className="w-full px-6 py-3 bg-white/10 border border-white/20 rounded-[12px] font-bold text-white text-base tracking-wide uppercase hover:bg-white/20 hover:border-white/40 transition-all duration-300"
              >
                Continue as Guest
              </button>

              {/* Login as Operator Button */}
              <button
                type="button"
                onClick={handleOperatorLogin}
                className="w-full px-6 py-3 bg-green-500/20 border border-green-500/30 rounded-[12px] font-bold text-green-400 text-base tracking-wide uppercase hover:bg-green-500/30 hover:border-green-500/50 transition-all duration-300"
              >
                Login as Operator
              </button>
            </form>

            {/* Sign Up Link */}
            <p className="text-center mt-6 text-white/60 font-medium opacity-0 animate-fade-up" style={{animationDelay: '200ms'}}>
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-[#003fcc] hover:text-[#0b499a] transition-colors font-bold">
                Create
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
