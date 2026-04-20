'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import ScrollFloat from './ScrollFloat';

const latestUpdates = [
  {
    id: 1,
    title: 'Altus Reaches 1 Million Users in Just 3 Months in Indonesia',
    imageUrl: '/images/altus_1mil.png',
  },
  {
    id: 2,
    title: 'New Feature Launched! Altus is in Collaboration with No Na Christy',
    imageUrl: '/images/no_na.png',
  },
  {
    id: 3,
    title: 'Achieve Strong Growth, Altus Build a Solid Foundation for 2026',
    imageUrl: '/images/tower_altus.png',
  },
];

export const About = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

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
      className="min-h-auto w-full bg-[#0d1c32] relative overflow-hidden px-4 py-8 md:px-10 md:py-10"
    >
      <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-[#003fcc]/12 blur-3xl" />
      <div className="absolute right-0 bottom-16 h-72 w-72 rounded-full bg-[#0b499a]/12 blur-3xl" />

      <div className="relative max-w-7xl mx-auto z-10">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] items-center">
          <div className="space-y-4" data-animate>
            <ScrollFloat
              containerClassName="max-w-3xl text-lg md:text-xl lg:text-2xl"
              textClassName="text-white font-black"
              scrollStart="top 95%"
              scrollEnd="center 60%"
              stagger={0.03}
            >
              About Altus
            </ScrollFloat>
            <p className="text-white/80 text-xs md:text-sm leading-relaxed max-w-2xl font-semibold">
              Altus is an air cargo tracking system designed to support fast-paced airport operations. The platform enables operators to monitor shipment status, manage airway bill data, and track flight conditions in real-time through a clear and reliable interface.
            </p>
          </div>

          <div className="relative rounded-[24px] h-48 overflow-hidden border border-[#003fcc]/30 bg-[#0b1730]/60 shadow-[0_30px_90px_rgba(0,0,0,0.24)] about-image-hover" data-animate>
            <div className="absolute inset-0 bg-gradient-to-br from-[#003fcc]/20 via-transparent to-[#0b1830]/80" />
            <Image src="/images/about_altus.png" alt="About Altus" fill className="object-cover" />
            <div className="absolute inset-0 bg-black/20" />
          </div>
        </div>

        <div className="mt-6" data-animate>
          <ScrollFloat
            containerClassName="max-w-3xl text-xl md:text-2xl lg:text-3xl mb-4"
            textClassName="text-white font-black tracking-tight"
            scrollStart="top 95%"
            scrollEnd="center 60%"
            stagger={0.03}
          >
            Latest Updates
          </ScrollFloat>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
            {latestUpdates.map((update, index) => (
              <div
                key={update.id}
                className="group relative overflow-hidden rounded-[20px] border border-[#003fcc]/30 bg-[#0b1730]/80 p-3 md:p-4 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative h-32 overflow-hidden rounded-[16px] bg-[#0d1c32]">
                  <Image src={update.imageUrl} alt={update.title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d1c32]/90 via-transparent to-transparent" />
                </div>

                <div className="mt-2">
                  <h3 className="font-bold text-white text-xs md:text-sm leading-tight">
                    {update.title}
                  </h3>
                  <div className="mt-3 h-1 w-20 rounded-full bg-gradient-to-r from-[#003fcc] to-[#0b499a]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
