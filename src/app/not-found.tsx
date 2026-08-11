import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
        <h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-indigo-600 mb-4 tracking-tighter">
          404
        </h1>
        <h2 className="text-3xl font-bold text-slate-100 mb-4">
          Halaman Tidak Ditemukan
        </h2>
        <p className="text-slate-400 mb-8 leading-relaxed">
          Halaman yang Anda cari tidak tersedia atau telah dipindahkan.
        </p>
        
        <Link
          href="/"
          className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-8 rounded-full transition-all duration-300 hover:shadow-[0_0_20px_rgba(147,51,234,0.4)] flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  )
}
