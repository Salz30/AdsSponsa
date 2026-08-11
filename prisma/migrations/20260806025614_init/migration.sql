-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'ADVERTISER');

-- CreateEnum
CREATE TYPE "AdSlotCategory" AS ENUM ('WEBSITE', 'NEWSLETTER', 'PODCAST', 'SOCIAL_MEDIA');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING_PAYMENT', 'PENDING_REVIEW', 'SCHEDULED', 'LIVE', 'COMPLETED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UNVERIFIED', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ProofType" AS ENUM ('SCREENSHOT', 'LIVE_LINK');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "phone_number" VARCHAR(20),
    "role" "Role" NOT NULL DEFAULT 'ADVERTISER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ad_slots" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "category" "AdSlotCategory" NOT NULL,
    "description" TEXT,
    "price_per_day" DECIMAL(12,2) NOT NULL,
    "dimensions_spec" VARCHAR(100),
    "allowed_formats" VARCHAR(100) NOT NULL,
    "max_file_size_mb" INTEGER NOT NULL DEFAULT 5,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ad_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" SERIAL NOT NULL,
    "booking_code" VARCHAR(25) NOT NULL,
    "user_id" INTEGER NOT NULL,
    "ad_slot_id" INTEGER NOT NULL,
    "campaign_name" VARCHAR(150) NOT NULL,
    "brand_name" VARCHAR(100) NOT NULL,
    "target_url" VARCHAR(255),
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "total_price" DECIMAL(12,2) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "rejection_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ad_assets" (
    "id" SERIAL NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "file_path" VARCHAR(500) NOT NULL,
    "file_type" VARCHAR(50) NOT NULL,
    "file_size_kb" INTEGER NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ad_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" SERIAL NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "bank_name" VARCHAR(50) NOT NULL,
    "sender_name" VARCHAR(100) NOT NULL,
    "proof_file_path" VARCHAR(500) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "verified_at" TIMESTAMP(3),
    "verified_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proof_of_performances" (
    "id" SERIAL NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "proof_type" "ProofType" NOT NULL,
    "content_url" TEXT NOT NULL,
    "notes" TEXT,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proof_of_performances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_booking_code_key" ON "bookings"("booking_code");

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

-- CreateIndex
CREATE INDEX "bookings_ad_slot_id_start_date_end_date_idx" ON "bookings"("ad_slot_id", "start_date", "end_date");

-- CreateIndex
CREATE UNIQUE INDEX "payments_booking_id_key" ON "payments"("booking_id");

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_ad_slot_id_fkey" FOREIGN KEY ("ad_slot_id") REFERENCES "ad_slots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ad_assets" ADD CONSTRAINT "ad_assets_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proof_of_performances" ADD CONSTRAINT "proof_of_performances_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
