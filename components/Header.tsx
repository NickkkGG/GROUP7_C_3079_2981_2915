'use client';

import Image from 'next/image';
import Link from 'next/link';
import { lusitana } from '@/app/ui/fonts';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0d1c32]/20 backdrop-blur-md border-b border-white/10 overflow-hidden">
      <div className="flex items-center justify-between px-6 md:px-10 lg:px-16 py-4 w-full">
        {/* Logo Left */}
        <Link href="/company-profile/home" className="flex items-center gap-2 group cursor-pointer hover:scale-105 transition-transform duration-300 opacity-0 animate-fade-down">
          <div className="w-[90px] h-10 bg-[#d9d9d9] rounded-[22px] flex items-center justify-center px-2.5">
            <div className={`${lusitana.className} font-black text-[#1b3956] text-[11px] md:text-base`}>
              ALTUS
            </div>
          </div>
        </Link>

        {/* Navigation Center */}
        <nav className="hidden lg:flex items-center gap-16">
          <Link
            href="/company-profile/home"
            className={`font-bold text-sm tracking-wide transition-all duration-300 relative group opacity-0 animate-fade-down ${
              isActive('/company-profile/home') ? 'text-white' : 'text-white/50 hover:text-white'
            }`}
          >
            HOME
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#003fcc] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          </Link>

          <Link
            href="/company-profile/about"
            className={`font-bold text-sm tracking-wide transition-all duration-300 relative group opacity-0 animate-fade-down ${
              isActive('/company-profile/about') ? 'text-white' : 'text-white/50 hover:text-white'
            }`}
            style={{animationDelay: '100ms'}}
          >
            ABOUT
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#003fcc] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          </Link>

          <Link
            href="/company-profile/contact"
            className={`font-bold text-sm tracking-wide transition-all duration-300 relative group opacity-0 animate-fade-down ${
              isActive('/company-profile/contact') ? 'text-white' : 'text-white/50 hover:text-white'
            }`}
            style={{animationDelay: '200ms'}}
          >
            CONTACT
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#003fcc] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          </Link>

          <Link
            href="/login"
            className="px-5 py-2 bg-gradient-to-r from-[#003fcc] to-[#0b499a] rounded-[15px] shadow-[0_0_20px_rgba(0,63,204,0.4)] font-bold text-white text-sm tracking-wide uppercase opacity-0 animate-fade-down btn-neon-glow"
            style={{animationDelay: '300ms'}}
          >
            Get Started
          </Link>
        </nav>

        {/* Logo Right */}
        <div className="flex items-center justify-end opacity-0 animate-fade-down" style={{animationDelay: '400ms'}}>
          <div className="w-10 h-10 bg-[#d9d9d9] rounded-full flex items-center justify-center overflow-hidden">
            <Image
              src="/images/icon_altus.png"
              width={45}
              height={45}
              alt="Logo Icon"
              className="hidden sm:block"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
