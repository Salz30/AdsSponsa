import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import Providers from '@/components/providers'


const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'Sponsor Desk — Platform Reservasi Slot Iklan Media Lokal',
    template: '%s | Sponsor Desk',
  },
  description:
    'Platform self-service reservasi slot iklan terpadu untuk media lokal dan independen. Dari pemesanan hingga bukti tayang, semua dalam satu dashboard.',
  keywords: ['slot iklan', 'sponsorship', 'media lokal', 'iklan podcast', 'newsletter sponsorship'],
  authors: [{ name: 'Sponsor Desk' }],
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'Sponsor Desk',
    title: 'Sponsor Desk — Platform Reservasi Slot Iklan Media Lokal',
    description:
      'Platform self-service reservasi slot iklan terpadu untuk media lokal dan independen.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-slate-950 text-white`}>
        <Providers>
          {children}
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  )
}

