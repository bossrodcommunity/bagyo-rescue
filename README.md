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

## Web base path

The web app uses `VITE_BASE_PATH` for Vite assets, TanStack Router `basepath`, and
PWA `scope`/`start_url`.

```sh
VITE_BASE_PATH=/bagyo-rescue/ pnpm --filter=@bagyo-rescue/web build
```
