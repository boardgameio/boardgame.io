# AGENTS.md

This file provides guidance to coding agents (e.g. Claude Code) working in this repository.

## Project identity

**boardgame.io** is a turn-based game engine library — game logic lives in `src/`, public entry points in `packages/`, and rollup-built bundles in `dist/`. It is published on npm as `boardgame.io`. The toolchain runs on a modern **Node 24/26** baseline and uses **pnpm** as the package manager.

## Package manager

**pnpm 10.16+ is mandatory** (pinned via `packageManager` in `package.json`). Don't use npm or yarn — `pnpm-lock.yaml` is the only lockfile, and CI installs with `--frozen-lockfile`. Enable via `corepack enable`.

`.npmrc` sets `minimum-release-age=2880` (48 hours) as supply-chain protection. The integration script overrides this with `--config.minimum-release-age=0` because it installs a local tarball.

## Common commands

- `pnpm test` — runs `lint` (pretest hook) then jest. Lint failures block tests.
- `pnpm test:watch` — jest in watch mode (no lint).
- `pnpm exec jest path/to/file.test.ts` — run one test file. Add `-t "name"` for one test case.
- `pnpm run test:coverage` — lint + jest with coverage scoped to `src/**`. This is what `pre-push` runs, so pushes aren't fast.
- `pnpm run test:integration` — `scripts/integration.js` deletes `dist/`, `npm pack`s the lib, installs the tarball into `integration/`, and runs that project's tests + build. Use to verify the published artifact.
- `pnpm run lint` / `pnpm run lint:fix` — eslint over the whole repo (`.eslintrc`).
- `pnpm run ts` — typecheck only (`tsc --noEmit`).
- `pnpm run build` — rollup build into `dist/` (silent).
- `pnpm run build:watch` — rollup in watch mode.
- `pnpm start` / `pnpm dev` — boots the react-web example (`examples/react-web`) with a dev server. `dev` adds `build:watch`.
- `pnpm run docs` — local docsify preview.

`pre-commit` runs `lint-staged` (prettier on staged `.ts/.js/.css/.md`). `pre-push` runs full coverage.

## Architecture

### Source layout (`src/`)

All real code lives under `src/`, split by domain:

- `core/` — pure game engine: the reducer, flow (phases/turns/stages), turn-order strategies, initialization, action creators/types. Framework-agnostic, no I/O.
- `client/` — client-side runtime, framework bindings (`react.tsx`, `react-native.js`), and **transports** (`transport/local.ts`, `transport/socketio.ts`, `transport/dummy.ts`) that connect a client to either a local in-process master or a remote server.
- `client/debug/` — Svelte-based debug panel. Svelte sources are transformed by `jest-svelte-transformer.cjs` for tests and via `rollup-plugin-svelte` for builds.
- `master/` — server-side game authority. The Master applies moves, filters per-player views (`filter-player-view.ts`), and is what both `Local` (in-process) and the socket.io server transport drive.
- `server/` — Koa-based HTTP API + socket.io transport + DB adapters (`db/flatfile.ts`, `db/inmemory.ts`, `db/localstorage.ts`, plus `db/base.ts` for custom stores).
- `ai/` — bot framework (`bot.ts`, `random-bot.ts`, `mcts-bot.ts`) plus `Step`/`Simulate` helpers.
- `plugins/` — plugin system + built-ins (`plugin-immer`, `plugin-random`, `plugin-log`, `plugin-player`, `plugin-events`, `plugin-serializable`). Plugins extend the per-move context (`ctx.G`, `ctx.events`, …).
- `lobby/`, `testing/` — matchmaking helpers and test utilities.
- `types.ts` — shared TS types (excluded from coverage).

### Public entry points (`packages/`)

Each `packages/<name>.ts` is a thin re-export file that defines a public subpackage. The canonical list is `subpackages.js`:

```
client, core, debug, react, react-native, ai, plugins, master, multiplayer, internal, testing
```

`packages/server.ts` is built separately (CJS-only, with full node deps). `packages/main.js` is the legacy single-bundle entry.

**To add a new subpackage:** create `packages/<name>.ts`, add `<name>` to `subpackages.js`, and add `<name>` to the `files` array in `package.json`.

### Build pipeline (`rollup.config.js`)

Rollup produces four output groups from one config:

1. **Subpackages** → `dist/esm/<name>.js` + `dist/cjs/<name>.js` + `dist/types/packages/<name>.d.ts` (typescript declarations).
2. **Server** → `dist/cjs/server.js` (CJS only, includes commonjs plugin for node deps).
3. **Legacy combined** → `dist/boardgameio.js` (CJS) + `dist/boardgameio.es.js` (ESM) from `packages/main.js`.
4. **Browser UMD** → `dist/boardgameio.min.js`, minified, with `process.env.NODE_ENV` replaced and filesize reporting.

`prepack` runs `build` then `scripts/proxy-dirs.js`, which generates top-level **proxy directories** (`client/`, `core/`, `react/`, …) each containing a tiny `package.json` pointing at `dist/cjs|esm|types`. This is what makes `import 'boardgame.io/client'` work for consumers. These dirs are gitignored but listed in the `files` field for publishing. `postpack` runs `clean`.

### Test setup (jest in `package.json`)

- Preset: `ts-jest/presets/js-with-babel`, env `jsdom`.
- Svelte: custom `jest-svelte-transformer.cjs` plus `moduleNameMapper` entries pointing `svelte` and `svelte-json-tree-auto` at their client builds.
- Ignored paths: `examples/`, `integration/`, `node_modules/`, `.npm/`. Don't put real tests in those dirs.
- Setup files: `jest.setup.js`, `raf/polyfill`, `jest-date-mock`, plus `@testing-library/jest-dom` after env.

### Babel resolver alias

`babel.config.js` aliases `boardgame.io` → `./packages`. This lets `src/` and `examples/` import from the package name as if it were installed, without circular dependencies. Don't import from `dist/` in source.

## Repo gotchas

- **Two pnpm projects nested:** `examples/react-web/` and `integration/` each have their own `pnpm-lock.yaml`. Don't conflate them with the root install.
- **`*.tgz` is gitignored** because `scripts/integration.js` runs `npm pack` and leaves the tarball in the root. Don't commit it.
- **Coverage is collected only with the flag.** `pnpm test` (no flag) does not produce coverage; use `pnpm run test:coverage` if a hook or CI expects `coverage/lcov.info`.
- **The `pretest` hook runs lint**, so a lint error makes `pnpm test` fail before any test runs. Use `pnpm exec jest …` to skip lint when iterating on a single test.
