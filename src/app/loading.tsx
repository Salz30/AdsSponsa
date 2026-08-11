export default function Loading() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-slate-950 p-4">
      <div className="relative flex items-center justify-center mb-4">
        <div className="absolute inset-0 rounded-full border-t-2 border-purple-500 w-16 h-16 animate-spin"></div>
        <div className="rounded-full border-t-2 border-indigo-400 w-10 h-10 animate-spin" style={{ animationDelay: '150ms' }}></div>
      </div>
      <p className="text-purple-400 font-medium tracking-widest text-sm uppercase animate-pulse">
        Memuat...
      </p>
    </div>
  )
}
