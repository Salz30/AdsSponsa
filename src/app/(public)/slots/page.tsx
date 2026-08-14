import Navbar from '@/components/navbar'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { CATEGORY_LABELS, CATEGORY_ICONS, formatRupiah } from '@/lib/utils'
import { AdSlotCategory } from '@prisma/client'

export const revalidate = 0

export default async function SlotsCatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; priceRange?: string }>
}) {
  const params = await searchParams
  const selectedCategory = params.category as AdSlotCategory | undefined
  const selectedPriceRange = params.priceRange

  let priceFilter = {}
  if (selectedPriceRange === 'low') {
    priceFilter = { pricePerDay: { lt: 100000 } }
  } else if (selectedPriceRange === 'mid') {
    priceFilter = { pricePerDay: { gte: 100000, lte: 300000 } }
  } else if (selectedPriceRange === 'high') {
    priceFilter = { pricePerDay: { gt: 300000 } }
  }

  const slots = await prisma.adSlot.findMany({
    where: {
      isActive: true,
      ...(selectedCategory ? { category: selectedCategory } : {}),
      ...priceFilter,
    },
    orderBy: { createdAt: 'desc' },
  })

  const categories = [
    { key: 'ALL', label: 'Semua Media', icon: '✨' },
    { key: AdSlotCategory.WEBSITE, label: 'Website', icon: '🌐' },
    { key: AdSlotCategory.PODCAST, label: 'Podcast', icon: '🎙️' },
    { key: AdSlotCategory.NEWSLETTER, label: 'Newsletter', icon: '📧' },
    { key: AdSlotCategory.SOCIAL_MEDIA, label: 'Social Media', icon: '📱' },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col selection:bg-purple-500 selection:text-white">
      <Navbar />

      {/* Header Banner */}
      <section className="border-b border-white/10 bg-gradient-to-b from-purple-950/40 via-slate-950 to-slate-950 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-3">
            📢 Marketplace Slot Iklan Media
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-indigo-200 bg-clip-text text-transparent">
            Katalog Slot Iklan Media Lokal
          </h1>
          <p className="text-xs sm:text-sm text-purple-200/70 mt-1 max-w-2xl">
            Pilih slot iklan yang sesuai dengan target audiens kampanye brand Anda. Transparan, langsung, dan dilengkapi bukti tayang resmi.
          </p>
        </div>
      </section>

      {/* Main Catalog Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {/* Category & Price Filters */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none w-full sm:w-auto">
              {categories.map((cat) => {
                const isActive =
                  cat.key === 'ALL'
                    ? !selectedCategory
                    : selectedCategory === cat.key

                const searchParams = new URLSearchParams()
                if (cat.key !== 'ALL') searchParams.set('category', cat.key)
                if (selectedPriceRange) searchParams.set('priceRange', selectedPriceRange)
                const href = `/slots?${searchParams.toString()}`

                return (
                  <Link
                    key={cat.key}
                    href={href}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 border ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-400/50 text-white shadow-lg shadow-purple-600/30'
                        : 'bg-white/5 border-white/10 text-purple-200/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </Link>
                )
              })}
            </div>

            <span className="text-xs text-purple-300/60 font-medium">
              Menampilkan {slots.length} slot iklan tersedia
            </span>
          </div>

          {/* Price Range Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none w-full sm:w-auto">
            {[
              { key: 'all', label: 'Semua Harga' },
              { key: 'low', label: '< Rp 100.000/hari' },
              { key: 'mid', label: 'Rp 100.000 - Rp 300.000/hari' },
              { key: 'high', label: '> Rp 300.000/hari' },
            ].map((p) => {
              const isActive =
                p.key === 'all'
                  ? !selectedPriceRange
                  : selectedPriceRange === p.key

              const searchParams = new URLSearchParams()
              if (selectedCategory) searchParams.set('category', selectedCategory)
              if (p.key !== 'all') searchParams.set('priceRange', p.key)
              const href = `/slots?${searchParams.toString()}`

              return (
                <Link
                  key={p.key}
                  href={href}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap border ${
                    isActive
                      ? 'bg-purple-600/40 border-purple-500/60 text-purple-200 font-semibold'
                      : 'bg-slate-900/40 border-white/5 text-purple-300/60 hover:text-white'
                  }`}
                >
                  {p.label}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Slot Grid */}
        {slots.length === 0 ? (
          <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10 p-8 space-y-4">
            <div className="text-4xl">🔍</div>
            <h3 className="text-lg font-bold text-white">Tidak Ada Slot Iklan Ditemukan</h3>
            <p className="text-xs text-purple-200/60 max-w-md mx-auto">
              Belum ada slot iklan yang sesuai dengan filter kategori atau rentang harga ini. Coba pilih filter lain.
            </p>
            <Link
              href="/slots"
              className="inline-block px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg"
            >
              Reset Filter
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {slots.map((slot) => (
              <div
                key={slot.id}
                className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-900/20 transition-all duration-300 group"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-2xl p-2.5 bg-white/5 border border-white/10 rounded-xl group-hover:scale-110 transition-transform">
                      {CATEGORY_ICONS[slot.category] || '📢'}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      {CATEGORY_LABELS[slot.category] || slot.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                      {slot.title}
                    </h3>
                    <p className="text-xs text-purple-200/70 mt-1 line-clamp-2 leading-relaxed">
                      {slot.description || 'Slot iklan media lokal siap tayang dengan bukti performa resmi.'}
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-white/5 text-xs text-purple-200/60">
                    {slot.dimensionsSpec && (
                      <div className="flex items-center justify-between">
                        <span>Dimensi Spec:</span>
                        <span className="font-semibold text-white">{slot.dimensionsSpec}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span>Format Berkas:</span>
                      <span className="font-semibold text-purple-300">{slot.allowedFormats}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] text-purple-300/60 uppercase font-semibold">Harga Penayangan</span>
                    <span className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-indigo-200 to-white">
                      {formatRupiah(Number(slot.pricePerDay))}
                      <span className="text-xs text-purple-300 font-normal">/hari</span>
                    </span>
                  </div>

                  <Link
                    href={`/slots/${slot.id}`}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-600/30 transition-all flex items-center gap-1 group-hover:gap-2"
                  >
                    <span>Cek Slot</span>
                    <span>→</span>
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
