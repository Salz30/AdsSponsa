# Product Requirement Document (PRD) & Entity Relationship Diagram (ERD)
## Sistem Manajemen Direct Sponsorship & Slot Media Lokal (Adsponsa)

---

## 1. Document Overview & Metadata

* **Project Name:** Adsponsa (Sistem Manajemen Direct Sponsorship & Slot Media Lokal)
* **Document Version:** 2.2.0
* **Author:** Lead Product Developer
* **Status:** Deployed & Production Ready (Vercel)
* **Production URL:** `https://ads-sponsa.vercel.app`
* **Target Release Date:** Q3 2026 (Completed)

---

## 2. Executive Summary & Problem Statement

### 2.1 Background & Problem
Media independen, penerbit buletin/newsletter komunitas, pengelola podcast, dan portal berita lokal sering kali bergantung pada model pendapatan *direct sponsorship* atau penjualan slot iklan mandiri. Namun, operasional penjualan slot iklan ini menghadapi kendala signifikan:
1. **Pengelolaan Manual & Tercecer:** Negosiasi, pemesanan slot, dan pengiriman materi iklan dilakukan lewat obrolan aplikasi pesan (*WhatsApp/Email*) dan dicatat dalam *spreadsheet* terpisah.
2. **Kurangnya Transparansi bagi Pengiklan:** Pengiklan (*brand* lokal) kesulitan mengetahui ketersediaan slot secara *real-time*, spesifikasi materi iklan, serta kepastian jadwal tayang.
3. **Risiko Overbooking & Miskomunikasi:** Rentan terjadi bentrokan jadwal tayang iklan atau keterlambatan publikasi akibat tidak adanya *inventory management* yang terpusat.
4. **Verifikasi Bukti Tayang Konvensional:** Pengiriman bukti tayang (*proof of performance*) dilakukan manual satu per satu, memperlambat proses rekonsiliasi pembayaran dan *report*.

### 2.2 Proposed Solution
**AdSlot Manager** adalah *web application* yang dirancang sebagai sistem reservasi dan *inventory management* slot iklan terpadu untuk media lokal/independen. Platform ini menyediakan katalog slot publik berbasis kalender ketersediaan, formulir pemesanan & unggah materi mandiri bagi pengiklan, *dashboard approval workflow* bagi pengelola media, serta portal *proof of performance* otomatis.

---

## 3. Goals & Non-Goals

### 3.1 Key Goals
* **Efisiensi Operasional:** Memangkas waktu koordinasi penayangan iklan hingga 70% melalui *workflow* otomatis.
* **Akurasi Inventory:** Eliminasi risiko *overbooking* slot iklan dengan *calendar-locking mechanism*.
* **Pengalaman Pengiklan (Client Experience):** Menyediakan portal *self-service* yang transparan bagi pengiklan dari pengajuan hingga pelaporan.
* **Kemudahan Eksekusi Solo Developer:** Arsitektur sistem difokuskan pada *core logic* yang bersih tanpa ketergantungan API pihak ketiga yang kompleks.

### 3.2 Non-Goals (Out of Scope for v1.0)
* **Automated Programmatic Ad Network:** Tidak berfungsi sebagai ad network otomatis seperti Google AdSense/Programmatic Bidding.
* **Complex Payment Gateway Integration:** Pembayaran pada v1.0 menggunakan metode verifikasi pembayaran manual/transfer bank berbasis unggah bukti bayar.
* **Social Media Auto-Posting API:** Tidak melakukan posting otomatis ke platform sosial media via API external (posting dilakukan manual oleh tim media, lalu *proof of link/screenshot* diunggah ke sistem).

---

## 4. User Personas & Target Users

| Persona | Role | Primary Goals | Key Pain Points |
| :--- | :--- | :--- | :--- |
| **Budi (Media Manager / Admin)** | Pemilik/Pengelola Media Lokal | Mengelola jadwal iklan, mereview materi pengiklan, menerbitkan bukti tayang, melihat total omset. | Pesan sponsor tercecer di WA, sering lupa melepas banner iklan yang sudah habis masa tayangnya. |
| **Siska (Brand Owner / Advertiser)** | Pengiklan / Sponsor | Mencari slot iklan kosong, mengunggah materi iklan sesuai spek, melihat status tayang & laporan. | Sulit dapat kepastian slot kosong, proses konfirmasi lama, jarang mendapat laporan tayang yang rapi. |

---

