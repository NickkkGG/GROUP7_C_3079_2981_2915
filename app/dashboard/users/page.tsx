'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TopNavbar from '@/components/TopNavbar';
import { Plus, Download, Search, UserCheck, UserX, Trash2 } from 'lucide-react';
import CustomNotification, { useNotification } from '@/components/CustomNotification';

interface User {
  id: number;
  fullname: string;
  email: string;
  role: string;
  created_at: string;
}

export default function UsersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { notification, show: showNotification } = useNotification();
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState('user');

  useEffect(() => {
    if (!user || user.role === 'guest') {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
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

      if (!response.ok) throw new Error('Failed to update role');

      showNotification(`User role updated to ${newRole}`, 'success');
      setEditingId(null);
      fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      showNotification('Failed to update user role', 'error');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`/api/users?id=${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete user');

      showNotification('User deleted successfully', 'success');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      showNotification('Failed to delete user', 'error');
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
    <div className="h-full flex flex-col animate-fade-in bg-[#ffe9d4]">
      {notification && (
        <CustomNotification message={notification.message} type={notification.type} />
      )}
      <TopNavbar
        title="Users Management"
        subtitle="Manage operator and admin accounts"
      />

      <div className="p-4 flex flex-col overflow-y-auto flex-1">
        <div className="bg-gradient-to-br from-white to-amber-50 border-[2px] border-black/20 rounded-[24px] backdrop-blur-md overflow-hidden flex flex-col flex-1">
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

          <div className="space-y-3 p-5 bg-white overflow-y-auto flex-1">
            <div className="bg-gradient-to-br from-white to-amber-50 border-[2px] border-black/20 rounded-[16px] overflow-hidden">
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
                        <tr key={u.id} className="border-b-[1px] border-black/10 hover:bg-cyan-50 transition">
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
                                className="px-2 py-0.5 rounded text-xs border border-slate-300 focus:outline-none"
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
                          <td className="py-3 px-4 text-xs space-x-2">
                            <button
                              onClick={() => {
                                setEditingId(u.id);
                                setSelectedRole(u.role);
                              }}
                              className="text-cyan-600 hover:text-cyan-700 font-bold text-xs"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id)}
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
    </div>
  );
}
