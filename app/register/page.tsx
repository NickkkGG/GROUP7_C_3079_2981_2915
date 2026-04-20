'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { inter } from '@/app/ui/fonts';
import Header from '@/components/Header';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
    
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    setIsLoading(true);
    
    // Simulate registration process
    setTimeout(() => {
      setIsLoading(false);
      // Handle registration logic here
      console.log('Registration attempted with:', { fullName, email, password });
    }, 1000);
  };

  return (
    <main className={`${inter.className} bg-[#0d1c32] overflow-x-hidden`}>
      <Header />

      {/* ===== REGISTER SECTION ===== */}
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
            <div className="mb-8 opacity-0 animate-fade-up" style={{animationDelay: '100ms'}}>
              <h2 className="text-4xl text-white font-black leading-tight tracking-tight">
                Register
              </h2>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 opacity-0 animate-fade-up" style={{animationDelay: '150ms'}}>
              {/* Full Name Field */}
              <div className="space-y-2">
                <label htmlFor="fullName" className="block text-white/80 font-semibold text-sm">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 rounded-[12px] bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-[#003fcc] focus:bg-white/15 transition-all duration-300 font-medium"
                  required
                />
              </div>

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

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-white/80 font-semibold text-sm">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full px-4 py-3 rounded-[12px] bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-[#003fcc] focus:bg-white/15 transition-all duration-300 font-medium"
                  required
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
