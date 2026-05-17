-- Seed a linked rescue dataset for manual testing.
--
-- Creates:
-- - 10 LGUs
-- - 100 barangays
-- - 200 houses
-- - 200 families
-- - 1000 residents
-- - 50 evacuation centers
-- - 120 evacuation center assignments
-- - 360 contact persons
--
-- This file is idempotent for seed-owned rows. It deletes rows with seed_* IDs
-- before inserting a fresh random distribution.

BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DELETE FROM "evacuation_center_assignments"
WHERE "id" LIKE 'seed_evac_assignment_%'
   OR "family_id" LIKE 'seed_family_%'
   OR "house_id" LIKE 'seed_house_%';

DELETE FROM "contact_persons" WHERE "id" LIKE 'seed_cp_%';
DELETE FROM "residents" WHERE "id" LIKE 'seed_resident_%';
DELETE FROM "families" WHERE "id" LIKE 'seed_family_%';
DELETE FROM "houses" WHERE "id" LIKE 'seed_house_%';
DELETE FROM "evacuation_centers" WHERE "id" LIKE 'seed_evac_%';
DELETE FROM "barangays" WHERE "id" LIKE 'seed_brgy_%';
DELETE FROM "lgus" WHERE "id" LIKE 'seed_lgu_%';

INSERT INTO "lgus" ("id", "name", "province", "city_or_municipality")
SELECT
  format('seed_lgu_%s', lpad("lgu_number"::text, 3, '0')),
  format('Seed LGU %s', lpad("lgu_number"::text, 2, '0')),
  (
    ARRAY[
      'Albay',
      'Cagayan',
      'Camarines Sur',
      'Cavite',
      'Cebu',
      'Davao del Sur',
      'Iloilo',
      'Laguna',
      'Leyte',
      'Pampanga'
    ]
  )["lgu_number"],
  (
    ARRAY[
      'Legazpi City',
      'Tuguegarao City',
      'Naga City',
      'Bacoor City',
      'Cebu City',
      'Davao City',
      'Iloilo City',
      'Santa Rosa City',
      'Tacloban City',
      'San Fernando City'
    ]
  )["lgu_number"]
FROM generate_series(1, 10) AS "source"("lgu_number");

INSERT INTO "barangays" ("id", "lgu_id", "name", "area_name", "risk_level")
SELECT
  format('seed_brgy_%s', lpad("barangay_number"::text, 3, '0')),
  format('seed_lgu_%s', lpad("lgu_number"::text, 3, '0')),
  format('Seed Barangay %s', lpad("barangay_number"::text, 3, '0')),
  format('Purok %s', ((("barangay_number" - 1) % 12) + 1)),
  (
    ARRAY[
      'Low'::"risk_level",
      'Medium'::"risk_level",
      'High'::"risk_level",
      'Critical'::"risk_level"
    ]
  )[(floor(random() * 4)::int + 1)]
FROM (
  SELECT
    "barangay_number",
    CASE
      WHEN "barangay_number" <= 10 THEN "barangay_number"
      ELSE floor(random() * 10)::int + 1
    END AS "lgu_number"
  FROM generate_series(1, 100) AS "source"("barangay_number")
) AS "barangay_source";

