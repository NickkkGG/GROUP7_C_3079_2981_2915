'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import TopNavbar from '@/components/TopNavbar';
import Image from 'next/image';
import CustomNotification, { useNotification } from '@/components/CustomNotification';
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
  Package,
  Plane,
  Calendar,
  Smartphone,
  UserPlus,
  Volume2,
  Users,
} from 'lucide-react';

type Tab = 'account' | 'notifications' | 'display' | 'security';

interface ToggleItem {
  label: string;
  key: string;
  defaultOn: boolean;
  icon: any;
  description: string;
}

const notificationItems: ToggleItem[] = [
  { label: 'Shipment Updates', key: 'shipment', defaultOn: true, icon: Package, description: 'Get notified when shipment status changes' },
  { label: 'Flight Alerts', key: 'flight', defaultOn: true, icon: Plane, description: 'Receive alerts for flight delays and changes' },
  { label: 'Weekly Summary', key: 'weekly', defaultOn: true, icon: Calendar, description: 'Get weekly operational reports via email' },
  { label: 'Push Notifications', key: 'push', defaultOn: false, icon: Smartphone, description: 'Show browser notifications when logged in' },
  { label: 'Email Notifications', key: 'emailNotifications', defaultOn: true, icon: Mail, description: 'Receive all notifications via email' },
  { label: 'Sound & Badges', key: 'sound', defaultOn: true, icon: Volume2, description: 'Enable sound alerts and badge indicators' },
  { label: 'New User Alerts', key: 'new_user', defaultOn: false, icon: UserPlus, description: 'Notify when new accounts are created' },
];

