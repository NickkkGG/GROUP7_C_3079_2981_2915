'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import TopNavbar from '@/components/TopNavbar';
import Image from 'next/image';
import {
  User,
  Bell,
  Monitor,
  LogOut,
  Mail,
  BadgeCheck,
  Phone,
  Camera,
  Lock,
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
  const [profileData, setProfileData] = useState({
    fullname: '',
    phone: '',
    email: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'guest') {
      setProfileData({
        fullname: user.name || '',
        phone: '',
        email: user.email || '',
      });
    }
  }, [user]);

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
        { id: 'security' as Tab, label: 'Security', icon: Lock },
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
              <AccountTab
                user={user}
                isGuest={isGuest}
                profileData={profileData}
                setProfileData={setProfileData}
                isSaving={isSaving}
                setIsSaving={setIsSaving}
              />
            )}
            {activeTab === 'notifications' && !isGuest && (
              <NotificationsTab toggles={toggles} setToggles={setToggles} />
            )}
            {activeTab === 'display' && !isGuest && (
              <DisplayTab />
            )}
            {activeTab === 'security' && !isGuest && (
              <SecurityTab passwords={passwords} setPasswords={setPasswords} user={user} />
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
  profileData,
  setProfileData,
  isSaving,
  setIsSaving,
}: {
  user: { name: string; email: string; role: string; profileImage?: string | null };
  isGuest: boolean;
  profileData: { fullname: string; phone: string; email: string };
  setProfileData: any;
  isSaving: boolean;
  setIsSaving: any;
}) {
  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          fullname: profileData.fullname,
        }),
      });

      if (!response.ok) throw new Error('Failed to update profile');
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Profile Information</h2>

      <div className="flex gap-10">
        <div className="flex flex-col items-center gap-3">
          <div
            className={`w-28 h-28 rounded-full flex items-center justify-center overflow-hidden ${
              isGuest ? 'bg-gray-300' : 'bg-gradient-to-br from-emerald-500 to-cyan-500'
            }`}
          >
            {user.profileImage ? (
              <Image src={user.profileImage} alt="avatar" width={112} height={112} className="w-full h-full object-cover" />
            ) : (
              <User size={48} className={isGuest ? 'text-gray-400' : 'text-white font-bold'} />
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
        </div>

        <div className="flex-1 grid grid-cols-2 gap-4 content-start">
          <div className="col-span-2">
            <label className="block text-xs text-gray-400 mb-1 ml-1">Full Name</label>
            <div className="relative">
              <input
                type="text"
                value={profileData.fullname}
                onChange={(e) => setProfileData({ ...profileData, fullname: e.target.value })}
                disabled={isGuest}
                className={`w-full border rounded-xl px-4 py-3 text-sm text-slate-800 outline-none pr-10 ${
                  isGuest
                    ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white border-gray-300 focus:border-blue-400'
                }`}
              />
              <BadgeCheck size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="col-span-2">
            <label className="block text-xs text-gray-400 mb-1 ml-1">Email</label>
            <div className="relative">
              <input
                type="email"
                value={profileData.email}
                disabled={true}
                className="w-full border rounded-xl px-4 py-3 text-sm text-slate-800 outline-none pr-10 bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
              />
              <Mail size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1 ml-1">Phone Number</label>
            <div className="relative">
              <input
                type="text"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                disabled={isGuest}
                placeholder="Enter your phone number"
                className={`w-full border rounded-xl px-4 py-3 text-sm text-slate-800 outline-none pr-10 ${
                  isGuest
                    ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white border-gray-300 focus:border-blue-400'
                }`}
              />
              <Phone size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {!isGuest && (
            <div className="col-span-2 flex justify-end mt-2">
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="px-8 py-2.5 rounded-xl text-white text-sm font-semibold bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
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
  user,
}: {
  passwords: { current: string; newPass: string; confirm: string };
  setPasswords: (v: { current: string; newPass: string; confirm: string }) => void;
  user: any;
}) {
  const [isChanging, setIsChanging] = useState(false);

  const handleChangePassword = async () => {
    if (passwords.newPass !== passwords.confirm) {
      alert('New passwords do not match!');
      return;
    }

    if (passwords.newPass.length < 6) {
      alert('Password must be at least 6 characters!');
      return;
    }

    setIsChanging(true);
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          currentPassword: passwords.current,
          newPassword: passwords.newPass,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || 'Failed to change password');
        return;
      }

      alert('Password changed successfully!');
      setPasswords({ current: '', newPass: '', confirm: '' });
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Failed to change password');
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Security</h2>

      <div className="flex gap-10 items-start">
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

          <button
            onClick={handleChangePassword}
            disabled={isChanging}
            className="px-8 py-2.5 rounded-xl text-white text-sm font-semibold bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            {isChanging ? 'Changing...' : 'Change Password'}
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center pt-6">
          <div className="relative w-96 h-96 flex items-center justify-center">
            {/* Professional Padlock Icon */}
            <svg width="240" height="240" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10">
              {/* Main Lock Body - Clean Professional Design */}
              <rect x="60" y="90" width="120" height="110" rx="12" fill="#e5e7eb" stroke="#1f2937" strokeWidth="2"/>

              {/* Lock Shackle - Curved Arc */}
              <path d="M 90 90 Q 90 30 120 30 Q 150 30 150 90" fill="none" stroke="#1f2937" strokeWidth="6" strokeLinecap="round"/>

              {/* Keyhole Circle */}
              <circle cx="120" cy="140" r="14" fill="white" stroke="#1f2937" strokeWidth="2"/>

              {/* Keyhole Shaft */}
              <rect x="116" y="155" width="8" height="25" fill="#1f2937" rx="4"/>

              {/* Checkmark Badge - Top Right */}
              <g transform="translate(170, 50)">
                <circle cx="0" cy="0" r="35" fill="#10b981" opacity="0.95"/>
                <path d="M -12 0 L -3 10 L 16 -10" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </g>
            </svg>

            {/* Status Text with Icon */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
              <p className="text-slate-700 font-semibold text-sm">Secure & Protected</p>
              <p className="text-slate-500 text-xs mt-1">Your password is encrypted</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