INSERT INTO "houses" (
  "id",
  "barangay_id",
  "address",
  "landmark",
  "latitude",
  "longitude",
  "current_status",
  "water_level",
  "last_checked_at",
  "last_checked_by"
)
SELECT
  format('seed_house_%s', lpad("house_number"::text, 3, '0')),
  format('seed_brgy_%s', lpad((floor(random() * 100)::int + 1)::text, 3, '0')),
  format('Block %s Lot %s, Seed Village', (("house_number" - 1) / 20) + 1, (("house_number" - 1) % 20) + 1),
  format('Near marker %s', (("house_number" - 1) % 25) + 1),
  round((6.000000 + random() * 12.000000)::numeric, 6),
  round((120.000000 + random() * 6.000000)::numeric, 6),
  (
    ARRAY[
      'Not Checked'::"house_status",
      'Safe'::"house_status",
      'Needs Assistance'::"house_status",
      'Needs Rescue'::"house_status",
      'Evacuated'::"house_status"
    ]
  )[(floor(random() * 5)::int + 1)],
  (
    ARRAY[
      'None'::"water_level",
      'Ankle'::"water_level",
      'Knee'::"water_level",
      'Waist'::"water_level",
      'Chest'::"water_level",
      'Roof'::"water_level",
      'Unknown'::"water_level"
    ]
  )[(floor(random() * 7)::int + 1)],
  CURRENT_TIMESTAMP - (floor(random() * 72)::int || ' hours')::interval,
  'Seed responder'
FROM generate_series(1, 200) AS "source"("house_number");

INSERT INTO "families" (
  "id",
  "house_id",
  "family_code",
  "pin_code",
  "family_name",
  "head_of_family",
  "head_of_family_phone_number",
  "total_members",
  "current_inside_count",
  "evacuated_count",
  "missing_or_unconfirmed_count",
  "needs_assistance",
  "notes"
)
SELECT
  format('seed_family_%s', lpad("family_number"::text, 3, '0')),
  format('seed_house_%s', lpad((floor(random() * 200)::int + 1)::text, 3, '0')),
  format('FAM-T%s', lpad("family_number"::text, 4, '0')),
  lpad((1000 + "family_number")::text, 4, '0'),
  format('%s Family', "last_name"),
  format('%s %s', "head_first_name", "last_name"),
  format('+63917%s', lpad("family_number"::text, 7, '0')),
  0,
  0,
  0,
  0,
  false,
  format('Seed testing family. Login PIN: %s', lpad((1000 + "family_number")::text, 4, '0'))
FROM (
  SELECT
    "family_number",
    (
      ARRAY[
        'Santos',
        'Reyes',
        'Cruz',
        'Bautista',
        'Ocampo',
        'Garcia',
        'Mendoza',
        'Torres',
        'Ramos',
        'Flores',
        'Dela Cruz',
        'Villanueva',
        'Aquino',
        'Castillo',
        'Gonzales',
        'Navarro',
        'Salazar',
        'Domingo',
        'Mercado',
        'Rivera'
      ]
    )[(("family_number" - 1) % 20) + 1] AS "last_name",
    (
      ARRAY[
        'Jose',
        'Maria',
        'Juan',
        'Ana',
        'Pedro',
        'Rosa',
        'Miguel',
        'Elena',
        'Carlo',
        'Lina'
      ]
    )[(floor(random() * 10)::int + 1)] AS "head_first_name"
  FROM generate_series(1, 200) AS "source"("family_number")
) AS "family_source";

INSERT INTO "residents" (
  "id",
  "family_id",
  "first_name",
  "last_name",
  "phone_number",
  "age",
  "sex",
  "is_senior",
  "is_child",
  "is_pwd",
  "is_pregnant",
  "current_status"
)
SELECT
  format('seed_resident_%s', lpad("resident_number"::text, 4, '0')),
  format('seed_family_%s', lpad("family_number"::text, 3, '0')),
  "first_name",
  "last_name",
  CASE
    WHEN random() < 0.82 THEN format('+63918%s', lpad("resident_number"::text, 7, '0'))
    ELSE NULL
  END,
  "age",
  "sex",
  "age" >= 60,
  "age" <= 17,
  random() < 0.08,
  "sex" = 'Female'::"sex" AND "age" BETWEEN 18 AND 45 AND random() < 0.06,
  CASE
    WHEN "status_roll" < 0.5 THEN 'Inside House'::"resident_status"
    WHEN "status_roll" < 0.72 THEN 'Safe'::"resident_status"
    WHEN "status_roll" < 0.88 THEN 'Evacuated'::"resident_status"
    WHEN "status_roll" < 0.97 THEN 'Missing / Unconfirmed'::"resident_status"
    ELSE 'Needs Rescue'::"resident_status"
  END
