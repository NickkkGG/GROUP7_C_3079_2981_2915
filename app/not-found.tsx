'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect } from 'react';
import { inter } from '@/app/ui/fonts';
import Header from '@/components/Header';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  useEffect(() => {
    document.title = '404 - Halaman Tidak Ditemukan | ALTUS';
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  return (
    <main className={`${inter.className} relative bg-[#0d1c32] min-h-dvh flex flex-col overflow-x-hidden overflow-y-auto`}>
      <Header />

      {/* Background Image — sama dengan halaman Home */}
      <div className="absolute inset-0 z-0 overflow-hidden opacity-25 pointer-events-none">
        <Image
          src="/images/plane_bg.jpg"
          fill
          alt=""
          className="object-cover object-center"
          sizes="100vw"
          priority
        />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      {/* Blur Effects — sama dengan halaman Home */}
      <div className="absolute top-[-131px] left-[-1005px] w-[1218px] h-[947px] bg-[#0d1d32] rotate-[0.84deg] blur-[199.25px] z-10 pointer-events-none" />
      <div className="absolute top-[-898px] left-[908px] w-[1259px] h-[1080px] bg-[#0d1d32] blur-[199.25px] z-10 pointer-events-none" />

      {/* pt-24+: jarak aman dari header fixed; scale: muat window tidak fullscreen */}
      <section className="relative z-20 flex flex-1 flex-col items-center justify-center px-6 pt-24 pb-10 min-h-dvh box-border">
        <div className="max-w-2xl w-full text-center space-y-4 origin-center scale-[0.82] sm:scale-[0.88] md:scale-95 lg:scale-100 mt-4 sm:mt-6">
          {/* 404 — angka saja, tanpa icon package */}
          <div
            className="flex justify-center opacity-0 animate-fade-up"
            style={{ animationDelay: '50ms' }}
          >
            <div className="flex h-20 w-20 sm:h-[5.5rem] sm:w-[5.5rem] md:h-24 md:w-24 items-center justify-center rounded-full border-2 border-[#003fcc]/40 bg-[#003fcc]/10 shadow-[0_0_40px_rgba(0,63,204,0.25)]">
              <span className="text-4xl sm:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">
                404
              </span>
            </div>
          </div>

          {/* Error Message */}
          <div className="space-y-2 opacity-0 animate-fade-up" style={{ animationDelay: '100ms' }}>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight tracking-tight">
              Halaman Tidak Ditemukan
            </h1>
            <p className="text-sm sm:text-base text-white/70 font-medium max-w-lg mx-auto leading-relaxed">
              Halaman yang Anda cari tidak ada di sistem ALTUS. Periksa kembali URL — mungkin ada typo atau link sudah tidak aktif.
            </p>
          </div>

          {/* Error Code Box */}
          <div
            className="bg-white/5 border border-white/20 rounded-[12px] p-3 sm:p-4 backdrop-blur-sm opacity-0 animate-fade-up text-left max-w-md mx-auto"
            style={{ animationDelay: '150ms' }}
          >
            <p className="text-white/60 font-semibold text-xs uppercase tracking-wide">Error Code</p>
            <p className="text-lg sm:text-xl font-mono font-bold text-[#003fcc] mt-1">ALTUS-404-NOT-FOUND</p>
            <ul className="text-white/60 text-sm mt-3 space-y-1">
              <li>• URL salah atau tidak valid</li>
              <li>• Halaman dipindahkan atau dihapus</li>
              <li>• Link sudah kadaluarsa</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div
            className="flex flex-col sm:flex-row gap-3 justify-center items-center opacity-0 animate-fade-up"
            style={{ animationDelay: '200ms' }}
          >
            <button
              type="button"
              onClick={() => window.history.back()}
              className="flex items-center gap-2 px-6 py-2.5 bg-white/10 border border-white/20 rounded-[12px] font-bold text-white text-sm hover:bg-white/20 hover:border-white/40 transition-all duration-300 min-w-[180px] justify-center"
            >
              <ArrowLeft size={18} />
              Kembali
            </button>
            <Link
              href="/company-profile/home"
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#003fcc] to-[#0b499a] rounded-[12px] shadow-[0_0_20px_rgba(0,63,204,0.4)] font-bold text-white text-sm hover:shadow-[0_0_50px_rgba(0,63,204,0.8)] transition-all duration-300 min-w-[180px] justify-center"
            >
              <Home size={18} />
              Halaman Utama
            </Link>
          </div>

          {/* Help Text */}
          <p className="text-white/50 text-xs md:text-sm opacity-0 animate-fade-up" style={{ animationDelay: '250ms' }}>
            Butuh bantuan?{' '}
            <Link href="/login" className="text-[#003fcc] hover:text-[#0b499a] font-semibold transition-colors">
              Login
            </Link>
            {' '}·{' '}
            <Link href="/dashboard" className="text-[#003fcc] hover:text-[#0b499a] font-semibold transition-colors">
              Dashboard
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}