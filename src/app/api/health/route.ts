import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/health
 *
 * Diagnostic endpoint — cek apakah database dan env vars sudah terkonfigurasi
 * dengan benar di Vercel.
 *
 * ⚠️  HAPUS file ini setelah masalah production terdiagnosis!
 */
export async function GET() {
  const checks: Record<string, string | boolean> = {}

  // 1. Cek environment variables wajib
  checks['NEXTAUTH_SECRET set']    = !!process.env.NEXTAUTH_SECRET
  checks['DATABASE_URL set']       = !!process.env.DATABASE_URL
  checks['NODE_ENV']               = process.env.NODE_ENV ?? '(tidak ada)'
  checks['VERCEL_URL']             = process.env.VERCEL_URL ?? '(tidak ada)'

  // Pastikan DATABASE_URL menggunakan port pooler Supabase (6543), bukan direct (5432)
  const dbUrl = process.env.DATABASE_URL ?? ''
  checks['DATABASE_URL port']      = dbUrl.includes(':6543') ? '6543 ✅ pooled' :
                                     dbUrl.includes(':5432') ? '5432 ⚠️  direct (ganti ke 6543!)' :
                                     '(tidak diketahui)'
  checks['DATABASE_URL has ssl']   = dbUrl.includes('sslmode') || dbUrl.includes('ssl')

  // 2. Cek koneksi database
  try {
    await prisma.$queryRaw`SELECT 1`
    checks['Database connection']  = '✅ OK'
  } catch (err) {
    checks['Database connection']  = `❌ GAGAL: ${err instanceof Error ? err.message : String(err)}`
  }

  // 3. Cek apakah tabel users ada
  try {
    const count = await prisma.user.count()
    checks['User table']           = `✅ OK (${count} users)`
  } catch (err) {
    checks['User table']           = `❌ GAGAL: ${err instanceof Error ? err.message : String(err)}`
  }

  return NextResponse.json(checks, { status: 200 })
}
