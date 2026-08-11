import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AdSlotCategory } from '@prisma/client'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category') as AdSlotCategory | null

    const whereCondition = {
      isActive: true,
      ...(category ? { category } : {}),
    }

    const slots = await prisma.adSlot.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(slots)
  } catch (error) {
    console.error('API Slots Error:', error)
    return NextResponse.json({ message: 'Gagal mengambil data slot iklan.' }, { status: 500 })
  }
}
