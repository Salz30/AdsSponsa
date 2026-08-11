import Navbar from '@/components/navbar'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AdminSlotsTable from '@/components/admin/admin-slots-table'

export const revalidate = 0

export default async function AdminSlotsPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  const slots = await prisma.adSlot.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const formattedSlots = slots.map((slot) => ({
    ...slot,
    pricePerDay: Number(slot.pricePerDay),
  }))

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Kelola Slot Iklan</h1>
            <p className="text-sm text-purple-200/70 mt-1">
              Atur dan perbarui slot iklan yang tersedia untuk pengiklan.
            </p>
          </div>
          <div>
            <Link
              href="/admin/slots/create"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500"
            >
              + Tambah Slot Baru
            </Link>
          </div>
        </div>

        <AdminSlotsTable initialSlots={formattedSlots} />
      </main>
    </div>
  )
}
