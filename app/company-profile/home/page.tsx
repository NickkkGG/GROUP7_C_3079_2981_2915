'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { inter } from '@/app/ui/fonts';
import Header from '@/components/Header';

export default function HomePage() {
  const heroContentRef = useRef<HTMLDivElement>(null);

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

  return (
    <main className={`${inter.className} bg-[#0d1c32] overflow-x-hidden`}>
      <Header />

      {/* ===== HOME SECTION ===== */}
      <section className="relative min-h-screen w-full flex flex-col items-center overflow-hidden pt-32 pb-6">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 opacity-60 parallax-bg">
          <Image src="/images/plane_bg.jpg" fill alt="background" className="object-cover" priority />
        </div>

        {/* Blur Effects */}
        <div className="absolute top-[-131px] left-[-1005px] w-[1218px] h-[947px] bg-[#0d1d32] rotate-[0.84deg] blur-[199.25px] z-10" />
        <div className="absolute top-[-898px] left-[908px] w-[1259px] h-[1080px] bg-[#0d1d32] blur-[199.25px] z-10" />

        {/* Hero Content - Top Section */}
        <div className="relative z-20 max-w-6xl mx-auto px-6 text-center flex-shrink-0 hero-content" ref={heroContentRef}>
          {/* Main Heading */}
          <div className="space-y-0">
            <div className="flex flex-col items-center">
              {/* Line 1 */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-white font-black leading-tight tracking-tight opacity-0 animate-fade-up">
                Your Shipment,
              </h1>

              {/* Line 2 - Mix of white text and blue ALTUS */}
              <div className="flex items-center justify-center gap-1 flex-wrap opacity-0 animate-fade-up" style={{animationDelay: '50ms'}}>
                <span className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-white font-black leading-tight tracking-tight">
                  Tracked High with
                </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#003fcc] to-[#0b499a] font-black text-3xl md:text-4xl lg:text-5xl xl:text-6xl leading-tight">
                  ALTUS
                </span>
              </div>
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-base md:text-lg xl:text-xl text-white/80 font-semibold leading-relaxed max-w-3xl mx-auto opacity-0 animate-fade-up mt-4 md:mt-6" style={{animationDelay: '50ms'}}>
            Real-time airway bill tracking for seamless cargo operations
          </p>
        </div>

        {/* Spacer for background visibility */}
        <div className="flex-grow relative z-20" />

        {/* CTA Buttons - Bottom Section */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center pb-12 opacity-0 animate-fade-up relative z-20" style={{animationDelay: '200ms'}}>
          <Link
            href="/company-profile/about"
            className="px-8 md:px-10 py-3 md:py-4 bg-gradient-to-r from-[#003fcc] to-[#0b499a] rounded-[15px] shadow-[0_0_20px_rgba(0,63,204,0.4)] font-bold text-white text-base md:text-lg tracking-wide uppercase btn-enhanced-hover hover:shadow-[0_0_50px_rgba(0,63,204,0.8)] inline-block text-center"
          >
            Explore More
          </Link>

          <Link
            href="/company-profile/contact"
            className="px-8 md:px-10 py-3 md:py-4 border-2 border-white/30 rounded-[15px] font-bold text-white text-base md:text-lg tracking-wide uppercase transition-all duration-300 btn-enhanced-hover hover:border-[#003fcc] hover:bg-[#003fcc]/10 hover:text-white hover:shadow-[0_0_30px_rgba(0,63,204,0.5)] inline-block text-center"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </main>
  );
}
