import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import {
  generateBookingCode,
  calculateDays,
  BLOCKING_STATUSES,
  isFileTypeAllowed,
} from '@/lib/utils'
import { uploadFile, STORAGE_BUCKETS, generateStoragePath } from '@/lib/supabase'
import { bookingSchema } from '@/lib/validations'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Anda harus masuk terlebih dahulu untuk melakukan pemesanan.' },
        { status: 401 }
      )
    }

    if (session.user.role === 'ADMIN') {
      return NextResponse.json(
        { message: 'Akun Admin (Mode Peninjauan) tidak dapat melakukan pemesanan slot iklan. Silakan masuk sebagai pengiklan.' },
        { status: 403 }
      )
    }

    const formData = await req.formData()

    const slotIdStr = formData.get('slotId') as string
    const startDateStr = formData.get('startDate') as string
    const endDateStr = formData.get('endDate') as string
    const campaignName = formData.get('campaignName') as string
    const brandName = formData.get('brandName') as string
    const targetUrl = formData.get('targetUrl') as string
    const notes = (formData.get('notes') as string) || ''
    const bankName = formData.get('bankName') as string
    const senderName = formData.get('senderName') as string

    const assetFile = formData.get('assetFile') as File | null
    const paymentProofFile = formData.get('paymentProofFile') as File | null

    const validation = bookingSchema.safeParse({
      slotId: parseInt(slotIdStr, 10),
      startDate: startDateStr,
      endDate: endDateStr,
      campaignName,
      brandName,
      targetUrl: targetUrl || '',
      bankName,
      senderName,
      notes,
    })

    if (!validation.success) {
      return NextResponse.json(
        { message: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    if (!assetFile || !paymentProofFile) {
      return NextResponse.json(
        { message: 'Semua bidang formulir dan berkas wajib diisi.' },
        { status: 400 }
      )
    }

    const slotId = parseInt(slotIdStr, 10)
    const startDate = new Date(startDateStr)
    const endDate = new Date(endDateStr)

    // Find the requested slot
    const slot = await prisma.adSlot.findUnique({
      where: { id: slotId },
    })

    if (!slot || !slot.isActive) {
      return NextResponse.json({ message: 'Slot iklan tidak tersedia.' }, { status: 404 })
    }

    // 1. DATE COLLISION CHECK (Pengecekan Tumpang Tindih Tanggal)
    const overlappingBookings = await prisma.booking.findMany({
      where: {
        adSlotId: slotId,
        status: { in: BLOCKING_STATUSES },
        OR: [
          {
            startDate: { lte: endDate },
            endDate: { gte: startDate },
          },
        ],
      },
    })

    if (overlappingBookings.length > 0) {
      return NextResponse.json(
        {
          message:
            'Maaf, tanggal yang Anda pilih telah dipesan oleh pengiklan lain. Silakan pilih tanggal lain.',
        },
        { status: 409 }
      )
    }

    // Validate Asset File format and size
    if (!isFileTypeAllowed(assetFile.type, slot.allowedFormats)) {
      return NextResponse.json(
        { message: `Format file materi iklan harus berupa: ${slot.allowedFormats}` },
        { status: 400 }
      )
    }

    const assetSizeMb = assetFile.size / (1024 * 1024)
    if (assetSizeMb > slot.maxFileSizeMb) {
      return NextResponse.json(
        { message: `Ukuran materi iklan maksimal ${slot.maxFileSizeMb} MB.` },
        { status: 400 }
      )
    }

    // Calculate Pricing
    const totalDays = calculateDays(startDate, endDate)
    const totalPrice = Number(slot.pricePerDay) * totalDays
    const bookingCode = generateBookingCode()

    // 2. FILE STORAGE UPLOADS (Supabase Storage)
    const assetBuffer = Buffer.from(await assetFile.arrayBuffer())
    const assetPath = generateStoragePath('materials', assetFile.name, bookingCode)
    const assetPublicUrl = await uploadFile({
      bucket: STORAGE_BUCKETS.AD_ASSETS,
      path: assetPath,
      file: assetBuffer,
      contentType: assetFile.type,
    })

    const proofBuffer = Buffer.from(await paymentProofFile.arrayBuffer())
    const proofPath = generateStoragePath('receipts', paymentProofFile.name, bookingCode)
    const proofPublicUrl = await uploadFile({
      bucket: STORAGE_BUCKETS.PAYMENT_PROOFS,
      path: proofPath,
      file: proofBuffer,
      contentType: paymentProofFile.type,
    })

    // 3. DATABASE ATOMIC TRANSACTION
    const result = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          bookingCode,
          userId: parseInt(session.user.id, 10),
          adSlotId: slotId,
          campaignName,
          brandName,
          targetUrl: targetUrl || null,
          notes: notes || null,
          startDate,
          endDate,
          totalPrice,
          status: 'PENDING_REVIEW', // After uploading payment proof, status is PENDING_REVIEW
        },
      })

      await tx.adAsset.create({
        data: {
          bookingId: booking.id,
          filePath: assetPublicUrl,
          fileType: assetFile.type,
          fileSizeKb: Math.round(assetFile.size / 1024),
          version: 1,
        },
      })

      await tx.payment.create({
        data: {
          bookingId: booking.id,
          amount: totalPrice,
          bankName,
          senderName,
          proofFilePath: proofPublicUrl,
          status: 'UNVERIFIED',
        },
      })

      return booking
    })

    return NextResponse.json(
      {
        message: 'Pemesanan berhasil dibuat!',
        bookingCode: result.bookingCode,
        id: result.id,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Booking Creation Error:', error)
    return NextResponse.json(
      { message: 'Gagal membuat pemesanan. Terjadi kesalahan pada server.' },
      { status: 500 }
    )
  }
}