FROM (
  SELECT
    "resident_number",
    CASE
      WHEN "resident_number" <= 200 THEN "resident_number"
      ELSE floor(random() * 200)::int + 1
    END AS "family_number",
    (
      ARRAY[
        'Amihan',
        'Benjie',
        'Cora',
        'Danilo',
        'Elisa',
        'Felix',
        'Grace',
        'Hector',
        'Irene',
        'Jun',
        'Karla',
        'Leo',
        'Mila',
        'Nestor',
        'Olivia',
        'Paolo',
        'Queenie',
        'Ramon',
        'Sofia',
        'Tomas'
      ]
    )[(floor(random() * 20)::int + 1)] AS "first_name",
    (
      ARRAY[
        'Santos',
        'Reyes',
        'Cruz',
        'Bautista',
        'Ocampo',
        'Garcia',
        'Mendoza',
        'Torres',
        'Ramos',
        'Flores',
        'Dela Cruz',
        'Villanueva',
        'Aquino',
        'Castillo',
        'Gonzales',
        'Navarro',
        'Salazar',
        'Domingo',
        'Mercado',
        'Rivera'
      ]
    )[(floor(random() * 20)::int + 1)] AS "last_name",
    floor(random() * 90)::int AS "age",
    (
      ARRAY[
        'Male'::"sex",
        'Female'::"sex",
        'Other'::"sex",
        'Prefer Not To Say'::"sex"
      ]
    )[(floor(random() * 4)::int + 1)] AS "sex",
    random() AS "status_roll"
FROM generate_series(1, 1000) AS "source"("resident_number")
) AS "resident_source";

INSERT INTO "evacuation_centers" (
  "id",
  "lgu_id",
  "barangay_id",
  "name",
  "type",
  "address",
  "landmark",
  "latitude",
  "longitude",
  "capacity",
  "current_occupancy",
  "status",
  "has_food_supply",
  "has_water_supply",
  "has_medical_support",
  "has_power",
  "notes"
)
SELECT
  format('seed_evac_%s', lpad("center_number"::text, 3, '0')),
  "barangay"."lgu_id",
  "barangay"."id",
  format('Seed Evacuation Center %s', lpad("center_number"::text, 3, '0')),
  (
    ARRAY[
      'School'::"evacuation_center_type",
      'Covered Court'::"evacuation_center_type",
      'Gymnasium'::"evacuation_center_type",
      'Barangay Hall'::"evacuation_center_type",
      'Church'::"evacuation_center_type",
      'Community Center'::"evacuation_center_type",
      'Other'::"evacuation_center_type"
    ]
  )[(floor(random() * 7)::int + 1)],
  format('%s Evacuation Road, %s', "barangay"."name", "lgu"."city_or_municipality"),
  format('Beside %s command post', "barangay"."name"),
  round((6.000000 + random() * 12.000000)::numeric, 6),
  round((120.000000 + random() * 6.000000)::numeric, 6),
  "capacity",
  LEAST("capacity", floor(random() * "capacity")::int),
  CASE
    WHEN "capacity_roll" < 0.12 THEN 'Full'::"evacuation_center_status"
    WHEN "capacity_roll" < 0.34 THEN 'Near Capacity'::"evacuation_center_status"
    WHEN "capacity_roll" < 0.9 THEN 'Open'::"evacuation_center_status"
    WHEN "capacity_roll" < 0.96 THEN 'Unavailable'::"evacuation_center_status"
    ELSE 'Closed'::"evacuation_center_status"
  END,
  random() < 0.86,
  random() < 0.9,
  random() < 0.7,
  random() < 0.78,
  'Seed testing evacuation center.'
