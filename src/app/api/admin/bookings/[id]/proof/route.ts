import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { ProofType, BookingStatus } from '@prisma/client'
import { uploadFile, STORAGE_BUCKETS, generateStoragePath } from '@/lib/supabase'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Akses khusus Admin.' }, { status: 403 })
    }

    const { id } = await params
    const bookingId = parseInt(id, 10)
    if (isNaN(bookingId)) {
      return NextResponse.json({ message: 'ID Pemesanan tidak valid.' }, { status: 400 })
    }

    const formData = await req.formData()
    const proofType = formData.get('proofType') as ProofType
    const liveUrl = formData.get('liveUrl') as string | null
    const notes = formData.get('notes') as string | null
    const screenshotFile = formData.get('screenshotFile') as File | null

    if (!proofType || !['SCREENSHOT', 'LIVE_LINK'].includes(proofType)) {
      return NextResponse.json({ message: 'Tipe bukti tayang tidak valid.' }, { status: 400 })
    }

    let finalContentUrl = ''

    if (proofType === 'SCREENSHOT') {
      if (!screenshotFile) {
        return NextResponse.json(
          { message: 'Berkas tangkapan layar (screenshot) wajib diunggah.' },
          { status: 400 }
        )
      }

      const buffer = Buffer.from(await screenshotFile.arrayBuffer())
      const path = generateStoragePath('proofs', screenshotFile.name)
      finalContentUrl = await uploadFile({
        bucket: STORAGE_BUCKETS.PROOF_OF_PERFORMANCES,
        path,
        file: buffer,
        contentType: screenshotFile.type,
      })
    } else {
      if (!liveUrl) {
        return NextResponse.json(
          { message: 'Tautan URL publikasi iklan wajib diisi.' },
          { status: 400 }
        )
      }
      finalContentUrl = liveUrl
    }

    // Save Proof of Performance and check if campaign end_date is past to auto-complete
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    })

    if (!booking) {
      return NextResponse.json({ message: 'Pemesanan tidak ditemukan.' }, { status: 404 })
    }

    const isEnded = new Date() >= new Date(booking.endDate)

    const proof = await prisma.$transaction(async (tx) => {
      const createdProof = await tx.proofOfPerformance.create({
        data: {
          bookingId,
          proofType,
          contentUrl: finalContentUrl,
          notes: notes || null,
        },
      })

      if (isEnded || booking.status === BookingStatus.LIVE) {
        await tx.booking.update({
          where: { id: bookingId },
          data: { status: BookingStatus.COMPLETED },
        })
      }

      return createdProof
    })

    return NextResponse.json(
      { message: 'Bukti tayang iklan berhasil diterbitkan!', proof },
      { status: 201 }
    )
  } catch (error) {
    console.error('Upload Proof API Error:', error)
    return NextResponse.json(
      { message: 'Gagal menerbitkan bukti tayang.' },
      { status: 500 }
    )
  }
}
