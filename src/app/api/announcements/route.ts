import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const announcements = await prisma.announcement.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(announcements)
  } catch (err) {
    console.error('Fetch announcements error:', err)
    return NextResponse.json([])
  }
}
