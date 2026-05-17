ALTER TABLE "houses" ALTER COLUMN "water_level" DROP DEFAULT;

UPDATE "houses"
SET "water_level" = 'Unknown'
WHERE "water_level" = 'None';

UPDATE "report_histories"
SET "water_level" = 'Unknown'
WHERE "water_level" = 'None';

ALTER TYPE "water_level" RENAME TO "water_level_old";

CREATE TYPE "water_level" AS ENUM (
  'Ankle',
  'Knee',
  'Waist',
  'Chest',
  'Roof',
  'Unknown'
);

ALTER TABLE "houses"
ALTER COLUMN "water_level" TYPE "water_level"
USING "water_level"::text::"water_level";

ALTER TABLE "report_histories"
ALTER COLUMN "water_level" TYPE "water_level"
USING "water_level"::text::"water_level";

ALTER TABLE "houses" ALTER COLUMN "water_level" SET DEFAULT 'Unknown';

DROP TYPE "water_level_old";
