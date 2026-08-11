import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { BLOCKING_STATUSES } from '@/lib/utils'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const slotId = parseInt(id, 10)

    if (isNaN(slotId)) {
      return NextResponse.json({ message: 'ID Slot tidak valid.' }, { status: 400 })
    }

    const slot = await prisma.adSlot.findUnique({
      where: { id: slotId },
      include: {
        bookings: {
          where: {
            status: { in: BLOCKING_STATUSES },
          },
          select: {
            startDate: true,
            endDate: true,
            status: true,
          },
        },
      },
    })

    if (!slot) {
      return NextResponse.json({ message: 'Slot iklan tidak ditemukan.' }, { status: 404 })
    }

    return NextResponse.json(slot)
  } catch (error) {
    console.error('Slot Detail API Error:', error)
    return NextResponse.json({ message: 'Gagal memuat detail slot.' }, { status: 500 })
  }
}
