'use client';

import { useEffect } from 'react';
import { inter } from '@/app/ui/fonts';
import Header from '@/components/Header';
import { About } from '@/components/About';

export default function AboutPage() {
  useEffect(() => {
    document.title = 'About Us - ALTUS';
  }, []);

  return (
    <main className={`${inter.className} bg-[#0d1c32] overflow-x-hidden`}>
      <Header />

      {/* ===== ABOUT SECTION ===== */}
      <div className="w-full pt-32 md:pt-40">
        <About />
      </div>
    </main>
  );
}
