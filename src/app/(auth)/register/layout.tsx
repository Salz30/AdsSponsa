import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Daftar Account | Adsponsa',
  description: 'Buat akun pengiklan baru di Adsponsa.',
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
