import Navbar from '@/components/navbar'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { CATEGORY_LABELS, CATEGORY_ICONS, formatRupiah } from '@/lib/utils'
import { AdSlotCategory } from '@prisma/client'

export const revalidate = 0

export default async function HomePage({
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

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 border-b border-white/10 bg-gradient-to-b from-purple-950/40 via-slate-950 to-slate-950">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-tr from-purple-600/20 to-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-6 shadow-inner">
            <span className="flex h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
            Platform Self-Service Slot Iklan Media Lokal
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
            Pesan Slot Iklan Media{' '}
            <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent">
              Transparan & Tanpa Ribet
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-purple-200/70 max-w-2xl mx-auto font-normal">
            Pilih slot banner website, podcast, newsletter, atau media sosial. Cek kalender ketersediaan ketersediaan secara real-time dan dapatkan bukti tayang resmi.
          </p>
        </div>
      </section>

      {/* Main Catalog Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
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
                const href = `/?${searchParams.toString()}`

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

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none w-full sm:w-auto">
            {[
              { key: 'ALL', label: 'Semua Harga' },
              { key: 'low', label: '< Rp 100.000/hari' },
              { key: 'mid', label: 'Rp 100.000 - Rp 300.000/hari' },
              { key: 'high', label: '> Rp 300.000/hari' },
            ].map((price) => {
              const isActive = price.key === 'ALL' ? !selectedPriceRange : selectedPriceRange === price.key
              
              const searchParams = new URLSearchParams()
              if (selectedCategory) searchParams.set('category', selectedCategory)
              if (price.key !== 'ALL') searchParams.set('priceRange', price.key)
              const href = `/?${searchParams.toString()}`

              return (
                <Link
                  key={price.key}
                  href={href}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 border ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-400/50 text-white shadow-lg shadow-purple-600/30'
                      : 'bg-white/5 border-white/10 text-purple-200/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span>{price.label}</span>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Slot Grid Cards */}
        {slots.length === 0 ? (
          <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl p-8">
            <span className="text-4xl block mb-3">🔍</span>
            <h3 className="text-xl font-bold text-white mb-1">Slot Iklan Tidak Ditemukan</h3>
            <p className="text-sm text-purple-200/70">
              Belum ada slot iklan aktif di kategori ini. Silakan pilih kategori lain.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {slots.map((slot) => (
              <div
                key={slot.id}
                className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/40 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-purple-900/60 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
                      <span>{CATEGORY_ICONS[slot.category]}</span>
                      <span>{CATEGORY_LABELS[slot.category]}</span>
                    </span>

                    <div className="text-right">
                      <span className="text-2xl font-bold text-white">
                        {formatRupiah(Number(slot.pricePerDay))}
                      </span>
                      <span className="text-xs text-purple-300/70 block">/ hari</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors mb-2">
                    {slot.title}
                  </h3>

                  <p className="text-sm text-purple-200/70 leading-relaxed mb-6 line-clamp-3">
                    {slot.description}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-6 p-3 bg-black/20 rounded-xl border border-white/5 text-xs">
                    <div>
                      <span className="block text-purple-400 font-medium">Spesifikasi</span>
                      <span className="text-white font-semibold truncate block">
                        {slot.dimensionsSpec || 'Sesuai Standar'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-purple-400 font-medium">Format Berkas</span>
                      <span className="text-white font-semibold truncate block">
                        {slot.allowedFormats} (max {slot.maxFileSizeMb}MB)
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  href={`/slots/${slot.id}`}
                  className="w-full py-3 px-4 bg-gradient-to-r from-purple-600/90 to-indigo-600/90 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold text-sm rounded-xl text-center shadow-lg shadow-purple-600/20 group-hover:shadow-purple-500/40 transition-all flex items-center justify-center gap-2"
                >
                  <span>Lihat Kalender & Pesan</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 bg-slate-950 text-center text-xs text-purple-300/60">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 Sponsor Desk — AdSlot Manager System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
