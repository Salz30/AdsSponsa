'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (res?.error) {
        toast.error('Login gagal! Periksa kembali email dan password Anda.')
        setLoading(false)
        return
      }

      toast.success('Selamat datang kembali! Mengalihkan...')
      
      const sessionRes = await fetch('/api/auth/session').then((r) => r.json())
      if (sessionRes?.user?.role === 'ADMIN') {
        router.push('/admin/dashboard')
      } else {
        router.push(callbackUrl)
      }
      router.refresh()
    } catch {
      toast.error('Terjadi kesalahan saat melakukan login.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs font-semibold text-purple-200 mb-1">
          EMAIL ADDRESS
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nama@perusahaan.com"
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
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-600/30 hover:shadow-purple-500/50 transition-all duration-200 disabled:opacity-50"
      >
        {loading ? 'Memproses...' : 'Masuk Akun'}
      </button>

      {/* Demo Credentials Helper */}
      <div className="mt-6 pt-6 border-t border-white/10 text-xs text-purple-200/70 space-y-2">
        <p className="font-semibold text-purple-300">🔑 Kredensial Demo Cepat:</p>
        <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg">
          <span>Admin: <strong className="text-white">admin@sponsordesk.id</strong></span>
          <button
            type="button"
            onClick={() => {
              setEmail('admin@sponsordesk.id')
              setPassword('admin123!')
            }}
            className="text-purple-400 hover:text-white underline text-[11px]"
          >
            Gunakan
          </button>
        </div>
        <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg">
          <span>Advertiser: <strong className="text-white">siska@brand.id</strong></span>
          <button
            type="button"
            onClick={() => {
              setEmail('siska@brand.id')
              setPassword('advertiser123!')
            }}
            className="text-purple-400 hover:text-white underline text-[11px]"
          >
            Gunakan
          </button>
        </div>
      </div>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 px-4 py-12">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl text-white animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 mb-4 shadow-lg shadow-purple-500/30">
            <span className="text-2xl">📢</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-purple-200 to-indigo-200 bg-clip-text text-transparent">
            Sponsor Desk
          </h1>
          <p className="text-sm text-purple-200/80 mt-1">
            Masuk ke portal manajemen slot media Anda
          </p>
        </div>

        <Suspense fallback={<div className="text-center text-purple-300 py-8">Memuat form login...</div>}>
          <LoginForm />
        </Suspense>

        <p className="mt-6 text-center text-xs text-purple-200/60">
          Belum punya akun?{' '}
          <Link href="/register" className="text-purple-300 font-semibold hover:underline">
            Daftar sebagai Pengiklan
          </Link>
        </p>
      </div>
    </div>
  )
}
