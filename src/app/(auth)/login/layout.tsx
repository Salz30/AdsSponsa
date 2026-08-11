import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Masuk | Adsponsa',
  description: 'Masuk ke akun Adsponsa Anda.',
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
