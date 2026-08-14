'use client'

import { useState } from 'react'

interface UserGuideModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function UserGuideModal({ isOpen, onClose }: UserGuideModalProps) {
  const [activeTab, setActiveTab] = useState<'advertiser' | 'admin' | 'faq'>('advertiser')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-white/20 rounded-2xl max-w-3xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto text-white relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-purple-300 hover:text-white text-xl font-bold bg-white/5 hover:bg-white/10 w-9 h-9 rounded-xl flex items-center justify-center transition-all"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="pr-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-2">
            📖 Pusat Panduan & Bantuan Adsponsa
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-indigo-200 bg-clip-text text-transparent">
            Cara Penggunaan & Pemesanan Slot Iklan
          </h2>
          <p className="text-xs text-purple-200/70 mt-1">
            Panduan lengkap alur pemesanan mandiri untuk pengiklan dan alur verifikasi pengelola media.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-white/10 pb-3">
          <button
            onClick={() => setActiveTab('advertiser')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'advertiser'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-white/5 text-purple-200/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span>📢 Panduan Pengiklan (Advertiser)</span>
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'admin'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-white/5 text-purple-200/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span>⚙️ Panduan Admin (Media Owner)</span>
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'faq'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-white/5 text-purple-200/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span>❓ Pertanyaan Umum (FAQ)</span>
          </button>
        </div>

        {/* Tab 1: Advertiser Guide */}
        {activeTab === 'advertiser' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Step 1 */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-extrabold flex items-center justify-center">
                    1
                  </span>
                  <h4 className="text-sm font-bold text-white">Pilih Slot & Jadwal Tayang</h4>
                </div>
                <p className="text-xs text-purple-200/80 leading-relaxed">
                  Cari slot iklan di Katalog (Instagram Story, Website, Newsletter, Podcast). Pilih rentang tanggal pada <strong>Kalender Ketersediaan</strong> real-time.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-extrabold flex items-center justify-center">
                    2
                  </span>
                  <h4 className="text-sm font-bold text-white">Isi Detail & Request Khusus</h4>
                </div>
                <p className="text-xs text-purple-200/80 leading-relaxed">
                  Isi nama kampanye, brand, dan URL tujuan CTA. Gunakan kolom <strong>Catatan Khusus</strong> jika ada request jam upload atau tag/collab akun IG.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-extrabold flex items-center justify-center">
                    3
                  </span>
                  <h4 className="text-sm font-bold text-white">Upload Materi & Live Preview</h4>
                </div>
                <p className="text-xs text-purple-200/80 leading-relaxed">
                  Unggah foto/materi iklan (maks 4 MB). Nikmati <strong>Live Interactive Preview</strong> untuk melihat simulasi tampilan nyata iklan Anda di frame IG/Web.
                </p>
              </div>

              {/* Step 4 */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-extrabold flex items-center justify-center">
                    4
                  </span>
                  <h4 className="text-sm font-bold text-white">Transfer & Unggah Bukti Bayar</h4>
                </div>
                <p className="text-xs text-purple-200/80 leading-relaxed">
                  Transfer ke BCA <code>8830-1928-3341</code> (Gunakan tombol 1-klik Salin). Unggah foto bukti bayar, lalu klik <strong>Kirim Pemesanan</strong>.
                </p>
              </div>
            </div>

            {/* Tracking Step Banner */}
            <div className="p-4 bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border border-purple-500/30 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="block text-xs font-bold text-amber-300">
                  🎯 Pelaporan & Bukti Tayang Transparan (Step 5)
                </span>
                <p className="text-xs text-purple-200/70 mt-0.5">
                  Setelah booking dikirim, Anda mendapatkan kode booking unik (mis. <code>#BOOK-2026-XXXX</code>) untuk memantau progres 5 tahap & mengunduh laporan bukti tayang resmi.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Admin Guide */}
        {activeTab === 'admin' && (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-1">
                <span className="text-xs font-bold text-purple-300 block">1. Login Kredensial Demo Admin</span>
                <p className="text-xs text-purple-200/80">
                  Masuk via halaman `/login` dengan kredensial <code>admin@sponsordesk.id</code> / <code>admin123!</code>. Sistem akan otomatis mengarahkan ke <code>/admin/dashboard</code>.
                </p>
              </div>

              <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-1">
                <span className="text-xs font-bold text-purple-300 block">2. Review Pemesanan Masuk & Verifikasi Bayar</span>
                <p className="text-xs text-purple-200/80">
                  Klik tombol <strong>🔍 Review</strong> pada pesanan status <code>Pending Review</code>. Periksa materi iklan, bukti bayar pengirim, dan <strong>Catatan Khusus Request Pengiklan</strong>. Klik <strong>✅ Setujui & Jadwalkan</strong> atau <strong>🚫 Tolak</strong>.
                </p>
              </div>

              <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-1">
                <span className="text-xs font-bold text-purple-300 block">3. Terbitkan Bukti Tayang (Proof of Performance)</span>
                <p className="text-xs text-purple-200/80">
                  Pada pesanan status <code>Scheduled / Live / Completed</code>, klik <strong>📸 Proof</strong> untuk mengunggah tangkapan layar publikasi atau menautkan link tayang publik.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: FAQ */}
        {activeTab === 'faq' && (
          <div className="space-y-3">
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-1">
              <span className="text-xs font-bold text-white block">❓ Berapa batas maksimal ukuran berkas materi & bukti bayar?</span>
              <p className="text-xs text-purple-200/80">
                Batas maksimal ukuran tiap berkas adalah <strong>4 MB</strong>. Jika berkas foto dari kamera HP Anda melebihi 4 MB, harap lakukan screenshot atau kompresi gambar terlebih dahulu.
              </p>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-1">
              <span className="text-xs font-bold text-white block">❓ Bagaimana jika tanggal yang saya inginkan bertanda tidak aktif di kalender?</span>
              <p className="text-xs text-purple-200/80">
                Tanggal yang bertanda tidak aktif berarti telah dipesan oleh pengiklan lain (proteksi bentrok otomatis). Silakan pilih tanggal lain yang masih aktif.
              </p>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-1">
              <span className="text-xs font-bold text-white block">❓ Dimana saya bisa mengecek status iklan saya tanpa login?</span>
              <p className="text-xs text-purple-200/80">
                Buka menu <strong>Cek Status Booking</strong> di bagian atas web (URL `/track`), lalu masukkan kode booking unik Anda (contoh: <code>BOOK-2026-001</code>).
              </p>
            </div>
          </div>
        )}

        {/* Footer Close CTA */}
        <div className="pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
          >
            Mengerti, Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  )
}
