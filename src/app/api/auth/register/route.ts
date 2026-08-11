import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { Role } from '@prisma/client'

export async function POST(req: Request) {
  try {
    const { name, email, password, phoneNumber } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Semua bidang wajib diisi.' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ message: 'Email sudah terdaftar.' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        phoneNumber: phoneNumber || null,
        role: Role.ADVERTISER,
      },
    })

    return NextResponse.json(
      { message: 'Registrasi berhasil!', userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration API Error:', error)
    return NextResponse.json({ message: 'Terjadi kesalahan pada server.' }, { status: 500 })
  }
}
