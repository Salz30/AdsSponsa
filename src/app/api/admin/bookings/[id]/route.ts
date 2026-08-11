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

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await params
    const bookingId = parseInt(id, 10)

    // Ambil data assets & payment proof untuk dihapus dari Storage (opsional tapi baik untuk kebersihan)
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        assets: true,
        payment: true,
        proofs: true,
      },
    })

    if (!booking) {
      return NextResponse.json({ message: 'Booking tidak ditemukan' }, { status: 404 })
    }

    // Eksekusi penghapusan file di cloud storage secara asinkron
    const storageDeletions = []
    
    for (const asset of booking.assets) {
      const path = asset.filePath.split(`${STORAGE_BUCKETS.AD_ASSETS}/`)[1]
      if (path) storageDeletions.push(deleteFile(STORAGE_BUCKETS.AD_ASSETS, path).catch(() => {}))
    }
    
    if (booking.payment?.proofFilePath) {
      const path = booking.payment.proofFilePath.split(`${STORAGE_BUCKETS.PAYMENT_PROOFS}/`)[1]
      if (path) storageDeletions.push(deleteFile(STORAGE_BUCKETS.PAYMENT_PROOFS, path).catch(() => {}))
    }
    
    // Hapus data dari database (Cascade otomatis menangani tabel relasi)
    await prisma.booking.delete({
      where: { id: bookingId },
    })

    return NextResponse.json({ message: 'Pemesanan berhasil dihapus secara permanen.' }, { status: 200 })
  } catch (error: any) {
    console.error('Delete Booking Error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan sistem', error: error.message },
      { status: 500 }
    )
  }
}
