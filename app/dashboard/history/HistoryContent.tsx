'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { History, Search, Download, Package, ExternalLink } from 'lucide-react';
import TopNavbar from '@/components/TopNavbar';

interface Activity {
  id: number;
  activity_type: 'track' | 'download';
  tracking_number: string;
  created_at: string;
  origin: string | null;
  destination: string | null;
  status: string | null;
}

export default function HistoryContent() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'track' | 'download'>('all');

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'user')) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user || user.role !== 'user' || !user.email) return;
    setLoading(true);
    fetch(`/api/history?email=${encodeURIComponent(user.email)}`)
      .then((res) => res.json())
      .then((data) => setActivities(data.activities || []))
      .catch(() => setActivities([]))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user || user.role !== 'user') return null;

  const filtered = activities.filter((a) => filter === 'all' || a.activity_type === filter);

  const goTrack = (awb: string) => router.push(`/dashboard/tracking?search=${encodeURIComponent(awb)}`);

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 animate-fade-in">
      <TopNavbar title="My Activity History" subtitle="Your tracking and download activity." showLiveUpdate={false} />
      <div className="p-4 flex flex-col gap-3 flex-1 overflow-y-auto">
        {/* Filter tabs */}
        <div className="flex items-center gap-2">
          {([
            { key: 'all', label: 'All' },
            { key: 'track', label: 'Tracked' },
            { key: 'download', label: 'Downloaded' },
          ] as const).map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === t.key
                  ? 'bg-[#1e3a5f] text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-800 border-[2px] border-black/20 dark:border-white/10 rounded-[16px] overflow-hidden flex-1">
          {loading ? (
            <div className="p-10 text-center text-slate-400 text-sm">Loading your history…</div>
          ) : filtered.length === 0 ? (
            <div className="p-10 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-3">
                <History size={24} className="text-slate-400" />
              </div>
              <p className="text-slate-500 dark:text-slate-300 text-sm font-semibold">No activity yet</p>
              <p className="text-slate-400 text-xs mt-1">Track an AWB or download a receipt and it will show up here.</p>
            </div>
          ) : (
            <div className="divide-y divide-black/10 dark:divide-white/10">
              {filtered.map((a) => (
                <div key={a.id} className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50/50 dark:hover:bg-slate-700/40 transition">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${a.activity_type === 'download' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                    {a.activity_type === 'download' ? <Download size={16} /> : <Search size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-xs font-mono">{a.tracking_number}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${a.activity_type === 'download' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                        {a.activity_type === 'download' ? 'Downloaded PDF' : 'Tracked'}
                      </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 truncate">
                      {a.origin && a.destination ? `${a.origin} → ${a.destination}` : 'Shipment no longer available'}
                      {a.status ? ` · ${a.status.replace('_', ' ')}` : ''}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-slate-400 text-[10px]">{fmtDate(a.created_at)}</p>
                    <button
                      onClick={() => goTrack(a.tracking_number)}
                      className="text-[#1e3a5f] dark:text-blue-400 hover:underline text-[11px] font-bold flex items-center gap-1 justify-end mt-0.5"
                    >
                      Track <ExternalLink size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
