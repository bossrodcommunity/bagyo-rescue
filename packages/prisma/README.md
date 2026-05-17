# Prisma Migrations

This package uses Prisma for database migrations only. It intentionally does
not install `@prisma/client`.

## Setup

Create `packages/prisma/.env` with:

```sh
DATABASE_URL="postgresql://<user>:<password>@localhost:<port>/<database>"
```

If `POSTGRES_DB` is not set in `packages/prisma/docker-compose-db.yaml`, the
default database name is the same as `POSTGRES_USER`.

## Commands

```sh
pnpm --filter @bagyo-rescue/prisma migrate:dev
pnpm --filter @bagyo-rescue/prisma migrate:deploy
pnpm --filter @bagyo-rescue/prisma migrate:status
pnpm --filter @bagyo-rescue/prisma db:pull
```
