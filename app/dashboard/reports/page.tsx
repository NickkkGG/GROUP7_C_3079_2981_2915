import ReportsContent from './ReportsContent';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Reports - ALTUS',
};

function ReportsLoadingSkeleton() {
  return (
    <div className="h-full flex flex-col bg-white animate-fade-in">
      <div className="p-4 flex flex-col overflow-y-auto flex-1 no-scrollbar">
        <div className="bg-gradient-to-br from-white to-slate-50 border-[2px] border-black/20 rounded-[24px] overflow-hidden flex flex-col flex-1">
          <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 px-5 py-3 border-b-[2px] border-black/20">
            <div className="h-5 bg-slate-300 rounded w-40 mb-1 animate-pulse"></div>
            <div className="h-3 bg-slate-200 rounded w-60 animate-pulse"></div>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-slate-200 rounded-[16px] animate-pulse"></div>
              ))}
            </div>
            <div className="h-14 bg-slate-200 rounded-[16px] animate-pulse"></div>
            <div className="h-64 bg-slate-200 rounded-[16px] animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <ReportsContent />
  );
}
