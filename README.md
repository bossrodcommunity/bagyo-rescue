# Bagyo Rescue

Monorepo managed with pnpm workspaces and Turborepo.

## Structure

- `apps/*` for deployable applications
- `packages/*` for shared packages

## Commands

```sh
pnpm dev
pnpm dev:web
pnpm build
pnpm test
pnpm lint
pnpm format
pnpm check:all
```

## Supabase Types

To refresh the generated Supabase types:

```sh
pnpm supabase:types
```
