'use client';

import { useEffect } from 'react';
import { inter } from '@/app/ui/fonts';
import Header from '@/components/Header';
import { Contact } from '@/components/Contact';

export default function ContactPage() {
  useEffect(() => {
    document.title = 'Contact Us - ALTUS';
  }, []);

  return (
    <main className={`${inter.className} bg-[#0d1c32] overflow-x-hidden`}>
      <Header />

      {/* ===== CONTACT SECTION ===== */}
      <div className="w-full flex items-center justify-center pt-32 md:pt-0">
        <Contact />
      </div>
    </main>
  );
}
