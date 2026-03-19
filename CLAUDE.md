# CLAUDE.md — Quantexus Web Terminal

## Documentation

- **Architecture:** [`docs/architecture.md`](docs/architecture.md) — tech stack, folder structure, BFF pattern, API integration.
- **Project Status:** [`docs/project_status.md`](docs/project_status.md) — current phase, roadmap, definition of done.
- **Engine repo:** `../engine` or https://github.com/Quantexus/engine — the backend this UI calls.
- **Engine API:** `../engine/proto/quantexus/v1/order_service.proto` — source of truth for all request/response shapes.

> **Rule:** Update `docs/project_status.md` after every completed phase.

> **Rule:** When the engine proto changes, update `src/lib/engine/types.ts` to match before touching any component.

> **Rule:** Before every commit, ask: *did I have to reason from first principles about something that should already be documented?* If yes, update `CLAUDE.md` or the relevant `docs/` file before committing. Examples worth capturing: new patterns, accepted trade-offs, recurring conventions, cross-layer interface shapes.

---

## Development

### Prerequisites

- Node.js LTS (install via nvm)
- pnpm

```bash
nvm install --lts && nvm use --lts
npm install -g pnpm
```

### Setup

```bash
pnpm install
cp .env.example .env.local   # then fill in ENGINE_GRPC_URL
pnpm dev                     # http://localhost:3000
```

### Scripts

```bash
pnpm dev        # dev server
pnpm build      # production build
pnpm lint       # eslint
pnpm typecheck  # tsc --noEmit
pnpm test       # vitest
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ENGINE_GRPC_URL` | Yes | Engine gRPC address, e.g. `localhost:50051` (server-side only, no `NEXT_PUBLIC_`) |

---

## Architecture

See [`docs/architecture.md`](docs/architecture.md) for full details. Summary:

- **Next.js App Router** — file-based routing, server components where possible.
- **BFF pattern** — browsers can't speak gRPC. Next.js API routes (`src/app/api/`) run server-side, call the engine via `@grpc/grpc-js`, and return JSON to the browser.
- **No mock layer** — the terminal connects to a real engine. Run `make dev-up` in the engine repo before starting the frontend.
- **TanStack Query** — all server state (order book, balances, trades, open orders). Handles polling, caching, and invalidation.
- **Zustand** — client state: active symbol, order form selections, user session (userId for testing without auth).
- **shadcn/ui** — component primitives in `src/components/ui/`. Never edit these files manually; use the shadcn CLI to add/update.

---

## Conventions

### File Naming

| Element | Convention |
|---------|-----------|
| Pages | `src/app/.../page.tsx` |
| API routes | `src/app/api/.../route.ts` |
| Components | `PascalCase.tsx` |
| Hooks | `use{Name}.ts` |
| Stores | `{name}.store.ts` |
| Engine client | `src/lib/engine/client.ts` (server-side only) |
| Types | `src/lib/engine/types.ts` |

### Component Rules

- No business logic in components — extract to hooks.
- No direct `fetch` in components — use TanStack Query hooks from `src/hooks/`.
- Components are unaware of gRPC. They only know about types from `src/lib/engine/types.ts`.

### Numeric Precision

The engine encodes all prices, quantities, and balances as 18-decimal fixed-point integers sent as strings (e.g. `"1000000000000000000"` = 1.0). Use helpers in `src/lib/utils/format.ts` for all display conversions. **Never use `parseFloat` or `Number()` on financial strings.** Use `BigInt` for any arithmetic.

### API Routes (BFF)

All engine calls go through `src/app/api/`. Each route:
1. Validates the incoming request
2. Calls the engine via the gRPC client in `src/lib/engine/client.ts`
3. Returns plain JSON — no gRPC types leak to the browser

### Testing

- Unit and component tests with Vitest + React Testing Library.
- Test files colocated: `Component.test.tsx` next to `Component.tsx`.
- No `any` types in test files.
- API route tests mock `src/lib/engine/client.ts` only — never mock TanStack Query or React internals.

### Order Lifecycle States

Valid order states: `Created`, `Validating`, `PendingMatch`, `PartiallyFilled`, `Filled`, `Cancelled`, `Rejected`, `Settled`, `Completed`.

Only transitions defined in the engine PRD (Section 5.4) are valid. The UI must not infer or fabricate states — display exactly what the engine returns.

### Commits

- **Always use the `/commit` skill to create commits. Never run `git commit` directly.**
- **Always run `/check` before committing.** Fix all lint, type, and test failures before proceeding.
- `type: description` format (feat, fix, refactor, test, docs, chore).
- One logical change per commit. Do not mix features with refactors.
- No `console.log` in committed code.

### Code Quality

- No dead code. No commented-out code. No TODO comments without an associated tracking issue.
- Never log sensitive data (user IDs in prod, balances, tokens).
- No `any` types anywhere — not in components, hooks, or tests.
