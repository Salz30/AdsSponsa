'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AdPlacementMockup from '@/components/ad-placement-mockup'
import { calculateDays, formatRupiah } from '@/lib/utils'
import { showLoadingAlert, showErrorAlert, swalTheme } from '@/lib/swal'
import { useSession } from 'next-auth/react'

export default function BookingWizard({ slotId }: { slotId: number }) {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'
  const searchParams = useSearchParams()
  const router = useRouter()

  const category = searchParams.get('category') || 'WEBSITE'
  const slotTitle = searchParams.get('title') || 'Slot Iklan'

  const startDateStr = searchParams.get('from') || ''
  const endDateStr = searchParams.get('to') || ''

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [assetUploading, setAssetUploading] = useState(false)

  // Step 2 Data
  const [campaignName, setCampaignName] = useState('')
  const [brandName, setBrandName] = useState('')
  const [targetUrl, setTargetUrl] = useState('')
  const [notes, setNotes] = useState('')

  // Step 3 Data — file selection
  const [assetFile, setAssetFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Step 3 — after upload to /api/upload
  const [assetUrl, setAssetUrl] = useState<string | null>(null)
  const [assetFileType, setAssetFileType] = useState<string>('')
  const [assetFileSizeKb, setAssetFileSizeKb] = useState<number>(0)

  // Step 4 Data
  const [bankName] = useState('BCA')
  const [senderName, setSenderName] = useState('')
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null)
  const [copiedBank, setCopiedBank] = useState(false)

  const startDate = startDateStr ? new Date(startDateStr) : new Date()
  const endDate = endDateStr ? new Date(endDateStr) : new Date()
  const totalDays = calculateDays(startDate, endDate)
  const pricePerDay = parseInt(searchParams.get('price') || '0', 10)
  const totalPrice = totalDays * pricePerDay

  const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024 // 4 MB per file

  const handleAssetFileChange = (file: File | null) => {
    if (file && file.size > MAX_FILE_SIZE_BYTES) {
      showErrorAlert(
        'Ukuran Berkas Terlalu Besar',
        `Berkas "${file.name}" (${(file.size / 1024 / 1024).toFixed(1)} MB) melebihi batas maksimal 4 MB. Harap kompres/pilih berkas yang lebih kecil.`
      )
      setAssetFile(null)
      setPreviewUrl(null)
      return
    }
    setAssetFile(file)
    setAssetUrl(null) // Reset URL when file changes
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }
  }

  const handlePaymentProofChange = (file: File | null) => {
    if (file && file.size > MAX_FILE_SIZE_BYTES) {
      showErrorAlert(
        'Ukuran Berkas Terlalu Besar',
        `Bukti transfer (${(file.size / 1024 / 1024).toFixed(1)} MB) melebihi batas maksimal 4 MB. Harap gunakan tangkapan layar (screenshot) dengan ukuran di bawah 4 MB.`
      )
      setPaymentProofFile(null)
      return
    }
    setPaymentProofFile(file)
  }

  const handleCopyBank = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedBank(true)
    setTimeout(() => setCopiedBank(false), 2000)
  }

  // Upload asset file separately, then advance to step 4
  const handleUploadAssetAndAdvance = async () => {
    if (!assetFile) return

    setAssetUploading(true)
    showLoadingAlert('Mengunggah Materi Iklan...')

    try {
      const fd = new FormData()
      fd.append('file', assetFile)
      fd.append('fileType', 'asset')
      fd.append('tempId', `TMP-${Date.now()}`)

      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const rawText = await res.text()
      let data: any = {}
      try {
        data = JSON.parse(rawText)
      } catch {
        if (res.status === 413 || rawText.includes('Request Entity Too Large')) {
          showErrorAlert(
            'Berkas Terlalu Besar (413)',
            'Materi iklan melebihi batas 4.5 MB Vercel. Harap kompres berkas dan coba lagi.'
          )
          return
        }
        showErrorAlert('Upload Gagal', 'Terjadi kesalahan server. Silakan coba lagi.')
        return
      }

      if (!res.ok) {
        showErrorAlert('Upload Materi Gagal', data.message || 'Gagal mengunggah materi iklan. Silakan coba lagi.')
        return
      }

      setAssetUrl(data.url)
      setAssetFileType(data.fileType || assetFile.type)
      setAssetFileSizeKb(data.fileSizeKb || Math.round(assetFile.size / 1024))
      swalTheme.close()
      setStep(4)
    } catch (err: any) {
      showErrorAlert('Upload Gagal', err?.message || 'Terjadi kesalahan koneksi. Silakan coba lagi.')
    } finally {
      setAssetUploading(false)
    }
  }

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!paymentProofFile) {
      showErrorAlert('Berkas Tidak Lengkap', 'Harap unggah bukti transfer sebelum mengirim pemesanan.')
      return
    }
    if (!assetUrl) {
      showErrorAlert(
        'Materi Iklan Belum Diunggah',
        'Harap kembali ke Langkah 3 dan unggah ulang materi iklan terlebih dahulu.'
      )
      return
    }

    setLoading(true)
    showLoadingAlert('Mengunggah Bukti Transfer...')

    try {
      // Step A — Upload proof file separately
      const fd = new FormData()
      fd.append('file', paymentProofFile)
      fd.append('fileType', 'proof')
      fd.append('tempId', `TMP-${Date.now()}`)

      const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd })
      const uploadRaw = await uploadRes.text()
      let uploadData: any = {}
      try {
        uploadData = JSON.parse(uploadRaw)
      } catch {
        if (uploadRes.status === 413 || uploadRaw.includes('Request Entity Too Large')) {
          showErrorAlert(
            'Ukuran Berkas Terlalu Besar (413)',
            'Ukuran bukti transfer melebihi batas 4.5 MB. Harap gunakan screenshot yang lebih kecil dan coba lagi.'
          )
          setLoading(false)
          return
        }
        showErrorAlert('Upload Gagal', 'Terjadi kesalahan server. Silakan coba lagi.')
        setLoading(false)
        return
      }

      if (!uploadRes.ok) {
        showErrorAlert('Upload Bukti Gagal', uploadData.message || 'Gagal mengunggah bukti transfer. Silakan coba lagi.')
        setLoading(false)
        return
      }

      const proofUrl = uploadData.url
      showLoadingAlert('Menyimpan Data Pemesanan...')

      // Step B — Submit booking as lightweight JSON (no binary files)
      const bookingRes = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotId,
          startDate: startDateStr,
          endDate: endDateStr,
          campaignName,
          brandName,
          targetUrl,
          notes,
          bankName,
          senderName,
          assetUrl,
          assetFileType,
          assetFileSizeKb,
          proofUrl,
        }),
      })

      const bookingRaw = await bookingRes.text()
      let bookingData: any = {}
      try {
        bookingData = JSON.parse(bookingRaw)
      } catch {
        showErrorAlert('Gagal Menyimpan Pemesanan', 'Terjadi kesalahan server saat menyimpan data. Silakan coba lagi.')
        setLoading(false)
        return
      }

      if (!bookingRes.ok) {
        showErrorAlert('Gagal', bookingData.message || 'Pemesanan gagal dibuat.')
        setLoading(false)
        return
      }

      await swalTheme.fire({
        icon: 'success',
        title: 'Berhasil Dibuat!',
        text: 'Mengalihkan ke portal tracking pemesanan Anda...',
        iconColor: '#34d399',
        timer: 2000,
        showConfirmButton: false,
      })

      router.push(`/track/${bookingData.bookingCode}`)
    } catch (err: any) {
      console.error('Submission Catch Error:', err)
      showErrorAlert(
        'Gagal Mengirim Pemesanan',
        err?.message || 'Terjadi kesalahan pada koneksi server. Silakan coba lagi.'
      )
      setLoading(false)
    }
  }

  return (
    <>
      {/* Wizard Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2 text-xs font-semibold text-purple-300">
          <span className={step >= 1 ? 'text-purple-300' : 'text-purple-300/40'}>
            1. Ringkasan
          </span>
          <span className={step >= 2 ? 'text-purple-300' : 'text-purple-300/40'}>
            2. Detail Kampanye
          </span>
          <span className={step >= 3 ? 'text-purple-300' : 'text-purple-300/40'}>
            3. Unggah Materi
          </span>
          <span className={step >= 4 ? 'text-purple-300' : 'text-purple-300/40'}>
            4. Pembayaran
          </span>
        </div>
        <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-white/10">
          <div
            className="bg-gradient-to-r from-purple-600 to-indigo-500 h-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Admin Notice */}
      {isAdmin && (
        <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-center justify-between">
          <span>
            ⚠️ Anda sedang masuk sebagai <strong>Admin</strong> (Mode Peninjauan). Admin tidak dapat mengirim pemesanan. Masuk sebagai pengiklan untuk memesan.
          </span>
          <Link href="/login" className="underline font-bold hover:text-white">
            Ganti Akun
          </Link>
        </div>
      )}

      {/* Main Wizard Form Container */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                Langkah 1: Konfirmasi Tanggal &amp; Slot
              </h2>
              <p className="text-xs text-purple-200/70">
                Periksa kembali tanggal penayangan dan estimasi total biaya iklan Anda.
              </p>
            </div>

            <div className="p-4 bg-slate-900/60 border border-white/10 rounded-xl space-y-3 text-xs">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-purple-300">Tanggal Mulai:</span>
                <span className="font-bold text-white">{startDateStr || '-'}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-purple-300">Tanggal Selesai:</span>
                <span className="font-bold text-white">{endDateStr || '-'}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-purple-300">Total Durasi:</span>
                <span className="font-bold text-purple-300">{totalDays} Hari</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-white font-semibold">Total Biaya:</span>
                <span className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-white">
                  {formatRupiah(totalPrice)}
                </span>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Link
                href={`/slots/${slotId}`}
                className="px-5 py-2.5 text-xs font-semibold text-purple-200 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all"
              >
                ← Kembali ke Detail Slot
              </Link>
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!startDateStr || !endDateStr}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
              >
                Lanjut ke Detail Kampanye →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setStep(3)
            }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                Langkah 2: Detail Kampanye &amp; Request Khusus
              </h2>
              <p className="text-xs text-purple-200/70">
                Isi informasi kampanye brand Anda dan catatan spesifik untuk pengelola media.
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
                  placeholder="Contoh: Promo Diskon Kemerdekaan 2026"
                  className="w-full px-4 py-3 bg-slate-900/60 border border-white/10 rounded-xl text-white placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1">
                  NAMA BRAND / PERUSAHAAN *
                </label>
                <input
                  type="text"
                  required
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Contoh: PT Medika Utama"
                  className="w-full px-4 py-3 bg-slate-900/60 border border-white/10 rounded-xl text-white placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1">
                  URL TUJUAN / LINK LANDING PAGE (OPSIONAL)
                </label>
                <input
                  type="url"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://brandanda.com/promo"
                  className="w-full px-4 py-3 bg-slate-900/60 border border-white/10 rounded-xl text-white placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1">
                  📌 CATATAN KHUSUS / REQUEST PENAYANGAN (OPSIONAL)
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Request upload jam 19.00 WIB, tag akun IG @brandkami, tambahkan hashtag #PromoAgustus"
                  className="w-full px-4 py-3 bg-slate-900/60 border border-white/10 rounded-xl text-white placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs"
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
                type="submit"
                disabled={!campaignName || !brandName}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
              >
                Lanjut ke Unggah Materi →
              </button>
            </div>
          </form>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                Langkah 3: Unggah Materi Iklan &amp; Live Preview
              </h2>
              <p className="text-xs text-purple-200/70">
                Unggah berkas foto/desain iklan dan lihat simulasi tampilan di frame penayangan.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1">
                  BERKAS MATERI IKLAN (JPG/PNG/GIF/MP4, MAKS 4 MB) *
                </label>
                <input
                  type="file"
                  accept="image/*,video/mp4"
                  onChange={(e) => handleAssetFileChange(e.target.files?.[0] || null)}
                  className="w-full text-xs text-purple-300 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500 cursor-pointer"
                />
                {assetUrl && (
                  <p className="mt-1 text-[10px] text-emerald-400 font-semibold">
                    ✅ Materi berhasil diunggah. Lanjut ke Pembayaran.
                  </p>
                )}
              </div>

              {/* LIVE PLACEMENT MOCKUP PREVIEW */}
              <div className="p-4 bg-slate-900/60 border border-white/10 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-300">
                    🖼️ LIVE PLACEMENT PREVIEW (SIMULASI NYATA)
                  </span>
                  <span className="text-[10px] text-purple-300/60">
                    Posisi: {category}
                  </span>
                </div>
                <div className="flex justify-center bg-black/40 p-4 rounded-xl border border-white/5">
                  <AdPlacementMockup
                    category={category}
                    slotTitle={slotTitle}
                    previewUrl={previewUrl}
                  />
                </div>
              </div>
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
                onClick={handleUploadAssetAndAdvance}
                disabled={!assetFile || assetUploading}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
              >
                {assetUploading ? '⏳ Mengunggah Materi...' : '⬆️ Unggah & Lanjut ke Pembayaran →'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <form onSubmit={handleSubmitBooking} className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                Langkah 4: Pembayaran &amp; Unggah Bukti
              </h2>
              <p className="text-xs text-purple-200/70">
                Lakukan transfer bank sesuai nominal total lalu unggah foto bukti transfer.
              </p>
            </div>

            <div className="p-4 bg-purple-900/40 border border-purple-500/40 rounded-xl space-y-2 relative">
              <div className="flex justify-between items-center text-xs">
                <span className="text-purple-300">Bank Tujuan:</span>
                <span className="font-bold text-white">BCA (Bank Central Asia)</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-purple-300">Nomor Rekening:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-yellow-300 text-sm">8830-1928-3341</span>
                  <button
                    type="button"
                    onClick={() => handleCopyBank('883019283341')}
                    className="px-2 py-0.5 text-[10px] font-semibold bg-purple-600 hover:bg-purple-500 text-white rounded transition-all"
                  >
                    {copiedBank ? '✓ Tersalin' : '📋 Salin'}
                  </button>
                </div>
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
                  UNGGAH BUKTI TRANSFER (JPG/PNG/PDF, MAKS 4 MB) *
                </label>
                <input
                  type="file"
                  required
                  accept="image/*,application/pdf"
                  onChange={(e) => handlePaymentProofChange(e.target.files?.[0] || null)}
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
