'use client'

import { useState, useEffect, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'

// ── Error message mapping ─────────────────────────────────────────────────────
// NextAuth redirects to /login?error=<code> when authentication fails.
// We map each code to a human-readable Indonesian message.
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: 'Email atau password salah. Periksa kembali dan coba lagi.',
  SessionRequired: 'Sesi Anda telah berakhir. Silakan login kembali.',
  OAuthAccountNotLinked:
    'Akun ini terhubung ke metode login lain. Gunakan metode yang sama.',
  OAuthCallbackError: 'Terjadi kesalahan saat menghubungi server autentikasi.',
  Default: 'Terjadi kesalahan koneksi server. Silakan coba lagi.',
}

function getErrorMessage(code: string | null): string | null {
  if (!code) return null
  return AUTH_ERROR_MESSAGES[code] ?? AUTH_ERROR_MESSAGES.Default
}

// ── Login Form ────────────────────────────────────────────────────────────────
function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

  // Read ?error= from URL (set by NextAuth when it redirects to pages.error)
  const urlError = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Show a toast for the URL error exactly once on mount
  useEffect(() => {
    const message = getErrorMessage(urlError)
    if (message) {
      toast.error(message, { id: 'url-auth-error', duration: 6000 })
    }
  }, [urlError])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Prevent double-submission while the request is in flight
    if (isLoading) return
    setIsLoading(true)

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (res?.error) {
        const message = getErrorMessage(res.error)
        toast.error(message ?? AUTH_ERROR_MESSAGES.Default)
        setIsLoading(false)
        return
      }

      toast.success('Selamat datang kembali! Mengalihkan...')

      // Determine redirect target based on role
      const sessionRes = await fetch('/api/auth/session').then((r) => r.json())
      if (sessionRes?.user?.role === 'ADMIN') {
        router.push('/admin/dashboard')
      } else {
        router.push(callbackUrl)
      }
      router.refresh()
    } catch {
      toast.error('Terjadi kesalahan jaringan. Periksa koneksi Anda dan coba lagi.')
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Inline error banner for URL-based errors (accessible fallback) */}
      {urlError && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          <span className="mt-0.5 shrink-0">⚠️</span>
          <span>{getErrorMessage(urlError)}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-purple-200 mb-1">
          EMAIL ADDRESS
        </label>
        <input
          id="login-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nama@perusahaan.com"
          disabled={isLoading}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-60"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-purple-200 mb-1">
          PASSWORD
        </label>
        <input
          id="login-password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          disabled={isLoading}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-60"
        />
      </div>

      <button
        id="login-submit"
        type="submit"
        disabled={isLoading}
        className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-600/30 hover:shadow-purple-500/50 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2 justify-center">
            <svg
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
              />
            </svg>
            Memproses...
          </span>
        ) : (
          'Masuk Akun'
        )}
      </button>

      {/* Demo Credentials Helper */}
      <div className="mt-6 pt-6 border-t border-white/10 text-xs text-purple-200/70 space-y-2">
        <p className="font-semibold text-purple-300">🔑 Kredensial Demo Cepat:</p>
        <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg">
          <span>
            Admin: <strong className="text-white">admin@sponsordesk.id</strong>
          </span>
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
          <span>
            Advertiser: <strong className="text-white">siska@brand.id</strong>
          </span>
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

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 px-4 py-12">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl text-white animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 mb-4 shadow-lg shadow-purple-500/30">
            <span className="text-2xl">📢</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-purple-200 to-indigo-200 bg-clip-text text-transparent">
            Adsponsa
          </h1>
          <p className="text-sm text-purple-200/80 mt-1">
            Masuk ke portal manajemen slot media Anda
          </p>
        </div>

        <Suspense
          fallback={
            <div className="text-center text-purple-300 py-8">
              Memuat form login...
            </div>
          }
        >
          <LoginForm />
        </Suspense>

        <p className="mt-6 text-center text-xs text-purple-200/60">
          Belum punya akun?{' '}
          <Link
            href="/register"
            className="text-purple-300 font-semibold hover:underline"
          >
            Daftar sebagai Pengiklan
          </Link>
        </p>
      </div>
    </div>
  )
}
