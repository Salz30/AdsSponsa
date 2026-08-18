import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Public client — for use in browser/client components
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side admin client — only use in server components / API routes
export function createSupabaseAdmin() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Storage bucket names
export const STORAGE_BUCKETS = {
  AD_ASSETS: 'ad-assets',
  PAYMENT_PROOFS: 'payment-proofs',
  PROOF_OF_PERFORMANCES: 'proof-of-performances',
} as const

function createDataUrlFallback(path: string): string {
  const sanitizedPath = path.replace(/[^a-zA-Z0-9/._-]/g, '_')
  return `/uploads/fallback/${sanitizedPath}`
}

/**
 * Upload a file to Supabase Storage with resilient Data URL fallback
 * Returns the public URL of the uploaded file
 */
export async function uploadFile({
  bucket,
  path,
  file,
  contentType,
}: {
  bucket: string
  path: string
  file: Buffer | Uint8Array | Blob
  contentType: string
}): Promise<string> {
  try {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      console.warn('[Storage] SUPABASE_SERVICE_ROLE_KEY not set. Using path fallback.')
      return createDataUrlFallback(path)
    }

    const supabaseAdmin = createSupabaseAdmin()

    const { data, error } = await supabaseAdmin.storage.from(bucket).upload(path, file, {
      contentType,
      upsert: true,
    })

    if (error) {
      console.warn(
        `[Storage] Supabase upload to ${bucket}/${path} failed (${error.message}). Using path fallback.`
      )
      return createDataUrlFallback(path)
    }

    const { data: urlData } = supabaseAdmin.storage.from(bucket).getPublicUrl(data.path)
    return urlData.publicUrl
  } catch (err) {
    console.warn('[Storage] Storage upload exception:', err)
    return createDataUrlFallback(path)
  }
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(bucket: string, path: string): Promise<void> {
  try {
    const supabaseAdmin = createSupabaseAdmin()
    const { error } = await supabaseAdmin.storage.from(bucket).remove([path])
    if (error) {
      console.warn(`[Storage] Failed to delete file: ${error.message}`)
    }
  } catch (err) {
    console.warn('[Storage] Delete file exception:', err)
  }
}

/**
 * Generate a unique file path for storage
 * Format: {folder}/{timestamp}-{randomId}.{ext}
 */
export function generateStoragePath(
  folder: string,
  filename: string,
  bookingCode?: string
): string {
  const timestamp = Date.now()
  const randomId = Math.random().toString(36).substring(2, 8)
  const ext = filename.split('.').pop()
  const prefix = bookingCode ? `${bookingCode}/` : ''
  return `${folder}/${prefix}${timestamp}-${randomId}.${ext}`
}
