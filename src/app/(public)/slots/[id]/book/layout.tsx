import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pesan Slot Iklan | Adsponsa',
}

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
