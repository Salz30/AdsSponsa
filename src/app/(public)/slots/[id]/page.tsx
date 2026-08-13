import Navbar from '@/components/navbar'
import CalendarPicker from '@/components/calendar-picker'
import AdPlacementMockup from '@/components/ad-placement-mockup'
import { prisma } from '@/lib/prisma'
import { CATEGORY_LABELS, CATEGORY_ICONS, formatRupiah, BLOCKING_STATUSES } from '@/lib/utils'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

export const revalidate = 0

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const slotId = parseInt(id, 10)
  
  if (isNaN(slotId)) return { title: 'Slot Iklan Media | Adsponsa' }
  
  const slot = await prisma.adSlot.findUnique({
    where: { id: slotId },
    select: { title: true }
  })
  
  if (!slot) return { title: 'Slot Iklan Media | Adsponsa' }
  
  return {
    title: `${slot.title} — Slot Iklan Media | Adsponsa`,
  }
}

export default async function SlotDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const slotId = parseInt(id, 10)

  if (isNaN(slotId)) notFound()

  const slot = await prisma.adSlot.findUnique({
    where: { id: slotId },
    include: {
      bookings: {
        where: {
          status: { in: BLOCKING_STATUSES },
        },
        select: {
          startDate: true,
          endDate: true,
        },
      },
    },
  })

  if (!slot || !slot.isActive) notFound()

  const blockedRanges = slot.bookings.map((b) => ({
    startDate: b.startDate.toISOString(),
    endDate: b.endDate.toISOString(),
  }))

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs text-purple-300/70">
          <Link href="/" className="hover:text-white transition-colors">
            Katalog Slot
          </Link>
          <span>/</span>
          <span className="text-white font-medium">{slot.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Specifications & Information */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-semibold bg-purple-900/60 text-purple-300 border border-purple-500/30 mb-4">
                <span>{CATEGORY_ICONS[slot.category]}</span>
                <span>{CATEGORY_LABELS[slot.category]}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
                {slot.title}
              </h1>

              <div className="text-3xl font-extrabold text-purple-300 mb-6">
                {formatRupiah(Number(slot.pricePerDay))}{' '}
                <span className="text-sm font-normal text-purple-200/60">/ hari tayang</span>
              </div>

              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                Deskripsi Slot & Ketentuan
              </h3>
              <p className="text-sm text-purple-200/80 leading-relaxed mb-8">
                {slot.description}
              </p>

              {/* Technical Specifications */}
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                Spesifikasi Teknis Materi Iklan
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-black/30 rounded-xl border border-white/5">
                  <span className="block text-xs font-semibold text-purple-400 mb-1">
                    Dimensi / Durasi
                  </span>
                  <span className="text-sm font-bold text-white">
                    {slot.dimensionsSpec || 'Tidak ada batasan dimensi spesifik'}
                  </span>
                </div>

                <div className="p-4 bg-black/30 rounded-xl border border-white/5">
                  <span className="block text-xs font-semibold text-purple-400 mb-1">
                    Format Ekstensi Berkas
                  </span>
                  <span className="text-sm font-bold text-white">
                    {slot.allowedFormats}
                  </span>
                </div>

                <div className="p-4 bg-black/30 rounded-xl border border-white/5">
                  <span className="block text-xs font-semibold text-purple-400 mb-1">
                    Maksimal Ukuran Berkas
                  </span>
                  <span className="text-sm font-bold text-white">
                    {slot.maxFileSizeMb} MB
                  </span>
                </div>

                <div className="p-4 bg-black/30 rounded-xl border border-white/5">
                  <span className="block text-xs font-semibold text-purple-400 mb-1">
                    Laporan Bukti Tayang
                  </span>
                  <span className="text-sm font-bold text-white text-green-400 flex items-center gap-1">
                    <span>✓</span> Otomatis di Portal Tracking
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Placement Mockup Simulation */}
            <AdPlacementMockup
              category={slot.category}
              slotTitle={slot.title}
            />
          </div>

          {/* Right Column: Availability Calendar & Calculator */}
          <div className="lg:col-span-5">
            <CalendarPicker
              slotId={slot.id}
              pricePerDay={Number(slot.pricePerDay)}
              category={slot.category}
              slotTitle={slot.title}
              blockedRanges={blockedRanges}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
