'use client'

import { useState, useEffect } from 'react'
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS, formatRupiah, formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import Link from 'next/link'
import { swalTheme, showLoadingAlert, showSuccessAlert, showErrorAlert } from '@/lib/swal'

interface BookingData {
  id: number
  bookingCode: string
  campaignName: string
  brandName: string
  targetUrl: string | null
  startDate: string
  endDate: string
  totalPrice: number
  status: string
  rejectionReason: string | null
  notes: string | null
  createdAt: string
  user: { name: string; email: string; phoneNumber: string | null }
  adSlot: { title: string; category: string; pricePerDay: number }
  assets: { id: number; filePath: string; fileType: string; fileSizeKb: number }[]
  payment: { id: number; amount: number; bankName: string; senderName: string; proofFilePath: string; status: string } | null
}

export default function AdminDashboardTable({
  initialBookings,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  currentStatus = 'ALL',
}: {
  initialBookings: BookingData[]
  currentPage?: number
  totalPages?: number
  totalItems?: number
  currentStatus?: string
}) {
  const [bookings, setBookings] = useState<BookingData[]>(initialBookings)
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  // Sync state when props change
  useEffect(() => {
    setBookings(initialBookings)
  }, [initialBookings])

  // We don't filter client-side anymore since the server handles it
  const filteredBookings = bookings

  const handleAction = async (action: 'APPROVE' | 'REJECT') => {
    if (!selectedBooking) return

    const result = await swalTheme.fire({
      title: action === 'APPROVE' ? 'Setujui Pesanan?' : 'Tolak Pesanan?',
      text: action === 'APPROVE' 
        ? 'Pesanan ini akan dijadwalkan dan siap tayang.' 
        : 'Pesanan ini akan ditolak dan dikembalikan ke pengiklan.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: action === 'APPROVE' ? 'Ya, Setujui' : 'Ya, Tolak',
      cancelButtonText: 'Batal',
    })

    if (!result.isConfirmed) return

    showLoadingAlert()

    try {
      const res = await fetch(`/api/admin/bookings/${selectedBooking.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          rejectionReason: action === 'REJECT' ? rejectionReason : undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        showErrorAlert('Gagal memproses aksi', data.message)
        return
      }

      showSuccessAlert('Berhasil', data.message)
      setBookings((prev) =>
        prev.map((b) =>
          b.id === selectedBooking.id
            ? {
                ...b,
                status: action === 'APPROVE' ? 'SCHEDULED' : 'REJECTED',
                rejectionReason: action === 'REJECT' ? rejectionReason : null,
              }
            : b
        )
      )

      setSelectedBooking(null)
      setRejectionReason('')
    } catch {
      showErrorAlert('Terjadi kesalahan koneksi.')
    }
  }

  const handleDelete = async (id: number) => {
    const result = await swalTheme.fire({
      title: 'Hapus Pesanan Permanen?',
      text: 'Semua data terkait termasuk materi iklan dan bukti bayar akan ikut terhapus.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#e11d48', // rose-600
    })

    if (!result.isConfirmed) return

    showLoadingAlert('Menghapus...')

    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (!res.ok) {
        showErrorAlert('Gagal', data.message)
        return
      }

      showSuccessAlert('Dihapus', data.message)
      setBookings((prev) => prev.filter((b) => b.id !== id))
    } catch {
      showErrorAlert('Terjadi kesalahan koneksi.')
    }
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 shadow-2xl backdrop-blur-xl">
      {/* Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h3 className="text-lg font-bold text-white">Daftar Pemesanan Masuk</h3>

        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {['ALL', 'PENDING_REVIEW', 'SCHEDULED', 'LIVE', 'COMPLETED', 'REJECTED'].map((st) => (
            <Link
              key={st}
              href={`?status=${st}&page=1`}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                currentStatus === st
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-white/5 text-purple-300/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              {st === 'ALL' ? 'Semua Status' : BOOKING_STATUS_LABELS[st as keyof typeof BOOKING_STATUS_LABELS]}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-8 text-purple-300/60 text-sm">
            Tidak ada pemesanan yang cocok dengan filter.
          </div>
        ) : (
          filteredBookings.map((b) => (
            <div key={b.id} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3 relative shadow-sm">
              <div className="flex justify-between items-start gap-2">
                <div className="overflow-hidden">
                  <Link href={`/track/${b.bookingCode}`} className="font-mono font-bold text-white hover:underline text-sm flex items-center gap-1.5 truncate">
                    <span>#{b.bookingCode}</span>
                  </Link>
                  <span className="block text-xs text-purple-300/70 mt-0.5 truncate">{b.adSlot.title}</span>
                </div>
                <span
                  className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                    BOOKING_STATUS_COLORS[b.status as keyof typeof BOOKING_STATUS_COLORS]
                  }`}
                >
                  {BOOKING_STATUS_LABELS[b.status as keyof typeof BOOKING_STATUS_LABELS]}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="overflow-hidden">
                  <span className="block text-purple-400/80 font-semibold text-[10px] uppercase mb-0.5">Pengiklan / Brand</span>
                  <span className="text-white font-semibold truncate block">{b.brandName}</span>
                </div>
                <div className="overflow-hidden text-right">
                  <span className="block text-purple-400/80 font-semibold text-[10px] uppercase mb-0.5">Total Biaya</span>
                  <span className="text-emerald-400 font-extrabold truncate block">{formatRupiah(b.totalPrice)}</span>
                </div>
              </div>
              
              <div>
                <span className="block text-purple-400/80 font-semibold text-[10px] uppercase mb-0.5">Periode Tayang</span>
                <span className="text-purple-200/90 text-xs">{formatDate(b.startDate)} - {formatDate(b.endDate)}</span>
              </div>

              <div className="pt-3 border-t border-white/10 flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedBooking(b)}
                  className="flex-1 min-w-[100px] px-3 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg font-bold text-[11px] shadow-md shadow-purple-600/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>🔍 Review</span>
                </button>
                {['SCHEDULED', 'LIVE', 'COMPLETED'].includes(b.status) && (
                  <Link
                    href={`/admin/bookings/${b.id}/proof`}
                    className="flex-1 min-w-[100px] px-3 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg font-bold text-[11px] shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>📸 Proof</span>
                  </Link>
                )}
                <button
                  onClick={() => handleDelete(b.id)}
                  className="flex-none px-3 py-2.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 rounded-lg font-bold text-[11px] shadow-md transition-all flex items-center justify-center gap-1.5"
                  title="Hapus Pesanan"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Data Table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-white/5">
        <table className="w-full text-left text-xs text-purple-200">
          <thead className="bg-slate-900/80 text-purple-300 uppercase tracking-wider font-semibold border-b border-white/10">
            <tr>
              <th className="p-4">Kode Booking</th>
              <th className="p-4">Pengiklan / Brand</th>
              <th className="p-4">Slot Iklan</th>
              <th className="p-4">Periode Tayang</th>
              <th className="p-4">Total Biaya</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-purple-300/60">
                  Tidak ada pemesanan yang cocok dengan filter.
                </td>
              </tr>
            ) : (
              filteredBookings.map((b) => (
                <tr key={b.id} className="hover:bg-white/5 transition-colors group">
                  <td className="p-4 font-mono font-bold text-white whitespace-nowrap">
                    <Link href={`/track/${b.bookingCode}`} className="hover:underline text-purple-300 flex items-center gap-1.5">
                      <span>#{b.bookingCode}</span>
                    </Link>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-white block">{b.brandName}</span>
                    <span className="text-[10px] text-purple-300/70 font-medium">{b.user.name} ({b.user.email})</span>
                  </td>
                  <td className="p-4 font-semibold text-white whitespace-nowrap">
                    {b.adSlot.title}
                  </td>
                  <td className="p-4 text-purple-200/90 whitespace-nowrap">
                    {formatDate(b.startDate)} - {formatDate(b.endDate)}
                  </td>
                  <td className="p-4 font-extrabold text-emerald-400 whitespace-nowrap">
                    {formatRupiah(b.totalPrice)}
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold border ${
                        BOOKING_STATUS_COLORS[b.status as keyof typeof BOOKING_STATUS_COLORS]
                      }`}
                    >
                      {BOOKING_STATUS_LABELS[b.status as keyof typeof BOOKING_STATUS_LABELS]}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => setSelectedBooking(b)}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold text-[11px] shadow-md shadow-purple-600/20 transition-all inline-flex items-center gap-1"
                    >
                      <span>🔍 Review</span>
                    </button>
                    {['SCHEDULED', 'LIVE', 'COMPLETED'].includes(b.status) && (
                      <Link
                        href={`/admin/bookings/${b.id}/proof`}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold text-[11px] shadow-md shadow-emerald-600/20 transition-all inline-flex items-center gap-1"
                      >
                        <span>📸 Proof</span>
                      </Link>
                    )}
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="px-3.5 py-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 rounded-xl font-bold text-[11px] shadow-md transition-all inline-flex items-center gap-1"
                      title="Hapus"
                    >
                      <span>🗑️</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-4">
          <p className="text-xs text-purple-300/70">
            Menampilkan halaman {currentPage} dari {totalPages} ({totalItems} total)
          </p>
          <div className="flex items-center gap-2">
            {currentPage > 1 ? (
              <Link
                href={`?status=${currentStatus}&page=${currentPage - 1}`}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs transition-colors"
              >
                Sebelumnya
              </Link>
            ) : (
              <button disabled className="px-3 py-1.5 bg-white/5 opacity-50 cursor-not-allowed text-white rounded-lg text-xs">
                Sebelumnya
              </button>
            )}
            
            {currentPage < totalPages ? (
              <Link
                href={`?status=${currentStatus}&page=${currentPage + 1}`}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs transition-colors"
              >
                Selanjutnya
              </Link>
            ) : (
              <button disabled className="px-3 py-1.5 bg-white/5 opacity-50 cursor-not-allowed text-white rounded-lg text-xs">
                Selanjutnya
              </button>
            )}
          </div>
        </div>
      )}

      {/* Review Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-white/20 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white">
                  Peninjauan Pemesanan #{selectedBooking.bookingCode}
                </h3>
                <span className="text-xs text-purple-300">
                  Diajukan oleh {selectedBooking.user.name} ({selectedBooking.user.email})
                </span>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-purple-300 hover:text-white text-xl font-bold"
              >
                ✕
              </button>
            </div>

            {/* Campaign & Pricing Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-white/5 rounded-xl border border-white/5 text-xs">
              <div>
                <span className="block text-purple-400 font-semibold">Nama Kampanye</span>
                <span className="text-white font-bold">{selectedBooking.campaignName}</span>
              </div>
              <div>
                <span className="block text-purple-400 font-semibold">Nama Brand</span>
                <span className="text-white font-bold">{selectedBooking.brandName}</span>
              </div>
              <div>
                <span className="block text-purple-400 font-semibold">Slot Iklan</span>
                <span className="text-white font-bold">{selectedBooking.adSlot.title}</span>
              </div>
              <div>
                <span className="block text-purple-400 font-semibold">Total Tagihan</span>
                <span className="text-green-400 font-extrabold text-sm">
                  {formatRupiah(selectedBooking.totalPrice)}
                </span>
              </div>
            </div>

            {/* Special Instructions / Notes */}
            {selectedBooking.notes && (
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs space-y-1">
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  <span>📌</span> Catatan Khusus / Request Penayangan Pengiklan:
                </span>
                <p className="text-amber-100 whitespace-pre-wrap leading-relaxed">
                  {selectedBooking.notes}
                </p>
              </div>
            )}

            {/* Uploaded Material Preview */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Materi Iklan Yang Diunggah Pengiklan:
              </h4>
              {selectedBooking.assets.length === 0 ? (
                <p className="text-xs text-purple-300/60">Tidak ada materi file.</p>
              ) : (
                selectedBooking.assets.map((asset) => {
                  const isFallback = asset.filePath.startsWith('/uploads/fallback/')
                  return (
                    <div key={asset.id} className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-purple-200 truncate max-w-xs">{asset.filePath}</span>
                        {isFallback ? (
                          <span className="px-3 py-1 bg-red-900/50 border border-red-500/30 text-red-300 font-semibold rounded-lg text-[11px]">
                            ⚠️ File Tidak Tersedia
                          </span>
                        ) : (
                          <a
                            href={asset.filePath}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg text-[11px]"
                          >
                            Buka Berkas ↗
                          </a>
                        )}
                      </div>
                      {isFallback && (
                        <p className="text-[10px] text-red-300/80 bg-red-950/30 border border-red-500/20 rounded-lg px-3 py-2">
                          ❌ Materi iklan gagal tersimpan ke cloud storage saat upload. Supabase Storage belum dikonfigurasi di environment produksi. Minta pengiklan untuk mengirim ulang pemesanan setelah storage dikonfigurasi.
                        </p>
                      )}
                    </div>
                  )
                })
              )}
            </div>

            {/* Uploaded Payment Proof Preview */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Bukti Transfer Bank ({selectedBooking.payment?.bankName || 'BCA'}):
              </h4>
              {selectedBooking.payment ? (() => {
                const isFallback = selectedBooking.payment.proofFilePath.startsWith('/uploads/fallback/')
                return (
                  <div className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="block text-white font-bold">
                          Pengirim: {selectedBooking.payment.senderName}
                        </span>
                        <span className="block text-purple-300 text-[10px]">
                          Nominal: {formatRupiah(selectedBooking.payment.amount)}
                        </span>
                      </div>
                      {isFallback ? (
                        <span className="px-3 py-1 bg-red-900/50 border border-red-500/30 text-red-300 font-semibold rounded-lg text-[11px]">
                          ⚠️ File Tidak Tersedia
                        </span>
                      ) : (
                        <a
                          href={selectedBooking.payment.proofFilePath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg text-[11px]"
                        >
                          Lihat Bukti Bayar ↗
                        </a>
                      )}
                    </div>
                    {isFallback && (
                      <p className="text-[10px] text-red-300/80 bg-red-950/30 border border-red-500/20 rounded-lg px-3 py-2">
                        ❌ Bukti transfer gagal tersimpan ke cloud storage saat upload. Supabase Storage belum dikonfigurasi di environment produksi. Minta pengiklan untuk mengirim ulang pemesanan setelah storage dikonfigurasi.
                      </p>
                    )}
                  </div>
                )
              })() : (
                <p className="text-xs text-purple-300/60">Bukti pembayaran belum diunggah.</p>
              )}
            </div>

            {/* Approval Controls */}
            {selectedBooking.status === 'PENDING_REVIEW' && (
              <div className="pt-4 border-t border-white/10 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-purple-200 mb-1">
                    Alasan Penolakan (Hanya diisi jika menolak):
                  </label>
                  <input
                    type="text"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Contoh: Bukti transfer tidak terbaca atau materi melebihi batas durasi."
                    className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-purple-300/40"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => handleAction('REJECT')}
                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
                  >
                    🚫 Tolak Booking
                  </button>
                  <button
                    onClick={() => handleAction('APPROVE')}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
                  >
                    ✅ Setujui & Jadwalkan
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
