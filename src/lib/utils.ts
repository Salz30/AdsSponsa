import { BookingStatus, AdSlotCategory } from '@prisma/client'

/**
 * Format currency to Indonesian Rupiah
 */
export function formatRupiah(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

/**
 * Format date to Indonesian locale
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d)
}

/**
 * Calculate number of days between two dates (inclusive)
 */
export function calculateDays(startDate: Date, endDate: Date): number {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays + 1 // inclusive
}

/**
 * Generate a unique booking code
 * Format: SLOT-YYYYMMDD-XXXX
 */
export function generateBookingCode(): string {
  const now = new Date()
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
  const randomPart = Math.random().toString(36).toUpperCase().substring(2, 6)
  return `SLOT-${dateStr}-${randomPart}`
}

/**
 * Map BookingStatus to human-readable Indonesian label
 */
export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING_PAYMENT: 'Menunggu Pembayaran',
  PENDING_REVIEW: 'Dalam Peninjauan',
  SCHEDULED: 'Terjadwal',
  LIVE: 'Sedang Tayang',
  COMPLETED: 'Selesai',
  REJECTED: 'Ditolak',
}

/**
 * Map BookingStatus to badge color variant
 */
export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  PENDING_PAYMENT: 'bg-amber-500/15 text-amber-300 border-amber-500/30 whitespace-nowrap shadow-sm',
  PENDING_REVIEW: 'bg-blue-500/15 text-blue-300 border-blue-500/30 whitespace-nowrap shadow-sm',
  SCHEDULED: 'bg-purple-500/15 text-purple-300 border-purple-500/30 whitespace-nowrap shadow-sm',
  LIVE: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 whitespace-nowrap shadow-sm',
  COMPLETED: 'bg-slate-500/20 text-slate-300 border-slate-500/30 whitespace-nowrap shadow-sm',
  REJECTED: 'bg-rose-500/15 text-rose-300 border-rose-500/30 whitespace-nowrap shadow-sm',
}

/**
 * Map AdSlotCategory to human-readable label
 */
export const CATEGORY_LABELS: Record<AdSlotCategory, string> = {
  WEBSITE: 'Website',
  NEWSLETTER: 'Newsletter',
  PODCAST: 'Podcast',
  SOCIAL_MEDIA: 'Social Media',
}

/**
 * Map AdSlotCategory to emoji icon
 */
export const CATEGORY_ICONS: Record<AdSlotCategory, string> = {
  WEBSITE: '🌐',
  NEWSLETTER: '📧',
  PODCAST: '🎙️',
  SOCIAL_MEDIA: '📱',
}

/**
 * Statuses that "block" a date range (prevent double booking)
 */
export const BLOCKING_STATUSES: BookingStatus[] = [
  BookingStatus.PENDING_REVIEW,
  BookingStatus.SCHEDULED,
  BookingStatus.LIVE,
]

/**
 * Validate file type against allowed formats string
 * allowedFormats example: "PNG, JPG, MP3"
 */
export function isFileTypeAllowed(fileType: string, allowedFormats: string): boolean {
  const allowed = allowedFormats
    .split(',')
    .map((f) => f.trim().toLowerCase())

  // fileType is MIME like "image/png" → extract "png"
  const ext = fileType.split('/').pop()?.toLowerCase() ?? ''
  const mimeBase = fileType.split('/')[0]

  // Map common MIME → extension aliases
  const mimeToExt: Record<string, string[]> = {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/gif': ['gif'],
    'image/webp': ['webp'],
    'audio/mpeg': ['mp3'],
    'audio/mp4': ['m4a'],
    'video/mp4': ['mp4'],
    'application/pdf': ['pdf'],
    'application/msword': ['doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
  }

  const exts = mimeToExt[fileType] ?? [ext]
  return exts.some((e) => allowed.includes(e))
}
