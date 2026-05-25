ALTER TABLE "rescue_pings" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rescue_pings_public_insert"
  ON "rescue_pings"
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    "phone_number" <> ''
    AND "latitude" >= -90
    AND "latitude" <= 90
    AND "longitude" >= -180
    AND "longitude" <= 180
    AND ("accuracy_meters" IS NULL OR "accuracy_meters" >= 0)
    AND "source" = 'web'
    AND "status" = 'new'
  );

GRANT INSERT ON TABLE "rescue_pings" TO anon, authenticated;
