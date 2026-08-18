import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { uploadFile, STORAGE_BUCKETS, generateStoragePath } from '@/lib/supabase'

export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const fileType = (formData.get('fileType') as string) || 'asset'
    const tempId = (formData.get('tempId') as string) || undefined

    if (!file) {
      return NextResponse.json({ message: 'Berkas tidak ditemukan dalam permintaan.' }, { status: 400 })
    }

    const bucket =
      fileType === 'proof' ? STORAGE_BUCKETS.PAYMENT_PROOFS : STORAGE_BUCKETS.AD_ASSETS
    const folder = fileType === 'proof' ? 'receipts' : 'materials'
    const storagePath = generateStoragePath(folder, file.name, tempId)

    const buffer = Buffer.from(await file.arrayBuffer())
    const publicUrl = await uploadFile({
      bucket,
      path: storagePath,
      file: buffer,
      contentType: file.type,
    })

    return NextResponse.json({
      url: publicUrl,
      fileType: file.type,
      fileSizeKb: Math.round(file.size / 1024),
    })
  } catch (error: any) {
    console.error('[Upload API Error]:', error)
    return NextResponse.json(
      { message: `Upload gagal: ${error?.message || 'Terjadi kesalahan pada server.'}` },
      { status: 500 }
    )
  }
}
