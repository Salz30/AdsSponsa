import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cek Status Booking | Adsponsa',
  description: 'Lacak status kampanye iklan dan pesanan Anda di Adsponsa.',
}

export default function TrackLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