export default function SettingsContent() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { notification, show: showNotification } = useNotification();
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
    <div className="h-full flex flex-col bg-[#ffe9d4] animate-fade-in">
      {notification && (
        <CustomNotification message={notification.message} type={notification.type} />
      )}
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
          <div className="flex-1 bg-white overflow-y-auto no-scrollbar p-8">
            {activeTab === 'account' && (
              <AccountTab
                user={user}
                isGuest={isGuest}
                profileData={profileData}
                setProfileData={setProfileData}
                isSaving={isSaving}
                setIsSaving={setIsSaving}
                showNotification={showNotification}
              />
            )}
            {activeTab === 'notifications' && !isGuest && (
              <NotificationsTab toggles={toggles} setToggles={setToggles} />
            )}
            {activeTab === 'display' && !isGuest && (
              <DisplayTab />
            )}
            {activeTab === 'security' && !isGuest && (
              <SecurityTab passwords={passwords} setPasswords={setPasswords} user={user} showNotification={showNotification} />
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
  showNotification,
}: {
  user: { name: string; email: string; role: string; profileImage?: string | null };
  isGuest: boolean;
  profileData: { fullname: string; phone: string; email: string };
  setProfileData: any;
  isSaving: boolean;
  setIsSaving: any;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
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
      showNotification('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification('Failed to update profile. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-1">Account Settings</h2>
        <p className="text-slate-600 text-xs">Manage your personal information and profile settings</p>
      </div>

      {/* Profile Card */}
      <div className="bg-gradient-to-br from-white to-slate-50 border-[2px] border-black/10 rounded-[20px] p-5 shadow-sm">
        <div className="flex items-start gap-5">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-2">
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-lg ${
                isGuest ? 'bg-gray-300' : 'bg-gradient-to-br from-emerald-500 to-cyan-500'
              }`}
            >
              {user.profileImage ? (
                <Image src={user.profileImage} alt="avatar" width={96} height={96} className="w-full h-full object-cover" />
              ) : (
                <User size={40} className={isGuest ? 'text-gray-400' : 'text-white font-bold'} />
              )}
            </div>

            <button
              disabled={isGuest}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                isGuest
                  ? 'bg-gray-300 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600 shadow-md hover:shadow-lg active:scale-95'
              }`}
            >
              <Camera size={12} />
              Change Photo
            </button>

            {/* Role Badge */}
            <div className={`px-3 py-1 rounded-full text-xs font-bold ${
              user.role === 'operator'
                ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                : user.role === 'user'
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                  : 'bg-gray-100 text-gray-700 border-2 border-gray-300'
            }`}>
              {user.role.toUpperCase()}
            </div>
          </div>

          {/* Form Section */}
          <div className="flex-1 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 ml-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={profileData.fullname}
                  onChange={(e) => setProfileData({ ...profileData, fullname: e.target.value })}
                  disabled={isGuest}
                  className={`w-full border-2 rounded-xl px-3 py-2 text-sm text-slate-800 outline-none pr-9 transition-all ${
                    isGuest
                      ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100'
                  }`}
                />
                <BadgeCheck size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 ml-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={profileData.email}
                  disabled={true}
                  className="w-full border-2 rounded-xl px-3 py-2 text-sm text-slate-800 outline-none pr-9 bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed"
                />
                <Mail size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500 mt-1 ml-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 ml-1">Phone Number</label>
              <div className="relative">
                <input
                  type="text"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  disabled={isGuest}
                  placeholder="Enter your phone number"
                  className={`w-full border-2 rounded-xl px-3 py-2 text-sm text-slate-800 outline-none pr-9 transition-all ${
                    isGuest
                      ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100'
                  }`}
                />
                <Phone size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {!isGuest && (
              <div className="flex justify-end pt-1">
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="px-6 py-2 rounded-xl text-white text-sm font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 transition-all shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Account Info Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-[16px] p-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <User size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-blue-600 font-semibold">Member Since</p>
              <p className="text-sm font-bold text-blue-900">May 2026</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-[16px] p-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
              <BadgeCheck size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-emerald-600 font-semibold">Account Status</p>
              <p className="text-sm font-bold text-emerald-900">Active</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-[16px] p-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Mail size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-purple-600 font-semibold">Last Login</p>
              <p className="text-sm font-bold text-purple-900">Today</p>
            </div>
          </div>
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
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-1">Notification Preferences</h2>
        <p className="text-xs text-slate-500">Manage how you receive notifications</p>
      </div>

      <div className="bg-gradient-to-br from-white to-slate-50 border-[2px] border-black/10 rounded-[20px] p-5 shadow-sm space-y-3">
        {notificationItems.map(({ label, key, icon: Icon, description }) => (
          <div key={key} className="flex items-center justify-between p-3 bg-white border-2 border-slate-100 rounded-[16px] hover:border-cyan-200 transition-all">
            <div className="flex items-center gap-3 flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                toggles[key]
                  ? 'bg-gradient-to-br from-emerald-500 to-cyan-500'
                  : 'bg-gray-200'
              }`}>
                <Icon size={18} className={toggles[key] ? 'text-white' : 'text-gray-400'} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{label}</p>
                <p className="text-xs text-slate-500">{description}</p>
              </div>
            </div>
            <button
              role="switch"
              aria-checked={toggles[key]}
              onClick={() => flip(key)}
              className={`relative w-12 h-6 rounded-full transition-all flex-shrink-0 shadow-inner ${
                toggles[key] ? 'bg-gradient-to-r from-emerald-500 to-cyan-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                  toggles[key] ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-[16px] p-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Bell size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-blue-600 font-semibold">Active Notifications</p>
              <p className="text-sm font-bold text-blue-900">{Object.values(toggles).filter(Boolean).length} / {notificationItems.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-[16px] p-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Mail size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-purple-600 font-semibold">Email Alerts</p>
              <p className="text-sm font-bold text-purple-900">{toggles.emailNotifications ? 'Enabled' : 'Disabled'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────── Display Tab ───────────── */
function DisplayTab() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-1">Display Settings</h2>
        <p className="text-xs text-slate-500">Customize your visual experience</p>
      </div>

      {/* Current Theme Preview */}
      <div className="bg-gradient-to-br from-white to-slate-50 border-[2px] border-black/10 rounded-[20px] p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Current Theme</h3>
            <p className="text-xs text-slate-500">Light Mode (Active)</p>
          </div>
          <div className="px-3 py-1 bg-emerald-100 text-emerald-700 border-2 border-emerald-300 rounded-full text-xs font-bold">
            ACTIVE
          </div>
        </div>

        {/* Theme Preview Card */}
        <div className="bg-gradient-to-br from-[#ffe9d4] to-[#ffd9b8] border-2 border-black/20 rounded-[16px] p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
              A
            </div>
            <div className="flex-1">
              <div className="h-3 bg-slate-300 rounded w-24 mb-1.5"></div>
              <div className="h-2 bg-slate-200 rounded w-16"></div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="h-16 bg-white border-2 border-black/10 rounded-lg"></div>
            <div className="h-16 bg-gradient-to-r from-emerald-500 to-cyan-500 border-2 border-white/20 rounded-lg"></div>
            <div className="h-16 bg-white border-2 border-black/10 rounded-lg"></div>
          </div>
        </div>
      </div>

      {/* Coming Soon Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Dark Mode */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-[2px] border-slate-700 rounded-[20px] p-5 shadow-sm relative overflow-hidden">
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-cyan-500 text-white rounded-full text-[10px] font-bold">
            SOON
          </div>
          <div className="space-y-3">
            <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
              <Monitor size={20} className="text-slate-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Dark Mode</h3>
              <p className="text-xs text-slate-400">Easy on the eyes, perfect for night work</p>
            </div>
            {/* Mini Preview */}
            <div className="bg-slate-950 border-2 border-slate-700 rounded-lg p-2 space-y-1.5">
              <div className="h-2 bg-slate-700 rounded w-16"></div>
              <div className="h-2 bg-slate-800 rounded w-12"></div>
            </div>
          </div>
        </div>

        {/* Custom Themes */}
        <div className="bg-gradient-to-br from-purple-100 to-pink-100 border-[2px] border-purple-300 rounded-[20px] p-5 shadow-sm relative overflow-hidden">
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-purple-500 text-white rounded-full text-[10px] font-bold">
            SOON
          </div>
          <div className="space-y-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Camera size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-purple-900 mb-1">Custom Themes</h3>
              <p className="text-xs text-purple-700">Personalize colors and styles</p>
            </div>
            {/* Color Palette Preview */}
            <div className="flex gap-1.5">
              <div className="w-6 h-6 bg-gradient-to-br from-red-400 to-orange-400 rounded-full border-2 border-white"></div>
              <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full border-2 border-white"></div>
              <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full border-2 border-white"></div>
              <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full border-2 border-white"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-[16px] p-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Bell size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-blue-900 mb-1">More Display Options Coming Soon</p>
            <p className="text-xs text-blue-700">We're working on dark mode, custom themes, and more personalization options to make ALTUS truly yours.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────── Security Tab ───────────── */
function SecurityTab({
  passwords,
  setPasswords,
  user,
  showNotification,
}: {
  passwords: { current: string; newPass: string; confirm: string };
  setPasswords: (v: { current: string; newPass: string; confirm: string }) => void;
  user: any;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
}) {
  const [isChanging, setIsChanging] = useState(false);

  const handleChangePassword = async () => {
    if (passwords.newPass !== passwords.confirm) {
      showNotification('Password baru tidak cocok! Pastikan keduanya sama.', 'error');
      return;
    }

    if (passwords.newPass.length < 6) {
      showNotification('Password minimal 6 karakter!', 'error');
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
        showNotification(data.error || 'Gagal mengganti password', 'error');
        return;
      }

      showNotification('Password berhasil diubah!', 'success');
      setPasswords({ current: '', newPass: '', confirm: '' });
    } catch (error) {
      console.error('Error changing password:', error);
      showNotification('Gagal mengganti password. Coba lagi.', 'error');
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-1">Security Settings</h2>
        <p className="text-xs text-slate-500">Manage your password and account security</p>
      </div>

      <div className="bg-gradient-to-br from-white to-slate-50 border-[2px] border-black/10 rounded-[20px] p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
            <Lock size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Change Password</h3>
            <p className="text-xs text-slate-500">Update your account password</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 ml-1">Current Password</label>
            <div className="relative">
              <input
                type="password"
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                placeholder="Enter current password"
                className="w-full border-2 rounded-xl px-3 py-2 text-sm text-slate-800 outline-none pr-9 bg-white border-slate-200 focus:border-red-400 focus:ring-4 focus:ring-red-100 transition-all"
              />
              <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 ml-1">New Password</label>
            <div className="relative">
              <input
                type="password"
                value={passwords.newPass}
                onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                placeholder="Enter new password (min 6 characters)"
                className="w-full border-2 rounded-xl px-3 py-2 text-sm text-slate-800 outline-none pr-9 bg-white border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all"
              />
              <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 ml-1">Confirm New Password</label>
            <div className="relative">
              <input
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                placeholder="Re-enter new password"
                className="w-full border-2 rounded-xl px-3 py-2 text-sm text-slate-800 outline-none pr-9 bg-white border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all"
              />
              <BadgeCheck size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={handleChangePassword}
              disabled={isChanging}
              className="px-6 py-2 rounded-xl text-white text-sm font-bold bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 transition-all shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isChanging ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </div>
      </div>

      {/* Security Info Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-[16px] p-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
              <BadgeCheck size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-emerald-600 font-semibold">Account Status</p>
              <p className="text-sm font-bold text-emerald-900">Secure</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-[16px] p-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Lock size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-blue-600 font-semibold">Encryption</p>
              <p className="text-sm font-bold text-blue-900">AES-256</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-[16px] p-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Mail size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-purple-600 font-semibold">Last Changed</p>
              <p className="text-sm font-bold text-purple-900">Never</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
