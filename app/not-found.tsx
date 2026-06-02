'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect } from 'react';
import { inter } from '@/app/ui/fonts';
import { PackageX, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  return (
    <main className={`${inter.className} bg-[#0d1c32] min-h-screen overflow-x-hidden`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      {/* Blur Effects */}
      <div className="absolute top-[-131px] left-[-1005px] w-[1218px] h-[947px] bg-[#0d1d32] rotate-[0.84deg] blur-[199.25px] z-10" />
      <div className="absolute top-[-898px] left-[908px] w-[1259px] h-[1080px] bg-[#0d1d32] blur-[199.25px] z-10" />

      <section className="relative z-20 flex flex-col items-center justify-center min-h-screen px-6 py-20">
        <div className="max-w-2xl w-full text-center space-y-8">
          {/* ALTUS Logo */}
          <div className="flex justify-center mb-6 opacity-0 animate-fade-up">
            <div className="relative w-24 h-24">
              <Image
                src="/images/LOGO ALTUS FULL.png"
                alt="ALTUS Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* 404 Icon */}
          <div className="flex justify-center opacity-0 animate-fade-up" style={{animationDelay: '50ms'}}>
            <div className="relative">
              <PackageX className="w-32 h-32 text-white/20" strokeWidth={1.5} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-6xl font-black text-white/30">404</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          <div className="space-y-4 opacity-0 animate-fade-up" style={{animationDelay: '100ms'}}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
              Halaman Tidak Ditemukan
            </h1>
            <p className="text-lg md:text-xl text-white/70 font-medium max-w-xl mx-auto leading-relaxed">
              Maaf, halaman yang Anda cari tidak ada di sistem ALTUS Air Cargo Management.
            </p>
          </div>

          {/* Error Code Box */}
          <div className="bg-white/5 border-2 border-white/20 rounded-[12px] p-6 backdrop-blur-sm opacity-0 animate-fade-up" style={{animationDelay: '150ms'}}>
            <div className="space-y-2">
              <p className="text-white/60 font-semibold text-sm uppercase tracking-wide">Error Code</p>
              <p className="text-2xl font-mono font-bold text-[#003fcc]">ALTUS-404-NOT-FOUND</p>
              <p className="text-white/50 text-sm mt-3">
                Kemungkinan penyebab:
              </p>
              <ul className="text-white/60 text-sm text-left max-w-md mx-auto space-y-1">
                <li>• URL yang Anda masukkan salah atau tidak valid</li>
                <li>• Halaman telah dipindahkan atau dihapus</li>
                <li>• Link yang Anda klik sudah kadaluarsa</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 opacity-0 animate-fade-up" style={{animationDelay: '200ms'}}>
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 rounded-[12px] font-bold text-white text-base hover:bg-white/20 hover:border-white/40 transition-all duration-300 min-w-[200px] justify-center"
            >
              <ArrowLeft size={20} />
              Kembali
            </button>
            <Link
              href="/"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#003fcc] to-[#0b499a] rounded-[12px] shadow-[0_0_20px_rgba(0,63,204,0.4)] font-bold text-white text-base hover:shadow-[0_0_50px_rgba(0,63,204,0.8)] transition-all duration-300 min-w-[200px] justify-center"
            >
              <Home size={20} />
              Halaman Utama
            </Link>
          </div>

          {/* Help Text */}
          <p className="text-white/50 text-sm opacity-0 animate-fade-up" style={{animationDelay: '250ms'}}>
            Butuh bantuan? Hubungi tim support ALTUS atau kembali ke{' '}
            <Link href="/dashboard" className="text-[#003fcc] hover:text-[#0b499a] font-semibold transition-colors">
              Dashboard
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