FROM (
  SELECT
    "center_number",
    CASE
      WHEN "center_number" <= 10 THEN "center_number"
      ELSE floor(random() * 100)::int + 1
    END AS "barangay_number",
    (80 + floor(random() * 321)::int) AS "capacity",
    random() AS "capacity_roll"
  FROM generate_series(1, 50) AS "source"("center_number")
) AS "center_source"
JOIN "barangays" AS "barangay"
  ON "barangay"."id" = format('seed_brgy_%s', lpad("center_source"."barangay_number"::text, 3, '0'))
JOIN "lgus" AS "lgu"
  ON "lgu"."id" = "barangay"."lgu_id";

INSERT INTO "evacuation_center_assignments" (
  "id",
  "evacuation_center_id",
  "family_id",
  "house_id",
  "number_of_people",
  "status",
  "arrived_at",
  "left_at",
  "notes"
)
SELECT
  format('seed_evac_assignment_%s', lpad("assignment_number"::text, 3, '0')),
  "evacuation_center"."id",
  "family_scope"."family_id",
  "family_scope"."house_id",
  GREATEST(1, LEAST("family_scope"."total_members", floor(random() * 8)::int + 1)),
  "assignment_status",
  CASE
    WHEN "assignment_status" IN (
      'Checked In'::"evacuation_assignment_status",
      'Transferred'::"evacuation_assignment_status",
      'Left'::"evacuation_assignment_status"
    )
      THEN CURRENT_TIMESTAMP - (floor(random() * 48)::int || ' hours')::interval
    ELSE NULL
  END,
  CASE
    WHEN "assignment_status" = 'Left'::"evacuation_assignment_status"
      THEN CURRENT_TIMESTAMP - (floor(random() * 12)::int || ' hours')::interval
    ELSE NULL
  END,
  'Seed evacuation assignment.'
FROM (
  SELECT
    "assignment_number",
    (
      ARRAY[
        'Assigned'::"evacuation_assignment_status",
        'Checked In'::"evacuation_assignment_status",
        'Transferred'::"evacuation_assignment_status",
        'Left'::"evacuation_assignment_status",
        'Missing / Unconfirmed'::"evacuation_assignment_status"
      ]
    )[(floor(random() * 5)::int + 1)] AS "assignment_status"
  FROM generate_series(1, 120) AS "source"("assignment_number")
) AS "assignment_source"
CROSS JOIN LATERAL (
  SELECT
    "family"."id" AS "family_id",
    "family"."house_id",
    GREATEST(
      "family"."total_members",
      (
        SELECT count(*)::int
        FROM "residents" AS "resident"
        WHERE "resident"."family_id" = "family"."id"
      )
    ) AS "total_members",
    "barangay"."lgu_id"
  FROM "families" AS "family"
  JOIN "houses" AS "house"
    ON "house"."id" = "family"."house_id"
  JOIN "barangays" AS "barangay"
    ON "barangay"."id" = "house"."barangay_id"
  WHERE "family"."id" LIKE 'seed_family_%'
  ORDER BY random()
  LIMIT 1
) AS "family_scope"
CROSS JOIN LATERAL (
  SELECT "center"."id"
  FROM "evacuation_centers" AS "center"
  WHERE "center"."id" LIKE 'seed_evac_%'
    AND "center"."lgu_id" = "family_scope"."lgu_id"
  ORDER BY random()
  LIMIT 1
) AS "evacuation_center";

INSERT INTO "contact_persons" (
  "id",
  "entity_type",
  "entity_id",
  "full_name",
  "role",
  "contact_number",
  "alternate_contact_number",
  "email",
  "is_primary",
  "notes"
)
SELECT
  format('seed_cp_lgu_%s', lpad(row_number() OVER (ORDER BY "lgu"."id")::text, 3, '0')),
  'LGU'::"contact_entity_type",
  "lgu"."id",
  format('Officer %s', "lgu"."name"),
  'MDRRMO Officer'::"contact_role",
  format('+63920%s', lpad(row_number() OVER (ORDER BY "lgu"."id")::text, 7, '0')),
  NULL,
  lower(replace("lgu"."name", ' ', '.')) || '@seed.bagyo-rescue.test',
  true,
  'Seed LGU contact.'
