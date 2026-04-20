'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Map,
  Plane,
  Package,
  Users,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: ('guest' | 'user' | 'operator')[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard size={20} />,
    roles: ['guest', 'user', 'operator'],
  },
  {
    label: 'Track AWB',
    href: '/dashboard/tracking',
    icon: <Map size={20} />,
    roles: ['guest', 'user', 'operator'],
  },
  {
    label: 'Flight Status',
    href: '/dashboard/flight-status',
    icon: <Plane size={20} />,
    roles: ['guest', 'user', 'operator'],
  },
  {
    label: 'Manifest',
    href: '/dashboard/manifest',
    icon: <Package size={20} />,
    roles: ['guest', 'user', 'operator'],
  },
  {
    label: 'Shipments',
    href: '/dashboard/shipments',
    icon: <Package size={20} />,
    roles: ['operator'],
  },
  {
    label: 'Users',
    href: '/dashboard/users',
    icon: <Users size={20} />,
    roles: ['operator'],
  },
  {
    label: 'Settings',
    href: '/dashboard/settings',
    icon: <Settings size={20} />,
    roles: ['guest', 'user', 'operator'],
  },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user || !pathname.startsWith('/dashboard')) {
    return null;
  }

  const visibleItems = navItems.filter((item) => item.roles.includes(user.role));

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-[#0d1c32] to-[#1a2847] border-r border-blue-500/20 transition-all duration-300 z-40 ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-blue-500/20 h-20">
        {isOpen && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-blue-500 flex items-center justify-center font-bold text-white">
              ✈
            </div>
            <span className="text-white font-bold text-lg">ALTUS</span>
          </div>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 hover:bg-blue-500/10 rounded transition-colors"
        >
          {isOpen ? <X size={20} className="text-white" /> : <Menu size={20} className="text-white" />}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="p-3 space-y-2 mt-4">
        {visibleItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive(item.href)
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                : 'text-gray-300 hover:bg-blue-500/10 hover:text-white'
            }`}
            title={!isOpen ? item.label : undefined}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {isOpen && <span className="font-medium text-sm">{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* User Info */}
      {isOpen && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-500/20 bg-gradient-to-t from-[#0d1c32] to-transparent">
          <div className="text-xs text-gray-400 mb-2">Logged in as</div>
          <div className="text-white font-semibold text-sm truncate">{user.name}</div>
          <div className="text-xs text-blue-400 capitalize">{user.role}</div>
        </div>
      )}
    </aside>
  );
}
