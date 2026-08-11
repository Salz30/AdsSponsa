import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { BookingStatus, PaymentStatus } from '@prisma/client'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Akses ditolak. Akses khusus Admin.' },
        { status: 403 }
      )
    }

    const { id } = await params
    const bookingId = parseInt(id, 10)
    if (isNaN(bookingId)) {
      return NextResponse.json({ message: 'ID Pemesanan tidak valid.' }, { status: 400 })
    }

    const { action, rejectionReason } = await req.json()

    if (!action || !['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json({ message: 'Aksi approval tidak valid.' }, { status: 400 })
    }

    const adminUserId = parseInt(session.user.id, 10)

    if (action === 'APPROVE') {
      // Approve booking -> status SCHEDULED, payment VERIFIED
      const updatedBooking = await prisma.$transaction(async (tx) => {
        const booking = await tx.booking.update({
          where: { id: bookingId },
          data: {
            status: BookingStatus.SCHEDULED,
            rejectionReason: null,
          },
        })

        await tx.payment.updateMany({
          where: { bookingId },
          data: {
            status: PaymentStatus.VERIFIED,
            verifiedAt: new Date(),
            verifiedBy: adminUserId,
          },
        })

        return booking
      })

      return NextResponse.json({
        message: 'Pemesanan dan pembayaran berhasil disetujui!',
        booking: updatedBooking,
      })
    } else {
      // Reject booking -> status REJECTED, payment REJECTED
      const updatedBooking = await prisma.$transaction(async (tx) => {
        const booking = await tx.booking.update({
          where: { id: bookingId },
          data: {
            status: BookingStatus.REJECTED,
            rejectionReason: rejectionReason || 'Materi atau bukti pembayaran tidak sesuai.',
          },
        })

        await tx.payment.updateMany({
          where: { bookingId },
          data: {
            status: PaymentStatus.REJECTED,
            verifiedAt: new Date(),
            verifiedBy: adminUserId,
          },
        })

        return booking
      })

      return NextResponse.json({
        message: 'Pemesanan berhasil ditolak.',
        booking: updatedBooking,
      })
    }
  } catch (error) {
    console.error('Admin Approval API Error:', error)
    return NextResponse.json(
      { message: 'Gagal memproses persetujuan pemesanan.' },
      { status: 500 }
    )
  }
}
