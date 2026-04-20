'use client';

import { useEffect, useRef, useState } from 'react';
import type React from 'react';
import type { IconType } from 'react-icons';
import { FaInstagram, FaFacebookF, FaTwitter, FaYoutube, FaLinkedinIn, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import { motion, useMotionValue, useSpring } from 'motion/react';
import ScrollFloat from './ScrollFloat';

const socialLinks: Array<{ id: number; name: string; icon: IconType; href: string }> = [
  { id: 1, name: 'Instagram', icon: FaInstagram, href: '#' },
  { id: 2, name: 'Facebook', icon: FaFacebookF, href: '#' },
  { id: 3, name: 'X', icon: FaTwitter, href: '#' },
  { id: 4, name: 'YouTube', icon: FaYoutube, href: '#' },
  { id: 5, name: 'LinkedIn', icon: FaLinkedinIn, href: '#' },
];

export const Contact = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const rotateXMV = useMotionValue(0);
  const rotateYMV = useMotionValue(0);
  const scaleMV = useMotionValue(1);

  const rotateX = useSpring(rotateXMV, {
    damping: 40,
    stiffness: 120,
    mass: 1.2,
  });
  const rotateY = useSpring(rotateYMV, {
    damping: 40,
    stiffness: 120,
    mass: 1.2,
  });
  const scale = useSpring(scaleMV, {
    damping: 40,
    stiffness: 120,
    mass: 1.2,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const offsetX = e.clientX - (rect.left + rect.width / 2);
    const offsetY = e.clientY - (rect.top + rect.height / 2);

    const maxRotate = 12;
    const rotationX = (offsetY / (rect.height / 2)) * maxRotate * -1;
    const rotationY = (offsetX / (rect.width / 2)) * maxRotate;

    rotateXMV.set(rotationX);
    rotateYMV.set(rotationY);
    scaleMV.set(1.04);
  };

  const handleMouseLeave = () => {
    rotateXMV.set(0);
    rotateYMV.set(0);
    scaleMV.set(1);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('[data-animate]').forEach((el, index) => {
              setTimeout(() => {
                el.classList.add('animate-fade-up');
              }, index * 30);
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="min-h-screen w-full bg-[#0d1c32] relative overflow-hidden px-4 py-8 md:px-10 md:py-10 flex flex-col items-center justify-center"
    >
      <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-[#0b1830]/90 to-transparent" />
      <div className="absolute -right-24 top-40 w-[420px] h-[420px] rounded-full bg-[#003fcc]/12 blur-3xl" />
      <div className="absolute left-0 top-1/2 w-[360px] h-[360px] rounded-full bg-[#0b499a]/12 blur-3xl" />

      <div className="relative max-w-7xl mx-auto z-10 mt-12 md:mt-16 lg:mt-20" style={{ perspective: '1200px' }}>
        <motion.div
          ref={cardRef as any}
          className="group relative overflow-hidden rounded-[32px] border border-[#003fcc]/40 bg-[#ede4d7] shadow-[0_20px_60px_rgba(0,0,0,0.35)] hover-border-glow"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            rotateX,
            rotateY,
            scale,
            transformStyle: 'preserve-3d',
            transformOrigin: 'center',
            willChange: 'transform',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-black/20 rounded-[32px] pointer-events-none" />
          <div className="absolute inset-0 bg-white/30 opacity-10 blur-2xl rounded-[32px]" />
          <div className="absolute top-4 left-4 h-32 w-32 rounded-full bg-[#003fcc]/15 blur-3xl" />
          <div className="absolute bottom-6 right-6 h-40 w-40 rounded-full bg-[#0b499a]/15 blur-3xl" />

          <div className="relative grid gap-5 lg:grid-cols-[1.3fr_1fr] p-4 md:p-5 xl:p-6">
            <div className="space-y-6" data-animate>
              <ScrollFloat
                containerClassName="max-w-3xl text-sm md:text-base lg:text-lg"
                textClassName="text-[#1f3d6d] font-black"
                scrollStart="top 95%"
                scrollEnd="center 60%"
                stagger={0.03}
              >
                Stay Connected with Altus
              </ScrollFloat>

              <p className="text-[#2b4a7b] text-xs md:text-sm leading-relaxed max-w-2xl">
                We&apos;re always ready to connect with partners, operators, and users who rely on fast, accurate, and reliable air cargo tracking solutions.
              </p>

              <div className="flex flex-wrap items-center gap-2">
                {socialLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.id}
                      href={item.href}
                      aria-label={item.name}
                      className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#003fcc]/10 text-[#003fcc] text-sm transition hover:bg-[#003fcc]/20"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>

              <div className="rounded-[24px] border border-[#d9d0bf] bg-[#f6efe5] p-4 md:p-5 shadow-sm">
                <p className="font-semibold text-[#1f3d6d] uppercase tracking-[0.24em] text-xs mb-3">Our Contact</p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#003fcc]/15 text-[#003fcc] text-base flex-shrink-0">
                      <FaPhoneAlt />
                    </div>
                    <div>
                      <p className="font-black text-[#1f3d6d] text-sm">021-2622-4321</p>
                      <p className="text-xs text-[#5a6b8a]">Call our operations team</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#003fcc]/15 text-[#003fcc] text-base flex-shrink-0">
                      <FaEnvelope />
                    </div>
                    <div>
                      <p className="font-black text-[#1f3d6d] text-sm">contact@altus.com</p>
                      <p className="text-xs text-[#5a6b8a]">Email our support desk</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-[#d9d0bf] bg-[#f6efe5] p-5 md:p-6 shadow-sm" data-animate>
              <p className="font-semibold text-[#1f3d6d] uppercase tracking-[0.24em] text-xs mb-3">Postal Address</p>
              <p className="text-[#26416f] text-xs md:text-sm leading-relaxed">
                PT Altus Air Logistics<br />
                Altus Operations Center<br />
                Soewarna Business Park, Soekarno-Hatta Airport<br />
                Tangerang, Banten 15126<br />
                Indonesia
              </p>

              <div className="mt-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#003fcc]/15 text-[#003fcc] text-base flex-shrink-0">
                    <FaClock />
                  </div>
                  <div>
                    <p className="font-black text-[#1f3d6d] text-sm">Operational Hours</p>
                    <p className="text-xs text-[#5a6b8a]">
                      Monday – Friday: 08.00 – 17.00<br />
                      Saturday & Sunday: 08.00 – 12.00
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#003fcc]/15 text-[#003fcc] text-base flex-shrink-0">
                    <FaMapMarkerAlt />
                  </div>
                  <div>
                    <p className="font-black text-[#1f3d6d] text-sm">Support Information</p>
                    <p className="text-xs text-[#5a6b8a]">
                      For assistance and operational inquiries, our team is available to help through email and phone support.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ===== FOOTER ===== */}
      <footer className="relative bottom-0 left-0 right-0 bg-[#0d1c32]/95 z-20 px-6 py-3 text-center mt-6">
        <p className="font-semibold text-white/40 text-xs md:text-xs tracking-wide">
          © 2026 PT ALTUS AIR LOGISTICS. All Rights Reserved.
        </p>
      </footer>
    </section>
  );
};
