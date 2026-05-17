# Bagyo Rescue Monorepo

Monorepo for Bagyo Rescue: an offline-ready rescue coordination dashboard backed by a
PostgreSQL schema managed through Prisma migrations.

## Package Manager

**Use `pnpm`** - never npm or yarn.

Required versions:

- Node `>=22.12.0`
- pnpm `>=9.1.1`

## Running Services

Assume `pnpm dev` is already running. Do not start or restart it.

Database work targets Supabase only. Use Prisma in `packages/prisma` for schema
and migrations, with `DATABASE_URL` pointing at the Supabase database.

When creating migrations for triggers, database functions, RLS policies, cron
jobs, or any database script, implement the database change through
`packages/prisma/schema.prisma` and Prisma-managed migrations. Do not place
database scripts outside the Prisma package.

Use existing scripts when you need checks, builds, or database tasks:

- `pnpm build` - build all workspaces
- `pnpm check:types` - run TypeScript checks
- `pnpm lint` - run oxlint
- `pnpm format:check` - check formatting with oxfmt

## Structure

```text
apps/web/         # React + Vite + TanStack Router rescue dashboard
packages/prisma/  # Prisma schema and migrations only; no Prisma client
packages/assets/  # Shared static assets
packages/supabase/ # Supabase package area when needed
tools/            # Context factory, rules, and sync tooling
```

## Plan Mode

- Make plans extremely concise. Sacrifice grammar.
- End with unresolved questions, if any.

## Shared Conventions

- [Naming](tools/context-factory/shared/naming.md) - File/folder/variable naming
- [Frontend Project Structure](tools/context-factory/shared/frontend-project-structure.md) - Frontend folder patterns
- [Branding Idea](tools/context-factory/frontend/rules/branding-idea.md) - Tone, vibe, audience, mission
- [Branding Token Spec](tools/context-factory/frontend/rules/branding-token-spec.md) - Typography, color palette, UI tokens
- [Shared Packages Policy](tools/context-factory/shared/shared-packages.md) - When to create packages

## Quick Reference

| Task                        | Where to Look                                  |
| --------------------------- | ---------------------------------------------- |
| Web route                   | `apps/web/src/routes/`                         |
| Web data hook               | `apps/web/src/data/`                           |
| Local IndexedDB data        | `apps/web/src/db/`                             |
| PWA/service worker behavior | `apps/web/vite.config.ts`, `apps/web/src/pwa/` |
| Prisma schema               | `packages/prisma/schema.prisma`                |
| Database migration          | `packages/prisma/migrations/`                  |
| Frontend rules              | `tools/context-factory/frontend/rules/`        |
| Sync context/rules          | `tools/context-factory/scripts/sync-rules.mjs` |
