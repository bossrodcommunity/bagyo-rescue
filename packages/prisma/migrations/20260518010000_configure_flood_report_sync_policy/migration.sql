ALTER TABLE "flood_reports" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "flood_reports_public_insert"
  ON "flood_reports"
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    "client_report_id" <> ''
    AND ("latitude" IS NULL OR ("latitude" >= -90 AND "latitude" <= 90))
    AND ("longitude" IS NULL OR ("longitude" >= -180 AND "longitude" <= 180))
    AND ("accuracy" IS NULL OR "accuracy" >= 0)
    AND ("barangay" IS NOT NULL OR ("latitude" IS NOT NULL AND "longitude" IS NOT NULL))
    AND "risk_level" IN ('low', 'medium', 'high', 'critical', 'unknown')
    AND "confidence" IN ('low', 'medium', 'high')
    AND "status" IN ('active', 'cleared', 'disputed', 'expired')
    AND "expires_at" > "reported_at"
  );

CREATE POLICY "flood_reports_public_update_by_client_report_id"
  ON "flood_reports"
  FOR UPDATE
  TO anon, authenticated
  USING ("client_report_id" <> '')
  WITH CHECK (
    "client_report_id" <> ''
    AND ("latitude" IS NULL OR ("latitude" >= -90 AND "latitude" <= 90))
    AND ("longitude" IS NULL OR ("longitude" >= -180 AND "longitude" <= 180))
    AND ("accuracy" IS NULL OR "accuracy" >= 0)
    AND ("barangay" IS NOT NULL OR ("latitude" IS NOT NULL AND "longitude" IS NOT NULL))
    AND "risk_level" IN ('low', 'medium', 'high', 'critical', 'unknown')
    AND "confidence" IN ('low', 'medium', 'high')
    AND "status" IN ('active', 'cleared', 'disputed', 'expired')
    AND "expires_at" > "reported_at"
  );

CREATE POLICY "flood_reports_public_select_for_sync"
  ON "flood_reports"
  FOR SELECT
  TO anon, authenticated
  USING ("client_report_id" <> '');

GRANT INSERT, UPDATE, SELECT ON TABLE "flood_reports" TO anon, authenticated;
