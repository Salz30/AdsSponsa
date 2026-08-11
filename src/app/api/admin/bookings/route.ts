import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { BookingStatus } from '@prisma/client'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Akses ditolak. Hanya Admin yang dapat mengakses data ini.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(req.url)
    const statusFilter = searchParams.get('status') as BookingStatus | null

    const bookings = await prisma.booking.findMany({
      where: {
        ...(statusFilter ? { status: statusFilter } : {}),
      },
      include: {
        user: {
          select: { name: true, email: true, phoneNumber: true },
        },
        adSlot: {
          select: { title: true, category: true, pricePerDay: true },
        },
        assets: true,
        payment: true,
        proofs: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Admin Bookings API Error:', error)
    return NextResponse.json(
      { message: 'Gagal mengambil data pemesanan admin.' },
      { status: 500 }
    )
  }
}
