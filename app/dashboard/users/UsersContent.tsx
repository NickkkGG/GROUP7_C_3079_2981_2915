'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TopNavbar from '@/components/TopNavbar';
import { Plus, Download, Search, UserCheck, UserX, Trash2, Eye, EyeOff } from 'lucide-react';
import CustomNotification, { useNotification } from '@/components/CustomNotification';

interface User {
  id: number;
  fullname: string;
  email: string;
  role: string;
  created_at: string;
}

export default function UsersContent() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { notification, show: showNotification } = useNotification();
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState('user');
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ fullname: '', email: '', role: 'user', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Wait for auth to finish loading before redirecting
    if (!isLoading && (!user || user.role === 'guest')) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();

      if (!response.ok) {
        showNotification(data.error || 'Failed to load users', 'error');
        setUsers([]);
        return;
      }

      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching users:', error);
      showNotification('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId: number, newRole: string) => {
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });

      const data = await response.json();

      if (!response.ok) {
        showNotification(data.error || 'Failed to update user role', 'error');
        return;
      }

      showNotification(`User role updated to ${newRole}`, 'success');
      setEditingId(null);
      fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      showNotification('Failed to update user role', 'error');
    }
  };

  const openEditModal = (u: User) => {
    setEditUser(u);
    setEditForm({ fullname: u.fullname, email: u.email, role: u.role, password: '' });
    setShowPassword(false);
    setShowCurrentPassword(false);
  };

  const handleSaveUser = async () => {
    if (!editUser) return;
    setSaving(true);
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editUser.id,
          fullname: editForm.fullname,
          email: editForm.email,
          role: editForm.role,
          password: editForm.password,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        showNotification(data.error || 'Failed to update user', 'error');
        return;
      }
      showNotification('User updated successfully', 'success');
      setEditUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      showNotification('Failed to update user', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/users?id=${userToDelete.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        showNotification(data.error || 'Failed to delete user', 'error');
        return;
      }

      showNotification('User deleted successfully', 'success');
      setUserToDelete(null);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      showNotification('Failed to delete user', 'error');
    } finally {
      setDeleting(false);
    }
  };

  if (!user || user.role === 'guest') return null;

  const filtered = users.filter(
    (u) =>
      u.fullname.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = users.length;
  const userCount = users.filter((u) => u.role === 'user').length;

  return (
    <div className="h-full flex flex-col bg-white animate-fade-in">
      {notification && (
        <CustomNotification message={notification.message} type={notification.type} />
      )}
      <TopNavbar
        title="Users Management"
        subtitle="Manage operator and admin accounts"
      />

      <div className="p-4 flex flex-col overflow-y-auto flex-1 no-scrollbar">
        <div className="bg-gradient-to-br from-white to-slate-50 border-[2px] border-black/20 rounded-[24px] backdrop-blur-md overflow-hidden flex flex-col flex-1">
          <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 px-5 py-3 flex items-center justify-between border-b-[2px] border-black/20">
            <div>
              <h1 className="text-slate-900 font-bold text-lg">Users Management</h1>
              <p className="text-slate-600 text-xs mt-1">Manage user accounts and roles</p>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-1 px-3 py-1.5 bg-white border-[2px] border-black/20 text-slate-900 font-bold text-xs rounded-full hover:bg-cyan-50 transition">
                <Download size={14} />
                Export
              </button>
            </div>
          </div>

          <div className="px-5 py-3 flex gap-3 border-b-[2px] border-black/20 bg-white">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
              <UserCheck size={13} className="text-green-600" />
              <span className="text-green-700 font-bold text-xs">{activeCount} Total</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full">
              <span className="text-blue-700 font-bold text-xs">{userCount} Users</span>
            </div>
          </div>

          <div className="bg-white px-6 py-3 border-b-[2px] border-black/20">
            <p className="text-slate-900 font-medium text-xs mb-2.5">Search and filter users</p>
            <div className="flex-1 bg-white border-[2px] border-black/20 rounded-[16px] px-3.5 py-2 flex items-center gap-2">
              <Search size={14} className="text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email or role..."
                className="flex-1 bg-transparent text-slate-900 text-xs outline-none placeholder-slate-400"
              />
            </div>
          </div>

          <div className="space-y-3 p-5 bg-white overflow-y-auto flex-1 no-scrollbar">
            <div className="bg-gradient-to-br from-white to-slate-50 border-[2px] border-black/20 rounded-[16px] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-[2px] border-black/20 bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
                      <th className="text-left py-3 px-4 text-slate-900 font-bold text-xs">#</th>
                      <th className="text-left py-3 px-4 text-slate-900 font-bold text-xs">Name</th>
                      <th className="text-left py-3 px-4 text-slate-900 font-bold text-xs">Email</th>
                      <th className="text-left py-3 px-4 text-slate-900 font-bold text-xs">Role</th>
                      <th className="text-left py-3 px-4 text-slate-900 font-bold text-xs">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-slate-400 text-xs">
                          Loading users...
                        </td>
                      </tr>
                    ) : filtered.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-slate-400 text-xs">
                          No users found.
                        </td>
                      </tr>
                    ) : (
                      filtered.map((u, idx) => (
                        <tr key={u.id} onClick={() => openEditModal(u)} className="border-b-[1px] border-black/10 hover:bg-cyan-50 transition cursor-pointer">
                          <td className="py-3 px-4 text-slate-500 text-xs">{idx + 1}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {u.fullname.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-bold text-slate-900 text-xs">{u.fullname}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-600 text-xs">{u.email}</td>
                          <td className="py-3 px-4">
                            {editingId === u.id ? (
                              <select
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                onBlur={() => handleUpdateRole(u.id, selectedRole)}
                                className="px-2 py-1 rounded-lg text-xs border-2 border-cyan-400 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-300 cursor-pointer"
                                autoFocus
                              >
                                <option value="user">User</option>
                                <option value="operator">Operator</option>
                              </select>
                            ) : (
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
                                  u.role === 'operator'
                                    ? 'bg-purple-500/10 text-purple-700 border-purple-300'
                                    : 'bg-blue-500/10 text-blue-700 border-blue-300'
                                }`}
                              >
                                {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-xs space-x-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => { e.stopPropagation(); openEditModal(u); }}
                              className="text-cyan-600 hover:text-cyan-700 font-bold text-xs"
                            >
                              Edit User
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteUser(u); }}
                              className="text-red-600 hover:text-red-700 font-bold text-xs ml-2"
                            >
                              <Trash2 size={12} className="inline mr-1" />
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {editUser && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border-[2px] border-black/20 rounded-[20px] p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-black text-lg">
                  {editUser.fullname.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-slate-900 font-bold text-lg">Edit User</h3>
                  <p className="text-slate-500 text-xs">Update user details</p>
                </div>
              </div>
              <button onClick={() => setEditUser(null)} className="text-slate-400 hover:text-slate-600 transition text-lg">✕</button>
            </div>

            <div className="space-y-3">
              {/* Fullname */}
              <div>
                <label className="block text-slate-900 font-bold text-xs mb-1">Full Name</label>
                <input
                  type="text"
                  value={editForm.fullname}
                  onChange={(e) => setEditForm({ ...editForm, fullname: e.target.value })}
                  className="w-full bg-white border-[2px] border-black/20 rounded-[12px] px-3 py-2 text-slate-900 text-xs outline-none focus:border-cyan-500 transition"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-slate-900 font-bold text-xs mb-1">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full bg-white border-[2px] border-black/20 rounded-[12px] px-3 py-2 text-slate-900 text-xs outline-none focus:border-cyan-500 transition"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-slate-900 font-bold text-xs mb-1">Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full bg-white border-[2px] border-black/20 rounded-[12px] px-3 py-2 text-slate-900 text-xs outline-none focus:border-cyan-500 transition cursor-pointer"
                >
                  <option value="user">User</option>
                  <option value="operator">Operator</option>
                </select>
              </div>

              {/* Current Password (read-only — bcrypt encrypted, cannot reveal plaintext) */}
              <div>
                <label className="block text-slate-900 font-bold text-xs mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={showCurrentPassword ? '🔒 Encrypted — cannot be revealed' : '••••••••••••'}
                    className="w-full bg-slate-100 border-[2px] border-slate-300 rounded-[12px] px-3 py-2 pr-9 text-slate-500 text-xs outline-none cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showCurrentPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <p className="text-slate-400 text-[10px] mt-1">Passwords are securely hashed and cannot be displayed. Set a new one below to change it.</p>
              </div>

              {/* Password */}
              <div>
                <label className="block text-slate-900 font-bold text-xs mb-1">New Password <span className="text-slate-400 font-normal">(leave blank to keep current)</span></label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={editForm.password}
                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                    placeholder="Enter new password..."
                    className="w-full bg-white border-[2px] border-black/20 rounded-[12px] px-3 py-2 pr-9 text-slate-900 text-xs outline-none focus:border-cyan-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setEditUser(null)}
                className="flex-1 px-4 py-2.5 bg-white border-[2px] border-black/20 text-slate-900 font-bold text-xs rounded-[12px] hover:bg-red-50 hover:border-red-400 hover:text-red-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUser}
                disabled={saving}
                className="flex-1 px-4 py-2.5 bg-[#1e3a5f] text-white font-bold text-xs rounded-[12px] hover:bg-[#2c5282] transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border-[2px] border-black/20 rounded-[20px] p-6 max-w-sm w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <h3 className="text-slate-900 font-bold text-lg">Delete User?</h3>
            </div>
            <p className="text-slate-600 text-sm mb-5">
              Are you sure you want to delete user <span className="font-bold text-slate-900">{userToDelete.fullname}</span> ({userToDelete.email})? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setUserToDelete(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-slate-200 border-[2px] border-slate-400 text-slate-900 font-bold text-xs rounded-[12px] hover:bg-slate-300 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white font-bold text-xs rounded-[12px] hover:bg-red-700 transition disabled:opacity-50 shadow-md"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
