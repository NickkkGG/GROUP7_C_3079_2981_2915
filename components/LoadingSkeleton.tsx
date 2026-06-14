/* ═══════════════════════════════════════════════════════════════════════════
   LOADING SKELETONS - Exact Copy of Each Page Layout
   - Each skeleton mirrors the actual page structure
   - animate-fade-in on wrapper for smooth entrance
   - animate-pulse on content boxes for loading effect
   ═══════════════════════════════════════════════════════════════════════════ */

/* ───────────── DASHBOARD SKELETON ───────────── */
export function DashboardLoadingSkeleton() {
  return (
    <div className="p-3 h-full bg-white animate-fade-in">
      <div className="grid grid-cols-3 gap-2 h-full" style={{ gridTemplateRows: 'repeat(5, 1fr)' }}>
        {/* Overview - col 1, rows 1-3 */}
        <div className="bg-gradient-to-br from-white to-slate-50 border-[2px] border-black/20 rounded-[16px] p-3 overflow-hidden flex flex-col" style={{ gridColumn: '1', gridRow: '1 / span 3' }}>
          <div className="h-4 bg-slate-300 rounded w-20 mb-2 animate-pulse"></div>
          <div className="grid grid-cols-2 gap-3 flex-1">
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="bg-gradient-to-br from-slate-100 to-slate-50 border-[2px] border-black/15 rounded-[14px] p-4 flex flex-col justify-between">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-slate-300 rounded-lg animate-pulse"></div>
                  <div className="w-16 h-6 bg-slate-300 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <div className="h-3 bg-slate-300 rounded w-24 mb-2 animate-pulse"></div>
                  <div className="h-8 bg-slate-300 rounded w-16 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map - cols 2-3, rows 1-3 */}
        <div className="bg-gradient-to-br from-white to-slate-50 border-[2px] border-black/20 rounded-[16px] p-2 overflow-hidden flex flex-col" style={{ gridColumn: '2 / span 2', gridRow: '1 / span 3' }}>
          <div className="h-4 bg-slate-300 rounded w-40 mb-2 animate-pulse"></div>
          <div className="flex-1 bg-slate-200 rounded-lg animate-pulse"></div>
        </div>

        {/* Flight Status - col 1, rows 4-5 */}
        <div className="bg-gradient-to-br from-white to-slate-50 border-[2px] border-black/20 rounded-[16px] p-2 overflow-hidden flex flex-col" style={{ gridColumn: '1', gridRow: '4 / span 2' }}>
          <div className="h-4 bg-slate-300 rounded w-24 mb-2 animate-pulse"></div>
          <div className="flex-1 space-y-1 mb-2">
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="flex items-center justify-between p-1.5 bg-gradient-to-r from-slate-50 to-white rounded-lg border-[1px] border-black/20">
                <div className="flex-1">
                  <div className="h-3 bg-slate-300 rounded w-16 mb-1 animate-pulse"></div>
                  <div className="h-2 bg-slate-200 rounded w-24 animate-pulse"></div>
                </div>
                <div className="w-14 h-4 bg-slate-300 rounded-full animate-pulse"></div>
              </div>
            ))}
          </div>
          <div className="h-8 bg-slate-300 rounded-lg animate-pulse"></div>
        </div>

        {/* Shipments Table - cols 2-3, rows 4-5 */}
        <div className="bg-gradient-to-br from-white to-slate-50 border-[2px] border-black/20 rounded-[16px] p-2 overflow-hidden flex flex-col" style={{ gridColumn: '2 / span 2', gridRow: '4 / span 2' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="h-4 bg-slate-300 rounded w-32 animate-pulse"></div>
            <div className="flex gap-1 flex-1 ml-4">
              <div className="flex-1 h-7 bg-slate-200 rounded-lg animate-pulse"></div>
              <div className="w-16 h-7 bg-slate-300 rounded-lg animate-pulse"></div>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="border-b-[2px] border-black/20 pb-2 mb-2">
              <div className="flex gap-2">
                {['AWB', 'Origin', 'Dest', 'Flight', 'Status', 'Weight', 'Action'].map((_, idx) => (
                  <div key={idx} className="h-3 bg-slate-300 rounded flex-1 animate-pulse"></div>
                ))}
              </div>
            </div>
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="h-4 bg-slate-200 rounded flex-1 animate-pulse"></div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────── TRACKING SKELETON ───────────── */
export function TrackingLoadingSkeleton() {
  return (
    <div className="h-full flex flex-col bg-white animate-fade-in">
      {/* TopNavbar Skeleton */}
      <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-6 py-4 border-b-[2px] border-black/20">
        <div className="h-6 bg-slate-300 rounded w-48 mb-2 animate-pulse"></div>
        <div className="h-4 bg-slate-200 rounded w-64 animate-pulse"></div>
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1 overflow-y-auto">
        {/* Search Header */}
        <div className="bg-gradient-to-br from-white to-amber-50 border-[2px] border-black/20 rounded-[20px] p-4 min-h-[150px]">
          <div className="h-5 bg-slate-300 rounded w-40 mb-2 animate-pulse"></div>
          <div className="h-3 bg-slate-200 rounded w-80 mb-5 animate-pulse"></div>
          <div className="flex gap-2">
            <div className="flex-1 h-10 bg-slate-200 rounded-[12px] animate-pulse"></div>
            <div className="w-24 h-10 bg-slate-300 rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Shipment Details Card */}
        <div className="border-[2px] border-black/20 rounded-[20px] overflow-hidden">
          {/* Blue Top Section */}
          <div style={{ backgroundColor: '#183c88' }} className="px-4 py-4">
            <div className="h-3 bg-white/30 rounded w-32 mb-2 animate-pulse"></div>
            <div className="h-5 bg-white/40 rounded w-40 animate-pulse"></div>
          </div>
          {/* White Bottom Section */}
          <div className="bg-white px-4 py-6">
            <div className="grid grid-cols-4 gap-4">
              {['ORIGIN', 'DESTINATION', 'FLIGHT', 'EST.ARRIVAL'].map((_, idx) => (
                <div key={idx} className="text-center">
                  <div className="h-3 bg-slate-300 rounded w-20 mx-auto mb-2 animate-pulse"></div>
                  <div className="h-4 bg-slate-200 rounded w-16 mx-auto animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline Section */}
        <div className="border-[2px] border-black/20 rounded-[20px] overflow-hidden flex-1">
          <div className="bg-white px-4 py-3 border-b-[2px] border-black/20">
            <div className="h-4 bg-slate-300 rounded w-32 animate-pulse"></div>
          </div>
          <div className="bg-gradient-to-br from-white to-amber-50 px-4 py-6">
            <div className="flex justify-between items-start gap-2">
              {[...Array(5)].map((_, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div className="w-11 h-11 bg-slate-300 rounded-full mb-3 animate-pulse"></div>
                  <div className="h-3 bg-slate-300 rounded w-20 mb-2 animate-pulse"></div>
                  <div className="h-2 bg-slate-200 rounded w-16 mb-1 animate-pulse"></div>
                  <div className="h-2 bg-slate-200 rounded w-12 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────── FLIGHT STATUS SKELETON ───────────── */
export function FlightStatusLoadingSkeleton() {
  return (
    <div className="h-full flex flex-col bg-white animate-fade-in">
      {/* TopNavbar Skeleton */}
      <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-6 py-4 border-b-[2px] border-black/20">
        <div className="h-6 bg-slate-300 rounded w-48 mb-2 animate-pulse"></div>
        <div className="h-4 bg-slate-200 rounded w-64 animate-pulse"></div>
      </div>

      <div className="p-4 flex flex-col overflow-y-auto flex-1">
        <div className="bg-gradient-to-br from-white to-amber-50 border-[2px] border-black/20 rounded-[24px] overflow-hidden flex flex-col flex-1">
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 px-5 py-3 flex items-center justify-between border-b-[2px] border-black/20">
            <div>
              <div className="h-5 bg-slate-300 rounded w-32 mb-1 animate-pulse"></div>
              <div className="h-3 bg-slate-200 rounded w-48 animate-pulse"></div>
            </div>
            <div className="w-28 h-7 bg-slate-200 rounded-full animate-pulse"></div>
          </div>

          {/* Search Section */}
          <div className="bg-white px-6 py-5 border-b-[2px] border-black/20">
            <div className="h-3 bg-slate-200 rounded w-64 mb-3 animate-pulse"></div>
            <div className="flex gap-2">
              <div className="flex-1 h-10 bg-slate-200 rounded-[16px] animate-pulse"></div>
              <div className="w-20 h-10 bg-slate-300 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Table */}
          <div className="p-5 bg-white overflow-y-auto flex-1">
            <div className="bg-gradient-to-br from-white to-amber-50 border-[2px] border-black/20 rounded-[16px] overflow-hidden">
              <div className="border-b-[2px] border-black/20 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 px-4 py-3">
                <div className="flex gap-4">
                  {['Flight', 'Route', 'Scheduled', 'Status', 'Capacity', 'Action'].map((_, idx) => (
                    <div key={idx} className="h-3 bg-slate-300 rounded flex-1 animate-pulse"></div>
                  ))}
                </div>
              </div>
              <div className="p-4 space-y-3">
                {[...Array(6)].map((_, idx) => (
                  <div key={idx} className="flex gap-4 items-center">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-4 bg-slate-200 rounded flex-1 animate-pulse"></div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────── SHIPMENTS SKELETON ───────────── */
export function ShipmentsLoadingSkeleton() {
  return (
    <div className="h-full flex flex-col bg-white animate-fade-in">
      {/* TopNavbar Skeleton */}
      <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-6 py-4 border-b-[2px] border-black/20">
        <div className="h-6 bg-slate-300 rounded w-48 mb-2 animate-pulse"></div>
        <div className="h-4 bg-slate-200 rounded w-64 animate-pulse"></div>
      </div>

      <div className="p-4 flex flex-col overflow-y-auto flex-1">
        <div className="bg-gradient-to-br from-white to-amber-50 border-[2px] border-black/20 rounded-[24px] overflow-hidden flex flex-col flex-1">
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 px-5 py-3 flex items-center justify-between border-b-[2px] border-black/20">
            <div>
              <div className="h-5 bg-slate-300 rounded w-40 mb-1 animate-pulse"></div>
              <div className="h-3 bg-slate-200 rounded w-56 animate-pulse"></div>
            </div>
            <div className="flex gap-2">
              <div className="w-20 h-7 bg-slate-200 rounded-full animate-pulse"></div>
              <div className="w-16 h-7 bg-slate-300 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Search Section */}
          <div className="bg-white px-6 py-3 border-b-[2px] border-black/20">
            <div className="h-3 bg-slate-200 rounded w-48 mb-2 animate-pulse"></div>
            <div className="h-10 bg-slate-200 rounded-[16px] animate-pulse"></div>
          </div>

          {/* Table */}
          <div className="p-5 bg-white overflow-y-auto flex-1">
            <div className="bg-gradient-to-br from-white to-amber-50 border-[2px] border-black/20 rounded-[16px] overflow-hidden">
              <div className="border-b-[2px] border-black/20 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 px-4 py-3">
                <div className="flex gap-4">
                  {['AWB', 'Sender', 'Destination', 'Flight', 'Status', 'Weight', 'Action'].map((_, idx) => (
                    <div key={idx} className="h-3 bg-slate-300 rounded flex-1 animate-pulse"></div>
                  ))}
                </div>
              </div>
              <div className="p-4 space-y-3">
                {[...Array(6)].map((_, idx) => (
                  <div key={idx} className="flex gap-4 items-center">
                    {[...Array(7)].map((_, i) => (
                      <div key={i} className="h-4 bg-slate-200 rounded flex-1 animate-pulse"></div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────── USERS SKELETON ───────────── */
export function UsersLoadingSkeleton() {
  return (
    <div className="h-full flex flex-col bg-white animate-fade-in">
      {/* TopNavbar Skeleton */}
      <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-6 py-4 border-b-[2px] border-black/20">
        <div className="h-6 bg-slate-300 rounded w-48 mb-2 animate-pulse"></div>
        <div className="h-4 bg-slate-200 rounded w-64 animate-pulse"></div>
      </div>

      <div className="p-4 flex flex-col overflow-y-auto flex-1">
        <div className="bg-gradient-to-br from-white to-amber-50 border-[2px] border-black/20 rounded-[24px] overflow-hidden flex flex-col flex-1">
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 px-5 py-3 flex items-center justify-between border-b-[2px] border-black/20">
            <div>
              <div className="h-5 bg-slate-300 rounded w-36 mb-1 animate-pulse"></div>
              <div className="h-3 bg-slate-200 rounded w-48 animate-pulse"></div>
            </div>
            <div className="w-20 h-7 bg-slate-200 rounded-full animate-pulse"></div>
          </div>

          {/* Stats Badges */}
          <div className="px-5 py-3 flex gap-3 border-b-[2px] border-black/20 bg-white">
            <div className="w-24 h-6 bg-slate-200 rounded-full animate-pulse"></div>
            <div className="w-20 h-6 bg-slate-200 rounded-full animate-pulse"></div>
          </div>

          {/* Search Section */}
          <div className="bg-white px-6 py-3 border-b-[2px] border-black/20">
            <div className="h-3 bg-slate-200 rounded w-48 mb-2 animate-pulse"></div>
            <div className="h-10 bg-slate-200 rounded-[16px] animate-pulse"></div>
          </div>

          {/* Table */}
          <div className="p-5 bg-white overflow-y-auto flex-1">
            <div className="bg-gradient-to-br from-white to-amber-50 border-[2px] border-black/20 rounded-[16px] overflow-hidden">
              <div className="border-b-[2px] border-black/20 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 px-4 py-3">
                <div className="flex gap-4">
                  {['#', 'Name', 'Email', 'Role', 'Actions'].map((_, idx) => (
                    <div key={idx} className="h-3 bg-slate-300 rounded flex-1 animate-pulse"></div>
                  ))}
                </div>
              </div>
              <div className="p-4 space-y-3">
                {[...Array(6)].map((_, idx) => (
                  <div key={idx} className="flex gap-4 items-center">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-4 bg-slate-200 rounded flex-1 animate-pulse"></div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────── SETTINGS SKELETON ───────────── */
export function SettingsLoadingSkeleton() {
  return (
    <div className="h-full flex flex-col bg-white animate-fade-in">
      {/* TopNavbar Skeleton */}
      <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-6 py-4 border-b-[2px] border-black/20">
        <div className="h-6 bg-slate-300 rounded w-48 mb-2 animate-pulse"></div>
        <div className="h-4 bg-slate-200 rounded w-64 animate-pulse"></div>
      </div>

      <div className="p-4 flex flex-col overflow-hidden flex-1">
        <div className="flex-1 rounded-[20px] overflow-hidden flex" style={{ background: '#f0ebe3', border: '1.5px solid rgba(0,0,0,0.12)' }}>
          {/* Sidebar */}
          <div className="w-56 flex-shrink-0 flex flex-col justify-between p-4" style={{ background: '#e8e0d6' }}>
            <div className="space-y-1">
              {[...Array(4)].map((_, idx) => (
                <div key={idx} className="h-10 bg-slate-200 rounded-xl animate-pulse"></div>
              ))}
            </div>
            <div className="h-10 bg-slate-300 rounded-xl animate-pulse"></div>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-white overflow-y-auto p-8">
            <div className="h-8 bg-slate-300 rounded w-48 mb-6 animate-pulse"></div>
            <div className="flex gap-10">
              <div className="flex flex-col items-center gap-3">
                <div className="w-28 h-28 bg-slate-300 rounded-full animate-pulse"></div>
                <div className="w-32 h-7 bg-slate-200 rounded-lg animate-pulse"></div>
              </div>
              <div className="flex-1 space-y-4">
                <div className="h-16 bg-slate-200 rounded-xl animate-pulse"></div>
                <div className="h-16 bg-slate-200 rounded-xl animate-pulse"></div>
                <div className="h-16 bg-slate-200 rounded-xl animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────── GENERIC PAGE SKELETON (Fallback) ───────────── */
export function PageLoadingSkeleton() {
  return (
    <div className="h-full flex flex-col bg-white animate-fade-in">
      <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-6 py-4 border-b-[2px] border-black/20">
        <div className="h-6 bg-slate-300 rounded w-48 mb-2 animate-pulse"></div>
        <div className="h-4 bg-slate-200 rounded w-64 animate-pulse"></div>
      </div>

      <div className="p-4 flex flex-col overflow-y-auto flex-1">
        <div className="bg-gradient-to-br from-white to-amber-50 border-[2px] border-black/20 rounded-[24px] overflow-hidden flex flex-col flex-1">
          <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 px-5 py-3 border-b-[2px] border-black/20">
            <div className="h-5 bg-slate-300 rounded w-40 mb-2 animate-pulse"></div>
            <div className="h-3 bg-slate-200 rounded w-56 animate-pulse"></div>
          </div>

          <div className="bg-white px-6 py-3 border-b-[2px] border-black/20">
            <div className="h-3 bg-slate-200 rounded w-48 mb-2 animate-pulse"></div>
            <div className="h-10 bg-slate-200 rounded-[16px] w-full animate-pulse"></div>
          </div>

          <div className="p-5 space-y-3 bg-white overflow-y-auto flex-1">
            <div className="h-32 bg-slate-200 rounded-[16px] animate-pulse"></div>
            <div className="h-32 bg-slate-200 rounded-[16px] animate-pulse"></div>
            <div className="h-32 bg-slate-200 rounded-[16px] animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
