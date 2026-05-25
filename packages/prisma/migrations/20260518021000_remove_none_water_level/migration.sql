ALTER TABLE "houses" ALTER COLUMN "water_level" DROP DEFAULT;

UPDATE "houses"
SET "water_level" = 'unknown'
WHERE "water_level" = 'none';

UPDATE "report_histories"
SET "water_level" = 'unknown'
WHERE "water_level" = 'none';

ALTER TYPE "water_level" RENAME TO "water_level_old";

CREATE TYPE "water_level" AS ENUM (
  'ankle',
  'knee',
  'waist',
  'chest',
  'roof',
  'unknown'
);

ALTER TABLE "houses"
ALTER COLUMN "water_level" TYPE "water_level"
USING "water_level"::text::"water_level";

ALTER TABLE "report_histories"
ALTER COLUMN "water_level" TYPE "water_level"
USING "water_level"::text::"water_level";

ALTER TABLE "houses" ALTER COLUMN "water_level" SET DEFAULT 'unknown';

DROP TYPE "water_level_old";
