'use client'

import { useState, useEffect } from 'react'
import { swalTheme, showSuccessAlert, showErrorAlert } from '@/lib/swal'

interface AdminGuideModalProps {
  isOpen: boolean
  onClose: () => void
}

interface Announcement {
  id: number
  title: string
  content: string
  isActive: boolean
  createdAt: string
}

export default function AdminGuideModal({ isOpen, onClose }: AdminGuideModalProps) {
  const [activeTab, setActiveTab] = useState<'admin_guide' | 'cms'>('admin_guide')
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(false)

  // CMS Form State
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchAnnouncements = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/announcements')
      const data = await res.json()
      if (Array.isArray(data)) setAnnouncements(data)
    } catch {
      // silent catch
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchAnnouncements()
    }
  }, [isOpen])

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !newContent.trim()) {
      showErrorAlert('Form Tidak Lengkap', 'Judul dan isi pengumuman wajib diisi.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, content: newContent }),
      })

      if (!res.ok) {
        const err = await res.json()
        showErrorAlert('Gagal', err.message || 'Gagal menerbitkan pengumuman.')
        return
      }

      showSuccessAlert('Pengumuman Diterbitkan!', 'Pengumuman baru telah tampil untuk publik.')
      setNewTitle('')
      setNewContent('')
      fetchAnnouncements()
    } catch {
      showErrorAlert('Error', 'Terjadi kesalahan server.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteAnnouncement = async (id: number) => {
    const confirm = await swalTheme.fire({
      title: 'Hapus Pengumuman?',
      text: 'Pengumuman ini tidak akan lagi tampil di halaman pelanggan.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
    })

    if (confirm.isConfirmed) {
      try {
        const res = await fetch(`/api/admin/announcements?id=${id}`, {
          method: 'DELETE',
        })
        if (res.ok) {
          showSuccessAlert('Terhapus', 'Pengumuman berhasil dihapus.')
          fetchAnnouncements()
        } else {
          showErrorAlert('Gagal', 'Gagal menghapus pengumuman.')
        }
      } catch {
        showErrorAlert('Error', 'Terjadi kesalahan koneksi.')
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-purple-500/30 rounded-2xl max-w-3xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto text-white relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-purple-300 hover:text-white text-xl font-bold bg-white/5 hover:bg-white/10 w-9 h-9 rounded-xl flex items-center justify-center transition-all"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="pr-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-2">
            ⚙️ Mode Pengelola (Admin Dashboard)
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-indigo-200 bg-clip-text text-transparent">
            Panduan Operasional & CMS Pengumuman
          </h2>
          <p className="text-xs text-purple-200/70 mt-1">
            Panduan verifikasi pesanan, pengelolaan bukti tayang, serta pembuatan pengumuman publik.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-white/10 pb-3">
          <button
            onClick={() => setActiveTab('admin_guide')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'admin_guide'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-white/5 text-purple-200/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span>📖 Operational Guide</span>
          </button>
          <button
            onClick={() => setActiveTab('cms')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'cms'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-white/5 text-purple-200/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span>📢 Kelola Pengumuman CMS ({announcements.length})</span>
          </button>
        </div>

        {/* Tab 1: Admin Operational Guide */}
        {activeTab === 'admin_guide' && (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-1">
                <span className="text-xs font-bold text-purple-300 block">
                  1. Review Pemesanan Masuk & Verifikasi Transfer
                </span>
                <p className="text-xs text-purple-200/80 leading-relaxed">
                  Buka <strong>Admin Dashboard</strong> (`/admin/dashboard`). Klik tombol <strong>🔍 Review</strong> pada transaksi berstatus <code>Pending Review</code>. Periksa foto bukti bayar pengirim, materi iklan, dan <strong>📌 Catatan Khusus Request Pengiklan</strong> (mis. jam upload / tag IG). Klik <strong>✅ Setujui & Jadwalkan</strong> atau <strong>🚫 Tolak</strong>.
                </p>
              </div>

              <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-1">
                <span className="text-xs font-bold text-purple-300 block">
                  2. Upload Bukti Tayang (Proof of Performance)
                </span>
                <p className="text-xs text-purple-200/80 leading-relaxed">
                  Pada pesanan status <code>Scheduled / Live / Completed</code>, klik tombol <strong>📸 Proof</strong> untuk mengunggah tangkapan layar publikasi atau menautkan link tayang publik. Pengiklan akan dapat mengunduhnya secara otomatis di Portal Tracking.
                </p>
              </div>

              <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-1">
                <span className="text-xs font-bold text-purple-300 block">
                  3. Ekspor Data Laporan (CSV)
                </span>
                <p className="text-xs text-purple-200/80 leading-relaxed">
                  Gunakan tombol <strong>📥 Ekspor CSV Data</strong> di pojok kanan atas Admin Dashboard untuk mendownload rekap data transaksi dan pendapatan iklan.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: CMS Announcement Manager */}
        {activeTab === 'cms' && (
          <div className="space-y-6">
            {/* Create Announcement Form */}
            <form onSubmit={handleCreateAnnouncement} className="p-4 bg-purple-950/40 border border-purple-500/30 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                ➕ Terbitkan Pengumuman / Info Baru Untuk Pelanggan
              </h4>
              <div>
                <label className="block text-xs text-purple-200 mb-1">Judul Pengumuman *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Contoh: Promo Diskon Kemerdekaan 20% untuk Slot Banner Website"
                  className="w-full px-3 py-2 bg-slate-900/80 border border-white/10 rounded-lg text-xs text-white placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs text-purple-200 mb-1">Isi Pengumuman *</label>
                <textarea
                  required
                  rows={3}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Tuliskan detail pengumuman atau instruksi penting untuk pengiklan..."
                  className="w-full px-3 py-2 bg-slate-900/80 border border-white/10 rounded-lg text-xs text-white placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
              >
                {submitting ? 'Menerbitkan...' : '📢 Terbitkan Pengumuman Ke Publik'}
              </button>
            </form>

            {/* List of Existing Announcements */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-purple-200 uppercase tracking-wider">
                📋 Daftar Pengumuman Aktif ({announcements.length})
              </h4>
              {loading ? (
                <p className="text-xs text-purple-300">Memuat data pengumuman...</p>
              ) : announcements.length === 0 ? (
                <p className="text-xs text-purple-300/60 italic">Belum ada pengumuman yang diterbitkan.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {announcements.map((a) => (
                    <div key={a.id} className="p-3 bg-white/5 border border-white/10 rounded-xl flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{a.title}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Aktif Publik
                          </span>
                        </div>
                        <p className="text-xs text-purple-200/70 whitespace-pre-wrap">{a.content}</p>
                        <span className="block text-[10px] text-purple-400">
                          Diterbitkan: {new Date(a.createdAt).toLocaleString('id-ID')}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDeleteAnnouncement(a.id)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 rounded-lg transition-all"
                      >
                        Hapus
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer Close CTA */}
        <div className="pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
          >
            Tutup Mode Admin
          </button>
        </div>
      </div>
    </div>
  )
}
