'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'

export default function TrackSearchPage() {
  const [bookingCode, setBookingCode] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (bookingCode.trim()) {
      router.push(`/track/${bookingCode.trim()}`)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 mb-6 shadow-lg shadow-purple-500/30">
            <span className="text-2xl">🔎</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Portal Tracking Kampanye Iklan</h1>
          <p className="text-sm text-purple-200/70 mb-8">
            Masukkan kode booking Anda untuk melihat status pesanan dan laporan bukti tayang.
          </p>
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Contoh: SLOT-20260811-ABCD"
                value={bookingCode}
                onChange={(e) => setBookingCode(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/60 border border-white/10 rounded-xl text-white placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-500 text-center font-mono"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-600/30 transition-all"
            >
              Cari Pesanan
            </button>
          </form>
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-purple-300/50">
              💡 Tips: Kode booking dikirimkan ke email Anda saat pemesanan berhasil dibuat.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
