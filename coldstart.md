# Coldstart Project Document: Sponsor Desk (AdSlot Manager)

Dokumen ini adalah catatan terpusat proyek **Sponsor Desk** mengikuti panduan **SOP Vibe Coding Ver 1.1**.

---

## 📌 STEP 0 — Ide & Kategori Aplikasi

* **Kategori Web App:** Productivity / Business Helper / Direct Sponsorship Management
* **Nama Aplikasi:** **Sponsor Desk** (AdSlot Manager)
* **Deskripsi Singkat:** Web application *self-service* reservasi slot iklan dan *inventory management* terpadu untuk penerbit media lokal, pengelola podcast, newsletter, dan sosial media.

---

## 📄 STEP 1 — PRD (Product Requirements Document) Sederhana

### 1. Masalah yang Diselesaikan
1. **Pengelolaan Manual & Tercecer:** Negosiasi, pemesanan slot, dan materi iklan sering tercecer di WhatsApp/email/spreadsheet.
2. **Kurangnya Transparansi Bagi Pengiklan:** Pengiklan kesulitan mengetahui ketersediaan slot real-time dan spesifikasi teknis.
3. **Risiko Overbooking:** Tidak adanya *calendar locking mechanism* yang otomatis mengunci tanggal iklan terpesan.
4. **Pelaporan Bukti Tayang Konvensional:** Verifikasi *proof of performance* dilakukan manual satu per satu.

### 2. Siapa User-nya (Target Users)
* **Media Manager / Admin (Budi):** Pemilik/pengelola media lokal yang memantau status penjualan, mengkonfirmasi pesanan, mengecek pembayaran, menerbitkan bukti tayang, mengelola slot iklan, dan mengeksport laporan CSV. (Mode Peninjauan / Admin tidak melakukan pemesanan sponsor).
* **Advertiser / Brand Owner (Siska):** Pengiklan lokal yang mencari slot kosong, mengunggah materi, memantau status tayang, dan mengunduh laporan resmi.

