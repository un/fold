# Workspace Structure

The core repository uses pnpm workspaces and Turborepo.

```txt
apps/
  web/  # TanStack Start React app
  api/  # Hono Node.js API

packages/
  types/
  consts/
  database/
  utils/
  ui/
  email/

modules/
  auth/
```

## Commands

Use pnpm v11.

```bash
pnpm install
pnpm dev
pnpm typecheck
pnpm build
```

## Apps

`apps/web` is a blank TanStack Start app created from the TanStack CLI output and reduced to a minimal route. It uses React, Vite, TanStack Start, and TanStack Router.

`apps/api` is a Hono API app based on the `nodejs` starter from `pnpm create hono@latest`.

## Packages and Modules

Packages are shared workspace libraries. Modules are vertical feature modules.

Core modules must build and run without importing from EE. When a feature may have richer EE behavior, define the contract or extension point in core and let EE implement it separately.

## Database Package

`packages/database` owns the core Drizzle setup for PlanetScale Postgres. It provides:

- `src/client.ts` for creating a Drizzle node-postgres client from `DATABASE_URL`.
- `src/schema/core.ts` for core-owned table exports.
- `src/schema/edition.ts` for the empty OSS edition table extension point.
- `src/schema/index.ts` for the composed schema consumed by Drizzle Kit.
- `drizzle.config.ts` for migrations under `packages/database/drizzle`.

Do not put all tables in one large schema file. Add future tables as small schema files, export them through the relevant schema entrypoint, and keep EE-only tables outside the core repository. PlanetScale PgBouncer connections should use port `6432` in `DATABASE_URL`.

## Utils Package

`packages/utils` owns core utility primitives shared across apps and packages. Its TypeID system lives in `src/typeid.ts` and currently registers the core `user` prefix.

Add new core TypeID prefixes only by appending to the map. Prefixes are persisted in database rows, so changing an existing prefix is a data migration.
