CREATE TABLE IF NOT EXISTS "SaleSignUps" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "submissionId" VARCHAR(64) NOT NULL,
  "eventSlug" VARCHAR(191) NOT NULL,
  "eventTitle" VARCHAR(191),
  "attendeeIndex" INTEGER NOT NULL,
  "firstName" VARCHAR(120) NOT NULL,
  "lastName" VARCHAR(120) NOT NULL,
  "email" VARCHAR(191) NOT NULL,
  "phone" VARCHAR(32) NOT NULL,
  "emailConsent" BOOLEAN NOT NULL DEFAULT false,
  "smsConsent" BOOLEAN NOT NULL DEFAULT false,
  "addressLine1" VARCHAR(256) NOT NULL,
  "addressLine2" VARCHAR(256),
  "city" VARCHAR(128) NOT NULL,
  "state" VARCHAR(32) NOT NULL,
  "zip" VARCHAR(16) NOT NULL,
  "firstNameNorm" VARCHAR(120) NOT NULL,
  "emailNorm" VARCHAR(191) NOT NULL,
  "sourceUrl" TEXT,
  "referrer" TEXT,
  "utmSource" VARCHAR(191),
  "utmMedium" VARCHAR(191),
  "utmCampaign" VARCHAR(191),
  "utmTerm" VARCHAR(191),
  "utmContent" VARCHAR(191),
  "gclid" VARCHAR(191),
  "fbclid" VARCHAR(191),
  CONSTRAINT "SaleSignUps_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "SaleSignUps_eventSlug_createdAt_idx"
  ON "SaleSignUps"("eventSlug", "createdAt");

CREATE INDEX IF NOT EXISTS "SaleSignUps_submissionId_idx"
  ON "SaleSignUps"("submissionId");

CREATE INDEX IF NOT EXISTS "sale_signup_dedupe_idx"
  ON "SaleSignUps"("eventSlug", "emailNorm", "firstNameNorm");

ALTER TABLE "SaleSignUps"
  ADD COLUMN IF NOT EXISTS "emailConsent" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "addressLine1" VARCHAR(256) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "addressLine2" VARCHAR(256),
  ADD COLUMN IF NOT EXISTS "city" VARCHAR(128) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "state" VARCHAR(32) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "zip" VARCHAR(16) NOT NULL DEFAULT '';