### 3. Fitur Utama (Core Features)
1. **Public Slot Catalog & Interactive Availability Calendar:** Katalog slot publik dengan kalender *real-time* yang otomatis memblokir tanggal bentrok (*date collision protection*) serta filter kategori dan rentang harga.
2. **Self-Service Booking & Asset/Payment Submission:** Formulir pemesanan multi-step khusus pengiklan (dengan proteksi blokir pemesanan bagi akun Admin), kalkulator biaya otomatis, upload materi iklan, dan unggah bukti transfer.
3. **Media Owner Dashboard & Approval Workflow:** Dashboard admin ber-paginasi dengan kartu metrik transparan-glowing, peninjauan materi/bukti bayar, aksi *Approve*/*Reject*, shortcut ekspor CSV, dan manajemen slot.
4. **Admin AdSlot Management (CRUD):** Modul kelola slot iklan internal untuk menambah slot baru, mengedit spesifikasi/harga, serta mengaktifkan/menonaktifkan slot.
5. **Client Tracking Portal & Proof of Performance:** Portal pelaporan publik tanpa login berbasis `booking_code` unik (dilengkapi halaman pencarian `/track`), *Progress Bar Step Tracker* 5 tahap, dan galeri bukti tayang (*screenshot* / *live link*).
6. **Automated State Updater (Cron Job):** Pembaruan otomatis status iklan terproteksi token dari *Scheduled* → *Live* → *Completed* berdasarkan rentang tanggal.

### 4. Out of Scope (Fitur yang Dikesampingkan di v1.0)
* Automatic Programmatic Bidding Network (seperti Google AdSense).
* Automatic Payment Gateway Integration (v1.0 menggunakan verifikasi transfer bank manual).
* Auto-Posting API Social Media (posting dilakukan manual oleh media owner, lalu bukti tayang diunggah ke portal).

---

## 👤 STEP 2 — User Persona & User Flow

### 1. User Personas

#### Persona A: Media Owner / Admin
* **Nama:** Budi Pratama (32 tahun)
* **Kebutuhan:** Memantau penjualan slot iklan tanpa overbooking, mereview pembayaran & materi, mengekspor laporan CSV, dan memperbarui slot iklan. (Hanya bertindak sebagai pemantau & pengelola, bukan pengiklan).
* **Masalah Utama:** Pesan iklan tercecer di obrolan WhatsApp, sering lupa melepaskan banner yang sudah habis masa tayangnya.

#### Persona B: Advertiser / Brand Owner
* **Nama:** Siska Indriani (28 tahun)
* **Kebutuhan:** Kepastian jadwal tayang slot iklan, proses upload materi mandiri, pencarian status kampanye, dan laporan bukti tayang resmi.
* **Masalah Utama:** Konfirmasi slot iklan lama, jarang mendapat laporan tayang yang rapi dari pengelola media.

### 2. User Flow Step-by-Step

```
[ Login Page (/login) ] ──► (Jika Admin: Langsung Redirect ke /admin/dashboard)
                               │ (Jika Advertiser: Redirect ke /dashboard atau katalog)
                               ▼
[ Advertiser membuka Website Utama (/) ] ──► Filter Kategori & Rentang Harga
                               │
                               ▼
[ Halaman Detail Slot (/slots/[id]) ] ──► Cek Kalender & Estimasi Biaya
                               │
                               ▼
[ Form Pemesanan Multi-Step (/slots/[id]/book) ]
  ├── Akun Admin: Diblokir + Banner "Mode Peninjauan Admin" (Disable Submit)
  └── Akun Advertiser: Lanjut Pemesanan & Upload Asset/Bayar (Validated via Zod)
                               │
                               ▼
[ Admin Dashboard (/admin/dashboard) ] (Protected via Proxy & Server Auth Guard)
  ├── Visual Metric Cards Glowing & Translucent Status Badges
  ├── Review Pemesanan Masuk (Server-side Pagination 15 items/page)
  ├── Ekspor Data CSV (/api/admin/export)
  └── Kelola Slot Iklan (/admin/slots) ──► Tambah/Edit/Status Slot
                               │
  ┌────────────────────────────┴────────────────────────────┐
  ▼                                                         ▼
[ Approve ]                                             [ Reject ]
 Status: SCHEDULED                                       Status: REJECTED (+ Alasan)
  │
  ▼ (Masa Tayang Tiba — Triggered via Cron Job)
 Status: LIVE
  │
  ▼ (Admin Upload Proof / End Date Passed)
 Status: COMPLETED
                               │
                               ▼
[ Client Tracking Portal (/track atau /track/[booking_code]) ] ──► Pantau Progress 5 Tahap & Bukti Tayang
```

---

## 📐 STEP 3 — Wireframe & Struktur Elemen Halaman

1. **Homepage Katalog (`/`)**:
   - Navbar Responsive (Logo, Link Katalog, Cek Status Booking, Status Login, Button Login/Register, Hamburger Mobile Menu)
   - Hero Section (Title, Subtitle, Badge Highlight)
   - Category Filter Bar & Price Range Filter Bar (< 100k, 100k-300k, > 300k)
   - Grid Card Slots (Badge Kategori, Tarif/hari, Title, Deskripsi, Spesifikasi, Button CTA Detail)
   - Footer

2. **Detail Slot & Kalender (`/slots/[id]`)**:
   - Breadcrumb Navigation
   - Kolom Kiri: Title, Harga/hari, Deskripsi Slot, Grid Spesifikasi Teknis (Dimensi, Format, Ukuran File, Laporan)
   - Kolom Kanan: `CalendarPicker` (DayPicker kalender dengan disabled dates, Widget Kalkulator Biaya, Button Lanjut Booking + searchParams price)

3. **Multi-Step Booking Form (`/slots/[id]/book`)**:
   - Warning Banner "Mode Peninjauan Admin" jika diakses akun Admin (Tombol submit dikunci)
   - Progress Step Indicator (Step 1-4) untuk Pengiklan
   - Step 1: Card Rincian Tanggal & Biaya Total Dinamis
   - Step 2: Form Input Nama Kampanye, Brand, Target URL CTA
   - Step 3: Drag & Drop File Uploader Materi Iklan
   - Step 4: Card Rekening Bank BCA, Form Nama Pengirim, File Uploader Bukti Bayar, Button Submit (Zod Validation)

4. **Admin Operations Dashboard (`/admin/dashboard`)**:
   - Header Controls: Button **"📋 Kelola Slot Iklan"** & **"📥 Ekspor CSV"**
   - Premium Glowing Metric Cards (Total Pendapatan, Pending Review, Kampanye Aktif, Total Booking)
   - Filter Status Tabs (Semua, Pending Review, Scheduled, Live, Completed, Rejected)
   - Data Table dengan Badge Status Translucence (Rounded Pill `bg-...-500/15 border border-...-500/30 text-...-300` tanpa teks terpotong)
   - Server-Side Paginated Table (15 items/page)
   - Review Modal (Preview Materi Iklan, Preview Bukti Transfer, Input Alasan Penolakan, Button Approve/Reject)

5. **Admin Slot Management (`/admin/slots`, `/admin/slots/create`, `/admin/slots/[id]/edit`)**:
   - Slot List Table dengan badge status Aktif/Nonaktif & tombol Toggle Status & Edit
   - Form Tambah/Edit Slot dengan validasi Zod dan toast feedback (`sonner`)

6. **Client Tracking Search & Portal (`/track` & `/track/[booking_code]`)**:
   - Halaman Pencarian `/track`: Form input booking code unik
   - Halaman Detail `/track/[booking_code]`: Header Card, Visual Progress Step Tracker 5 Tahap, Detail Jadwal, Card Galeri Bukti Tayang (*Screenshot* / *Live Link*)

---

## 🗄️ STEP 4 — Database Schema (Prisma PostgreSQL)

```mermaid
erDiagram
    users ||--o{ bookings : "places"
    users ||--o{ payments : "verifies (admin)"
    ad_slots ||--o{ bookings : "reserved in"
    bookings ||--o{ ad_assets : "contains"
    bookings ||--o1 payments : "has payment"
    bookings ||--o{ proof_of_performances : "has proofs"

    users {
        int id PK
        string name
        string email UK
        string password_hash
        string phone_number
        enum role "ADMIN | ADVERTISER"
    }

    ad_slots {
        int id PK
        string title UK
        enum category "WEBSITE | NEWSLETTER | PODCAST | SOCIAL_MEDIA"
        text description
        decimal price_per_day
        string dimensions_spec
        string allowed_formats
        int max_file_size_mb
        boolean is_active
    }

    bookings {
        int id PK
        string booking_code UK
        int user_id FK
        int ad_slot_id FK
        string campaign_name
        string brand_name
        string target_url
        date start_date
        date end_date
        decimal total_price
        enum status "PENDING_PAYMENT | PENDING_REVIEW | SCHEDULED | LIVE | COMPLETED | REJECTED"
        text rejection_reason
    }

    ad_assets {
        int id PK
        int booking_id FK
        string file_path
        string file_type
        int file_size_kb
        int version
    }

    payments {
        int id PK
        int booking_id FK
        decimal amount
        string bank_name
        string sender_name
        string proof_file_path
        enum status "UNVERIFIED | VERIFIED | REJECTED"
    }

    proof_of_performances {
        int id PK
        int booking_id FK
        enum proof_type "SCREENSHOT | LIVE_LINK"
        text content_url
        text notes
    }
```

---

## 🎨 STEP 5 — Style & Mood Visual

* **Mood / Vibe App:** Clean, Modern, Professional, Glassmorphic & High-Tech Dark Theme.
* **Palet Warna Utama:**
  - **Background Utama:** Slate 950 (`#020617`) & Deep Purple/Indigo Gradients
  - **Warna Aksen Primary:** Brand Purple (`hsl(262, 83%, 58%)`) & Vibrant Indigo (`hsl(239, 84%, 67%)`)
  - **Badge Status (Glass Translucent):**
    - Pending Payment: `bg-amber-500/15 text-amber-300 border-amber-500/30`
    - Pending Review: `bg-blue-500/15 text-blue-300 border-blue-500/30`
    - Scheduled: `bg-purple-500/15 text-purple-300 border-purple-500/30`
    - Live: `bg-emerald-500/15 text-emerald-300 border-emerald-500/30`
    - Completed: `bg-slate-500/20 text-slate-300 border-slate-500/30`
    - Rejected: `bg-rose-500/15 text-rose-300 border-rose-500/30`
* **Typography:** `Inter` (Google Fonts via `next/font/google`).
* **Elemen Desain UI:** Glassmorphism (`backdrop-blur-xl`, border semi-transparan `border-white/10`), rounded-full status pills, micro-animations, dan shadow glowing.

---

## 💻 STEP 6 — Tech Stack Wajib (Kombinasi SOP Ver 1.1)

| Bagian | Teknologi Terkunci SOP | Implementasi Proyek |
|:---|:---|:---|
| **Framework** | Next.js | Next.js 16 (App Router) |
| **Library UI** | React | React 19 |
| **Bahasa** | TypeScript | TypeScript 5.8 |
| **Styling** | Tailwind CSS | Tailwind CSS v4 + @tailwindcss/postcss |
| **Database** | PostgreSQL (Supabase) | Supabase PostgreSQL via `@prisma/adapter-pg` & Prisma 7 ORM |
| **Auth** | NextAuth.js | NextAuth.js v5 (Credentials + JWT Role) |
| **Storage** | Supabase Storage | Supabase Storage Buckets (`ad-assets`, `payment-proofs`, `proof-of-performances`) |
| **Validation** | Zod | Zod v4 (`src/lib/validations.ts`) |
| **Tools Vibe Coding** | Antigravity AI | Antigravity AI Assistant |

---

## 🛠️ STEP 7–8 — Implementation, Testing & Debugging Summary

- **Prisma 7 & Driver Adapter Fix:** Mengintegrasikan `@prisma/adapter-pg` dan `pg` untuk mengeliminasi masalah IPv6/connection timeout pada Supabase.
- **Next.js 16 Proxy Convention:** Refactoring `src/proxy.ts` menjadi named export `proxy` dengan token check `getToken()` dari `next-auth/jwt`.
- **Admin Direct Redirect & Role Isolation:**
  - Login sebagai Admin langsung mengarahkan user ke `/admin/dashboard`.
  - Akses `/dashboard` oleh Admin otomatis di-redirect ke `/admin/dashboard`.
  - Percobaan booking oleh Admin diblokir pada API `POST /api/bookings` (403 Forbidden) dan UI booking form menampilkan banner peringatan & mengunci tombol kirim.
- **Admin Dashboard Visual Revamp:**
  - Perbaikan styling badge status menjadi translucent glowing pills (`rounded-full whitespace-nowrap`), mengeliminasi masalah teks terpotong/kotak putih kaku.
  - Kartu metrik diperbarui dengan icon badge glowing dan border gradient.
- **Production Build Result:** `npx next build` lulus 100% (exit code 0, 11 routes compiled).

---

## 🚀 STEP 9 — Deploy & Dokumentasi

- **Local Running Command:** `npm run dev` (Berjalan di `http://localhost:3000`)
- **Seeder Data Demo:**
  - Admin: `admin@sponsordesk.id` / `admin123!`
  - Advertiser: `siska@brand.id` / `advertiser123!`
- **Dokumentasi Lengkap:** [walkthrough.md](file:///C:/Users/Hype%20G12/.gemini/antigravity/brain/51cb8ba6-adff-4bdb-968b-09081248c0fb/walkthrough.md) & [implementation_plan.md](file:///C:/Users/Hype%20G12/.gemini/antigravity/brain/51cb8ba6-adff-4bdb-968b-09081248c0fb/implementation_plan.md)

---

## ✅ STEP 10 — Checklist Produksi & Catatan Update

### 1. Log Update Proyek

| Tanggal | Versi/Commit | Fokus Update | Status | Catatan |
|:---|:---|:---|:---|:---|
| 2026-08-07 | v1.0.0 | Inisialisasi & Implementasi Modul 0-6 | Done | Build dev & prod lulus |
| 2026-08-11 | v1.1.0 | **Fase 1: Security Fixes** (proxy.ts Next.js 16, admin server auth guard, CRON fail-closed, dynamic price) | Done | Audit & build test PASSED |
| 2026-08-11 | v1.2.0 | **Fase 2: Code Quality** (error boundaries, mobile navbar, admin pagination, Zod validations, price filter) | Done | Audit & build test PASSED |
| 2026-08-11 | v1.3.0 | **Fase 3: Fitur Baru** (Admin CRUD AdSlots, Ekspor CSV Data, Halaman Tracking Search `/track`, SEO Metadata) | Done | Build `next build` PASSED |
| 2026-08-11 | v1.4.0 | **Fase 4: UI/UX & Role Polish** (Admin direct login redirect, blokir Admin dari booking sponsor, redesign badge status translucent & glowing metric cards) | Done | Final build `next build` PASSED 100% |
