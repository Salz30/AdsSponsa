'use client'

import { useState, use, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'
import Link from 'next/link'
import { calculateDays, formatRupiah } from '@/lib/utils'
import { showLoadingAlert, showSuccessAlert, showErrorAlert, swalTheme } from '@/lib/swal'

import { useSession } from 'next-auth/react'

function BookingWizard({ slotId }: { slotId: number }) {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'
  const searchParams = useSearchParams()
  const router = useRouter()

  const startDateStr = searchParams.get('from') || ''
  const endDateStr = searchParams.get('to') || ''

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Step 2 Data
  const [campaignName, setCampaignName] = useState('')
  const [brandName, setBrandName] = useState('')
  const [targetUrl, setTargetUrl] = useState('')

  // Step 3 Data
  const [assetFile, setAssetFile] = useState<File | null>(null)

  // Step 4 Data
  const [bankName, setBankName] = useState('BCA')
  const [senderName, setSenderName] = useState('')
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null)

  const startDate = startDateStr ? new Date(startDateStr) : new Date()
  const endDate = endDateStr ? new Date(endDateStr) : new Date()
  const totalDays = calculateDays(startDate, endDate)
  const pricePerDay = parseInt(searchParams.get('price') || '0', 10)
  const totalPrice = totalDays * pricePerDay

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!assetFile || !paymentProofFile) {
      showErrorAlert('Berkas Tidak Lengkap', 'Harap unggah berkas materi iklan dan bukti transfer.')
      return
    }

    showLoadingAlert('Mengirim Pemesanan...')

    try {
      const formData = new FormData()
      formData.append('slotId', slotId.toString())
      formData.append('startDate', startDateStr)
      formData.append('endDate', endDateStr)
      formData.append('campaignName', campaignName)
      formData.append('brandName', brandName)
      formData.append('targetUrl', targetUrl)
      formData.append('bankName', bankName)
      formData.append('senderName', senderName)
      formData.append('assetFile', assetFile)
      formData.append('paymentProofFile', paymentProofFile)

      const res = await fetch('/api/bookings', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        showErrorAlert('Gagal', data.message || 'Pemesanan gagal dibuat.')
        setLoading(false)
        return
      }

      await swalTheme.fire({
        icon: 'success',
        title: 'Berhasil Dibuat!',
        text: 'Mengalihkan ke portal tracking pemesanan Anda...',
        iconColor: '#34d399',
        timer: 2000,
        showConfirmButton: false
      })
      
      router.push(`/track/${data.bookingCode}`)
    } catch {
      showErrorAlert('Terjadi kesalahan koneksi saat mengirim pemesanan.')
      setLoading(false)
    }
  }

  return (
    <>
      {isAdmin && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-xl shadow-xl">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚙️</span>
            <div>
              <strong className="block text-amber-300 text-sm">Mode Peninjauan Admin</strong>
              <p className="text-amber-200/80">Anda saat ini masuk sebagai Admin. Pemesanan slot iklan hanya diperuntukkan bagi akun Pengiklan (Advertiser).</p>
            </div>
          </div>
          <Link
            href="/admin/dashboard"
            className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 rounded-xl font-bold text-xs whitespace-nowrap transition-all shadow-md"
          >
            ← Buka Admin Dashboard
          </Link>
        </div>
      )}

      {/* Step Indicator Progress Bar */}
      <div className="mb-8 bg-white/5 border border-white/10 p-4 rounded-2xl">
        <div className="flex justify-between items-center text-xs font-semibold mb-3 text-purple-200">
          <span className={step >= 1 ? 'text-purple-300 font-bold' : ''}>
            1. Tanggal & Biaya
          </span>
          <span className={step >= 2 ? 'text-purple-300 font-bold' : ''}>
            2. Detail Kampanye
          </span>
          <span className={step >= 3 ? 'text-purple-300 font-bold' : ''}>
            3. Materi Iklan
          </span>
          <span className={step >= 4 ? 'text-purple-300 font-bold' : ''}>
            4. Pembayaran
          </span>
        </div>

        <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-white/5">
          <div
            className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full transition-all duration-500"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Wizard Form Card */}
      <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl">
        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                Langkah 1: Konfirmasi Jadwal & Biaya
              </h2>
              <p className="text-xs text-purple-200/70">
                Periksa kembali rentang tanggal penayangan iklan yang Anda pilih.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-900/60 rounded-xl border border-white/5">
              <div>
                <span className="block text-xs font-semibold text-purple-400">Tanggal Mulai</span>
                <span className="text-base font-bold text-white">{startDateStr || '-'}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-purple-400">Tanggal Selesai</span>
                <span className="text-base font-bold text-white">{endDateStr || '-'}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-purple-400">Total Hari Tayang</span>
                <span className="text-base font-bold text-purple-300">{totalDays} Hari</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-purple-400">Total Biaya</span>
                <span className="text-xl font-extrabold text-green-400">{formatRupiah(totalPrice)}</span>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Link
                href={`/slots/${slotId}`}
                className="px-5 py-2.5 text-xs font-semibold text-purple-200 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all"
              >
                ← Ubah Tanggal
              </Link>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-purple-600/30 transition-all"
              >
                Lanjut ke Detail Kampanye →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                Langkah 2: Informasi Kampanye
              </h2>
              <p className="text-xs text-purple-200/70">
                Lengkapi identitas kampanye dan alamat URL tautan tujuan (CTA).
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1">
                  NAMA KAMPANYE *
                </label>
                <input
                  type="text"
                  required
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="Contoh: Promo Promo Kemerdekaan Diskon 50%"
                  className="w-full px-4 py-3 bg-slate-900/60 border border-white/10 rounded-xl text-white placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1">
                  NAMA PERUSAHAAN / BRAND *
                </label>
                <input
                  type="text"
                  required
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Contoh: Kopi Kita Nusantara"
                  className="w-full px-4 py-3 bg-slate-900/60 border border-white/10 rounded-xl text-white placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1">
                  URL TUJUAN IKLAN / CTA (OPSIONAL)
                </label>
                <input
                  type="url"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://brandanda.com/promo"
                  className="w-full px-4 py-3 bg-slate-900/60 border border-white/10 rounded-xl text-white placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 text-xs font-semibold text-purple-200 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all"
              >
                ← Kembali
              </button>
              <button
                type="button"
                disabled={!campaignName || !brandName}
                onClick={() => setStep(3)}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white font-semibold text-xs rounded-xl shadow-lg shadow-purple-600/30 transition-all"
              >
                Lanjut ke Upload Materi →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                Langkah 3: Unggah Materi Iklan
              </h2>
              <p className="text-xs text-purple-200/70">
                Unggah berkas materi banner/audio/dokumen sesuai spesifikasi teknis slot.
              </p>
            </div>

            <div className="border-2 border-dashed border-purple-500/30 bg-purple-950/20 hover:bg-purple-950/40 rounded-2xl p-8 text-center transition-all cursor-pointer relative">
              <input
                type="file"
                required
                onChange={(e) => setAssetFile(e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <span className="text-4xl block mb-2">📁</span>
              <span className="block text-sm font-semibold text-purple-200">
                {assetFile ? assetFile.name : 'Klik atau seret berkas materi iklan ke sini'}
              </span>
              <span className="block text-xs text-purple-400 mt-1">
                {assetFile ? `${(assetFile.size / 1024 / 1024).toFixed(2)} MB` : 'Format sesuai ketentuan slot'}
              </span>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 text-xs font-semibold text-purple-200 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all"
              >
                ← Kembali
              </button>
              <button
                type="button"
                disabled={!assetFile}
                onClick={() => setStep(4)}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white font-semibold text-xs rounded-xl shadow-lg shadow-purple-600/30 transition-all"
              >
                Lanjut ke Pembayaran →
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <form onSubmit={handleSubmitBooking} className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                Langkah 4: Pembayaran & Unggah Bukti
              </h2>
              <p className="text-xs text-purple-200/70">
                Lakukan transfer bank sesuai nominal total lalu unggah foto bukti transfer.
              </p>
            </div>

            <div className="p-4 bg-purple-900/40 border border-purple-500/40 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-purple-300">Bank Tujuan:</span>
                <span className="font-bold text-white">BCA (Bank Central Asia)</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-purple-300">Nomor Rekening:</span>
                <span className="font-mono font-bold text-yellow-300 text-sm">8830-1928-3341</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-purple-300">Atas Nama:</span>
                <span className="font-bold text-white">PT MEDIA SPONSOR INDONESIA</span>
              </div>
              <div className="flex justify-between items-center text-xs pt-2 border-t border-purple-500/20">
                <span className="text-purple-300">Total Transfer:</span>
                <span className="font-extrabold text-green-400 text-lg">{formatRupiah(totalPrice)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1">
                  NAMA PEMILIK REKENING PENGIRIM *
                </label>
                <input
                  type="text"
                  required
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Contoh: Siska Indriani"
                  className="w-full px-4 py-3 bg-slate-900/60 border border-white/10 rounded-xl text-white placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1">
                  UNGGAH BUKTI TRANSFER (JPG/PNG/PDF) *
                </label>
                <input
                  type="file"
                  required
                  accept="image/*,application/pdf"
                  onChange={(e) => setPaymentProofFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-purple-300 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-5 py-2.5 text-xs font-semibold text-purple-200 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all"
              >
                ← Kembali
              </button>
              <button
                type="submit"
                disabled={loading || !senderName || !paymentProofFile || isAdmin}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:opacity-40 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-green-600/30 transition-all"
              >
                {isAdmin ? '🔒 Khusus Pengiklan' : loading ? 'Mengirim Pemesanan...' : '🚀 Kirim Pemesanan Sekarang'}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  )
}

export default function BookingFormPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const slotId = parseInt(resolvedParams.id, 10)

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <Suspense fallback={<div className="text-center text-purple-300 py-12">Memuat formulir pemesanan...</div>}>
          <BookingWizard slotId={slotId} />
        </Suspense>
      </main>
    </div>
  )
}
