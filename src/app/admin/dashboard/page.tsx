import Navbar from '@/components/navbar'
import AdminDashboardTable from '@/components/admin/admin-dashboard-table'
import { prisma } from '@/lib/prisma'
import { formatRupiah } from '@/lib/utils'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin Dashboard | Adsponsa' }

export const revalidate = 0

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>
}) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  const resolvedParams = await searchParams
  const page = Number(resolvedParams.page) || 1
  const currentStatus = resolvedParams.status || 'ALL'

  // Pagination logic
  const ITEMS_PER_PAGE = 15
  const currentPage = Math.max(1, page)
  const skip = (currentPage - 1) * ITEMS_PER_PAGE
  const take = ITEMS_PER_PAGE

  const where = currentStatus !== 'ALL' ? { status: currentStatus as any } : {}

  // Metrics Calculation
  const totalBookings = await prisma.booking.count()
  const pendingReviewCount = await prisma.booking.count({
    where: { status: 'PENDING_REVIEW' },
  })
  const activeCount = await prisma.booking.count({
    where: { status: { in: ['SCHEDULED', 'LIVE'] } },
  })

  // Total Earnings from Verified Payments
  const verifiedPayments = await prisma.payment.aggregate({
    where: { status: 'VERIFIED' },
    _sum: { amount: true },
  })

  const totalEarnings = Number(verifiedPayments._sum.amount || 0)

  // Get total count for pagination
  const totalItems = await prisma.booking.count({ where })
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)

  // Fetch all bookings for table
  const bookings = await prisma.booking.findMany({
    where,
    include: {
      user: { select: { name: true, email: true, phoneNumber: true } },
      adSlot: { select: { title: true, category: true, pricePerDay: true } },
      assets: true,
      payment: true,
      proofs: true,
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take,
  })

  // Format Decimal to numbers for client components
  const formattedBookings = bookings.map((b) => ({
    ...b,
    totalPrice: Number(b.totalPrice),
    startDate: b.startDate.toISOString(),
    endDate: b.endDate.toISOString(),
    createdAt: b.createdAt.toISOString(),
    adSlot: {
      ...b.adSlot,
      pricePerDay: Number(b.adSlot.pricePerDay),
    },
    payment: b.payment
      ? {
          ...b.payment,
          amount: Number(b.payment.amount),
        }
      : null,
  }))

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 flex-1 w-full space-y-6 md:space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-2">
              ⚙️ Admin Operation Control
            </div>
            <h1 className="text-3xl font-extrabold text-white">
              Media Owner Dashboard
            </h1>
            <p className="text-sm text-purple-200/70">
              Kelola persetujuan materi iklan, verifikasi bukti pembayaran, dan terbitkan bukti tayang.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-2 md:mt-0">
            <a
              href="/admin/slots"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600/20 border border-purple-500/30 px-4 py-2.5 text-sm font-semibold text-purple-300 shadow-sm hover:bg-purple-600/30 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500"
            >
              📋 Kelola Slot Iklan
            </a>
            <a
              href="/api/admin/export"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500"
            >
              📥 Ekspor CSV
            </a>
          </div>
        </div>

        {/* Metric Cards Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-purple-950/20 to-slate-900/90 border border-emerald-500/20 rounded-2xl p-5 backdrop-blur-xl shadow-xl hover:border-emerald-500/40 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400/90">
                Total Pendapatan
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-lg shadow-inner">
                💰
              </div>
            </div>
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 block tracking-tight">
              {formatRupiah(totalEarnings)}
            </span>
            <span className="text-[11px] text-emerald-300/60 mt-1 block">
              ✓ Pembayaran terverifikasi
            </span>
          </div>

          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-purple-950/20 to-slate-900/90 border border-amber-500/20 rounded-2xl p-5 backdrop-blur-xl shadow-xl hover:border-amber-500/40 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400/90">
                Menunggu Review
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-lg shadow-inner">
                ⏳
              </div>
            </div>
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-300 block tracking-tight">
              {pendingReviewCount}{' '}
              <span className="text-xs font-normal text-amber-200/60">booking</span>
            </span>
            <span className="text-[11px] text-amber-300/60 mt-1 block">
              Perlu konfirmasi admin
            </span>
          </div>

          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-purple-950/20 to-slate-900/90 border border-purple-500/20 rounded-2xl p-5 backdrop-blur-xl shadow-xl hover:border-purple-500/40 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-300">
                Kampanye Aktif
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-lg shadow-inner">
                📡
              </div>
            </div>
            <span className="text-2xl sm:text-3xl font-extrabold text-purple-300 block tracking-tight">
              {activeCount}{' '}
              <span className="text-xs font-normal text-purple-200/60">iklan</span>
            </span>
            <span className="text-[11px] text-purple-300/60 mt-1 block">
              Scheduled & Live
            </span>
          </div>

          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-purple-950/20 to-slate-900/90 border border-white/10 rounded-2xl p-5 backdrop-blur-xl shadow-xl hover:border-white/20 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-200/80">
                Total Pemesanan
              </span>
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg shadow-inner">
                📊
              </div>
            </div>
            <span className="text-2xl sm:text-3xl font-extrabold text-white block tracking-tight">
              {totalBookings}{' '}
              <span className="text-xs font-normal text-purple-200/60">total</span>
            </span>
            <span className="text-[11px] text-purple-200/60 mt-1 block">
              Semua status transaksi
            </span>
          </div>
        </div>

        {/* Interactive Data Table Component */}
        <AdminDashboardTable
          initialBookings={formattedBookings}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          currentStatus={currentStatus}
        />
      </main>
    </div>
  )
}
