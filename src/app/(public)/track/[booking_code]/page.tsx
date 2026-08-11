import Navbar from '@/components/navbar'
import { prisma } from '@/lib/prisma'
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS, formatRupiah, formatDate } from '@/lib/utils'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import CancelBookingButton from '@/components/cancel-booking-button'

export const revalidate = 0

export async function generateMetadata({ params }: { params: Promise<{ booking_code: string }> }): Promise<Metadata> {
  const { booking_code } = await params
  
  return {
    title: `Tracking Kampanye #${booking_code} | Adsponsa`,
  }
}

export default async function ClientTrackingPage({
  params,
}: {
  params: Promise<{ booking_code: string }>
}) {
  const { booking_code } = await params

  const booking = await prisma.booking.findUnique({
    where: { bookingCode: booking_code },
    include: {
      adSlot: true,
      assets: true,
      payment: true,
      proofs: {
        orderBy: { uploadedAt: 'desc' },
      },
    },
  })

  if (!booking) notFound()

  // Map status to progress step index (1..5)
  const getStepIndex = (status: string) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return 1
      case 'PENDING_REVIEW':
        return 2
      case 'SCHEDULED':
        return 3
      case 'LIVE':
        return 4
      case 'COMPLETED':
        return 5
      case 'REJECTED':
        return 0
      default:
        return 1
    }
  }

  const currentStep = getStepIndex(booking.status)

  const steps = [
    { title: 'Pemesanan Dibuat', desc: 'Detail dikirim' },
    { title: 'Verifikasi Bayar', desc: 'Tim meninjau bayar' },
    { title: 'Terjadwal', desc: 'Disetujui & siap tayang' },
    { title: 'Sedang Tayang', desc: 'Iklan aktif publik' },
    { title: 'Selesai', desc: 'Laporan diterbitkan' },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        {/* Header Summary */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold font-mono text-purple-300">
                #{booking.bookingCode}
              </h1>
              <span
                className={`px-3 py-1 rounded-md text-xs font-semibold border ${
                  BOOKING_STATUS_COLORS[booking.status as keyof typeof BOOKING_STATUS_COLORS]
                }`}
              >
                {BOOKING_STATUS_LABELS[booking.status as keyof typeof BOOKING_STATUS_LABELS]}
              </span>
            </div>

            <p className="text-lg font-bold text-white mb-1">{booking.campaignName}</p>
            <p className="text-xs text-purple-200/70">
              Brand: <span className="font-semibold text-white">{booking.brandName}</span> | Slot:{' '}
              <span className="font-semibold text-white">{booking.adSlot.title}</span>
            </p>
          </div>

          <div className="text-right flex flex-col items-end gap-3">
            <div>
              <span className="block text-xs text-purple-300">Total Biaya Kampanye</span>
              <span className="text-xl font-extrabold text-green-400">
                {formatRupiah(Number(booking.totalPrice))}
              </span>
            </div>
            
            {(booking.status === 'PENDING_PAYMENT' || booking.status === 'PENDING_REVIEW') && (
              <CancelBookingButton bookingId={booking.id} />
            )}
          </div>
        </div>

        {/* Progress Bar Steps Tracker */}
        {booking.status === 'REJECTED' ? (
          <div className="bg-rose-950/40 border border-rose-500/40 p-6 rounded-2xl text-center space-y-2">
            <span className="text-3xl block">🚫</span>
            <h3 className="text-lg font-bold text-rose-300">Pemesanan Ini Ditolak</h3>
            <p className="text-xs text-rose-200/80 max-w-md mx-auto">
              Alasan: {booking.rejectionReason || 'Materi atau pembayaran tidak sesuai dengan kriteria.'}
            </p>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6">
              Status Progres Kampanye Iklan
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative">
              {steps.map((st, idx) => {
                const stepNum = idx + 1
                const isDone = currentStep >= stepNum
                const isCurrent = currentStep === stepNum

                return (
                  <div key={st.title} className="flex flex-col items-center text-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition-all ${
                        isDone
                          ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/40 ring-2 ring-purple-400'
                          : 'bg-white/5 text-purple-300/40 border border-white/10'
                      }`}
                    >
                      {isDone ? '✓' : stepNum}
                    </div>
                    <span
                      className={`text-xs font-semibold ${
                        isCurrent
                          ? 'text-purple-300 font-bold'
                          : isDone
                          ? 'text-white'
                          : 'text-purple-300/40'
                      }`}
                    >
                      {st.title}
                    </span>
                    <span className="text-[10px] text-purple-300/50 mt-0.5">{st.desc}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Campaign Schedule & Proof of Performance Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Schedule Info */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Jadwal & Spesifikasi Tayang
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-purple-300">Tanggal Mulai:</span>
                <span className="font-bold text-white">{formatDate(booking.startDate)}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-purple-300">Tanggal Selesai:</span>
                <span className="font-bold text-white">{formatDate(booking.endDate)}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-purple-300">Tautan Tujuan (CTA):</span>
                <span className="font-bold text-white truncate max-w-[200px]">
                  {booking.targetUrl ? (
                    <a href={booking.targetUrl} target="_blank" rel="noreferrer" className="text-purple-300 hover:underline">
                      {booking.targetUrl} ↗
                    </a>
                  ) : (
                    'Tidak Ada Link'
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Proof of Performance Section */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center justify-between">
              <span>Bukti Tayang (Proof of Performance)</span>
              <span className="text-xs font-normal text-purple-300">
                {booking.proofs.length} Bukti Diterbitkan
              </span>
            </h3>

            {booking.proofs.length === 0 ? (
              <div className="text-center py-6 text-xs text-purple-300/60 bg-black/20 rounded-xl border border-white/5">
                <span>⏳ Bukti tayang akan diterbitkan oleh tim media saat iklan mulai tayang.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {booking.proofs.map((proof) => (
                  <div
                    key={proof.id}
                    className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-2 text-xs"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-purple-300">
                        {proof.proofType === 'SCREENSHOT' ? '🖼️ Tangkapan Layar' : '🔗 Tautan Publikasi'}
                      </span>
                      <span className="text-[10px] text-purple-400">
                        {formatDate(proof.uploadedAt)}
                      </span>
                    </div>

                    {proof.notes && (
                      <p className="text-[11px] text-purple-200/80 italic">"{proof.notes}"</p>
                    )}

                    <a
                      href={proof.contentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] rounded-lg transition-all"
                    >
                      Buka Bukti Tayang ↗
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