FROM "lgus" AS "lgu"
WHERE "lgu"."id" LIKE 'seed_lgu_%';

INSERT INTO "contact_persons" (
  "id",
  "entity_type",
  "entity_id",
  "full_name",
  "role",
  "contact_number",
  "alternate_contact_number",
  "email",
  "is_primary",
  "notes"
)
SELECT
  format('seed_cp_brgy_%s', lpad(row_number() OVER (ORDER BY "barangay"."id")::text, 3, '0')),
  'Barangay'::"contact_entity_type",
  "barangay"."id",
  format('Captain %s', "barangay"."name"),
  'Barangay Captain'::"contact_role",
  format('+63921%s', lpad(row_number() OVER (ORDER BY "barangay"."id")::text, 7, '0')),
  NULL,
  NULL,
  true,
  'Seed barangay contact.'
FROM "barangays" AS "barangay"
WHERE "barangay"."id" LIKE 'seed_brgy_%';

INSERT INTO "contact_persons" (
  "id",
  "entity_type",
  "entity_id",
  "full_name",
  "role",
  "contact_number",
  "alternate_contact_number",
  "email",
  "is_primary",
  "notes"
)
SELECT
  format('seed_cp_evac_%s', lpad(row_number() OVER (ORDER BY "center"."id")::text, 3, '0')),
  'Evacuation Center'::"contact_entity_type",
  "center"."id",
  format('Center Manager %s', row_number() OVER (ORDER BY "center"."id")),
  'Volunteer'::"contact_role",
  format('+63922%s', lpad(row_number() OVER (ORDER BY "center"."id")::text, 7, '0')),
  NULL,
  NULL,
  true,
  'Seed evacuation center contact.'
FROM "evacuation_centers" AS "center"
WHERE "center"."id" LIKE 'seed_evac_%';

INSERT INTO "contact_persons" (
  "id",
  "entity_type",
  "entity_id",
  "full_name",
  "role",
  "contact_number",
  "alternate_contact_number",
  "email",
  "is_primary",
  "notes"
)
SELECT
  format('seed_cp_family_%s', lpad(row_number() OVER (ORDER BY "family"."id")::text, 3, '0')),
  'Family'::"contact_entity_type",
  "family"."id",
  "family"."head_of_family",
  'Family Head'::"contact_role",
  COALESCE(
    "family"."head_of_family_phone_number",
    format('+63923%s', lpad(row_number() OVER (ORDER BY "family"."id")::text, 7, '0'))
  ),
  NULL,
  NULL,
  true,
  'Seed family contact.'
FROM "families" AS "family"
WHERE "family"."id" LIKE 'seed_family_%';

WITH "family_counts" AS (
  SELECT
    "family_id",
    count(*)::int AS "total_members",
    count(*) FILTER (WHERE "current_status" = 'Inside House'::"resident_status")::int AS "current_inside_count",
    count(*) FILTER (
      WHERE "current_status" IN ('Safe'::"resident_status", 'Evacuated'::"resident_status")
    )::int AS "evacuated_count",
    count(*) FILTER (
      WHERE "current_status" IN (
        'Missing / Unconfirmed'::"resident_status",
        'Needs Rescue'::"resident_status"
      )
    )::int AS "missing_or_unconfirmed_count",
    bool_or(
      "current_status" = 'Needs Rescue'::"resident_status"
      OR "is_senior"
      OR "is_child"
      OR "is_pwd"
      OR "is_pregnant"
    ) AS "needs_assistance"
  FROM "residents"
  WHERE "id" LIKE 'seed_resident_%'
  GROUP BY "family_id"
)
UPDATE "families" AS "family"
SET
  "total_members" = "family_counts"."total_members",
  "current_inside_count" = "family_counts"."current_inside_count",
  "evacuated_count" = "family_counts"."evacuated_count",
  "missing_or_unconfirmed_count" = "family_counts"."missing_or_unconfirmed_count",
  "needs_assistance" = "family_counts"."needs_assistance",
  "updated_at" = CURRENT_TIMESTAMP
