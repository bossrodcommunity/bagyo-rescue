-- Enable UUID generation for text IDs with domain-specific prefixes.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE "risk_level" AS ENUM ('Low', 'Medium', 'High', 'Critical');

CREATE TYPE "house_status" AS ENUM (
  'Not Checked',
  'Safe',
  'Needs Assistance',
  'Needs Rescue',
  'Evacuated'
);

CREATE TYPE "water_level" AS ENUM (
  'None',
  'Ankle',
  'Knee',
  'Waist',
  'Chest',
  'Roof',
  'Unknown'
);

CREATE TYPE "sex" AS ENUM (
  'Male',
  'Female',
  'Other',
  'Prefer Not To Say'
);

CREATE TYPE "resident_status" AS ENUM (
  'Inside House',
  'Evacuated',
  'Missing / Unconfirmed',
  'Needs Rescue',
  'Safe'
);

CREATE TYPE "contact_entity_type" AS ENUM (
  'LGU',
  'Barangay',
  'Area',
  'House',
  'Family',
  'Evacuation Center'
);

CREATE TYPE "contact_role" AS ENUM (
  'LGU Admin',
  'MDRRMO Officer',
  'Barangay Captain',
  'Barangay Secretary',
  'Responder',
  'Purok Leader',
  'Household Representative',
  'Family Head',
  'Relative',
  'Volunteer'
);

CREATE TYPE "evacuation_center_type" AS ENUM (
  'School',
  'Covered Court',
  'Gymnasium',
  'Barangay Hall',
  'Church',
  'Community Center',
  'Other'
);

CREATE TYPE "evacuation_center_status" AS ENUM (
  'Open',
  'Near Capacity',
  'Full',
  'Closed',
  'Unavailable'
);

CREATE TYPE "evacuation_assignment_status" AS ENUM (
  'Assigned',
  'Checked In',
  'Transferred',
  'Left',
  'Missing / Unconfirmed'
);

CREATE TABLE "lgus" (
  "id" TEXT NOT NULL DEFAULT concat('lgu_', replace((gen_random_uuid())::text, '-'::text, ''::text)),
  "name" TEXT NOT NULL,
  "province" TEXT NOT NULL,
  "city_or_municipality" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "lgus_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "barangays" (
  "id" TEXT NOT NULL DEFAULT concat('brgy_', replace((gen_random_uuid())::text, '-'::text, ''::text)),
  "lgu_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "area_name" TEXT,
  "risk_level" "risk_level" NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "barangays_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "houses" (
  "id" TEXT NOT NULL DEFAULT concat('house_', replace((gen_random_uuid())::text, '-'::text, ''::text)),
  "barangay_id" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "landmark" TEXT,
  "latitude" DECIMAL(9, 6),
  "longitude" DECIMAL(9, 6),
  "current_status" "house_status" NOT NULL DEFAULT 'Not Checked',
  "water_level" "water_level" NOT NULL DEFAULT 'Unknown',
  "last_checked_at" TIMESTAMPTZ(6),
  "last_checked_by" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "houses_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "families" (
  "id" TEXT NOT NULL DEFAULT concat('family_', replace((gen_random_uuid())::text, '-'::text, ''::text)),
  "house_id" TEXT NOT NULL,
  "family_code" TEXT NOT NULL DEFAULT concat('FAM-', upper(substr(replace((gen_random_uuid())::text, '-'::text, ''::text), 1, 6))),
  "pin_code" VARCHAR(4) NOT NULL DEFAULT '0000',
  "family_name" TEXT NOT NULL,
  "head_of_family" TEXT NOT NULL,
  "head_of_family_phone_number" TEXT,
  "total_members" INTEGER NOT NULL DEFAULT 0,
  "current_inside_count" INTEGER NOT NULL DEFAULT 0,
  "evacuated_count" INTEGER NOT NULL DEFAULT 0,
  "missing_or_unconfirmed_count" INTEGER NOT NULL DEFAULT 0,
  "needs_assistance" BOOLEAN NOT NULL DEFAULT false,
  "notes" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "families_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "families_total_members_nonnegative" CHECK ("total_members" >= 0),
  CONSTRAINT "families_current_inside_count_nonnegative" CHECK ("current_inside_count" >= 0),
  CONSTRAINT "families_evacuated_count_nonnegative" CHECK ("evacuated_count" >= 0),
  CONSTRAINT "families_missing_or_unconfirmed_count_nonnegative" CHECK ("missing_or_unconfirmed_count" >= 0)
);

