'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Map, Plane, Settings, Truck, Users } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface DashboardContainerProps {
  children: React.ReactNode;
}

const guestNavItems = [
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={20} strokeWidth={2.5} /> },
  { label: 'Track AWB', href: '/dashboard/tracking', icon: <Map size={20} strokeWidth={2.5} /> },
  { label: 'Flight Status', href: '/dashboard/flight-status', icon: <Plane size={20} strokeWidth={2.5} /> },
];

const operatorNavItems = [
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={20} strokeWidth={2.5} /> },
  { label: 'Track AWB', href: '/dashboard/tracking', icon: <Map size={20} strokeWidth={2.5} /> },
  { label: 'Flight Status', href: '/dashboard/flight-status', icon: <Plane size={20} strokeWidth={2.5} /> },
  { label: 'Shipments', href: '/dashboard/shipments', icon: <Truck size={20} strokeWidth={2.5} /> },
  { label: 'Users', href: '/dashboard/users', icon: <Users size={20} strokeWidth={2.5} /> },
];

export default function DashboardContainer({ children }: DashboardContainerProps) {
  const pathname = usePathname();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const { user } = useAuth();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

  const navItems = user?.role === 'operator' ? operatorNavItems : guestNavItems;

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-[#0d1c32] via-[#1a2f4a] to-[#0d1c32] flex items-center justify-center px-4 py-2">
      {/* Modern Container */}
      <div className="w-full bg-[#ffe9d4] rounded-[24px] border-[2px] border-black/30 overflow-hidden flex h-[92vh] shadow-2xl shadow-black/30 hover:shadow-2xl hover:shadow-cyan-500/10">
        {/* LEFT SIDEBAR */}
        <div className={`${sidebarExpanded ? 'w-48' : 'w-20'} bg-gradient-to-b from-[#ffe9d4] to-[#ffd9b8] border-r-[2px] border-black/20 flex flex-col items-center py-6 transition-all duration-300 ease-out`}>
          {/* Logo/ALTUS */}
          <Link href="/dashboard" className="group flex flex-col items-center relative top-[-48px] transition-transform duration-300 hover:scale-110">
            <div className="w-30 h-30 relative drop-shadow-lg group-hover:drop-shadow-2xl transition-all duration-300">
              <Image
                src="/images/icon_altus.png"
                alt="ALTUS"
                fill
                priority
                style={{ objectFit: 'contain' }}
              />
            </div>
            <p className="text-blue-600 font-black text-sm -mt-13 tracking-wider transition-colors duration-300 group-hover:text-blue-700" style={{ color: '#002156'}}>ALTUS</p>
          </Link>

          {/* Spacer - Push nav to middle */}
          <div className="flex-1" />

          {/* Navigation Items */}
          <nav className="w-full flex flex-col gap-2.5 px-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center justify-center ${sidebarExpanded ? 'justify-start' : ''} gap-3 px-4 py-3.5 rounded-[12px] overflow-hidden transition-all duration-300 group font-medium ${
                  isActive(item.href)
                    ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-cyan-500/30 border-[2px] border-white/20"
                    : "text-slate-700 hover:text-slate-900 border-[2px] border-transparent hover:bg-gradient-to-r hover:from-cyan-400/10 hover:to-emerald-400/10 hover:border-cyan-400/30 hover:shadow-md hover:shadow-cyan-400/20"
                }`}
              >
                <div className={`transition-all duration-300 ${isActive(item.href) ? 'scale-120' : 'group-hover:scale-120'}`}>
                  {item.icon}
                </div>
                {sidebarExpanded && <span className="text-sm font-bold whitespace-nowrap tracking-wide">{item.label}</span>}
                {isActive(item.href) && <div className="absolute inset-0 bg-white/10 rounded-[12px]" />}
              </Link>
            ))}
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Settings & Expand Toggle */}
          <div className="w-full flex flex-col gap-2.5 px-2 mb-3">
            <button
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
              className="flex items-center justify-center w-full p-3 text-slate-700 hover:text-slate-900 bg-transparent hover:bg-gradient-to-r hover:from-cyan-400/10 hover:to-emerald-400/10 border-[2px] border-transparent hover:border-cyan-400/30 rounded-[12px] transition-all duration-300 hover:shadow-md hover:shadow-cyan-400/20 active:scale-95 font-bold text-lg"
              title={sidebarExpanded ? 'Collapse' : 'Expand'}
            >
              {sidebarExpanded ? '«' : '»'}
            </button>
            <Link href="/dashboard/settings" className="flex items-center justify-center w-full p-3 text-slate-700 hover:text-slate-900 bg-transparent hover:bg-gradient-to-r hover:from-cyan-400/10 hover:to-emerald-400/10 border-[2px] border-transparent hover:border-cyan-400/30 rounded-[12px] transition-all duration-300 hover:shadow-md hover:shadow-cyan-400/20 active:scale-95 group">
              <Settings size={20} className="transition-transform duration-300 group-hover:rotate-90" />
            </Link>
          </div>

          {/* Profile Section */}
          <div className="w-full border-t-[2px] border-black/20 bg-gradient-to-b from-white/40 via-white/20 to-transparent transition-all duration-300 pt-5">
            <label className={`flex cursor-pointer group gap-3 items-center transition-all duration-300 ${sidebarExpanded ? 'flex-row px-3 py-1' : 'flex-col justify-center px-2 py-1'}`}>
              <div className="w-10 h-10 flex-shrink-0 bg-gradient-to-br from-emerald-500 via-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-black shadow-md shadow-cyan-500/30 text-sm transition-all duration-300 hover:scale-110 border-[2px] border-white/40 hover:border-white/60 group-hover:shadow-lg group-hover:shadow-cyan-500/50 overflow-hidden relative">
                {user?.profileImage && (
                  <Image
                    src={user.profileImage}
                    alt="Profile"
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                )}
                <span className="relative z-5 drop-shadow-sm">{user?.role === 'guest' ? 'G' : user?.name?.charAt(0) || 'U'}</span>
              </div>
              {sidebarExpanded && (
                <div className="text-left min-w-0">
                  <p className="text-slate-900 font-bold text-xs leading-tight truncate">{user?.role === 'guest' ? 'GUEST' : user?.name}</p>
                  <p className="text-slate-500 text-[10px] font-medium capitalize">{user?.role}</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                title="Upload profile photo"
              />
            </label>
          </div>
        </div>

        {/* RIGHT CONTENT AREA */}
        <div className="flex-1 bg-[#ffe9d4] overflow-y-auto overflow-x-hidden" style={{ contain: 'layout style paint' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
