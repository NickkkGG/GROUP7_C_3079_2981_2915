'use client';

import Link from 'next/link';
import { ShieldX, Home, Lock } from 'lucide-react';

export default function RestrictedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a1628] via-[#0f2747] to-[#1e3a5f] px-4">
      <div className="max-w-md w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center shadow-2xl">
        <div className="mx-auto w-20 h-20 flex items-center justify-center rounded-full bg-red-500/15 border border-red-500/30 mb-6">
          <ShieldX size={42} className="text-red-400" />
        </div>

        <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-blue-300 bg-blue-500/10 border border-blue-400/20 rounded-full px-3 py-1 mb-4">
          <Lock size={12} />
          Access Restricted
        </div>

        <h1 className="text-2xl font-black text-white mb-3">Halaman Dibatasi</h1>
        <p className="text-sm text-slate-300 leading-relaxed mb-2">
          Endpoint ini tidak tersedia. Operasi seeding dan inisialisasi database telah dinonaktifkan secara permanen.
        </p>
        <p className="text-xs text-slate-400 leading-relaxed mb-8">
          Perubahan data atau struktur tabel hanya dapat dilakukan secara manual langsung melalui database.
        </p>

        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 w-full bg-[#1e3a5f] hover:bg-[#2c5282] text-white font-bold text-sm rounded-xl px-5 py-3 transition-colors"
        >
          <Home size={16} />
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}
