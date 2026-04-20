'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TopNavbar from '@/components/TopNavbar';
import { Plus, Download, Search, UserCheck, UserX } from 'lucide-react';

const mockUsers = [
  {
    id: 1,
    name: 'Anton Lee',
    email: 'anton.lee@altus.co.id',
    role: 'Supervisor',
    shift: 'Day',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Louis Partridge',
    email: 'louis.partridge@altus.co.id',
    role: 'Admin',
    shift: 'Night',
    status: 'Inactive',
  },
  {
    id: 3,
    name: 'Nicole Zefanya',
    email: 'nicole.zefanya@altus.co.id',
    role: 'Operator',
    shift: 'Night',
    status: 'Active',
  },
  {
    id: 4,
    name: 'Shazfa Adesya Zahra',
    email: 'shazfa.zahra@altus.co.id',
    role: 'Admin',
    shift: 'Night',
    status: 'Active',
  },
  {
    id: 5,
    name: 'Matthias James Herhardt',
    email: 'matthias.herhardt@altus.co.id',
    role: 'Supervisor',
    shift: 'Day',
    status: 'Active',
  },
  {
    id: 6,
    name: 'Reza Firmansyah',
    email: 'reza.firmansyah@altus.co.id',
    role: 'Operator',
    shift: 'Day',
    status: 'Inactive',
  },
];

export default function UsersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user || user.role === 'guest') {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (!user || user.role === 'guest') return null;

  const filtered = mockUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = mockUsers.filter((u) => u.status === 'Active').length;
  const inactiveCount = mockUsers.filter((u) => u.status === 'Inactive').length;

  return (
    <div className="h-full flex flex-col animate-fade-in bg-[#ffe9d4]">
      <TopNavbar
        title="Users Management"
        subtitle="Manage operator and admin accounts"
      />

      <div className="p-4 flex flex-col overflow-y-auto flex-1">
        {/* Content Box */}
        <div className="bg-gradient-to-br from-white to-amber-50 border-[2px] border-black/20 rounded-[24px] backdrop-blur-md overflow-hidden flex flex-col flex-1">

          {/* Header Section */}
          <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 px-5 py-3 flex items-center justify-between border-b-[2px] border-black/20">
            <div>
              <h1 className="text-slate-900 font-bold text-lg">Users Management</h1>
              <p className="text-slate-600 text-xs mt-1">Manage operator and admin accounts</p>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-1 px-3 py-1.5 bg-white border-[2px] border-black/20 text-slate-900 font-bold text-xs rounded-full hover:bg-cyan-50 transition">
                <Download size={14} />
                Export
              </button>
              <button className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white font-bold text-xs rounded-full hover:bg-emerald-600 transition">
                <Plus size={14} />
                Add User
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="px-5 py-3 flex gap-3 border-b-[2px] border-black/20 bg-white">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
              <UserCheck size={13} className="text-green-600" />
              <span className="text-green-700 font-bold text-xs">{activeCount} Active</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-full">
              <UserX size={13} className="text-red-500" />
              <span className="text-red-600 font-bold text-xs">{inactiveCount} Inactive</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full">
              <span className="text-blue-700 font-bold text-xs">{mockUsers.length} Total Users</span>
            </div>
          </div>

          {/* Search Section */}
          <div className="bg-white px-6 py-3 border-b-[2px] border-black/20">
            <p className="text-slate-900 font-medium text-xs mb-2.5">Search and filter users</p>
            <div className="flex gap-2">
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
          </div>

          {/* Table */}
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
                      <th className="text-left py-3 px-4 text-slate-900 font-bold text-xs">Shift</th>
                      <th className="text-left py-3 px-4 text-slate-900 font-bold text-xs">Status</th>
                      <th className="text-left py-3 px-4 text-slate-900 font-bold text-xs">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-10 text-center text-slate-400 text-xs">
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
                                {u.name.charAt(0)}
                              </div>
                              <span className="font-bold text-slate-900 text-xs">{u.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-600 text-xs">{u.email}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
                                u.role === 'Admin'
                                  ? 'bg-purple-500/10 text-purple-700 border-purple-300'
                                  : u.role === 'Supervisor'
                                    ? 'bg-blue-500/10 text-blue-700 border-blue-300'
                                    : 'bg-amber-500/10 text-amber-700 border-amber-300'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600 text-xs">{u.shift}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
                                u.status === 'Active'
                                  ? 'bg-green-500/10 text-green-700 border-green-400'
                                  : 'bg-red-500/10 text-red-600 border-red-300'
                              }`}
                            >
                              {u.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <button className="text-cyan-600 hover:text-cyan-700 font-bold text-xs">
                              Edit →
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
