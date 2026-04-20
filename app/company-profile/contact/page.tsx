'use client';

import { inter } from '@/app/ui/fonts';
import Header from '@/components/Header';
import { Contact } from '@/components/Contact';

export default function ContactPage() {
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
