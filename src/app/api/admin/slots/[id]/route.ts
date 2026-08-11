import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { adSlotSchema } from '@/lib/validations'

export const revalidate = 0

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const slot = await prisma.adSlot.findUnique({
      where: { id: parseInt(id) },
    })

    if (!slot) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 })
    }

    return NextResponse.json(slot)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = adSlotSchema.parse(body)

    const slot = await prisma.adSlot.update({
      where: { id: parseInt(id) },
      data: validatedData,
    })

    return NextResponse.json(slot)
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const slot = await prisma.adSlot.findUnique({
      where: { id: parseInt(id) },
    })

    if (!slot) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 })
    }

    const updatedSlot = await prisma.adSlot.update({
      where: { id: parseInt(id) },
      data: { isActive: !slot.isActive },
    })

    return NextResponse.json(updatedSlot)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
