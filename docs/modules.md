# Modules and Edition Boundaries

UnFold core is the open-source, single-player application. It must build, test, and run without Enterprise Edition code.

Core may define extension points that private editions can implement, but core must not import private modules directly.

## Rules

- Core modules live in this repository.
- Shared contracts and extension points live in this repository.
- Optional edition behavior should be exposed through stable core-owned interfaces.
- OSS implementations should be valid defaults, empty arrays, empty objects, or no-op functions.
- Core code must not import from an EE repository path.

## Apps and Packages

Deployable services should live in `apps/`. Feature modules should live in `packages/`.

```txt
apps/api
  src/server.ts

packages/projects
  src/routes.ts
  src/handlers.ts
  src/service.ts
  src/repository.ts
  src/schema.ts
```

An app should usually compose packages instead of owning all feature behavior itself.

For example, a Hono API app may register core routes and then call an edition extension point:

```ts
import { Hono } from "hono";
import { registerProjectRoutes } from "@unfold/projects/routes";
import { registerEditionRoutes } from "@unfold/edition/routes";

const app = new Hono();

registerProjectRoutes(app);
registerEditionRoutes(app);

export default app;
```

The OSS edition implementation should build alone:

```ts
export function registerEditionRoutes() {}
```

## Shared Capabilities

Use required capability interfaces when both core and private editions need the same concept.

Good examples:

- auth
- authorization
- database access
- config
- storage
- queues
- email
- telemetry

Core code should import the stable capability:

```ts
import { authz } from "@unfold/authz";

await authz.requireProjectAccess(ctx, projectId);
```

The OSS implementation can check local ownership. A private edition can provide a richer implementation behind the same interface.

Avoid scattering edition checks through core code:

```ts
if (isEnterpriseEdition) {
  // Avoid this pattern in core feature code.
}
```

## Optional Features

Use optional registries for behavior that may not exist in core:

- extra routes
- extra settings sections
- extra navigation items
- extra jobs
- OpenAPI additions
- database table additions

Core should consume these generically:

```ts
for (const section of editionSettingsSections) {
  registerSettingsSection(section);
}
```

## Database Composition

Core tables should be defined in core packages. Edition-specific tables should be composed through an edition extension point.

```ts
import { coreTables } from "@unfold/db/schema-core";
import { editionTables } from "@unfold/edition/db";

export const schema = {
  ...coreTables,
  ...editionTables,
};
```

The OSS implementation should be empty:

```ts
export const editionTables = {};
```

## Documentation

When a core feature is created, updated, or removed, update `docs/` in this repository.

If a change adds or modifies an extension point, document the core contract here. Private implementation details belong in the private edition repository.
