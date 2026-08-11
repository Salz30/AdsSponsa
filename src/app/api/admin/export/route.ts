import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const revalidate = 0

export async function GET() {
  try {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const bookings = await prisma.booking.findMany({
      include: {
        user: true,
        adSlot: true,
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    const headers = [
      'Kode Booking',
      'Nama Kampanye',
      'Brand',
      'Nama Pengiklan',
      'Email',
      'Slot Iklan',
      'Kategori',
      'Tanggal Mulai',
      'Tanggal Selesai',
      'Total Biaya',
      'Status',
      'Status Pembayaran',
      'Tanggal Dibuat',
    ]

    const csvRows = [headers.join(',')]

    for (const booking of bookings) {
      const row = [
        `"${booking.bookingCode}"`,
        `"${booking.campaignName}"`,
        `"${booking.brandName}"`,
        `"${booking.user.name}"`,
        `"${booking.user.email}"`,
        `"${booking.adSlot.title}"`,
        `"${booking.adSlot.category}"`,
        `"${booking.startDate.toISOString().split('T')[0]}"`,
        `"${booking.endDate.toISOString().split('T')[0]}"`,
        `"${booking.totalPrice.toString()}"`,
        `"${booking.status}"`,
        `"${booking.payment?.status || 'UNVERIFIED'}"`,
        `"${booking.createdAt.toISOString().split('T')[0]}"`,
      ]
      csvRows.push(row.join(','))
    }

    const csvString = csvRows.join('\n')

    return new NextResponse(csvString, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="sponsor-desk-bookings-export.csv"',
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
