'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'
import Navbar from '@/components/navbar'

export default function EditSlotPage(props: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const params = use(props.params)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [formData, setFormData] = useState({
    title: '',
    category: 'WEBSITE',
    description: '',
    pricePerDay: '',
    dimensionsSpec: '',
    allowedFormats: '',
    maxFileSizeMb: '5',
    isActive: true,
  })

  useEffect(() => {
    const fetchSlot = async () => {
      try {
        const res = await fetch(`/api/admin/slots/${params.id}`)
        if (res.ok) {
          const data = await res.json()
          setFormData({
            title: data.title || '',
            category: data.category || 'WEBSITE',
            description: data.description || '',
            pricePerDay: data.pricePerDay?.toString() || '',
            dimensionsSpec: data.dimensionsSpec || '',
            allowedFormats: data.allowedFormats || '',
            maxFileSizeMb: data.maxFileSizeMb?.toString() || '5',
            isActive: data.isActive,
          })
        } else {
          toast.error('Gagal mengambil data slot.')
        }
      } catch (error) {
        toast.error('Gagal menghubungi server.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchSlot()
  }, [params.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const payload = {
        ...formData,
        pricePerDay: Number(formData.pricePerDay),
        maxFileSizeMb: Number(formData.maxFileSizeMb),
      }

      const res = await fetch(`/api/admin/slots/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast.success('Slot berhasil diperbarui!')
        router.push('/admin/slots')
        router.refresh()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Terjadi kesalahan saat memperbarui slot.')
      }
    } catch (error) {
      toast.error('Gagal menghubungi server.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        <div>
          <Link href="/admin/slots" className="text-purple-400 hover:text-purple-300 text-sm mb-4 inline-block">
            &larr; Kembali ke Daftar Slot
          </Link>
          <h1 className="text-3xl font-extrabold text-white">Edit Slot Iklan</h1>
          <p className="text-sm text-purple-200/70 mt-1">
            Perbarui informasi slot iklan ini.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-10 text-purple-300">Memuat data...</div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 space-y-6 backdrop-blur-xl">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-1">Judul Slot <span className="text-red-400">*</span></label>
                <input
                  required
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full rounded-xl bg-slate-900/50 border border-white/10 px-4 py-2.5 text-white placeholder-purple-200/30 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                  placeholder="Contoh: Banner Utama Website"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-1">Kategori <span className="text-red-400">*</span></label>
                  <select
                    required
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-slate-900/50 border border-white/10 px-4 py-2.5 text-white outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 appearance-none"
                  >
                    <option value="WEBSITE">Website</option>
                    <option value="NEWSLETTER">Newsletter</option>
                    <option value="PODCAST">Podcast</option>
                    <option value="SOCIAL_MEDIA">Social Media</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-1">Harga per Hari (Rp) <span className="text-red-400">*</span></label>
                  <input
                    required
                    type="number"
                    min="0"
                    name="pricePerDay"
                    value={formData.pricePerDay}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-slate-900/50 border border-white/10 px-4 py-2.5 text-white placeholder-purple-200/30 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                    placeholder="50000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-1">Deskripsi</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-xl bg-slate-900/50 border border-white/10 px-4 py-2.5 text-white placeholder-purple-200/30 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                  placeholder="Penjelasan detail mengenai slot iklan ini..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-1">Spesifikasi Dimensi</label>
                  <input
                    name="dimensionsSpec"
                    value={formData.dimensionsSpec}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-slate-900/50 border border-white/10 px-4 py-2.5 text-white placeholder-purple-200/30 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                    placeholder="Contoh: 728x90 px"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-1">Format Ekstensi <span className="text-red-400">*</span></label>
                  <input
                    required
                    name="allowedFormats"
                    value={formData.allowedFormats}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-slate-900/50 border border-white/10 px-4 py-2.5 text-white placeholder-purple-200/30 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                    placeholder="Contoh: JPG, PNG, GIF"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-1">Maks Ukuran File (MB) <span className="text-red-400">*</span></label>
                  <input
                    required
                    type="number"
                    min="1"
                    name="maxFileSizeMb"
                    value={formData.maxFileSizeMb}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-slate-900/50 border border-white/10 px-4 py-2.5 text-white placeholder-purple-200/30 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                  />
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      className="w-5 h-5 rounded border-white/10 text-purple-600 focus:ring-purple-500 bg-slate-900/50"
                    />
                    <span className="text-sm font-medium text-white">Aktif (Tersedia untuk dibooking)</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Menyimpan...' : 'Perbarui Slot Iklan'}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}
