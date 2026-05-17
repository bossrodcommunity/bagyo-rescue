CREATE TYPE "rescue_ping_status" AS ENUM (
  'New',
  'Acknowledged',
  'Responding',
  'Resolved'
);

CREATE TABLE "rescue_pings" (
  "id" TEXT NOT NULL DEFAULT concat('ping_', replace((gen_random_uuid())::text, '-'::text, ''::text)),
  "phone_number" TEXT NOT NULL,
  "latitude" DECIMAL(9, 6) NOT NULL,
  "longitude" DECIMAL(9, 6) NOT NULL,
  "accuracy_meters" DECIMAL(10, 2),
  "note" TEXT,
  "source" TEXT NOT NULL DEFAULT 'web',
  "status" "rescue_ping_status" NOT NULL DEFAULT 'New',
  "client_created_at" TIMESTAMPTZ(6) NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "rescue_pings_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "rescue_pings_latitude_range" CHECK ("latitude" >= -90 AND "latitude" <= 90),
  CONSTRAINT "rescue_pings_longitude_range" CHECK ("longitude" >= -180 AND "longitude" <= 180),
  CONSTRAINT "rescue_pings_accuracy_nonnegative" CHECK ("accuracy_meters" IS NULL OR "accuracy_meters" >= 0)
);

CREATE INDEX "rescue_pings_status_idx" ON "rescue_pings"("status");
CREATE INDEX "rescue_pings_created_at_idx" ON "rescue_pings"("created_at");