## 5. Core Feature Specifications (3–5 Primary Features)

### Feature 1: Public Slot Catalog & Interactive Availability Calendar
* **Deskripsi:** Halaman publik yang menampilkan daftar slot iklan beserta spesifikasi, harga, dan kalender ketersediaan interaktif.
* **Functional Requirements:**
  * Menampilkan kartu slot iklan (*Banner Top*, *Podcast Mid-roll*, *Newsletter Sponsored Post*, *Instagram Feed/Story*).
  * Filter berdasarkan tipe media dan rentang harga.
  * Tampilan kalender *real-time* yang menandai tanggal dengan status: `Available`, `Pending Approval`, atau `Booked`.
  * Rincian spesifikasi teknis per slot (misal: "1080x1920px, max 5MB, format PNG/JPG").

### Feature 2: Self-Service Booking & Asset Submission
* **Deskripsi:** Form alur pemesanan bagi pengiklan untuk memilih slot, tanggal, dan langsung mengunggah materi iklan.
* **Functional Requirements:**
  * Pengiklan memilih tanggal/periode penayangan pada kalender slot.
  * Form data kampanye: Nama Kampanye, Nama Perusahaan/Brand, URL Tujuan (Call to Action).
  * File uploader dengan validasi tipe file (*image/audio/pdf*) dan ukuran maksimal.
  * Ringkasan biaya otomatis berdasarkan jumlah hari/slot yang dipilih.
  * Form unggah bukti transfer pembayaran.

### Feature 3: Media Owner Dashboard & Ad Operations Workflow
* **Deskripsi:** Halaman *backend* internal bagi Admin/Media Owner untuk mengelola *lifecycle* pemesanan dan materi iklan.
* **Functional Requirements:**
  * Dashboard overview: Jumlah booking masuk (`Pending Review`), status iklan aktif (`Live`), dan ringkasan pendapatan.
  * *Approval Module*: Fitur untuk menyetujui (`Approve`), menolak (`Reject` + alasan), atau meminta revisi materi (`Request Revision`).
  * *Status State Machine*: Mengubah status booking sesuai alur kerja.
  * Fitur ekspor kalender penayangan bulanan ke format CSV/Excel.

### Feature 4: Proof of Performance & Client Reporting Portal
* **Deskripsi:** Modul pelaporan transparan tempat admin mengunggah bukti tayang dan pengiklan melihat rekapitulasi.
* **Functional Requirements:**
  * Admin dapat mengunggah bukti tayang berupa *screenshot* atau menyematkan *URL/Link* publikasi langsung.
  * Pengiklan mendapatkan *Unique Campaign Link* (dapat diakses tanpa login/akses portal) untuk memantau status tayang & mengunduh laporan *proof of performance*.
  * Otomatis menandai status booking menjadi `Completed` setelah masa tayang berakhir dan bukti tayang diunggah.

---

## 6. Workflow & State Transitions

```
[ Advertiser Selects Slot & Date ]
                │
                ▼
[ Upload Assets & Payment Proof ] ────► Status: PENDING_PAYMENT
                │
                ▼
  [ Admin Reviews Booking ]
        ├──► REJECTED (Reason provided, notify user)
        └──► APPROVED ─────────────────► Status: SCHEDULED
                │
                ▼
     [ Start Date Arrives ] ───────────► Status: LIVE / ACTIVE
                │
                ▼
 [ Admin Uploads Proof of Performance ]
                │
                ▼
      [ End Date Passes ] ─────────────► Status: COMPLETED
```

---

## 7. Entity Relationship Diagram (ERD)

### 7.1 Database Conceptual Schema
Sistem menggunakan basis data relasional (RDBMS) dengan struktur tabel yang bersih, modular, dan teroptimasi untuk performa serta kemudahan pemeliharaan solo developer.

### 7.2 Entity List & Descriptions
1. **`users`**: Menyimpan data pengguna (Admin Media dan Pengiklan/Advertiser).
2. **`ad_slots`**: Menyimpan katalog slot iklan yang ditawarkan oleh media.
3. **`bookings`**: Menyimpan data transaksi pemesanan slot iklan oleh pengiklan.
4. **`ad_assets`**: Menyimpan berkas/materi iklan yang diunggah oleh pengiklan untuk pemesanan tertentu.
5. **`proof_of_performances`**: Menyimpan bukti penayangan iklan yang diunggah oleh admin.
6. **`payments`**: Menyimpan rekaman transaksi pembayaran dan verifikasi bukti bayar.