CREATE TABLE "residents" (
  "id" TEXT NOT NULL DEFAULT concat('resident_', replace((gen_random_uuid())::text, '-'::text, ''::text)),
  "family_id" TEXT NOT NULL,
  "first_name" TEXT NOT NULL,
  "last_name" TEXT NOT NULL,
  "phone_number" TEXT,
  "age" INTEGER,
  "sex" "sex" NOT NULL,
  "is_senior" BOOLEAN NOT NULL DEFAULT false,
  "is_child" BOOLEAN NOT NULL DEFAULT false,
  "is_pwd" BOOLEAN NOT NULL DEFAULT false,
  "is_pregnant" BOOLEAN NOT NULL DEFAULT false,
  "current_status" "resident_status" NOT NULL DEFAULT 'Inside House',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "residents_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "residents_age_nonnegative" CHECK ("age" IS NULL OR "age" >= 0)
);

CREATE TABLE "contact_persons" (
  "id" TEXT NOT NULL DEFAULT concat('cp_', replace((gen_random_uuid())::text, '-'::text, ''::text)),
  "entity_type" "contact_entity_type" NOT NULL,
  "entity_id" TEXT NOT NULL,
  "full_name" TEXT NOT NULL,
  "role" "contact_role" NOT NULL,
  "contact_number" TEXT NOT NULL,
  "alternate_contact_number" TEXT,
  "email" TEXT,
  "is_primary" BOOLEAN NOT NULL DEFAULT false,
  "notes" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "contact_persons_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "evacuation_centers" (
  "id" TEXT NOT NULL DEFAULT concat('evac_', replace((gen_random_uuid())::text, '-'::text, ''::text)),
  "lgu_id" TEXT NOT NULL,
  "barangay_id" TEXT,
  "name" TEXT NOT NULL,
  "type" "evacuation_center_type" NOT NULL DEFAULT 'Other',
  "address" TEXT NOT NULL,
  "landmark" TEXT,
  "latitude" DECIMAL(9, 6),
  "longitude" DECIMAL(9, 6),
  "capacity" INTEGER NOT NULL DEFAULT 0,
  "current_occupancy" INTEGER NOT NULL DEFAULT 0,
  "status" "evacuation_center_status" NOT NULL DEFAULT 'Open',
  "has_food_supply" BOOLEAN NOT NULL DEFAULT false,
  "has_water_supply" BOOLEAN NOT NULL DEFAULT false,
  "has_medical_support" BOOLEAN NOT NULL DEFAULT false,
  "has_power" BOOLEAN NOT NULL DEFAULT false,
  "notes" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "evacuation_centers_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "evacuation_centers_capacity_nonnegative" CHECK ("capacity" >= 0),
  CONSTRAINT "evacuation_centers_current_occupancy_nonnegative" CHECK ("current_occupancy" >= 0)
);

CREATE TABLE "evacuation_center_assignments" (
  "id" TEXT NOT NULL DEFAULT concat('evac_assignment_', replace((gen_random_uuid())::text, '-'::text, ''::text)),
  "evacuation_center_id" TEXT NOT NULL,
  "family_id" TEXT NOT NULL,
  "house_id" TEXT NOT NULL,
  "number_of_people" INTEGER NOT NULL DEFAULT 0,
  "status" "evacuation_assignment_status" NOT NULL DEFAULT 'Assigned',
  "arrived_at" TIMESTAMPTZ(6),
  "left_at" TIMESTAMPTZ(6),
  "notes" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "evacuation_center_assignments_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "evacuation_center_assignments_number_of_people_nonnegative" CHECK ("number_of_people" >= 0)
);

