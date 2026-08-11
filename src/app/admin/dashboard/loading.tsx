export default function AdminDashboardLoading() {
  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-950 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-8 w-48 bg-slate-800 rounded-lg animate-pulse mb-2"></div>
          <div className="h-4 w-64 bg-slate-800 rounded-lg animate-pulse"></div>
        </div>
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <div className="w-10 h-10 rounded-full bg-slate-800/50 animate-pulse"></div>
            </div>
            <div className="h-5 w-24 bg-slate-800 rounded-md animate-pulse mb-4"></div>
            <div className="h-8 w-32 bg-slate-800 rounded-lg animate-pulse mb-2"></div>
            <div className="h-4 w-40 bg-slate-800/50 rounded-md animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden mt-8">
        <div className="p-6 border-b border-slate-800">
          <div className="h-6 w-40 bg-slate-800 rounded-lg animate-pulse"></div>
        </div>
        <div className="p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between border-b border-slate-800/50 pb-4 last:border-0 last:pb-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-800 animate-pulse"></div>
                <div>
                  <div className="h-4 w-32 bg-slate-800 rounded-md animate-pulse mb-2"></div>
                  <div className="h-3 w-24 bg-slate-800/50 rounded-md animate-pulse"></div>
                </div>
              </div>
              <div className="h-6 w-20 bg-slate-800 rounded-full animate-pulse"></div>
              <div className="h-4 w-24 bg-slate-800 rounded-md animate-pulse"></div>
              <div className="h-8 w-8 bg-slate-800 rounded-md animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