---

### 7.3 Detailed Database Table Structures

#### Table: `users`
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique User ID |
| `name` | VARCHAR(100) | NOT NULL | Full Name |
| `email` | VARCHAR(150) | UNIQUE, NOT NULL | Email Address |
| `password_hash` | VARCHAR(255) | NOT NULL | Encrypted Password |
| `phone_number` | VARCHAR(20) | NULLABLE | WhatsApp/Phone Number |
| `role` | ENUM | NOT NULL, DEFAULT 'advertiser' | Values: `'admin'`, `'advertiser'` |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation time |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record update time |

#### Table: `ad_slots`
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique Ad Slot ID |
| `title` | VARCHAR(150) | NOT NULL | Slot Title (e.g., "Main Banner Header") |
| `category` | ENUM | NOT NULL | Values: `'website'`, `'newsletter'`, `'podcast'`, `'social_media'` |
| `description` | TEXT | NULLABLE | Slot description & placement details |
| `price_per_day` | DECIMAL(12,2)| NOT NULL | Daily rate in IDR |
| `dimensions_spec` | VARCHAR(100) | NULLABLE | E.g., "728x90 px" or "1080x1920 px" |
| `allowed_formats` | VARCHAR(100) | NOT NULL | E.g., "PNG, JPG, MP3" |
| `max_file_size_mb`| INT | NOT NULL, DEFAULT 5 | Max file size limit |
| `is_active` | BOOLEAN | DEFAULT TRUE | Slot availability flag |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation time |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record update time |

#### Table: `bookings`
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique Booking ID |
| `booking_code` | VARCHAR(20) | UNIQUE, NOT NULL | Public tracking code (e.g. `BOOK-2026-001`) |
| `user_id` | BIGINT | FOREIGN KEY (`users.id`) | Advertiser reference |
| `ad_slot_id` | BIGINT | FOREIGN KEY (`ad_slots.id`) | Ad Slot reference |
| `campaign_name` | VARCHAR(150) | NOT NULL | Campaign name |
| `target_url` | VARCHAR(255) | NULLABLE | CTA Destination URL |
| `start_date` | DATE | NOT NULL | Booking Start Date |
| `end_date` | DATE | NOT NULL | Booking End Date |
| `total_price` | DECIMAL(12,2)| NOT NULL | Calculated Total Cost |
| `status` | ENUM | NOT NULL, DEFAULT 'pending_payment' | Values: `'pending_payment'`, `'pending_review'`, `'scheduled'`, `'live'`, `'completed'`, `'rejected'` |
| `rejection_reason`| TEXT | NULLABLE | Reason if status is rejected |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation time |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record update time |

#### Table: `ad_assets`
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique Asset ID |
| `booking_id` | BIGINT | FOREIGN KEY (`bookings.id`) | Booking reference |
| `file_path` | VARCHAR(255) | NOT NULL | Storage path / Cloud URL |
| `file_type` | VARCHAR(50) | NOT NULL | MIME Type (e.g., `image/png`) |
| `file_size_kb` | INT | NOT NULL | Size in Kilobytes |
| `version` | INT | DEFAULT 1 | Revision version counter |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation time |

#### Table: `payments`
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique Payment ID |
| `booking_id` | BIGINT | FOREIGN KEY (`bookings.id`) | Booking reference |
| `amount` | DECIMAL(12,2)| NOT NULL | Paid Amount |
| `bank_name` | VARCHAR(50) | NOT NULL | Bank/Sender Name |
| `proof_file_path` | VARCHAR(255) | NOT NULL | Payment receipt file path |
| `verified_at` | TIMESTAMP | NULLABLE | Verification timestamp |
| `verified_by` | BIGINT | FOREIGN KEY (`users.id`), NULLABLE | Admin who verified |
| `status` | ENUM | DEFAULT 'unverified' | Values: `'unverified'`, `'verified'`, `'rejected'` |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation time |

