'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import TopNavbar from '@/components/TopNavbar';
import Image from 'next/image';
import {
  User,
  Bell,
  Monitor,
  Shield,
  LogOut,
  Mail,
  BadgeCheck,
  Phone,
  Camera,
  Trash2,
} from 'lucide-react';

type Tab = 'account' | 'notifications' | 'display' | 'security';

interface ToggleItem {
  label: string;
  key: string;
  defaultOn: boolean;
}

const notificationItems: ToggleItem[] = [
  { label: 'Email me when a shipment status is updated', key: 'shipment', defaultOn: true },
  { label: 'Notify me about flight delays and schedule changes', key: 'flight', defaultOn: true },
  { label: 'Send me a weekly operational summary', key: 'weekly', defaultOn: true },
  { label: 'Show push notifications when I am logged in', key: 'push', defaultOn: false },
  { label: 'Notify me when a guest session ends', key: 'guest_session', defaultOn: true },
  { label: 'Enable sound and badge indicators for new notifications', key: 'sound', defaultOn: true },
  { label: 'Notify me when a new user account is created', key: 'new_user', defaultOn: false },
];

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('account');
  const [toggles, setToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(notificationItems.map((i) => [i.key, i.defaultOn]))
  );
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });

  if (!user) return null;

  const isGuest = user.role === 'guest';

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const menuItems = isGuest
    ? [{ id: 'account' as Tab, label: 'Account', icon: User }]
    : [
        { id: 'account' as Tab, label: 'Account', icon: User },
        { id: 'notifications' as Tab, label: 'Notifications', icon: Bell },
        { id: 'display' as Tab, label: 'Display', icon: Monitor },
        { id: 'security' as Tab, label: 'Security', icon: Shield },
      ];

  return (
    <div className="h-full flex flex-col bg-[#ffe9d4]">
      <TopNavbar
        title="Settings"
        subtitle="Configure personal preferences and system options"
      />

      <div className="p-4 flex flex-col overflow-hidden flex-1">
        <div
          className="flex-1 rounded-[20px] overflow-hidden flex"
          style={{
            background: '#f0ebe3',
            border: '1.5px solid rgba(0,0,0,0.12)',
          }}
        >
          {/* Sidebar */}
          <div className="w-56 flex-shrink-0 flex flex-col justify-between p-4" style={{ background: '#e8e0d6' }}>
            <div className="space-y-1">
              {menuItems.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === id
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:bg-white/50 hover:text-slate-800'
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </button>
              ))}
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
              style={{ background: '#8b2020' }}
            >
              <LogOut size={15} />
              Log Out
            </button>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-white overflow-y-auto p-8">
            {activeTab === 'account' && (
              <AccountTab user={user} isGuest={isGuest} />
            )}
            {activeTab === 'notifications' && !isGuest && (
              <NotificationsTab toggles={toggles} setToggles={setToggles} />
            )}
            {activeTab === 'display' && !isGuest && (
              <DisplayTab />
            )}
            {activeTab === 'security' && !isGuest && (
              <SecurityTab passwords={passwords} setPasswords={setPasswords} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────── Account Tab ───────────── */
function AccountTab({
  user,
  isGuest,
}: {
  user: { name: string; email: string; role: string; profileImage?: string | null };
  isGuest: boolean;
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Profile Information</h2>

      <div className="flex gap-10">
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-3">
          <div
            className={`w-28 h-28 rounded-full flex items-center justify-center overflow-hidden ${
              isGuest ? 'bg-gray-300' : 'bg-gray-200'
            }`}
          >
            {user.profileImage ? (
              <Image src={user.profileImage} alt="avatar" width={112} height={112} className="w-full h-full object-cover" />
            ) : (
              <User size={48} className={isGuest ? 'text-gray-400' : 'text-gray-500'} />
            )}
          </div>

          <button
            disabled={isGuest}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isGuest
                ? 'bg-gray-300 text-gray-400 cursor-not-allowed'
                : 'bg-slate-800 text-white hover:bg-slate-700'
            }`}
          >
            <Camera size={12} />
            Change Avatar
          </button>

          <button
            disabled={isGuest}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isGuest
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300'
                : 'bg-white text-slate-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            <Trash2 size={12} />
            Remove Avatar
          </button>
        </div>

        {/* Form Fields */}
        <div className="flex-1 grid grid-cols-2 gap-4 content-start">
          {/* Full Name */}
          <div className="col-span-2">
            <label className="block text-xs text-gray-400 mb-1 ml-1">Full Name</label>
            <div className="relative">
              <input
                type="text"
                defaultValue={isGuest ? 'Guest' : user.name}
                disabled={isGuest}
                className={`w-full border rounded-xl px-4 py-3 text-sm text-slate-800 outline-none pr-10 ${
                  isGuest
                    ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white border-gray-300 focus:border-blue-400'
                }`}
              />
              <BadgeCheck
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>

          {/* Email */}
          <div className="col-span-2">
            <label className="block text-xs text-gray-400 mb-1 ml-1">Email</label>
            <div className="relative">
              <input
                type="email"
                defaultValue={isGuest ? 'guest' : user.email}
                disabled={isGuest}
                className={`w-full border rounded-xl px-4 py-3 text-sm text-slate-800 outline-none pr-10 ${
                  isGuest
                    ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white border-gray-300 focus:border-blue-400'
                }`}
              />
              <Mail
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>

          {/* Employee ID */}
          <div className="col-span-2">
            <label className="block text-xs text-gray-400 mb-1 ml-1">Employee ID</label>
            <div className="relative">
              <input
                type="text"
                defaultValue={isGuest ? '' : 'ALT-SPV-011'}
                disabled={isGuest}
                placeholder={isGuest ? '' : ''}
                className={`w-full border rounded-xl px-4 py-3 text-sm text-slate-800 outline-none pr-10 ${
                  isGuest
                    ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white border-gray-300 focus:border-blue-400'
                }`}
              />
              <BadgeCheck
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>

          {/* Code + Phone */}
          <div>
            <label className="block text-xs text-gray-400 mb-1 ml-1">Code</label>
            <input
              type="text"
              defaultValue={isGuest ? '' : '+ 62'}
              disabled={isGuest}
              className={`w-full border rounded-xl px-4 py-3 text-sm text-slate-800 outline-none ${
                isGuest
                  ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white border-gray-300 focus:border-blue-400'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1 ml-1">Phone Number</label>
            <div className="relative">
              <input
                type="text"
                defaultValue={isGuest ? '' : '821-0987-6543'}
                disabled={isGuest}
                className={`w-full border rounded-xl px-4 py-3 text-sm text-slate-800 outline-none pr-10 ${
                  isGuest
                    ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white border-gray-300 focus:border-blue-400'
                }`}
              />
              <Phone
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>

          {/* Save Button */}
          {!isGuest && (
            <div className="col-span-2 flex justify-end mt-2">
              <button className="px-8 py-2.5 rounded-xl text-white text-sm font-semibold bg-blue-600 hover:bg-blue-700 transition-all">
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───────────── Notifications Tab ───────────── */
function NotificationsTab({
  toggles,
  setToggles,
}: {
  toggles: Record<string, boolean>;
  setToggles: (v: Record<string, boolean>) => void;
}) {
  const flip = (key: string) =>
    setToggles({ ...toggles, [key]: !toggles[key] });

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Notification Preferences</h2>
      <div className="space-y-4">
        {notificationItems.map(({ label, key }) => (
          <div key={key} className="flex items-center justify-between">
            <button
              role="switch"
              aria-checked={toggles[key]}
              onClick={() => flip(key)}
              className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                toggles[key] ? 'bg-green-500' : 'bg-red-400'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  toggles[key] ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="ml-4 text-sm text-slate-700 flex-1">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────────── Display Tab ───────────── */
function DisplayTab() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Display</h2>
      <p className="text-slate-500 text-sm">Display preferences coming soon.</p>
    </div>
  );
}

/* ───────────── Security Tab ───────────── */
function SecurityTab({
  passwords,
  setPasswords,
}: {
  passwords: { current: string; newPass: string; confirm: string };
  setPasswords: (v: { current: string; newPass: string; confirm: string }) => void;
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Security</h2>

      <div className="flex gap-10 items-start">
        {/* Form */}
        <div className="flex-1 space-y-4 max-w-sm">
          <h3 className="text-base font-bold text-slate-800">Change Password</h3>

          <div>
            <label className="block text-xs text-gray-400 mb-1 ml-1">Current Password</label>
            <input
              type="password"
              value={passwords.current}
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1 ml-1">New Password</label>
            <input
              type="password"
              value={passwords.newPass}
              onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1 ml-1">Confirm Password</label>
            <input
              type="password"
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 bg-white"
            />
          </div>

          <button className="px-8 py-2.5 rounded-xl text-white text-sm font-semibold bg-blue-600 hover:bg-blue-700 transition-all">
            Save Changes
          </button>
        </div>

        {/* Illustration */}
        <div className="flex-1 flex items-center justify-center pt-6">
          <div className="relative w-44 h-44 flex items-center justify-center">
            {/* Outer shield glow */}
            <div className="absolute inset-0 rounded-full bg-blue-50 opacity-60" />
            <Shield size={100} className="text-blue-300 relative z-10" strokeWidth={1} />
            <div className="absolute bottom-6 right-4 bg-yellow-400 rounded-full p-2 z-20">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
