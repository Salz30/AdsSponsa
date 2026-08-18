import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import {
  generateBookingCode,
  calculateDays,
  BLOCKING_STATUSES,
} from '@/lib/utils'
import { bookingSchema } from '@/lib/validations'

export const maxDuration = 60

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
        { message: 'Akun Admin tidak dapat melakukan pemesanan slot iklan. Silakan masuk sebagai pengiklan.' },
        { status: 403 }
      )
    }

    // Accept JSON body (files already uploaded via /api/upload)
    const body = await req.json()
    const {
      slotId: slotIdRaw,
      startDate: startDateStr,
      endDate: endDateStr,
      campaignName,
      brandName,
      targetUrl,
      notes,
      bankName,
      senderName,
      assetUrl,
      assetFileType,
      assetFileSizeKb,
      proofUrl,
    } = body

    if (!assetUrl || !proofUrl) {
      return NextResponse.json(
        { message: 'URL berkas materi iklan dan bukti transfer wajib disertakan.' },
        { status: 400 }
      )
    }

    const validation = bookingSchema.safeParse({
      slotId: parseInt(slotIdRaw, 10),
      startDate: startDateStr,
      endDate: endDateStr,
      campaignName,
      brandName,
      targetUrl: targetUrl || '',
      bankName,
      senderName,
      notes: notes || '',
    })

    if (!validation.success) {
      return NextResponse.json(
        { message: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const slotId = parseInt(slotIdRaw, 10)
    const startDate = new Date(startDateStr)
    const endDate = new Date(endDateStr)

    const slot = await prisma.adSlot.findUnique({
      where: { id: slotId },
    })

    if (!slot || !slot.isActive) {
      return NextResponse.json({ message: 'Slot iklan tidak tersedia.' }, { status: 404 })
    }

    // 1. DATE COLLISION CHECK
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
      select: { id: true },
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

    // Calculate Pricing
    const totalDays = calculateDays(startDate, endDate)
    const totalPrice = Number(slot.pricePerDay) * totalDays
    const bookingCode = generateBookingCode()

    // 2. DATABASE ATOMIC TRANSACTION (With Outer Retry Fallback for DB Schema Mismatch)
    let result
    try {
      result = await prisma.$transaction(async (tx) => {
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
            status: 'PENDING_REVIEW',
          },
        })

        await tx.adAsset.create({
          data: {
            bookingId: booking.id,
            filePath: assetUrl,
            fileType: assetFileType || 'image/jpeg',
            fileSizeKb: assetFileSizeKb || 0,
            version: 1,
          },
        })

        await tx.payment.create({
          data: {
            bookingId: booking.id,
            amount: totalPrice,
            bankName,
            senderName,
            proofFilePath: proofUrl,
            status: 'UNVERIFIED',
          },
        })

        return booking
      })
    } catch (txErr: any) {
      console.warn(
        '[Booking API] Primary transaction failed (likely missing notes column). Retrying without notes:',
        txErr?.message
      )
      result = await prisma.$transaction(async (tx) => {
        const booking = await tx.booking.create({
          data: {
            bookingCode,
            userId: parseInt(session.user.id, 10),
            adSlotId: slotId,
            campaignName,
            brandName,
            targetUrl: targetUrl || null,
            startDate,
            endDate,
            totalPrice,
            status: 'PENDING_REVIEW',
          },
        })

        await tx.adAsset.create({
          data: {
            bookingId: booking.id,
            filePath: assetUrl,
            fileType: assetFileType || 'image/jpeg',
            fileSizeKb: assetFileSizeKb || 0,
            version: 1,
          },
        })

        await tx.payment.create({
          data: {
            bookingId: booking.id,
            amount: totalPrice,
            bankName,
            senderName,
            proofFilePath: proofUrl,
            status: 'UNVERIFIED',
          },
        })

        return booking
      })
    }

    return NextResponse.json(
      {
        message: 'Pemesanan berhasil dibuat!',
        bookingCode: result.bookingCode,
        id: result.id,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('[Booking API Error]:', error)
    const detail = error?.message || 'Terjadi kesalahan pada server.'
    return NextResponse.json(
      { message: `Gagal membuat pemesanan: ${detail}` },
      { status: 500 }
    )
  }
}
