import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

// prisma.config.ts digunakan oleh Prisma CLI (migrate, generate, studio).
// Runtime PrismaClient membaca DATABASE_URL langsung via pg.Pool di src/lib/prisma.ts
// menggunakan PrismaPg adapter — tidak memerlukan directUrl di sini karena
// koneksi dikelola sepenuhnya oleh pg.Pool, bukan oleh Prisma native driver.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
})
