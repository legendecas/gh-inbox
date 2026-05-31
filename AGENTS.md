# AGENTS.md

## Project

**gh-inbox** — Electron desktop app for managing GitHub notifications. All data stored locally in SQLite; communicates with GitHub/GitHub Enterprise via user-supplied PATs.

## Stack

Electron, React, Vite, Tailwind CSS, TypeScript, Prisma ORM (SQLite), Octokit

## Directory layout

```
src/
  main/           # Electron main process
    main.ts               # Entry: creates Application, wires app lifecycle
    application.ts        # Application class: lifecycle orchestration
    service-manager.ts    # ServiceManager, IService, IpcHandle
    web-server.ts         # Express (port 2959), mirrors IPC over HTTP
    task-runner.ts        # Periodic background task scheduler (3 min interval)
    constants.ts          # Path constants
    github/               # GitHubClient (Octokit + undici proxy/TLS)
    tasks/                # Background tasks (base, fetch-notifications, refresh-status, cleanup-archived)
    services/             # IPC services (endpoint, threads, preset-filter)
    database/             # Prisma wrapper + custom SQLite migrator
    utils/                # Logger (Winston)
  app/            # Electron renderer (React + Vite)
    renderer.tsx           # React entry
    components/            # React components (inbox, settings, create-endpoint)
    hooks/                 # Custom hooks
  preload/        # Electron preload: contextBridge exposes versions + ipc.invoke
  common/         # Shared main/renderer types
    ipc/                   # IPC interface contracts (IpcEndpoints type + per-service interfaces)
    search-builder/        # Query parser + Prisma filter builder for thread search
    presets.ts             # Preset filter queries
  prisma/         # Prisma schema + raw SQL migration files
    migrations/            # Raw .sql migrations applied by custom Migrator
  generated/      # Generated output (do not edit)
    prisma/                # Prisma client
  static/         # Static assets
```

## Architecture

### Service + IPC wiring

Services implement `IService` (namespace + `wire()`). They register with `ServiceManager`, which wires them to Electron IPC. Channel format: `{namespace}:{channel}` (e.g. `threads:list`).

Renderers call `window.ipc.invoke("namespace", "channel", ...args)`. Types flow automatically from `IpcEndpoints` in `src/common/ipc/ipc.ts`.

The `WebServer` (port 2959) mirrors all IPC over `POST /api/ipc` for localhost dev.

### Adding a new IPC service

1. Define the interface in `src/common/ipc/` (follow `threads.ts` pattern)
2. Add it to `IpcEndpoints` in `src/common/ipc/ipc.ts`
3. Implement class in `src/main/services/` (implements `IService` + the interface)
4. Register in `Application.onReady()` via `serviceManager.registerService()`

### Database

Prisma schema at `src/prisma/schema.prisma`. Run `npx prisma generate` after changes to regenerate `src/generated/prisma/`.

Migrations are raw `.sql` files in `src/prisma/migrations/{name}/migration.sql`, applied alphabetically by the `Migrator` class using `node:sqlite` `DatabaseSync` — not Prisma Migrate.

## Tooling

```bash
npm run build      # Compile TypeScript + Prisma + Vite frontend (no Electron)
# NOTE: npm start is a long-running task. Do not run it; let the user handle that.
npm run lint       # ESLint
npm run format     # Prettier
npm run test       # Workspace tests (if present)
```

Always run `npm run format` before committing. Verify changes with `npm run build`.
