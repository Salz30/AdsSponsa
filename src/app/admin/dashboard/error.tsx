'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-950 p-4">
      <div className="max-w-md w-full bg-slate-900/50 backdrop-blur-xl border border-red-500/20 p-8 rounded-2xl shadow-2xl flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h2 className="text-xl font-bold text-slate-100 mb-2">Gagal Memuat Dashboard Admin</h2>
        <p className="text-slate-400 mb-8 text-sm">
          Terjadi kesalahan saat memuat data dashboard. Silakan coba beberapa saat lagi.
        </p>

        <div className="flex flex-col w-full gap-3">
          <button
            onClick={() => reset()}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Coba Lagi
          </button>
          
          <Link
            href="/"
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  )
}
