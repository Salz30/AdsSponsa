# Adsponsa 🚀

Adsponsa adalah **Sistem Manajemen Direct Sponsorship & Slot Media Lokal**. Aplikasi ini dibangun untuk memudahkan pengiklan (Advertiser) dalam memesan slot iklan (banner, newsletter, podcast, social media) dan bagi Pemilik Media (Admin/Media Owner) untuk mengelola persetujuan iklan, memantau pembayaran, dan menerbitkan bukti tayang secara terpusat.

## 🌟 Fitur Utama

- **Katalog Slot Interaktif**: Pengiklan dapat melihat daftar slot iklan yang tersedia beserta harganya, dan menyaring berdasarkan kategori atau rentang harga.
- **Pemesanan Mandiri (Self-Service)**: Pengiklan dapat memesan slot iklan, memilih tanggal di kalender, mengisi rincian kampanye, dan mengunggah materi iklan.
- **Portal Tracking Transaksi**: Pengiklan dapat memantau status pemesanan mereka secara *real-time* (Pending, Scheduled, Live, Completed, Rejected) menggunakan kode booking.
- **Admin Dashboard Lengkap**: Panel manajemen responsif (*mobile-friendly*) bagi admin untuk melihat statistik pemesanan, menyetujui/menolak kampanye, dan mengekspor laporan transaksi.
- **Unggah Bukti Pembayaran & Bukti Tayang (Proof of Performance)**: Integrasi dengan *cloud storage* (Supabase) untuk melampirkan berkas bukti.
- **Desain Modern (Glassmorphism)**: Antarmuka yang bersih dengan tema gelap elegan dan lencana status interaktif.

## 🛠️ Teknologi yang Digunakan

Aplikasi ini dikembangkan dengan *stack* modern terkini:
- **[Next.js 16](https://nextjs.org/)** - React Framework (App Router & Server Actions)
- **[TypeScript](https://www.typescriptlang.org/)** - Untuk keamanan penulisan tipe data
- **[Tailwind CSS v4](https://tailwindcss.com/)** - *Utility-first CSS framework* untuk desain UI
- **[Prisma ORM](https://www.prisma.io/)** - Interaksi database yang aman
- **[PostgreSQL (Supabase)](https://supabase.com/)** - Database utama dan *Cloud Storage*
- **[NextAuth.js (v5)](https://authjs.dev/)** - Sistem autentikasi pengguna
- **[Zod](https://zod.dev/)** - Validasi *schema* formulir

## 🚀 Panduan Instalasi Lokal

Ikuti langkah-langkah di bawah ini untuk menjalankan proyek secara lokal:

### 1. Kloning Repository
```bash
git clone https://github.com/USERNAME-ANDA/sponsor-desk.git
cd "Adsponsa"
```

### 2. Instalasi Dependensi
Jalankan perintah berikut untuk menginstal semua paket yang dibutuhkan:
```bash
npm install
```

### 3. Konfigurasi Environment (Lingkungan Lingkungan)
Duplikat file `.env.example` dan ubah namanya menjadi `.env`. Kemudian isi dengan konfigurasi kredensial database dan autentikasi Anda:

```env
# Database URL (dari Supabase / PostgreSQL)
DATABASE_URL="postgres://..."

# Auth (Gunakan "openssl rand -base64 32" untuk membuat secret baru)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="secret_anda_di_sini"

# Supabase Storage Credentials
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT_ID].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."

# Cron Job Secret
CRON_SECRET="cron_secret_anda_di_sini"
```

### 4. Persiapan Database (Migrasi & Seeding)
Terapkan skema ke database dan masukkan data awal (seperti akun Admin dan daftar kategori):
```bash
npm run db:push
npm run db:seed
```

### 5. Jalankan Development Server
Mulai *server* pengembangan lokal:
```bash
npm run dev
```
Buka browser dan akses **[http://localhost:3000](http://localhost:3000)**.

## 🗄️ Konfigurasi Supabase Storage
Agar fitur unggah file (materi iklan, bukti transfer, bukti tayang) berjalan, Anda harus membuat 3 *Public Bucket* di dashboard Storage Supabase dengan nama berikut secara persis:
1. `ad-assets`
2. `payment-proofs`
3. `proof-of-performances`

*Catatan: Pastikan opsi "Public bucket" diaktifkan saat membuat ketiga bucket tersebut.*

## 🔒 Manajemen Peran (Roles)
- **ADMIN**: Memiliki akses ke Dashboard Admin (`/admin/dashboard`), dapat membuat slot baru, dan memvalidasi pemesanan. (Bisa didapatkan dengan menggunakan email `admin@sponsordesk.com` saat *seeding* database awal).
- **USER (Advertiser)**: Hanya dapat melihat katalog, melakukan pemesanan, dan melacak status pemesanan miliknya di portal *Tracking*.

---
Dibuat dengan ❤️ untuk ekosistem Media Lokal.
