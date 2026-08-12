import 'dotenv/config'
import { defineConfig } from 'prisma/config'

// NOTE: DATABASE_URL and DIRECT_URL are now declared directly in
// prisma/schema.prisma via env() so Prisma Client can read them at runtime
// (including on Vercel serverless).  This config file is only used by the
// Prisma CLI (migrate, studio, generate) and references the schema path.
export default defineConfig({
  schema: 'prisma/schema.prisma',
})