FROM "family_counts"
WHERE "family"."id" = "family_counts"."family_id";

DO $$
DECLARE
  "seed_lgu_count" int;
  "seed_barangay_count" int;
  "seed_house_count" int;
  "seed_family_count" int;
  "seed_resident_count" int;
  "seed_evacuation_center_count" int;
  "seed_evacuation_assignment_count" int;
  "seed_contact_person_count" int;
BEGIN
  SELECT count(*) INTO "seed_lgu_count" FROM "lgus" WHERE "id" LIKE 'seed_lgu_%';
  SELECT count(*) INTO "seed_barangay_count" FROM "barangays" WHERE "id" LIKE 'seed_brgy_%';
  SELECT count(*) INTO "seed_house_count" FROM "houses" WHERE "id" LIKE 'seed_house_%';
  SELECT count(*) INTO "seed_family_count" FROM "families" WHERE "id" LIKE 'seed_family_%';
  SELECT count(*) INTO "seed_resident_count" FROM "residents" WHERE "id" LIKE 'seed_resident_%';
  SELECT count(*) INTO "seed_evacuation_center_count" FROM "evacuation_centers" WHERE "id" LIKE 'seed_evac_%';
  SELECT count(*) INTO "seed_evacuation_assignment_count" FROM "evacuation_center_assignments" WHERE "id" LIKE 'seed_evac_assignment_%';
  SELECT count(*) INTO "seed_contact_person_count" FROM "contact_persons" WHERE "id" LIKE 'seed_cp_%';

  IF "seed_lgu_count" <> 10 THEN
    RAISE EXCEPTION 'Expected 10 seeded LGUs, got %', "seed_lgu_count";
  END IF;

  IF "seed_barangay_count" <> 100 THEN
    RAISE EXCEPTION 'Expected 100 seeded barangays, got %', "seed_barangay_count";
  END IF;

  IF "seed_house_count" <> 200 THEN
    RAISE EXCEPTION 'Expected 200 seeded houses, got %', "seed_house_count";
  END IF;

  IF "seed_family_count" <> 200 THEN
    RAISE EXCEPTION 'Expected 200 seeded families, got %', "seed_family_count";
  END IF;

  IF "seed_resident_count" <> 1000 THEN
    RAISE EXCEPTION 'Expected 1000 seeded residents, got %', "seed_resident_count";
  END IF;

  IF "seed_evacuation_center_count" <> 50 THEN
    RAISE EXCEPTION 'Expected 50 seeded evacuation centers, got %', "seed_evacuation_center_count";
  END IF;

  IF "seed_evacuation_assignment_count" <> 120 THEN
    RAISE EXCEPTION 'Expected 120 seeded evacuation assignments, got %', "seed_evacuation_assignment_count";
  END IF;

  IF "seed_contact_person_count" <> 360 THEN
    RAISE EXCEPTION 'Expected 360 seeded contact persons, got %', "seed_contact_person_count";
  END IF;

  RAISE NOTICE 'Seed complete: % LGUs, % barangays, % houses, % families, % residents, % evacuation centers, % assignments, % contact persons.',
    "seed_lgu_count",
    "seed_barangay_count",
    "seed_house_count",
    "seed_family_count",
    "seed_resident_count",
    "seed_evacuation_center_count",
    "seed_evacuation_assignment_count",
    "seed_contact_person_count";
END $$;

COMMIT;
