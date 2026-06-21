<!-- intent-skills:start -->
## Skill Loading

Before editing files for a substantial TanStack task:
- Run `npx @tanstack/intent@latest list` from the workspace root to see available local skills.
- If a listed skill matches the task, run `npx @tanstack/intent@latest load <package>#<skill>` before changing files.
- Use the loaded `SKILL.md` guidance while making the change.
- Monorepos: when working across packages, run the skill check from the workspace root and prefer the local skill for the package being changed.
- Multiple matches: prefer the most specific local skill for the package or concern you are changing; load additional skills only when the task spans multiple packages or concerns.
<!-- intent-skills:end -->

# UnFold Core

This repository is the public, open-source core application. It must build and run without Enterprise Edition code.

## Workspace

- Package manager: `pnpm@11.4.0`
- Task runner: Turborepo
- Apps: `apps/*`
- Shared packages: `packages/*`
- Feature modules: `modules/*`

## Initial Scaffolding

TanStack Start was generated in scratch with:

```bash
npx @tanstack/cli@latest create my-tanstack-app --agent
```

Follow-up TanStack Intent commands run from the generated app:

```bash
npx @tanstack/intent@latest install
npx @tanstack/intent@latest list
npx @tanstack/intent@latest load @tanstack/start-client-core#start-core
npx @tanstack/intent@latest load @tanstack/react-start#react-start
npx @tanstack/intent@latest load @tanstack/router-core#router-core
```

The generated app was merged into `apps/web` as a blank React TanStack Start app. Template-only styling, demo routes, Tailwind, and devtools UI were omitted to honor the blank starter requirement.

Hono was generated in scratch with:

```bash
pnpm create hono@latest my-hono-app --template nodejs --pm pnpm --install
```

The generated Node.js Hono structure was merged into `apps/api`.

## Notes

- TanStack Start code is isomorphic by default. Use `createServerFn` or server-only files for server-only logic.
- Keep `tanstackStart()` before `viteReact()` in `apps/web/vite.config.ts`.
- Do not add direct imports from the private EE repository.
- When adding or changing a feature, decide whether it is core or EE and update docs.
