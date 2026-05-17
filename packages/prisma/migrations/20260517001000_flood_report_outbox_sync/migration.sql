CREATE TABLE "flood_reports" (
  "id" TEXT NOT NULL DEFAULT concat('flood_report_', replace((gen_random_uuid())::text, '-'::text, ''::text)),
  "client_report_id" TEXT NOT NULL,
  "latitude" DECIMAL(9, 6),
  "longitude" DECIMAL(9, 6),
  "accuracy" DECIMAL(10, 2),
  "barangay" TEXT,
  "risk_level" TEXT NOT NULL,
  "confidence" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "reported_at" TIMESTAMPTZ(6) NOT NULL,
  "expires_at" TIMESTAMPTZ(6) NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "flood_reports_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "flood_reports_client_report_id_key" ON "flood_reports"("client_report_id");
CREATE INDEX "flood_reports_risk_level_idx" ON "flood_reports"("risk_level");
CREATE INDEX "flood_reports_status_idx" ON "flood_reports"("status");
CREATE INDEX "flood_reports_expires_at_idx" ON "flood_reports"("expires_at");
