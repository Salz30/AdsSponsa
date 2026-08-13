'use client'

import { useState } from 'react'

interface AdPlacementMockupProps {
  category: 'WEBSITE' | 'NEWSLETTER' | 'PODCAST' | 'SOCIAL_MEDIA' | string
  slotTitle?: string
  previewUrl?: string | null
  brandName?: string
  campaignName?: string
  targetUrl?: string
}

export default function AdPlacementMockup({
  category,
  slotTitle = 'Slot Iklan',
  previewUrl,
  brandName = 'Nama Brand Anda',
  campaignName = 'Judul Kampanye Promo',
  targetUrl = 'https://brandanda.com',
}: AdPlacementMockupProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'spec'>('preview')

  const cat = category.toUpperCase()

  return (
    <div className="bg-slate-900/80 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl transition-all">
      {/* Header bar */}
      <div className="px-5 py-3.5 bg-white/5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-purple-300">
            📱 Visual Preview Penayangan
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono">
            {cat}
          </span>
        </div>

        <div className="flex gap-1 bg-black/40 p-1 rounded-lg border border-white/10 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1 rounded-md font-semibold transition-all ${
              activeTab === 'preview'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-purple-300/70 hover:text-white'
            }`}
          >
            Simulasi Tampilan
          </button>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-6">
        {/* ========================================================================= */}
        {/* 1. INSTAGRAM STORY / SOCIAL MEDIA MOCKUP */}
        {/* ========================================================================= */}
        {(cat === 'SOCIAL_MEDIA' || cat === 'INSTAGRAM') && (
          <div className="flex flex-col items-center">
            {/* Phone Frame */}
            <div className="w-full max-w-[280px] h-[500px] bg-slate-950 border-4 border-slate-800 rounded-[36px] overflow-hidden shadow-2xl relative flex flex-col justify-between p-3 select-none">
              {/* Top Status Bar & Story Progress Lines */}
              <div className="z-20 space-y-2 pt-1">
                <div className="flex gap-1">
                  <div className="h-0.5 bg-white/40 flex-1 rounded-full overflow-hidden">
                    <div className="h-full bg-white w-2/3" />
                  </div>
                  <div className="h-0.5 bg-white/30 flex-1 rounded-full" />
                </div>
                {/* Header User Info */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white shadow">
                      📢
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-white leading-tight">
                        medialokal.id
                      </span>
                      <span className="block text-[9px] text-purple-200/80">
                        Paid Partnership with <strong>{brandName}</strong>
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-white/60 font-mono">12s</span>
                </div>
              </div>

              {/* Main Content / Upload Preview */}
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-b from-purple-950/60 via-slate-950 to-purple-950/80">
                {previewUrl ? (
                  // Live Upload Preview
                  <img
                    src={previewUrl}
                    alt="Preview Iklan"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  // Default Mockup Content
                  <div className="text-center px-4 space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 mx-auto flex items-center justify-center text-2xl shadow-lg shadow-purple-500/40 animate-pulse">
                      📸
                    </div>
                    <span className="inline-block px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-semibold border border-purple-500/30">
                      Format 9:16 (1080x1920 px)
                    </span>
                    <h4 className="text-sm font-bold text-white">
                      {campaignName}
                    </h4>
                    <p className="text-[11px] text-purple-200/70">
                      Iklan Instagram Story / Feed dengan tag kolaborasi akun brand Anda.
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Swipe Up CTA */}
              <div className="z-20 text-center pb-2 pt-4 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent">
                <div className="inline-flex flex-col items-center gap-0.5 text-purple-300">
                  <span className="text-xs animate-bounce">▲</span>
                  <span className="text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white">
                    Kunjungi {brandName}
                  </span>
                </div>
              </div>
            </div>
            <span className="text-[11px] text-purple-200/60 mt-3 text-center">
              💡 Simulasi tayangan Instagram Story 9:16 dengan Swipe Up CTA link & Paid Partnership Tag.
            </span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. WEBSITE BANNER MOCKUP */}
        {/* ========================================================================= */}
        {cat === 'WEBSITE' && (
          <div className="space-y-4">
            {/* Browser Window Mockup */}
            <div className="bg-slate-950 border border-white/15 rounded-xl overflow-hidden shadow-2xl">
              {/* Browser Window Header */}
              <div className="px-4 py-2 bg-slate-900 border-b border-white/10 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <div className="flex-1 max-w-sm bg-slate-950 border border-white/10 rounded-md px-3 py-1 text-[11px] text-purple-300/70 font-mono truncate">
                  https://medialokal.id/berita-terkini
                </div>
              </div>

              {/* Website Body */}
              <div className="p-4 space-y-4">
                {/* Website Header Bar */}
                <div className="flex justify-between items-center pb-2 border-b border-white/10 text-xs text-purple-200/70">
                  <span className="font-bold text-white text-sm">📰 MediaLokal.id</span>
                  <div className="flex gap-3 text-[11px]">
                    <span>Berita</span>
                    <span>Bisnis</span>
                    <span>Gaya Hidup</span>
                  </div>
                </div>

                {/* SPONSORED BANNER SLOT */}
                <div className="relative overflow-hidden rounded-xl border border-purple-500/40 bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 min-h-[90px] flex items-center justify-center p-3">
                  <span className="absolute top-2 left-2 px-2 py-0.5 text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded uppercase">
                    SPONSORED AD
                  </span>

                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Banner Preview"
                      className="max-h-24 max-w-full object-contain rounded-lg shadow-lg"
                    />
                  ) : (
                    <div className="text-center space-y-1">
                      <span className="block text-xs font-bold text-white">
                        {campaignName}
                      </span>
                      <span className="block text-[11px] text-purple-300 font-semibold">
                        Sponsor Resmi: {brandName}
                      </span>
                      <span className="inline-block px-3 py-1 text-[10px] bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold transition-all shadow">
                        Buka Tautan CTA ↗
                      </span>
                    </div>
                  )}
                </div>

                {/* Mockup Content Lines */}
                <div className="space-y-2 opacity-40">
                  <div className="h-4 bg-white/20 rounded w-3/4" />
                  <div className="h-3 bg-white/10 rounded w-full" />
                  <div className="h-3 bg-white/10 rounded w-5/6" />
                </div>
              </div>
            </div>
            <span className="text-[11px] text-purple-200/60 block text-center">
              💡 Simulasi posisi Banner Iklan Header Utama di website portal berita.
            </span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. NEWSLETTER MOCKUP */}
        {/* ========================================================================= */}
        {cat === 'NEWSLETTER' && (
          <div className="space-y-4">
            <div className="bg-slate-950 border border-white/15 rounded-xl overflow-hidden shadow-2xl p-5 space-y-4">
              {/* Email Header */}
              <div className="border-b border-white/10 pb-3 space-y-1">
                <span className="text-xs text-purple-300">Daripada: Editorial Newsletter MediaLokal</span>
                <h4 className="text-base font-bold text-white">
                  📬 [Edisi Mingguan] Tren Bisnis & Insight Penting Minggu Ini
                </h4>
              </div>

              {/* Email Body Intro */}
              <p className="text-xs text-purple-200/70">
                Halo Pembaca Setia! Berikut adalah rekap berita dan artikel pilihan edisi minggu ini...
              </p>

              {/* NEWSLETTER SPONSORED BOX */}
              <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/40 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded uppercase">
                    SPONSORED HIGHLIGHT
                  </span>
                  <span className="text-[10px] text-purple-400 font-bold">
                    Persembahan oleh {brandName}
                  </span>
                </div>

                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Newsletter Banner"
                    className="w-full max-h-36 object-contain rounded-lg border border-white/10"
                  />
                ) : (
                  <div className="space-y-2">
                    <h5 className="text-sm font-bold text-white">
                      {campaignName}
                    </h5>
                    <p className="text-xs text-purple-200/80">
                      Dapatkan promo eksklusif persembahan {brandName} khusus untuk pelanggan setia newsletter kami.
                    </p>
                  </div>
                )}

                <a
                  href={targetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow"
                >
                  Pelajari Selengkapnya di {brandName} ↗
                </a>
              </div>

              <p className="text-xs text-purple-200/50">
                --- Terima kasih telah membaca Newsletter MediaLokal ---
              </p>
            </div>
            <span className="text-[11px] text-purple-200/60 block text-center">
              💡 Simulasi posisi Dedicated Sponsored Box di dalam email newsletter.
            </span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. PODCAST MOCKUP */}
        {/* ========================================================================= */}
        {cat === 'PODCAST' && (
          <div className="space-y-4">
            <div className="bg-slate-950 border border-white/15 rounded-xl overflow-hidden shadow-2xl p-5 space-y-4">
              <div className="flex items-center gap-4">
                {/* Album Art / Upload Preview */}
                <div className="w-20 h-20 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex-shrink-0 overflow-hidden flex items-center justify-center border border-white/10 shadow-lg">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Podcast Banner"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl">🎙️</span>
                  )}
                </div>

                {/* Track Info */}
                <div className="space-y-1">
                  <span className="inline-block px-2 py-0.5 text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded uppercase">
                    PODCAST BUMPER / MID-ROLL AD
                  </span>
                  <h4 className="text-sm font-bold text-white">
                    Edisi Spesial Sponsored by {brandName}
                  </h4>
                  <p className="text-xs text-purple-200/70">
                    "{campaignName}" — Ad-read script 30-60 detik oleh host podcast.
                  </p>
                </div>
              </div>

              {/* Animated Waveform Visualizer */}
              <div className="p-3 bg-slate-900/80 rounded-xl border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs text-purple-300 font-mono">
                  <span>01:15 (Ad-Read Time)</span>
                  <span>45:00</span>
                </div>
                {/* Equalizer Bars */}
                <div className="flex items-center gap-1 h-8 px-2 justify-center">
                  {[40, 75, 30, 90, 60, 100, 45, 80, 50, 95, 70, 40, 85, 60, 30, 90, 50].map(
                    (h, idx) => (
                      <div
                        key={idx}
                        className="w-1.5 bg-gradient-to-t from-purple-500 to-indigo-400 rounded-full animate-pulse"
                        style={{ height: `${h}%`, animationDelay: `${idx * 0.1}s` }}
                      />
                    )
                  )}
                </div>
              </div>
            </div>
            <span className="text-[11px] text-purple-200/60 block text-center">
              💡 Simulasi sebutan sponsor audio mid-roll / bumper ad pada podcast.
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
