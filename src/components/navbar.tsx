'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import CustomerGuideModal from '@/components/customer-guide-modal'
import AdminGuideModal from '@/components/admin-guide-modal'

export default function Navbar() {
  const { data: session } = useSession()
  const user = session?.user
  const isAdmin = user?.role === 'ADMIN'

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCustomerGuideOpen, setIsCustomerGuideOpen] = useState(false)
  const [isAdminGuideOpen, setIsAdminGuideOpen] = useState(false)

  const handleLogout = async () => {
    setIsMobileMenuOpen(false)
    await signOut({ redirect: false })
    window.location.href = '/login'
  }

  return (
    <>
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-xl shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
              📢
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-white via-purple-200 to-indigo-200 bg-clip-text text-transparent">
                Adsponsa
              </span>
              <span className="block text-[10px] text-purple-400 font-medium tracking-wider uppercase">
                AdSlot Manager
              </span>
            </div>
          </Link>

          {/* Nav Links Desktop */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-purple-200/80 hover:text-white transition-colors"
            >
              Katalog Slot
            </Link>

            <Link
              href="/track"
              className="text-sm font-medium text-purple-200/80 hover:text-white transition-colors"
            >
              Cek Status Booking
            </Link>

            {/* Role-Based Guide Buttons */}
            {isAdmin ? (
              <button
                onClick={() => setIsAdminGuideOpen(true)}
                className="text-sm font-semibold text-purple-300 hover:text-white transition-all flex items-center gap-1.5 bg-purple-500/10 hover:bg-purple-500/20 px-3 py-1.5 rounded-xl border border-purple-500/30"
              >
                <span>⚙️</span> Panduan Admin & CMS
              </button>
            ) : (
              <button
                onClick={() => setIsCustomerGuideOpen(true)}
                className="text-sm font-semibold text-amber-300 hover:text-white transition-all flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-xl border border-amber-500/30"
              >
                <span>📖</span> Panduan Cara Pesan
              </button>
            )}

            {user && (
              <>
                {isAdmin ? (
                  <Link
                    href="/admin/dashboard"
                    className="text-sm font-medium text-purple-300 hover:text-purple-100 bg-purple-900/40 px-3 py-1.5 rounded-lg border border-purple-500/30 transition-all"
                  >
                    📊 Admin Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/dashboard"
                    className="text-sm font-medium text-purple-300 hover:text-purple-100 bg-purple-900/40 px-3 py-1.5 rounded-lg border border-purple-500/30 transition-all"
                  >
                    📊 Pesanan Saya
                  </Link>
                )}
              </>
            )}

            {/* Auth Buttons Desktop */}
            {user ? (
              <div className="flex items-center gap-3 border-l border-white/10 pl-6">
                <div className="text-right">
                  <span className="block text-xs font-semibold text-white">{user.name}</span>
                  <span className="block text-[10px] text-purple-300 uppercase tracking-wider">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 rounded-lg transition-all"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 border-l border-white/10 pl-6">
                <Link
                  href="/login"
                  className="text-xs font-medium text-purple-200 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-3.5 py-1.5 rounded-lg shadow-md shadow-purple-600/30 transition-all"
                >
                  Daftar
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-purple-300 hover:text-white rounded-lg bg-white/5 border border-white/10 focus:outline-none"
            >
              <span className="text-xl">{isMobileMenuOpen ? '✕' : '☰'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden px-4 pt-2 pb-6 border-t border-white/10 space-y-3 bg-slate-950/95 backdrop-blur-xl">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-sm font-medium text-purple-200 hover:text-white py-1.5"
            >
              Katalog Slot
            </Link>

            <Link
              href="/track"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-sm font-medium text-purple-200 hover:text-white py-1.5"
            >
              Cek Status Booking
            </Link>

            {isAdmin ? (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  setIsAdminGuideOpen(true)
                }}
                className="w-full text-left text-sm font-semibold text-purple-300 hover:text-white transition-colors py-1.5 flex items-center gap-2"
              >
                <span>⚙️</span> Panduan Admin & CMS
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  setIsCustomerGuideOpen(true)
                }}
                className="w-full text-left text-sm font-semibold text-amber-300 hover:text-white transition-colors py-1.5 flex items-center gap-2"
              >
                <span>📖</span> Panduan Cara Pesan
              </button>
            )}

            {user && (
              <>
                {isAdmin ? (
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-sm font-medium text-purple-300 hover:text-purple-100 bg-purple-900/40 px-4 py-2 rounded-lg border border-purple-500/30 transition-all text-center"
                  >
                    📊 Admin Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-sm font-medium text-purple-300 hover:text-purple-100 bg-purple-900/40 px-4 py-2 rounded-lg border border-purple-500/30 transition-all text-center"
                  >
                    📊 Pesanan Saya
                  </Link>
                )}
              </>
            )}

            {user ? (
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <span className="block text-sm font-semibold text-white">{user.name}</span>
                  <span className="block text-xs text-purple-300 uppercase tracking-wider">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-semibold text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 rounded-lg transition-all"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-center text-sm font-medium text-purple-200 hover:text-white px-4 py-2 border border-purple-500/30 rounded-xl transition-colors bg-purple-900/20"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-center text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-4 py-2 rounded-xl shadow-md shadow-purple-600/30 transition-all"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Role-Based Guide Modals */}
      <CustomerGuideModal isOpen={isCustomerGuideOpen} onClose={() => setIsCustomerGuideOpen(false)} />
      <AdminGuideModal isOpen={isAdminGuideOpen} onClose={() => setIsAdminGuideOpen(false)} />
    </>
  )
}
