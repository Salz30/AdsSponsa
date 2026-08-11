import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Daftar Account | Sponsor Desk',
  description: 'Buat akun pengiklan baru di Sponsor Desk.',
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
