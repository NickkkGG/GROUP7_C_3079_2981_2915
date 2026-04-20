'use client';

interface TopNavbarProps {
  title: string;
  subtitle?: string;
  showLiveUpdate?: boolean;
  liveUpdateColor?: string;
}

export default function TopNavbar({
  title,
  subtitle,
  showLiveUpdate = true,
  liveUpdateColor = '#22c55e'
}: TopNavbarProps) {
  return (
    <div className="bg-[#ffe9d4] border-b-[2px] border-black/20 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h1 className="text-slate-900 font-bold text-lg">{title}</h1>
        {subtitle && <p className="text-slate-600 text-xs mt-1">{subtitle}</p>}
      </div>

      {showLiveUpdate && (
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full animate-pulse border"
            style={{ backgroundColor: liveUpdateColor }}
          />
          <span className="text-slate-600 text-xs font-medium">Live Update</span>
        </div>
      )}
    </div>
  );
}
