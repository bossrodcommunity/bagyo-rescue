CREATE TYPE "report_history_type" AS ENUM (
  'flood_report',
  'rescue_request'
);

CREATE TYPE "report_history_status" AS ENUM (
  'new',
  'acknowledged',
  'responding',
  'resolved'
);

CREATE TABLE "report_histories" (
  "id" TEXT NOT NULL DEFAULT concat('report_', replace((gen_random_uuid())::text, '-'::text, ''::text)),
  "type" "report_history_type" NOT NULL,
  "family_id" TEXT,
  "house_id" TEXT,
  "family_code" TEXT,
  "access_method" TEXT NOT NULL,
  "phone_number" TEXT,
  "latitude" DECIMAL(9, 6),
  "longitude" DECIMAL(9, 6),
  "accuracy_meters" DECIMAL(10, 2),
  "water_level" "water_level",
  "people_count" INTEGER,
  "note" TEXT,
  "source" TEXT NOT NULL DEFAULT 'web',
  "status" "report_history_status" NOT NULL DEFAULT 'new',
  "client_created_at" TIMESTAMPTZ(6) NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "report_histories_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "report_histories_latitude_range" CHECK ("latitude" IS NULL OR ("latitude" >= -90 AND "latitude" <= 90)),
  CONSTRAINT "report_histories_longitude_range" CHECK ("longitude" IS NULL OR ("longitude" >= -180 AND "longitude" <= 180)),
  CONSTRAINT "report_histories_accuracy_nonnegative" CHECK ("accuracy_meters" IS NULL OR "accuracy_meters" >= 0),
  CONSTRAINT "report_histories_people_count_nonnegative" CHECK ("people_count" IS NULL OR "people_count" >= 0)
);

CREATE INDEX "report_histories_type_idx" ON "report_histories"("type");
CREATE INDEX "report_histories_status_idx" ON "report_histories"("status");
CREATE INDEX "report_histories_family_id_idx" ON "report_histories"("family_id");
CREATE INDEX "report_histories_house_id_idx" ON "report_histories"("house_id");
CREATE INDEX "report_histories_created_at_idx" ON "report_histories"("created_at");

ALTER TABLE "report_histories"
  ADD CONSTRAINT "report_histories_family_id_fkey"
  FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "report_histories"
  ADD CONSTRAINT "report_histories_house_id_fkey"
  FOREIGN KEY ("house_id") REFERENCES "houses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "report_histories" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "report_histories_public_insert"
  ON "report_histories"
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    "source" = 'web'
    AND "status" = 'new'
    AND "access_method" IN ('scan', 'upload', 'manual')
    AND ("latitude" IS NULL OR ("latitude" >= -90 AND "latitude" <= 90))
    AND ("longitude" IS NULL OR ("longitude" >= -180 AND "longitude" <= 180))
    AND ("accuracy_meters" IS NULL OR "accuracy_meters" >= 0)
    AND ("people_count" IS NULL OR "people_count" >= 0)
  );

GRANT INSERT ON TABLE "report_histories" TO anon, authenticated;
