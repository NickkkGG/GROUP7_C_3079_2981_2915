'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, X } from 'lucide-react';

interface Notification {
  id: number;
  tracking_number: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationBell() {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number }>({ left: 0, top: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dragOffset = useRef<{ x: number; y: number } | null>(null);

  // Buka dropdown: posisikan di kanan tombol bell, menjorok ke atas (bell ada di bawah sidebar)
  const openDropdown = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const left = rect.right + 12;
      const top = Math.max(8, rect.bottom - 480);
      setPos({ left, top });
    }
    setIsOpen((prev) => !prev);
  };

  // Drag handlers — header jadi "title bar" window float
  const startDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    dragOffset.current = { x: e.clientX - pos.left, y: e.clientY - pos.top };
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragOffset.current) return;
      const width = 360;
      const maxLeft = window.innerWidth - width - 8;
      const maxTop = window.innerHeight - 80;
      const nextLeft = Math.min(Math.max(8, e.clientX - dragOffset.current.x), maxLeft);
      const nextTop = Math.min(Math.max(8, e.clientY - dragOffset.current.y), maxTop);
      setPos({ left: nextLeft, top: nextTop });
    };
    const onUp = () => { dragOffset.current = null; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [pos.left, pos.top]);

  // Fetch notifications
  useEffect(() => {
    if (!user || user.role === 'guest' || user.role === 'operator' || !user.email) return;

    const fetchNotifications = async () => {
      try {
        const res = await fetch(`/api/notifications?email=${encodeURIComponent(user.email)}`);
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user || user.role === 'guest' || user.role === 'operator' || !user.email) return null;

  const handleNotificationClick = async (notif: Notification) => {
    // Mark as read
    if (!notif.is_read) {
      try {
        await fetch('/api/notifications', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: notif.id, email: user.email })
        });
        setUnreadCount(prev => Math.max(0, prev - 1));
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }

    // Navigate to tracking page
    setIsOpen(false);
    router.push(`/dashboard/tracking?search=${encodeURIComponent(notif.tracking_number)}`);
  };

  const handleClearAll = async () => {
    if (!user.email) return;
    try {
      await fetch(`/api/notifications?email=${encodeURIComponent(user.email)}`, { method: 'DELETE' });
      setNotifications([]);
      setUnreadCount(0);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };

  const handleMarkAllRead = async () => {
    if (!user.email || unreadCount === 0) return;
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, markAll: true }),
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        ref={buttonRef}
        onClick={openDropdown}
        className="relative flex items-center justify-center w-full p-3 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-transparent hover:bg-gradient-to-r hover:from-cyan-400/10 hover:to-emerald-400/10 border-[2px] border-transparent hover:border-cyan-400/30 rounded-[12px] transition-all duration-300 hover:shadow-md hover:shadow-cyan-400/20 active:scale-95 group"
        title="Notifications"
      >
        <Bell size={20} className="transition-transform duration-300 group-hover:rotate-12" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white dark:border-slate-950">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown — fixed di kanan tombol bell, lepas dari clipping sidebar */}
      {isOpen && (
        <div
          style={{ left: pos.left, top: pos.top }}
          className="fixed w-[360px] max-h-[500px] bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col z-[9999]"
        >
          {/* Header — drag handle (window float style) */}
          <div
            onMouseDown={startDrag}
            className="flex items-center justify-between px-4 py-3 border-b-2 border-slate-200 dark:border-slate-700 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-slate-700 dark:to-slate-700 cursor-move select-none"
          >
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-blue-600 dark:text-blue-400" />
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-[10px] font-bold rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={18} />
            </button>
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bell size={40} className="text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">No notifications yet</p>
                <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">
                  You'll be notified when shipments you tracked change status
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {notifications.map((notif) => (
                  <button
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors ${
                      !notif.is_read ? 'bg-blue-50/50 dark:bg-slate-700/50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {!notif.is_read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1">
                          {notif.tracking_number}
                        </p>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed mb-1">
                          {notif.message}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">
                          {formatTime(notif.created_at)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer actions */}
          {notifications.length > 0 && (
            <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-t-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
              <button
                onClick={handleMarkAllRead}
                disabled={unreadCount === 0}
                className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 disabled:text-slate-300 dark:disabled:text-slate-600 disabled:cursor-not-allowed transition"
              >
                Mark all as read
              </button>
              <button
                onClick={handleClearAll}
                className="text-[11px] font-bold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