#### Table: `proof_of_performances`
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique Proof ID |
| `booking_id` | BIGINT | FOREIGN KEY (`bookings.id`) | Booking reference |
| `proof_type` | ENUM | NOT NULL | Values: `'screenshot'`, `'live_link'` |
| `content_url` | TEXT | NOT NULL | File storage path or URL link |
| `notes` | TEXT | NULLABLE | Additional notes from admin |
| `uploaded_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Upload timestamp |

---

### 7.4 Mermaid ERD Diagram Code

```mermaid
erDiagram
    users ||--o{ bookings : "places"
    users ||--o{ payments : "verifies (admin)"
    ad_slots ||--o{ bookings : "reserved in"
    bookings ||--o{ ad_assets : "contains"
    bookings ||--o1 payments : "has payment"
    bookings ||--o{ proof_of_performances : "has proofs"

    users {
        bigint id PK
        string name
        string email
        string password_hash
        string phone_number
        enum role
        timestamp created_at
    }

    ad_slots {
        bigint id PK
        string title
        enum category
        text description
        decimal price_per_day
        string dimensions_spec
        string allowed_formats
        boolean is_active
    }

    bookings {
        bigint id PK
        string booking_code UK
        bigint user_id FK
        bigint ad_slot_id FK
        string campaign_name
        date start_date
        date end_date
        decimal total_price
        enum status
        text rejection_reason
    }

    ad_assets {
        bigint id PK
        bigint booking_id FK
        string file_path
        string file_type
        int file_size_kb
        int version
    }

    payments {
        bigint id PK
        bigint booking_id FK
        decimal amount
        string bank_name
        string proof_file_path
        enum status
        timestamp verified_at
    }

    proof_of_performances {
        bigint id PK
        booking_id FK
        enum proof_type
        text content_url
        text notes
        timestamp uploaded_at
    }
```

---

## 8. Non-Functional Requirements (NFR)

1. **Performance:** 
   * Halaman katalog & kalender publik harus dapat dimuat dalam waktu < 1.5 detik.
   * Pencarian slot & query pengecekan bentrok tanggal (*date collision check*) harus diindeks dengan baik pada tabel `bookings`.
2. **Security:**
   * Password disimpan menggunakan enkripsi hashing aman (`Bcrypt`/`Argon2`).
   * Validasi ketat pada berkas yang diunggah (*MIME-type check* & pembatasan ekstensi file) untuk mencegah celah keamanan *Remote Code Execution*.
   * Parameterized query untuk mencegah *SQL Injection*.
3. **Usability & Responsive Design:**
   * Antarmuka publik & formulir pemesanan responsif sempurna untuk perangkat mobile (*mobile-first design*).
   * Dashboard admin dioptimalkan untuk tampilan desktop/tablet.

---

## 9. Implemented Tech Stack & Infrastructure (v1.5.0)

* **Frontend & Backend (Fullstack):** Next.js 16 (App Router) & React 19 (TypeScript 5.8).
* **Styling:** Tailwind CSS v4 + `@tailwindcss/postcss`.
* **Database & ORM:** Supabase PostgreSQL via `@prisma/adapter-pg` & Prisma 7 ORM (Connection Pooler port 6543).
* **Authentication:** NextAuth.js v5 (JWT Strategy, Credentials Provider, `trustHost: true`, HTTPS Secure Cookies `__Secure-next-auth.session-token`).
* **Storage:** Supabase Storage Buckets (`ad-assets`, `payment-proofs`, `proof-of-performances`).
* **Deployment & Serverless:** Vercel Platform (`src/proxy.ts` NextAuth v5 Middleware, fail-fast `pg.Pool` SSL, full-page navigation login/logout flow).

---

## 10. Development Roadmap & Milestones (4-Week Sprint Plan)

* **Week 1: Core Setup & Schema Implementation**
  * Inisialisasi proyek & konfigurasi database.
  * Implementasi Migrations, Models, dan Seeder berdasarkan ERD.
  * Authentication & Role Management (Admin vs Advertiser).

* **Week 2: Catalog & Booking System**
  * Pembangunan halaman Katalog Slot & Integrasi Kalender Ketersediaan.
  * Logika validasi *date overlap* (mencegah pemesanan tanggal yang sama).
  * Form pemesanan, upload materi, dan upload bukti bayar.

* **Week 3: Admin Operations Dashboard**
  * Dashboard Admin untuk manajemen booking & peninjauan bayar.
  * *Approval workflow* (Approve / Reject / Revise).
  * Modul unggah Bukti Tayang (*Proof of Performance*).

* **Week 4: Reporting, Testing & Deployment**
  * Halaman publik pelaporan kampanye (*Client Tracking Portal*).
  * Testing validasi file upload & skenario *date collision*.
  * Deployment ke server produksi (VPS / Cloud).
