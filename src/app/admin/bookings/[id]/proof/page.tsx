'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'
import Link from 'next/link'
import { toast } from 'sonner'

export default function AdminUploadProofPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const bookingId = parseInt(resolvedParams.id, 10)
  const router = useRouter()

  const [proofType, setProofType] = useState<'SCREENSHOT' | 'LIVE_LINK'>('SCREENSHOT')
  const [liveUrl, setLiveUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('proofType', proofType)
      if (liveUrl) formData.append('liveUrl', liveUrl)
      if (notes) formData.append('notes', notes)
      if (screenshotFile) formData.append('screenshotFile', screenshotFile)

      const res = await fetch(`/api/admin/bookings/${bookingId}/proof`, {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.message || 'Gagal menerbitkan bukti tayang.')
        setLoading(false)
        return
      }

      toast.success('Bukti tayang iklan berhasil diterbitkan!')
      router.push('/admin/dashboard')
    } catch {
      toast.error('Terjadi kesalahan koneksi.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <div className="mb-6 flex items-center gap-2 text-xs text-purple-300">
          <Link href="/admin/dashboard" className="hover:underline">
            ← Kembali ke Admin Dashboard
          </Link>
        </div>

        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2">
              📸 Proof of Performance Module
            </div>
            <h1 className="text-2xl font-bold text-white">
              Terbitkan Bukti Tayang Iklan
            </h1>
            <p className="text-xs text-purple-200/70">
              Unggah tangkapan layar publikasi atau sematkan tautan URL publikasi iklan untuk pengiklan.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-2">
                TIPE BUKTI TAYANG *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setProofType('SCREENSHOT')}
                  className={`py-3 px-4 rounded-xl text-xs font-semibold border text-center transition-all ${
                    proofType === 'SCREENSHOT'
                      ? 'bg-purple-600 border-purple-400 text-white shadow-lg'
                      : 'bg-white/5 border-white/10 text-purple-300 hover:bg-white/10'
                  }`}
                >
                  🖼️ Tangkapan Layar (Screenshot)
                </button>
                <button
                  type="button"
                  onClick={() => setProofType('LIVE_LINK')}
                  className={`py-3 px-4 rounded-xl text-xs font-semibold border text-center transition-all ${
                    proofType === 'LIVE_LINK'
                      ? 'bg-purple-600 border-purple-400 text-white shadow-lg'
                      : 'bg-white/5 border-white/10 text-purple-300 hover:bg-white/10'
                  }`}
                >
                  🔗 Tautan Langsung (Live Link URL)
                </button>
              </div>
            </div>

            {proofType === 'SCREENSHOT' ? (
              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1">
                  UNGGAH FOTO SCREENSHOT TAYANG *
                </label>
                <input
                  type="file"
                  required
                  accept="image/*"
                  onChange={(e) => setScreenshotFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-purple-300 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white cursor-pointer"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1">
                  URL LINK PUBLIKASI IKLAN *
                </label>
                <input
                  type="url"
                  required
                  value={liveUrl}
                  onChange={(e) => setLiveUrl(e.target.value)}
                  placeholder="https://instagram.com/p/xxx atau https://website.com/post/xxx"
                  className="w-full px-4 py-3 bg-slate-900/60 border border-white/10 rounded-xl text-white text-xs placeholder-purple-300/40"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-1">
                CATATAN DARI TIM MEDIA (OPSIONAL)
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Banner sudah tayang di posisi Header Top sejak pukul 08:00 WIB."
                className="w-full px-4 py-3 bg-slate-900/60 border border-white/10 rounded-xl text-white text-xs placeholder-purple-300/40"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all"
            >
              {loading ? 'Mempublikasikan...' : '🚀 Terbitkan Bukti Tayang'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
