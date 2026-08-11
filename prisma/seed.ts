import 'dotenv/config'
import { PrismaClient, Role, AdSlotCategory } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import bcrypt from 'bcryptjs'

const connectionString = process.env.DATABASE_URL
const pool = new pg.Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Starting database seed...')

  // ============================================================
  // USERS
  // ============================================================
  const adminPassword = await bcrypt.hash('admin123!', 12)
  const advertiserPassword = await bcrypt.hash('advertiser123!', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@sponsordesk.id' },
    update: {},
    create: {
      name: 'Budi Admin',
      email: 'admin@sponsordesk.id',
      passwordHash: adminPassword,
      phoneNumber: '08123456789',
      role: Role.ADMIN,
    },
  })
  console.log(`✅ Admin user: ${admin.email}`)

  const advertiser = await prisma.user.upsert({
    where: { email: 'siska@brand.id' },
    update: {},
    create: {
      name: 'Siska Brand Owner',
      email: 'siska@brand.id',
      passwordHash: advertiserPassword,
      phoneNumber: '08987654321',
      role: Role.ADVERTISER,
    },
  })
  console.log(`✅ Advertiser: ${advertiser.email}`)

  // ============================================================
  // AD SLOTS
  // ============================================================
  const slotsData = [
    {
      title: 'Header Banner Website',
      category: AdSlotCategory.WEBSITE,
      description:
        'Banner utama di bagian atas halaman beranda website kami. Tampil prominent di atas lipatan (above the fold) dengan visibilitas maksimal. Cocok untuk brand awareness campaign.',
      pricePerDay: 150000,
      dimensionsSpec: '1200x200 px (Leaderboard)',
      allowedFormats: 'PNG, JPG, GIF, WebP',
      maxFileSizeMb: 2,
      isActive: true,
    },
    {
      title: 'Mid-Roll Podcast Sponsorship',
      category: AdSlotCategory.PODCAST,
      description:
        'Slot sponsor di tengah episode podcast dengan 5.000+ pendengar aktif per episode. Durasi bacaan sponsor 30–60 detik dengan nada conversational dari host.',
      pricePerDay: 250000,
      dimensionsSpec: 'Audio: 30–60 detik | Brief: max 200 kata',
      allowedFormats: 'MP3, PDF, DOCX',
      maxFileSizeMb: 10,
      isActive: true,
    },
    {
      title: 'Dedicated Newsletter Spot',
      category: AdSlotCategory.NEWSLETTER,
      description:
        'Slot sponsor eksklusif di newsletter mingguan yang dikirim ke 12.000+ subscriber aktif. Termasuk logo brand, teks iklan 100 kata, dan satu CTA button.',
      pricePerDay: 200000,
      dimensionsSpec: '600px lebar | Logo: 300x100 px | Teks: max 100 kata',
      allowedFormats: 'PNG, JPG, PDF',
      maxFileSizeMb: 5,
      isActive: true,
    },
    {
      title: 'Instagram Story Slot',
      category: AdSlotCategory.SOCIAL_MEDIA,
      description:
        'Konten sponsor di Instagram Story akun media kami dengan 25.000+ followers. Format vertikal penuh layar dengan link ke landing page Anda.',
      pricePerDay: 175000,
      dimensionsSpec: '1080x1920 px (9:16 ratio)',
      allowedFormats: 'PNG, JPG, MP4',
      maxFileSizeMb: 8,
      isActive: true,
    },
  ]

  for (const slotData of slotsData) {
    const slot = await prisma.adSlot.upsert({
      where: { title: slotData.title },
      update: {},
      create: slotData,
    })
    console.log(`✅ Ad slot: ${slot.title} (Rp ${Number(slot.pricePerDay).toLocaleString('id-ID')}/hari)`)
  }

  console.log('\n🎉 Seeding completed successfully!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📧 Admin Login    → admin@sponsordesk.id  / admin123!')
  console.log('📧 Advertiser     → siska@brand.id        / advertiser123!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
