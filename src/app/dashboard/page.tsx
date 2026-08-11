import Navbar from '@/components/navbar'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS, formatRupiah, formatDate } from '@/lib/utils'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Pesanan Saya | Sponsor Desk' }

export const revalidate = 0

export default async function AdvertiserDashboardPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }
  if (session.user.role === 'ADMIN') {
    redirect('/admin/dashboard')
  }

  const userId = parseInt(session.user.id, 10)

  const bookings = await prisma.booking.findMany({
    where: { userId },
    include: {
      adSlot: true,
      proofs: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-2">
              📊 Portal Pengiklan (Advertiser)
            </div>
            <h1 className="text-3xl font-extrabold text-white">
              Pesanan Saya
            </h1>
            <p className="text-sm text-purple-200/70">
              Pantau status penayangan kampanye dan unduh bukti tayang resmi.
            </p>
          </div>

          <Link
            href="/"
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2"
          >
            <span>+ Pesan Slot Iklan Baru</span>
          </Link>
        </div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <div className="text-center py-16 bg-white/5 border border-white/10 rounded-2xl p-8 space-y-4">
            <span className="text-4xl block">📢</span>
            <h3 className="text-xl font-bold text-white">Belum Ada Pemesanan Iklan</h3>
            <p className="text-xs text-purple-200/70 max-w-sm mx-auto">
              Anda belum melakukan pemesanan slot iklan. Jelajahi katalog slot media kami dan buat pemesanan pertama Anda!
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl transition-all"
            >
              Lihat Katalog Slot
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="bg-white/5 border border-white/10 hover:border-purple-500/30 backdrop-blur-xl rounded-2xl p-6 transition-all shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-purple-300 text-sm">
                      #{b.bookingCode}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${
                        BOOKING_STATUS_COLORS[b.status as keyof typeof BOOKING_STATUS_COLORS]
                      }`}
                    >
                      {BOOKING_STATUS_LABELS[b.status as keyof typeof BOOKING_STATUS_LABELS]}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white">{b.campaignName}</h3>
                  <p className="text-xs text-purple-200/70">
                    Slot: <strong className="text-white">{b.adSlot.title}</strong> | Periode:{' '}
                    <strong className="text-white">
                      {formatDate(b.startDate)} - {formatDate(b.endDate)}
                    </strong>
                  </p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/10 pt-3 md:pt-0">
                  <div className="text-left md:text-right">
                    <span className="block text-[10px] text-purple-300">Total Biaya</span>
                    <span className="text-base font-extrabold text-green-400">
                      {formatRupiah(Number(b.totalPrice))}
                    </span>
                  </div>

                  <Link
                    href={`/track/${b.bookingCode}`}
                    className="px-4 py-2 bg-purple-600/90 hover:bg-purple-600 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                  >
                    Buka Portal Tracking ↗
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
