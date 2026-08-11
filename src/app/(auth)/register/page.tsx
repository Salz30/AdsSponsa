'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.message || 'Registrasi gagal.')
        setLoading(false)
        return
      }

      toast.success('Registrasi akun berhasil! Silakan masuk.')
      router.push('/login')
    } catch {
      toast.error('Terjadi kesalahan koneksi.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 px-4 py-12">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl text-white animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-purple-200 to-indigo-200 bg-clip-text text-transparent">
            Daftar Pengiklan
          </h1>
          <p className="text-sm text-purple-200/80 mt-1">
            Buat akun untuk memesan slot iklan di media lokal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-purple-200 mb-1">
              NAMA LENGKAP / BRAND
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Kopi Kita Indonesia"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-purple-200 mb-1">
              EMAIL
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="brand@domain.com"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-purple-200 mb-1">
              NOMOR WHATSAPP (OPSIONAL)
            </label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              placeholder="081234567890"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-purple-200 mb-1">
              PASSWORD
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Minimal 6 karakter"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-600/30 hover:shadow-purple-500/50 transition-all duration-200 disabled:opacity-50 mt-2"
          >
            {loading ? 'Mendaftarkan...' : 'Buat Akun Sekarang'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-purple-200/60">
          Sudah memiliki akun?{' '}
          <Link href="/login" className="text-purple-300 font-semibold hover:underline">
            Masuk Sekarang
          </Link>
        </p>
      </div>
    </div>
  )
}
