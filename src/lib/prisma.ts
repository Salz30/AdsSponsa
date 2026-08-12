import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pool: pg.Pool | undefined
}

function createPrismaClient() {
  // In serverless environments (Vercel), each function invocation may open a
  // new connection.  We use pgBouncer-compatible pool settings to avoid
  // exhausting the database connection limit.
  //
  // DATABASE_URL  — pooled connection string (e.g. Supabase pgBouncer :6543)
  // DIRECT_URL    — direct connection string (e.g. Supabase :5432)
  //                 Used by Prisma Migrate and for operations that need a
  //                 real connection (transactions, LISTEN/NOTIFY, etc.).
  const connectionString = process.env.DATABASE_URL

  const pool =
    globalForPrisma.pool ??
    new pg.Pool({
      connectionString,
      // Keep the pool small — serverless functions are short-lived and a large
      // pool would hold connections open unnecessarily between invocations.
      max: 2,
      idleTimeoutMillis: 3000,
      allowExitOnIdle: true,
    })

  // Only cache the pool in development/test to avoid leaking connections in
  // the serverless hot-reload cycle on Vercel.
  if (process.env.NODE_ENV !== 'production') globalForPrisma.pool = pool

  const adapter = new PrismaPg(pool)

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  })
}

// ── Singleton ─────────────────────────────────────────────────────────────────
// Re-use the same PrismaClient instance across hot-reloads in development.
// In production (Vercel serverless), each function execution gets a fresh
// module scope, so the globalThis trick keeps the pool alive across invocations
// within the same container/instance.
export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
