import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cek Status Booking | Sponsor Desk',
  description: 'Lacak status kampanye iklan dan pesanan Anda di Sponsor Desk.',
}

export default function TrackLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
