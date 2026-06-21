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
