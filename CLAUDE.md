# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

"Blaster" — an asteroids-style 2D shooter rendered on an HTML5 canvas. TypeScript, built with Vite, no UI framework and no runtime dependencies. Ships as a PWA (service worker via `vite-plugin-pwa`) and deploys to S3 (GitHub Actions `deploy` job on master; AWS CodeBuild also runs `buildspec.yml`).

## Commands

- `npm run dev` — Vite dev server
- `npm test` — typecheck (`tsc --noEmit`, includes spec files) then run all tests (`vitest run`)
- `npx vitest run src/js/Craft.spec.ts` — run a single test file
- `npm run test:watch` — vitest in watch mode
- `npm run coverage` — vitest with v8 coverage
- `npm run pretty` — eslint --fix over the whole repo (Prettier runs as an ESLint rule)
- `npm run build` — production build to `dist/`

Tests live next to sources as `src/js/*.spec.ts`, run in jsdom with `vitest-canvas-mock` (loaded by `vitest.setup.ts`) and vitest globals enabled. `src/js/spec-helper.ts` provides `generateStage()` / `generateObj()` factories. Write failing tests before fixing bugs.

## Architecture

Everything lives in `src/js/`. Composition: `Game` wires input and drives `World` (simulation) and `Renderer` (drawing) on a fixed timestep.

- **`main.ts`** — entry point; creates `Game` on window load, registers the PWA service worker (prompt-style updates: the updater lands in `Game.updateReady`, applied with U while paused), pauses the game on tab hide.
- **`Game.ts`** — composition root and game loop. Fixed-timestep: `main()` runs on `requestAnimationFrame`, accumulates ticks of `tickLength` (16.7 ms, capped at 4 catch-up ticks per frame, dropping any remaining time debt), calls `update()` per tick and `draw()` per frame. Also owns pause/resume, fullscreen (one-shot `toggleFS`, consumed on use), and all event wiring (keyboard, touch → native coords, blur → `Controls.reset`, resize).
- **`World.ts`** — simulation step: random roid spawning (in native space), movement + boundary clamping/culling (`boundNTick`; unbound objects cull only when fully off screen), collision dispatch (each pair processed once via `Obj.id` ordering, both parties notified), and a death sweep (`dead` flag or `health <= 0 && !immortal`) — never remove entities by index.
- **`Renderer.ts`** — canvas sizing (HiDPI via `devicePixelRatio`), the native→device transform, entity drawing, debug overlay, and text modals (modals set their own fill style; canvas resets wipe context state).
- **`Stage.ts`** — thin container holding the canvas, the entity list (`items`), the spatial hash, and world bounds.
- **`Object.ts`** (`Obj`) — base class for all entities: `mass`, `health`, a `Geo`, a `Path2D`, and a unique `id`. `intersects(other)` applies damage; removal is the World's job. Highlighting is a `highlightUntil` timestamp (no timers). Subclasses: `Craft` (player ship: thrusters, weapons switched edge-triggered with Q/E, fires `Projectile`s that inherit craft velocity), `Roid` (asteroids, vertices generated per-instance), `Projectile` (optionally ricochets — `bounce` option in `config.projectile` or per-instance).
- **`Geo.ts`** — per-entity geometry: position, velocity/acceleration, model-space polygon points, a `rotation` (radians, pivots on the centroid, setter refreshes the AABB), and a world-space AABB (`pos` + rotated extents). `worldPoints()` writes into a per-instance scratch buffer — results are invalidated by the next call. Collision: AABB broad phase (`aabbIntersects`, position-aware) then segment/point-in-polygon narrow phase (`intersectsWith`).
- **`SpatialHash.ts`** — in-repo broad-phase grid (replaces the old `spatial-hashmap` dep). Buckets and the `getNearby` result set are reused across calls; the returned set is only valid until the next `getNearby`.
- **`config.ts`** — all gameplay tuning constants (tick length, cell size, craft/roid/projectile stats, entity polygon vertices, projectile `bounce`). Change game feel here, not in the classes.
- **Coordinates** — the game simulates in a fixed native 1920×1080 space. `Renderer` scales to fit the device; `deviceToNative()` maps CSS-pixel input (touch/click) back into native space, dpr-invariant.
- **`Controls.ts`** — key bindings (WASD/arrows, Space fire, Q/E weapons, P pause, F fullscreen, R autobreak) and touch state. Press-activated vs toggle actions are distinct sets; one-shot actions (weapon switch, pause, fullscreen) are consumed by their handlers.
- **`draw.ts`** — helpers to build `Path2D` objects from point lists; entities pre-build paths at module load or construction time.

## Notes

- Husky 9 hooks: pre-commit runs lint-staged (eslint --fix + sort-package-json, re-staged), pre-push runs `npm test`.
- CI: `.github/workflows/ci.yml` tests on every push/PR; the deploy job runs only on master with a concurrency guard.
- Never commit secrets (the Codecov token was removed; coverage is vitest-only now).
