import { z } from 'zod'

// Login form validation
export const loginSchema = z.object({
  email: z.email('Email tidak valid.'),
  password: z.string().min(6, 'Password minimal 6 karakter.'),
})

// Register form validation
export const registerSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter.'),
  email: z.email('Email tidak valid.'),
  password: z.string().min(6, 'Password minimal 6 karakter.'),
  phoneNumber: z.string().optional(),
})

// Booking form validation
export const bookingSchema = z.object({
  slotId: z.number().int().positive(),
  startDate: z.string().min(1, 'Tanggal mulai wajib diisi.'),
  endDate: z.string().min(1, 'Tanggal selesai wajib diisi.'),
  campaignName: z.string().min(3, 'Nama kampanye minimal 3 karakter.'),
  brandName: z.string().min(2, 'Nama brand minimal 2 karakter.'),
  targetUrl: z.string().url('URL tidak valid.').optional().or(z.literal('')),
  bankName: z.string().min(1, 'Nama bank wajib diisi.'),
  senderName: z.string().min(2, 'Nama pengirim minimal 2 karakter.'),
  notes: z.string().optional(),
})

// Admin slot management
export const adSlotSchema = z.object({
  title: z.string().min(3, 'Judul slot minimal 3 karakter.'),
  category: z.enum(['WEBSITE', 'NEWSLETTER', 'PODCAST', 'SOCIAL_MEDIA']),
  description: z.string().optional(),
  pricePerDay: z.number().positive('Harga harus lebih dari 0.'),
  dimensionsSpec: z.string().optional(),
  allowedFormats: z.string().min(1, 'Format yang diizinkan wajib diisi.'),
  maxFileSizeMb: z.number().int().positive().default(5),
  isActive: z.boolean().default(true),
})

// Proof upload
export const proofSchema = z.object({
  proofType: z.enum(['SCREENSHOT', 'LIVE_LINK']),
  liveUrl: z.string().url('URL tidak valid.').optional().or(z.literal('')),
  notes: z.string().optional(),
})

// Type exports
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type BookingInput = z.infer<typeof bookingSchema>
export type AdSlotInput = z.infer<typeof adSlotSchema>
export type ProofInput = z.infer<typeof proofSchema>
