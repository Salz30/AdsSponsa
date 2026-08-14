import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Akses ditolak.' }, { status: 403 })
    }
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(announcements)
  } catch (err) {
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Akses ditolak.' }, { status: 403 })
    }

    const body = await req.json()
    const { title, content, isActive } = body

    if (!title || !content) {
      return NextResponse.json(
        { message: 'Judul dan isi pengumuman wajib diisi.' },
        { status: 400 }
      )
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        isActive: isActive ?? true,
      },
    })

    return NextResponse.json(announcement, { status: 201 })
  } catch (err) {
    return NextResponse.json({ message: 'Gagal membuat pengumuman.' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Akses ditolak.' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const idStr = searchParams.get('id')
    if (!idStr) {
      return NextResponse.json({ message: 'ID pengumuman tidak ditemukan.' }, { status: 400 })
    }

    await prisma.announcement.delete({
      where: { id: parseInt(idStr, 10) },
    })

    return NextResponse.json({ message: 'Pengumuman berhasil dihapus.' })
  } catch (err) {
    return NextResponse.json({ message: 'Gagal menghapus pengumuman.' }, { status: 500 })
  }
}
