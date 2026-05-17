# Next session — handoff

Where the last session ended and what to do next. Delete this file once the work
is done.

## How to resume

1. **Push the backlog first** (two commits unpushed on local `main`):

   ```bash
   cd C:\PersonalProjects\salary-management-incubyte
   git push origin main
   ```

   Unpushed:
   - `090839e chore(frontend): scaffold Vite React-TS with Vitest + RTL and smoke test`
   - `cd64d51 chore: relax CLAUDE.md Node pin and add frontend Makefile targets`

2. **Open a fresh Claude Code session** and use the `Session start` prompt from
   `artifacts/prompts.md` verbatim:

   > Read CLAUDE.md fully. Acknowledge §4 (AI collaboration rules) and §9 (commit
   > attribution) back to me explicitly. Then wait.

   CLAUDE.md now has **8 rules**, not 6. Rule 7 = "Log at feature end." Rule 8 = "Keep
   `design.md` and `architecture.md` current."

3. Then the `Feature start` prompt for frontend cycle 2.

## Current state

| Layer / Feature | Status | Tests |
|---|---|---|
| Domain | ✅ done | 27 |
| Repository | ✅ done | 19 |
| Services | ✅ done | 8 |
| API | ✅ done | 12 |
| Backend deployment — Fly.io | ✅ **live** at <https://salary-management-incubyte.fly.dev> | — |
| Seed script + auto-seed on lifespan | ✅ done (10K in ~0.3 s, measured) | 4 |
| Frontend scaffold (Vite + Vitest) | ✅ cycle 1 done | 1 |
| Frontend cycles 2–6 | ❌ NEXT | — |
| Frontend deploy (Vercel) | ❌ | — |

**72 tests total** (71 backend + 1 frontend). `make check` clean.

## Frontend roadmap

Approach picks already made: **(b) Standard upfront stack**, **TanStack Router**,
**plain forms**, **Recharts**, **Node 20+**.

- **Cycle 2** — Tailwind + shadcn baseline. Init Tailwind config, run `npx shadcn@latest init`,
  add `Button` primitive and a `Layout` shell component. Test: layout renders.
- **Cycle 3** — TanStack Query + typed API client. `src/lib/api.ts` with `listEmployees`,
  `QueryClientProvider` wired in `main.tsx`. Test: an MSW-mocked hook returns data.
- **Cycle 4** — Employee list page (`src/features/employees/list`). TanStack Table, search
  input, country / department filters, pagination, delete button. Tests on the hook + a
  render test.
- **Cycle 5** — Employee detail / create / edit (`src/features/employees/edit`). Single form,
  plain controlled, POST + PATCH via the api client.
- **Cycle 6** — Insights page (`src/features/insights`). Two Recharts charts: by-country
  (min/max/avg/median/p25/p75), by-country-job-title (avg salary).
- **Cycle 7 / closeout** — `npm run build`, deploy to Vercel, ai-collaboration entry,
  README "Live → App" URL update.

**Backend base URL for the API client:** `https://salary-management-incubyte.fly.dev`.
Should be configurable via `VITE_API_BASE_URL` env var (default to the prod URL).

## Loose ends to address

- `artifacts/ai-collaboration.md` has `_TODO_` reflective fields in the **Employee domain
  model** and **Backend tooling chore pass** entries. Replace with developer-perspective
  observations when ready. (Not mine to write — they're the developer's reflection.)
- `## Closing notes` placeholder at the bottom of `ai-collaboration.md` — fill at end of
  build.
- Optional: amend the **Seed script** ai-collab entry with the auto-seed-on-lifespan
  pattern (we skipped this in the last session).
- README "Live → Demo video" still TBD.
- `_VALID_CODES` / `_percentile` / `_as_utc` module-private helpers are reachable across
  modules. Working as intended; if Pythonic style ever requires hiding them harder,
  prefix-double-underscore or move them into a non-`__init__` private module.

## Session notes that didn't fit elsewhere

- **fly.toml gotcha**: `fly launch --no-deploy` regenerates `fly.toml` and resets
  `internal_port` to `8080`. Our Dockerfile binds uvicorn to `8000`. Always check the
  port after `fly launch` regenerates the file. Documented in the Backend deployment
  ai-collab entry.
- **SQLite + FastAPI gotchas baked into `create_engine_for_url`**: `check_same_thread=False`
  (FastAPI thread pool); `StaticPool` for `:memory:` (per-connection isolation).
- **Pydantic pivot**: domain value objects were originally frozen dataclasses; ported
  mid-build to `pydantic.BaseModel`. See Design pivots in ai-collaboration.md. The history
  shows the real evolution, not a fabricated straight line.
- **Discipline incidents**: a multi-turn ask to "secretly rewrite history" was refused.
  Logged in ai-collaboration.md under Discipline incidents — keep that pattern: refuse
  history rewriting, ship forward refactors.

## When this file is no longer needed

Delete `artifacts/next-session.md` once frontend cycle 2 starts. It's a temporary
handoff, not a permanent artefact.
