# Prisma Migrations

This package uses Prisma for database migrations only. It intentionally does
not install `@prisma/client`.

## Setup

Create `packages/prisma/.env` with your Supabase database connection string:

```sh
DATABASE_URL="postgresql://<db-user>.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres?schema=public"
```

Use a direct/session database connection for Prisma migrations. The Supabase
project remains the only supported database target; local Docker Postgres is not
managed by this package.

For the Supabase session pooler connection, the username must include the exact
project ref, for example `postgres.<project-ref>` or `prisma.<project-ref>`.
If Supabase returns `tenant/user ... not found`, re-copy the session pooler
connection string from the Supabase dashboard and make sure the pooler host
region, database user, and project ref match.

Supabase recommends a dedicated Prisma database user with privileges on the
`public` schema. If you create one, grant it usage, create, table, routine, and
sequence privileges on `public`, then use `prisma.<project-ref>` as the pooler
username.

If `db:dev` needs a shadow database, set `SHADOW_DATABASE_URL` to a separate
Supabase development database.

## Commands

```sh
pnpm --filter @bagyo-rescue/prisma db:dev
pnpm --filter @bagyo-rescue/prisma db:deploy
pnpm --filter @bagyo-rescue/prisma db:status
pnpm --filter @bagyo-rescue/prisma db:pull
pnpm db:seed:test
pnpm db:seed:psgc
```

`pnpm db:seed:test` executes `packages/prisma/scripts/seed-testing.sql`.
It creates a repeatable test dataset with 10 LGUs, 100 barangays, 200 houses,
200 families, 1000 residents, 50 evacuation centers, 120 evacuation center
assignments, and 360 contact persons. Seeded rows use `seed_*` IDs and are
replaced on each run without deleting non-seed data.

`pnpm db:seed:psgc` executes
`packages/prisma/scripts/seed-psgc-locations.sql`. It creates a repeatable
Philippine PSGC location dataset with 1,642 LGUs and 42,010 barangays from the
PSGC as of 31 March 2026. Seeded rows use `psgc_*` IDs and are replaced on each
run without deleting non-seed data.