CREATE INDEX "barangays_lgu_id_idx" ON "barangays"("lgu_id");
CREATE INDEX "houses_barangay_id_idx" ON "houses"("barangay_id");
CREATE INDEX "houses_current_status_idx" ON "houses"("current_status");
CREATE INDEX "houses_water_level_idx" ON "houses"("water_level");
CREATE UNIQUE INDEX "families_family_code_key" ON "families"("family_code");
CREATE INDEX "families_house_id_idx" ON "families"("house_id");
CREATE INDEX "families_needs_assistance_idx" ON "families"("needs_assistance");
CREATE INDEX "residents_family_id_idx" ON "residents"("family_id");
CREATE INDEX "residents_current_status_idx" ON "residents"("current_status");
CREATE INDEX "residents_is_senior_idx" ON "residents"("is_senior");
CREATE INDEX "residents_is_child_idx" ON "residents"("is_child");
CREATE INDEX "residents_is_pwd_idx" ON "residents"("is_pwd");
CREATE INDEX "residents_is_pregnant_idx" ON "residents"("is_pregnant");
CREATE INDEX "contact_persons_entity_type_entity_id_idx" ON "contact_persons"("entity_type", "entity_id");
CREATE INDEX "contact_persons_is_primary_idx" ON "contact_persons"("is_primary");
CREATE INDEX "evacuation_centers_lgu_id_idx" ON "evacuation_centers"("lgu_id");
CREATE INDEX "evacuation_centers_barangay_id_idx" ON "evacuation_centers"("barangay_id");
CREATE INDEX "evacuation_centers_status_idx" ON "evacuation_centers"("status");
CREATE INDEX "evacuation_center_assignments_evacuation_center_id_idx" ON "evacuation_center_assignments"("evacuation_center_id");
CREATE INDEX "evacuation_center_assignments_family_id_idx" ON "evacuation_center_assignments"("family_id");
CREATE INDEX "evacuation_center_assignments_house_id_idx" ON "evacuation_center_assignments"("house_id");
CREATE INDEX "evacuation_center_assignments_status_idx" ON "evacuation_center_assignments"("status");

ALTER TABLE "barangays"
  ADD CONSTRAINT "barangays_lgu_id_fkey"
  FOREIGN KEY ("lgu_id") REFERENCES "lgus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "houses"
  ADD CONSTRAINT "houses_barangay_id_fkey"
  FOREIGN KEY ("barangay_id") REFERENCES "barangays"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "families"
  ADD CONSTRAINT "families_house_id_fkey"
  FOREIGN KEY ("house_id") REFERENCES "houses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "residents"
  ADD CONSTRAINT "residents_family_id_fkey"
  FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "evacuation_centers"
  ADD CONSTRAINT "evacuation_centers_lgu_id_fkey"
  FOREIGN KEY ("lgu_id") REFERENCES "lgus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "evacuation_centers"
  ADD CONSTRAINT "evacuation_centers_barangay_id_fkey"
  FOREIGN KEY ("barangay_id") REFERENCES "barangays"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "evacuation_center_assignments"
  ADD CONSTRAINT "evacuation_center_assignments_evacuation_center_id_fkey"
  FOREIGN KEY ("evacuation_center_id") REFERENCES "evacuation_centers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "evacuation_center_assignments"
  ADD CONSTRAINT "evacuation_center_assignments_family_id_fkey"
  FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "evacuation_center_assignments"
  ADD CONSTRAINT "evacuation_center_assignments_house_id_fkey"
  FOREIGN KEY ("house_id") REFERENCES "houses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE OR REPLACE FUNCTION "set_updated_at"()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updated_at" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "lgus_set_updated_at"
  BEFORE UPDATE ON "lgus"
  FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();

CREATE TRIGGER "barangays_set_updated_at"
  BEFORE UPDATE ON "barangays"
  FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();

CREATE TRIGGER "houses_set_updated_at"
  BEFORE UPDATE ON "houses"
  FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();

CREATE TRIGGER "families_set_updated_at"
  BEFORE UPDATE ON "families"
  FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();

CREATE TRIGGER "residents_set_updated_at"
  BEFORE UPDATE ON "residents"
  FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();

CREATE TRIGGER "contact_persons_set_updated_at"
  BEFORE UPDATE ON "contact_persons"
  FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();

CREATE TRIGGER "evacuation_centers_set_updated_at"
  BEFORE UPDATE ON "evacuation_centers"
  FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();

CREATE TRIGGER "evacuation_center_assignments_set_updated_at"
  BEFORE UPDATE ON "evacuation_center_assignments"
  FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();
