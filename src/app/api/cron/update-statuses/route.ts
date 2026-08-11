import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { BookingStatus } from '@prisma/client'

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization')
    // Fail-closed CRON security check
    if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ message: 'Unauthorized cron invocation.' }, { status: 401 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // 1. Update SCHEDULED -> LIVE (if start_date <= today)
    const scheduledToLive = await prisma.booking.updateMany({
      where: {
        status: BookingStatus.SCHEDULED,
        startDate: { lte: today },
      },
      data: {
        status: BookingStatus.LIVE,
      },
    })

    // 2. Update LIVE -> COMPLETED (if end_date < today)
    const liveToCompleted = await prisma.booking.updateMany({
      where: {
        status: BookingStatus.LIVE,
        endDate: { lt: today },
      },
      data: {
        status: BookingStatus.COMPLETED,
      },
    })

    return NextResponse.json({
      message: 'Status pemesanan berhasil diperbarui secara otomatis.',
      updatedToLive: scheduledToLive.count,
      updatedToCompleted: liveToCompleted.count,
    })
  } catch (error) {
    console.error('Cron Update Statuses Error:', error)
    return NextResponse.json(
      { message: 'Gagal memperbarui status pemesanan.' },
      { status: 500 }
    )
  }
}
