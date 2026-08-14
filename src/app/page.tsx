import Navbar from '@/components/navbar'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { CATEGORY_LABELS, CATEGORY_ICONS, formatRupiah } from '@/lib/utils'
import { AdSlotCategory } from '@prisma/client'

export const revalidate = 0

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; priceRange?: string }>
}) {
  const session = await auth()
  const user = session?.user

  // If Admin logged in, redirect directly to Admin Dashboard
  if (user?.role === 'ADMIN') {
    redirect('/admin/dashboard')
  }

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

  // ════════════════════════════════════════════════════════════════════════════
  // 1. AUTHENTICATED CUSTOMER VIEW (MARKETPLACE CATALOG DIRECT ACCESS)
  // ════════════════════════════════════════════════════════════════════════════
  if (user) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col selection:bg-purple-500 selection:text-white">
        <Navbar />

        {/* Authenticated Customer Welcome Banner */}
        <section className="relative overflow-hidden pt-12 pb-14 border-b border-white/10 bg-gradient-to-b from-purple-950/50 via-slate-950 to-slate-950">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-tr from-purple-600/20 to-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-3">
                  👋 Selamat Datang Kembali, <span className="text-white font-bold">{user.name}</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-indigo-200 bg-clip-text text-transparent">
                  Pilih Slot Iklan Untuk Kampanye Anda
                </h1>
                <p className="text-xs sm:text-sm text-purple-200/70 mt-1 max-w-2xl">
                  Telusuri slot media lokal pilihan, cek jadwal penayangan real-time, dan ajukan pesanan sponsorship langsung tanpa perantara.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="px-4 py-2.5 bg-purple-900/40 hover:bg-purple-800/50 border border-purple-500/30 text-purple-200 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                >
                  <span>📊 Pesanan Saya</span>
                </Link>
                <Link
                  href="/track"
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                >
                  <span>🎯 Tracking Code</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Catalog Section */}
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
                const href = `/?${searchParams.toString()}`

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

          {/* Slot Cards Grid */}
          {slots.length === 0 ? (
            <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10 p-8 space-y-4">
              <div className="text-4xl">🔍</div>
              <h3 className="text-lg font-bold text-white">Tidak Ada Slot Iklan Ditemukan</h3>
              <p className="text-xs text-purple-200/60 max-w-md mx-auto">
                Belum ada slot iklan yang sesuai dengan filter kategori atau rentang harga ini. Coba pilih filter lain.
              </p>
              <Link
                href="/"
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

  // ════════════════════════════════════════════════════════════════════════════
  // 2. UNAUTHENTICATED PUBLIC LANDING PAGE (VISITOR / GUEST VIEW)
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col selection:bg-purple-500 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 border-b border-white/10 bg-gradient-to-b from-purple-950/60 via-slate-950 to-slate-950">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-gradient-to-tr from-purple-600/25 to-indigo-600/25 blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold shadow-inner">
            <span className="flex h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
            Platform Direct Sponsorship & Management Slot Iklan Media
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-5xl mx-auto leading-tight">
            Hubungkan Brand Anda dengan Audience Media Lokal{' '}
            <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent">
              Secara Direct & Transparan
            </span>
          </h1>

          <p className="text-base sm:text-lg text-purple-200/70 max-w-3xl mx-auto font-normal leading-relaxed">
            Pasang iklan di website berita lokal, Instagram Story, newsletter, atau podcast tanpa negosiasi manual yang rumit. Cek ketersediaan jadwal secara real-time dan dapatkan bukti tayang resmi.
          </p>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/slots"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-purple-600/30 transition-all flex items-center justify-center gap-2 group"
            >
              <span>📢 Jelajahi Katalog Slot Media</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-sm rounded-2xl backdrop-blur-md transition-all text-center"
            >
              🚀 Daftar Akun Pengiklan
            </Link>
          </div>

          {/* Key Value Proposition Grid */}
          <div className="pt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto text-left">
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md space-y-2 hover:border-purple-500/40 transition-colors">
              <span className="text-2xl block">📅</span>
              <h3 className="text-sm font-bold text-white">Kalender Real-Time</h3>
              <p className="text-xs text-purple-200/70 leading-relaxed">
                Pilih tanggal penayangan dengan kepastian ketersediaan otomatis tanpa jadwal bentrok.
              </p>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md space-y-2 hover:border-purple-500/40 transition-colors">
              <span className="text-2xl block">🖼️</span>
              <h3 className="text-sm font-bold text-white">Live Placement Preview</h3>
              <p className="text-xs text-purple-200/70 leading-relaxed">
                Lihat simulasi nyata tampilan iklan Anda di frame IG Story, Banner Web, atau Newsletter.
              </p>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md space-y-2 hover:border-purple-500/40 transition-colors">
              <span className="text-2xl block">📌</span>
              <h3 className="text-sm font-bold text-white">Request Penayangan Khusus</h3>
              <p className="text-xs text-purple-200/70 leading-relaxed">
                Tentukan instruksi khusus seperti jam upload, tag collab IG, atau hashtag spesifik.
              </p>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md space-y-2 hover:border-purple-500/40 transition-colors">
              <span className="text-2xl block">🎯</span>
              <h3 className="text-sm font-bold text-white">Laporan Bukti Tayang</h3>
              <p className="text-xs text-purple-200/70 leading-relaxed">
                Pantau progres tayang 5 tahap via kode booking dan unduh screenshot bukti tayang resmi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories Showcase Section */}
      <section className="py-20 border-b border-white/10 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-white via-purple-200 to-indigo-200 bg-clip-text text-transparent">
              Kategori Slot Media Populer
            </h2>
            <p className="text-xs sm:text-sm text-purple-200/70">
              Temukan media lokasi spesifik yang pas untuk menjangkau calon pelanggan brand Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Instagram Story & Feeds',
                icon: '📱',
                desc: 'Story 9:16 dengan Swipe Up link CTA & Tag Collab Mitra Media.',
                tag: 'SOCIAL MEDIA',
              },
              {
                title: 'Website Header Banner',
                icon: '🌐',
                desc: 'Banner posisi teratas di portal berita & media lokal trafik tinggi.',
                tag: 'WEBSITE',
              },
              {
                title: 'Newsletter Email Box',
                icon: '📧',
                desc: 'Dedicated Sponsored Box dikirim langsung ke ribuan inbox pembaca aktif.',
                tag: 'NEWSLETTER',
              },
              {
                title: 'Podcast Ad-Read Bumper',
                icon: '🎙️',
                desc: 'Audio ad-read host & visual bumper di episode podcast terpopuler.',
                tag: 'PODCAST',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-6 bg-slate-900/60 border border-white/10 rounded-2xl flex flex-col justify-between hover:border-purple-500/50 hover:bg-white/5 transition-all group"
              >
                <div className="space-y-3">
                  <span className="text-3xl p-3 bg-white/5 border border-white/10 rounded-xl inline-block group-hover:scale-110 transition-transform">
                    {item.icon}
                  </span>
                  <span className="block text-[10px] font-bold text-purple-400 tracking-wider">
                    {item.tag}
                  </span>
                  <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-purple-200/60 leading-relaxed">{item.desc}</p>
                </div>

                <div className="pt-4 mt-4 border-t border-white/5">
                  <Link
                    href={`/slots?category=${item.tag}`}
                    className="text-xs font-semibold text-purple-300 hover:text-white flex items-center justify-between"
                  >
                    <span>Lihat Slot {item.tag}</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Stats Section */}
      <section className="py-16 border-b border-white/10 bg-purple-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <span className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-white">
                100%
              </span>
              <span className="block text-xs text-purple-200/70 mt-1 font-medium">
                Self-Service & Transparan
              </span>
            </div>
            <div>
              <span className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-white">
                5-Step
              </span>
              <span className="block text-xs text-purple-200/70 mt-1 font-medium">
                Tracking Progress Penayangan
              </span>
            </div>
            <div>
              <span className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-white">
                Real-Time
              </span>
              <span className="block text-xs text-purple-200/70 mt-1 font-medium">
                Live Upload Preview Frame
              </span>
            </div>
            <div>
              <span className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-white">
                1-Click
              </span>
              <span className="block text-xs text-purple-200/70 mt-1 font-medium">
                Download Bukti Tayang Laporan
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call To Action Banner */}
      <section className="py-20 bg-gradient-to-b from-slate-950 to-purple-950/40">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white">
            Siap Meningkatkan Reach Brand Anda Hari Ini?
          </h2>
          <p className="text-xs sm:text-sm text-purple-200/70 max-w-xl mx-auto">
            Daftar gratis dalam 1 menit, tentukan jadwal penayangan iklan Anda, dan dapatkan laporan hasil penayangan resmi dari mitra media.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm rounded-xl shadow-xl shadow-purple-600/30 transition-all"
            >
              🚀 Buat Akun Pengiklan Sekarang
            </Link>
            <Link
              href="/slots"
              className="w-full sm:w-auto px-8 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-purple-200 hover:text-white font-bold text-sm rounded-xl transition-all"
            >
              📢 Jelajahi Katalog Slot
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
