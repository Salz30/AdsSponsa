import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { deleteFile, STORAGE_BUCKETS } from '@/lib/supabase'

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const bookingId = parseInt(id, 10)

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        assets: true,
        payment: true,
      },
    })

    if (!booking) {
      return NextResponse.json({ message: 'Pemesanan tidak ditemukan' }, { status: 404 })
    }

    // Verifikasi bahwa user yang sedang login adalah pemilik pemesanan
    if (booking.userId !== parseInt(session.user.id, 10) && session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    // Aturan bisnis: User hanya bisa menghapus jika status PENDING_PAYMENT atau PENDING_REVIEW
    if (
      session.user.role !== 'ADMIN' &&
      booking.status !== 'PENDING_PAYMENT' &&
      booking.status !== 'PENDING_REVIEW'
    ) {
      return NextResponse.json(
        { message: 'Pemesanan tidak dapat dibatalkan karena pembayaran sudah diverifikasi dan masuk jadwal tayang.' },
        { status: 400 }
      )
    }

    // Hapus file di storage secara asinkron
    for (const asset of booking.assets) {
      const path = asset.filePath.split(`${STORAGE_BUCKETS.AD_ASSETS}/`)[1]
      if (path) deleteFile(STORAGE_BUCKETS.AD_ASSETS, path).catch(() => {})
    }
    
    if (booking.payment?.proofFilePath) {
      const path = booking.payment.proofFilePath.split(`${STORAGE_BUCKETS.PAYMENT_PROOFS}/`)[1]
      if (path) deleteFile(STORAGE_BUCKETS.PAYMENT_PROOFS, path).catch(() => {})
    }

    // Hapus booking dari DB
    await prisma.booking.delete({
      where: { id: bookingId },
    })

    return NextResponse.json({ message: 'Pemesanan berhasil dibatalkan dan dihapus.' }, { status: 200 })
  } catch (error: any) {
    console.error('Cancel Booking Error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan sistem saat membatalkan pemesanan.', error: error.message },
      { status: 500 }
    )
  }
}
