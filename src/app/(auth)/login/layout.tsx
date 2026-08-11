import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Masuk | Sponsor Desk',
  description: 'Masuk ke akun Sponsor Desk Anda.',
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
