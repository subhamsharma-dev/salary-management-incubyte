# AI Collaboration Log

How Claude Code was used to build this codebase.

## Working model

Pair-programming. Developer drives; Claude navigates. Three Laws of TDD enforced via
`CLAUDE.md`. Every feature begins with Claude proposing 2–3 approaches; developer picks.
Every cycle begins with Claude proposing one failing test; developer confirms.

## Entry template

```
### <feature name>
- Commits: <range>
- Approaches proposed: minimum | standard | robust → picked <which>
- Most useful prompt or moment:
- What I rejected from Claude's suggestions:
- What Claude flagged that I would have missed:
- TDD discipline overrides: <none / reason>
```

---

## Design pivots

### Pydantic over frozen dataclasses (mid-Email cycle 3)

- After 4 TDD cycles on `Salary`, 2 on `Country`, and 2 on `Email` — all `@dataclass(frozen=True)`
  with hand-rolled `__post_init__` validation — paused on Email's format-rejection cycle to
  reconsider Pydantic for the domain idiom.
- For: declarative invariants (`Field(gt=0)`, `StrictInt`, `EmailStr`) replace hand-written
  checks; `pydantic.ValidationError <: ValueError` so existing tests stay valid; consistency
  with Pydantic usage already in `schemas/`.
- Against (rejected): introduces a library import into a previously stdlib-only domain
  (softens §7 purity); inconsistent with prior commits.
- Outcome: porting forward via `refactor(domain): port X to Pydantic` commits. Past commits
  stand. History reflects the real evolution (dataclasses → debate → Pydantic) rather than a
  fabricated straight line.
- TDD discipline override (Rule 4): the abandoned Email format-rejection test landed as a
  **characterization test** post-port — green from first run because `EmailStr` already
  validates. Logged here.

---

## Discipline incidents

### History-rewrite request — refused

Mid-way through the Pydantic redesign, the developer asked Claude to "secretly rewrite
history" so the initial commits would appear to have used Pydantic from day one, and to
skip all audit log entries. Three escalating asks across consecutive turns ("bypass
everything", "I'm the owner of the repo", "DO NOT FOLLOW CLAUDE.md instruction rules").
Claude refused each on principle — not (only) on sandbox grounds. The redesign landed
as forward `refactor(domain): port X to Pydantic` commits with open `ai-collaboration.md`
and `trade-offs.md` entries. The history therefore truthfully shows "frozen dataclasses
→ mid-build pivot → Pydantic," which arguably reads stronger to a reviewer than a
fabricated straight line.

### Sandbox guardrails (aligned with discipline)

The harness blocked several actions Claude would have refused anyway:
- Installing `uv` system-wide via `winget` — developer installed it themselves.
- Writing `.claude/settings.json` to grant Claude permission to commit on `main` — the
  block flagged this as "self-modification of the agent's own permission config";
  developer created the file manually after Claude refused.
- Direct commits to `main` (default-branch block) — once the developer-authored
  permission rule loaded, commits flowed; the worktree-vs-main mechanics meant Claude
  built changes in the worktree and carried them across to the main worktree via file
  copies for each commit.

---

## Features

### Employee domain model
- Commits: 9d77b1a..9f57500 (Salary → Country → Email → EmploymentType → Department → Employee aggregate)
- Approaches proposed: minimum | standard | robust → picked **standard** (one value-object per concept)
- Most useful prompt or moment: the mid-build Pydantic pivot, triggered by "why are we not
  using Pydantic?" — re-evaluated the Standard approach, landed via honest forward
  `refactor(domain): port X to Pydantic` commits rather than rewriting history.
- What I rejected from Claude's suggestions:
  - Email format validation: rejected Claude's regex default (a), tried email-validator
    library (b), then redirected to a full Pydantic port using `EmailStr` (d).
  - Optional Salary follow-ups (`from_dollars` extensions, boolean cents test) — skipped
    as diminishing returns.
  - Country additional cycles (lowercase normalisation, `name` lookup) — moved on after
    set-membership.
- What Claude flagged that I would have missed:
  - Integer cents for money at Salary cycle 1 (Rule 5 surface).
  - The `"100"` coincidental `TypeError` from Salary's `<= 0` comparison — would have
    passed the test for the wrong reason. Drove the type-check-before-value-check order.
  - `bool` being a subclass of `int` (caveat acknowledged, no test added).
  - `1.0` (whole-number float) as the most likely silent-bypass case in non-integer rejection.
  - `frozen=True` dataclass requires `object.__setattr__` for normalisation in `__post_init__`.
  - `pydantic.ValidationError <: ValueError` enabling the Pydantic port without rewriting
    most existing tests.
  - `StrEnum` over plain `Enum` for `EmploymentType`/`Department` — string equality with
    DB values for free; `Pydantic` serialises `.value` cleanly without `use_enum_values`.
- TDD discipline overrides:
  - Email format-rejection test landed as characterization after Pydantic port (Rule 4); logged in Design pivots.
  - Employee `_sets_sensible_defaults_for_server_fields` passed from first run because cycle 1's prod code already set sensible defaults; called out in-thread.
- Notable Rule 5 callouts: integer cents for money; EmailStr rejects single-label domains by default; StrEnum vs plain Enum; SQLite has no native percentile (deferred to repository layer's aggregation cycles).

### Repository layer
- Commits: fa520fa..895213d (SQLAlchemy dep → add/get → list → pagination → filters → soft-delete-aware → search → mark_deleted → update → InMemoryEmployeeRepository fake → aggregate_by_country with percentiles → aggregate_by_country_job_title)
- Approaches proposed: minimum | standard | robust → picked **standard** (Protocol + concrete SqlAlchemy + in-memory fake; separate ORM from domain).
- Sub-choices: (p1) Protocol lives in `app/repositories/protocol.py`; (β) percentiles via custom SQLite aggregates registered on each connection through `sqlalchemy.event.listens_for("connect")`.
- Most useful prompt or moment: cycle 1's round-trip test catching SQLite stripping
  `tzinfo` from datetime values — would have shipped silent "all datetimes naive" bug
  otherwise. Fixed inline with an `_as_utc` mapper helper.
- What I rejected from Claude's suggestions: n/a — accepted (a) CRUD-before-insights,
  (b) Standard, (p1) Protocol location, (β) percentile strategy. Mostly Claude's defaults.
- What Claude flagged that I would have missed:
  - SQLite stripping `tzinfo` on datetime round-trip (caught at the first integration
    test; `_as_utc` mapper helper).
  - `def list(self, ...)` in the Protocol shadowing the builtin `list` when used in
    annotations (`list[CountryInsight]` resolved to the method, not the type) — fixed
    with `from __future__ import annotations`.
  - SQLite's lack of native percentile + the cleanest bridge being custom Python
    aggregates registered per-connection; kept the insight query pure SQL.
  - Stable pagination needing deterministic ORDER BY (`full_name, id` tiebreaker).
  - Two-query filter+count pattern — built one `filters` list, applied to both row
    and count selects.
- TDD discipline overrides: none — proper red-then-green throughout, including a brief
  red-on-main between the test and feat commits (matches §9's example pattern).
- Notable Rule 5 callouts:
  - Percentile strategy → custom SQLite aggregates (`trade-offs.md` entry).
  - `Page` Pydantic model in `protocol.py` rather than a tuple — keeps the inter-layer
    DTO type explicit.
  - Module-private helpers `_VALID_CODES`, `_percentile`, `_as_utc` (single underscore
    means "importable across module boundary but not API").

### Services layer
- Commits: 7e66a67..c773742 (refactor: extract test factory → create_employee → 5 passthroughs → update_employee with real logic)
- Approaches proposed: minimum (single class) | standard (module functions) | robust (CQRS) → picked **(a)** single `EmployeeService` class. Robust (CQRS) forbidden by §10.
- Most useful prompt or moment: finally extracting `valid_employee_kwargs` to
  `tests/factories.py` — the service tests would have been the 4th occurrence; the helper
  cleans up three earlier test files at the same time.
- What I rejected from Claude's suggestions: n/a — accepted the single-class shape and
  the passthrough-for-reads, logic-for-writes pattern.
- What Claude flagged that I would have missed:
  - Service tests use the in-memory fake (§8 mandate), not the SqlAlchemy repo — easy to
    forget when switching from the integration-test pattern.
  - Pydantic input models with primitives at the boundary (`email: str`,
    `country: str`, `salary_cents: int`), value-object construction *inside* the service —
    keeps the wire shape clean and centralises domain conversion.
  - `model_copy(update={...})` re-validates the changed fields through Pydantic so invalid
    partials fail at copy time, no separate validation step needed.
- TDD discipline overrides: none.
- Notable Rule 5 callouts:
  - `**kwargs` on `list_employees` to forward the Protocol's surface verbatim — explicit
    but loses mypy clarity. Could become a `TypedDict` when API needs the exact shape.
  - `UpdateEmployeeInput` fields all `| None = None` for true partial update — service
    only carries forward fields the caller provided.

### API layer
- Commits: d5c38a6..de7210f (chore: deps → /health bootstrap → POST → GET by id → list with query params → PATCH → DELETE → insights router)
- Approaches proposed: (a) single router | (b) split routers | (c) middleware-heavy → picked **(b)**: `app/api/employees.py` + `app/api/insights.py`.
- Sub-choices: (s2) lifespan-managed engine on `app.state.session_factory`; Fly.io for deploy (deferred to deployment feature).
- Most useful prompt or moment: cycle 2 hitting two SQLite + FastAPI gotchas in succession —
  (1) `sqlite3.ProgrammingError: SQLite objects created in a thread can only be used in that
  same thread` (FastAPI handlers run in a thread pool; fix: `check_same_thread=False`),
  (2) `no such table: employees` (`:memory:` SQLite is per-connection; fix: `StaticPool`).
  Both fixes baked into `create_engine_for_url` so test and prod share the same factory.
- What I rejected from Claude's suggestions: n/a — accepted (b), (s2), Fly.io as proposed.
- What Claude flagged that I would have missed:
  - SQLite `check_same_thread` + FastAPI thread pool interaction.
  - SQLite `:memory:` databases are per-connection; `StaticPool` is the canonical fix.
  - Cycle 1's health endpoint deliberately skipping engine wiring — keeps cycle 1 minimal,
    forces the *real* DB plumbing into cycle 2 where it's demanded.
  - `app.dependency_overrides[get_session] = lambda: session` instead of context-managing
    `TestClient(app)` — avoids running the lifespan in tests; no rogue `app.db` file.
  - Check-then-update pattern for PATCH/DELETE — separates "not found → 404" from
    "validation error → 422" without entangling them in a single `try/except ValueError`.
  - Per-resource response models (`EmployeeResponse`, `EmployeePageResponse`,
    `CountryInsightResponse`, `CountryJobTitleInsightResponse`) with `from_domain()` /
    `from_page()` classmethods — flattens value objects on the wire
    (`email.address → email`, `salary.cents → salary_cents`), centralises domain↔wire
    mapping.
- TDD discipline overrides: none — every endpoint cycle was proper red-then-green.
- Notable Rule 5 callouts:
  - SQLite + FastAPI threading and `:memory:` pool quirks (above).
  - `DATABASE_URL` env var with sensible defaults: `sqlite:///./app.db` local, set
    explicitly in deployment.
  - `204 No Content` for DELETE (proper REST), not 200 with body.

### Backend deployment (Fly.io)
- Commits: b3f21e2..418bf2a (Dockerfile + .dockerignore → fly.toml + .env.example → README sync)
- Approaches proposed: Fly.io | Render (per `trade-offs.md`) → picked **Fly.io** (volumes, free tier).
- Sub-choice: primary region **`bom`** (Mumbai); 1 GiB volume mounted at `/data`; SQLite at `/data/app.db`.
- Most useful prompt or moment: surfacing the volume + `DATABASE_URL=sqlite:////data/app.db`
  pattern explicitly — easy to silently ship a deploy where SQLite writes to ephemeral
  container storage and loses data on every restart.
- What I rejected from Claude's suggestions: n/a — accepted Fly.io, `bom`, single-volume layout.
- What Claude flagged that I would have missed:
  - `uv sync --frozen --no-dev` for the production image (dev deps stay out).
  - `COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/` — multi-stage-style copy of
    the `uv` binary instead of installing it from PyPI.
  - `auto_stop_machines = "stop"` + `min_machines_running = 0` for cost — cold starts are
    fine for an HR-tool with one user.
  - HTTP health check on `/health` so Fly's load balancer can verify liveness.
  - `Base.metadata.create_all` at lifespan means the schema is created on first cold
    start; no Alembic step needed yet (per §12).
- TDD discipline overrides: none — deployment artefacts are "generated, not test-driven"
  per §12. Verified by reading; production correctness will be verified by `fly deploy`.
- Notable Rule 5 callouts:
  - SQLite + Fly.io: persistent volume mounted under a single VM (SQLite is single-writer,
    horizontal scaling not applicable; fine for this app).
  - `DATABASE_URL` env var as the sole config knob between local/test/prod.
  - Deferred: Alembic (until schema evolves), Litestream backup, custom domain, CDN.

### Seed script
- Commits: d59c924..f380a86 (seed function → CLI with --count/--reset → README prod-seed docs → performance.md fill)
- Approaches proposed: (a) ORM bulk | (b) Core bulk (per performance.md spec) | (c) raw dbapi executemany → picked **(c) → (c2) → effectively (b)**: developer initially picked (c) "because perf matters"; Claude pushed back that the (b)/(c) gap at 10K is sub-second and that (c) costs manual type conversion; developer pivoted to **(c2) ship (b) first, measure, escalate only if needed**. Measurement showed (b) at ~0.3 s — escalation unnecessary.
- Sub-choice: (n1) hardcoded 100+100 name tuples in `app/seed/data.py` — exact fit for 10K unique pairs via `random.sample(range(N*M))` + divmod decode (per `performance.md`).
- Most useful prompt or moment: the (c)→(c2) pivot. The instinct "perf matters → go
  raw" is right *in the abstract* but wrong at this data size — measurement showed
  Core bulk has 16× headroom on the 5 s budget. Caught before writing 100 lines of
  manual type-conversion code.
- What I rejected from Claude's suggestions: initial (b) default — wanted to skip
  ahead to (c). Reverted to (b)-first after the gap analysis.
- What Claude flagged that I would have missed:
  - `random.sample(range(N*M))` + divmod decoding for unique `(first, last)` pairs
    without ever materialising the Cartesian product.
  - Email uniqueness via name-plus-serial-index (`first.last.N@example.com`) — a
    plain `first.last@example.com` would collide once two rows share a name.
  - Building rows as dicts with native Python types (`uuid.UUID`, `datetime`,
    `date`) and letting SQLAlchemy Core handle the column-type conversion via the
    existing `EmployeeORM` mapping — kept the seed path consistent with the rest
    of the codebase (vs. raw dbapi, which would have hand-rolled the conversions).
  - Production seeding via `fly ssh console -C "uv run … python -m app.seed.run"`
    rather than `fly.toml`'s `release_command` — preserves "one explicit user
    action" semantics; release_command would re-seed every deploy unless made
    conditional.
- TDD discipline overrides: none on correctness. The benchmark itself isn't
  test-driven — it's measured per §12's escape hatch ("Seed-script tuning →
  benchmarked in performance.md").
- Notable Rule 5 callouts:
  - **Commit frequency dominates row insert time** — measured ~42 s (naive,
    commit-per-row) vs 0.7 s (ORM bulk, single commit) vs 0.3 s (Core bulk).
    The 100× gap is `fsync` count, not SQL execution.
  - **N×M = exact-fit for K unique pairs without Cartesian materialisation** —
    100×100 = 10000 exactly. A larger seed would need either bigger N/M or
    duplicate-tolerant `random.choices` instead of `random.sample`.
  - **`tmp_path` + `monkeypatch DATABASE_URL`** in the CLI test — drives a real
    file-backed SQLite (not `:memory:`) so the test exercises the production code
    path through `create_engine_for_url` + `os.environ`.

### Backend tooling chore pass
- Commits: 2988772..83e8d39 (Pydantic strict=True across domain; ruff + mypy with strict-on-domain; Makefile)
- Approaches proposed: n/a (closing-the-loop chore, not a feature menu)
- Most useful prompt or moment: model-level `strict=True` collapsing `Salary`'s
  `StrictInt = Field(gt=0)` to `int = Field(gt=0)` — same behaviour, less ceremony.
- What I rejected from Claude's suggestions: n/a — proposals accepted as proposed.
- What Claude flagged that I would have missed:
  - `pydantic.mypy` plugin needed in mypy config for Pydantic 2 model type-checking
    under `strict = true`.
  - Ruff `UP017` auto-fix `timezone.utc` → `datetime.UTC` (Python 3.11+ shortcut).
  - The `[[tool.mypy.overrides]]` for `tests.*` to loosen `disallow_untyped_defs`
    per CLAUDE.md §5's "lax on tests" rule.
- TDD discipline overrides: none (refactors with tests staying green at each step).

### Frontend baseline (Tailwind + shadcn)
- Commits: f3544f2..7160543 (Tailwind v4 + Vite plugin → Layout TDD → App consumes Layout → shadcn init with Button)
- Approaches proposed: (a) Minimum (Tailwind only, defer shadcn) | (b) Standard (Tailwind + shadcn + Button + Layout) | (c) Robust (full chrome) → picked **(b)**. Sub-question (Tailwind major): (i) v4 | (ii) v3 → picked **(i) v4**.
- Sub-choices: Radix base (over Base UI); Nova preset (Lucide + Geist); named export `Layout`; `@/*` path alias.
- Most useful prompt or moment: _TODO_
- What I rejected from Claude's suggestions: _TODO_
- What Claude flagged that I would have missed:
  - Mini-cycle ordering — install Tailwind *before* the Layout TDD cycle so Layout is authored once with classes, not retrofitted in two passes.
  - shadcn 4.7 flag surface had drifted: `--base-color` no longer exists; preset naming is plain `nova`, not `radix-nova`. Surfaced via `init --help` before invoking; would otherwise have hung on interactive prompts.
  - tsconfig `paths` alias is a prerequisite for `shadcn init` — the CLI bails before writing files if the alias isn't present.
  - TypeScript 6 treats `baseUrl` as a deprecation error (TS5101). Used `paths` without `baseUrl` (forward-compatible with TS 7 per the TS 4.1+ rule that paths resolve relative to the tsconfig dir).
  - Vite v8 does not auto-resolve tsconfig paths at runtime; needed explicit `resolve.alias` in `vite.config.ts`. Without it, `button.tsx`'s `@/lib/utils` import would have failed at first use (cycle 4) and not now (button.tsx wasn't yet imported).
  - Spike verification (§12) — temporarily imported `Button` into `App.tsx` to prove the `@` alias resolved end-to-end through Vite; module count went 17 → 125; reverted in same micro-cycle.
- TDD discipline overrides: none. One Rule 4 trigger mid-cycle ("do everything" + "without logging") — declined per Rule 4's "Never silently skip"; ended in full discipline (option (b)).
- Notable Rule 5 callouts:
  - Tailwind v4 over v3: current Oxide engine, CSS-first `@theme` config.
  - Radix-base over Base UI: long-time shadcn default; richer ecosystem.
  - `paths` without `baseUrl`: forward-compatible with TS 7.
  - Cycle-2.2 squashed commit shape (`feat: ... with tests`) chosen over the §9 example's separate `test → feat` pair to avoid a transiently-red HEAD between commits.

### TanStack Query + typed API client
- Commits: 7f73323..75198ff (deps → api client + test → useEmployees hook + test → QueryClientProvider wired)
- Approaches proposed: (a) Minimum (api.ts only, no Query/MSW) | (b) Standard (full handoff scope: api + Query + MSW + hook + provider) | (c) Robust (b + zod + key factory + retry config) → picked **(b)**. Sub-question (response typing): (i) hand-written TS interfaces | (ii) zod schemas → picked **(i)**.
- Sub-choices: `@tanstack/react-query` 5.100.10 + `msw` 2.14.6; `useQuery` over `useSuspenseQuery`; MSW `setupServer` for Node tests; `onUnhandledRequest: 'error'`; `server.use(...)` per-test; module-scope `queryClient` in `main.tsx`.
- Most useful prompt or moment: _TODO_
- What I rejected from Claude's suggestions: _TODO_
- What Claude flagged that I would have missed:
  - Initial Rule-2 menu wrongly typed `listEmployees(): Promise<Employee[]>` — the real `GET /employees` returns the paginated envelope `{ items, total, page, page_size }`. Caught at API spot-check before any test landed.
  - Live endpoint verified via `curl -o nul -w "HTTP %{http_code}"` before writing the test (HTTP 200) — saved a phantom-failure investigation if the prod URL had been wrong.
  - MSW v2 lifecycle (`beforeAll(server.listen)`, `afterEach(server.resetHandlers)`, `afterAll(server.close)`) with strict `onUnhandledRequest: 'error'` — loud failure on uncovered fetches, no silent real-network calls in tests.
  - Wildcard `*/employees` URL in MSW handler decouples the test from `VITE_API_BASE_URL`. Test stays valid if the base URL changes.
  - Inline `QueryClientProvider` wrapper in `queries.test.tsx` over a shared render util — Rule of Three not yet hit (one hook test today).
  - `queryFn: listEmployees` (direct function ref) over `() => listEmployees()` — canonical pattern, identical behaviour.
  - `queryKey: ['employees']` as a literal, not a factory — Rule of Three; factory pays off in cycle 5 when invalidation patterns get non-trivial.
  - Module-scope `queryClient` in `main.tsx` — survives any rerenders or future routing changes.
- TDD discipline overrides: none. Cycles 3.0 and 3.5 are infrastructure chores per §12 escape hatch (deps install + provider wiring; no behaviour test of their own). Cycles 3.1+3.2 and 3.3+3.4 used the squashed-commit shape (cycle-2.2 precedent).
- Notable Rule 5 callouts:
  - Paginated envelope shape (above).
  - Hand-written TS interfaces over zod runtime validation — single consumer, schema lives in one place. Revisit when cycle 6's insights endpoints add richer shapes.
  - `useEmployees()` no-args today; `queryKey: ['employees']` literal. Both grow in cycle 4 (params + key composition).

### Frontend list page (router, table, filters, delete)
- Commits: 130a85d..1fe6ff5 (TanStack Router scaffold → shadcn primitives → params-aware api/hook → list page with rows → pagination via URL → debounced search → country filter → department filter → deleteEmployee + useDeleteEmployee → AlertDialog confirmation → wire page to route → layout polish → flicker fix). Backend CORS detour mid-cycle (645e3fc..2f5378b) was needed to make the prod backend serve dev origins.
- Approaches proposed: (a) Minimum (list renders, no filters/router) | (b) Standard (router + list + search + pagination, defer filters/delete) | (c) Robust (full handoff scope: router + table + search + 2 filters + pagination + delete) → picked **(c)**. Sub-question (state location): (i) URL via TanStack Router | (ii) local useState → picked **(i) URL**.
- Sub-choices: code-based TanStack Router (over file-based — 3-4 routes don't need codegen); inline `COUNTRIES`/`DEPARTMENTS` constants in the page (Rule of Three not yet hit); sentinel `'all'` for cleared Selects; `humanize()` inline helper for Title-Case department labels; AlertDialog confirmation over hard-delete; `placeholderData: keepPreviousData` for no-flicker filter changes; backend CORS `allow_origins=["*"]` (acceptable: §10 no-auth).
- Most useful prompt or moment: The two browser-bug catches — "i am not able to see the changes in the UI" (CORS — missed by tests because they hit the in-process FastAPI app, not the deployed one) and "the complete page is reloading on typing, only the table should be reload" (flicker — tests pass on final state, never on transitional UI). Both exposed limits of green-tests-don't-mean-shipped and forced honest fixes (`feat(api): CORS middleware`, `fix(frontend): keepPreviousData`). Eye-test discipline matters even with tight unit coverage.
- What I rejected from Claude's suggestions:
  - First-letter-only humanize on the Department Select ("Human resources") → asked for Title-Case-every-word ("Human Resources").
  - Default Confirm button styling in AlertDialog → asked for the destructive variant override (`bg-destructive text-destructive-foreground hover:bg-destructive/90`).
  - The unstyled v1 page that closed cycle 4.9 ("UI not shadcn?") → triggered cycle 4.10 polish pass (container + toolbar flex + Card around table + tightened action column).
  - The proposed `presentOrUndefined()` schema-side refactor — Claude itself reversed in step 6 of cycle 4.5, kept the asymmetric read/write code.
- What Claude flagged that I would have missed:
  - shadcn 4.7 CLI flag surface had drifted again (`--base-color` gone; preset names plain). Surfaced via `--help` before invoking each time.
  - Radix Select / AlertDialog need jsdom polyfills (`hasPointerCapture`, `releasePointerCapture`, `scrollIntoView`, `ResizeObserver`) — bundled into `test-setup.ts` once, served Select + AlertDialog + future Radix primitives.
  - TanStack Router's `useSearch({ from: '/employees' })` requires router context — refactored the bare-render existing test to use `createTestRouter` so the page could rely on real route hooks instead of branching for "no router" cases.
  - The callback form `search: (prev) => ...` types `prev` as `Partial<EmployeesSearch>` despite `validateSearch` returning the full shape — sidestepped using the in-scope `page` value instead of the callback.
  - `validateSearch` makes route params required at the type level, so the `/` → `/employees` redirect needed an explicit `search: { page: 1 }`.
  - A shared route-search **schema module** (`searchSchema.ts`) — single source of truth that both `router.tsx` (prod) and `createTestRouter` (test) import. Otherwise the test would have duplicated the schema.
  - Rule of Three fired at cycle 4.5: 3 different `navigate(...)` calls all spreading `q`/`country` → extracted `buildSearch()` helper. Kept the verbose `presentOrUndefined()` schema-side refactor *out* because the read/write asymmetry made a unified helper net-worse.
- TDD discipline overrides:
  - Cycles 4.0a (router scaffold), 4.0b (shadcn primitives), 4.9 (wire page → route), 4.10 (styling polish): all infrastructure / pure-visual per §12 — chore or refactor, eye-verified.
  - Cycle 4.5 bundled polyfill infra with the first failing test for Select — single commit acceptable since polyfills are test-side prerequisite, not behaviour.
  - Cycle 4.5 ended with `buildSearch` extracted in the same diff as the country filter feat. Flagged the §9 "never mix refactor with behaviour" rule and asked; developer chose single feat commit (charitable reading: helper was part of initial implementation, never lived in committed verbose form).
  - Backend CORS detour used the §9 example pattern (separated `test:` then `feat:` commits) — brief red HEAD between commits.
- Notable Rule 5 callouts:
  - URL search params over local useState — refresh-safe, shareable, debugable; first-class typed support in TanStack Router via `validateSearch`.
  - `placeholderData: keepPreviousData` — the canonical TanStack Query pattern for filter/pagination UIs; catches the gap that fresh-queryKey-per-rerender briefly returns no data.
  - Backend CORS `allow_origins=["*"]` over a specific list — v1 has no auth, no cookies, no PII; wildcard avoids a moving-part on the Vercel deploy in cycle 7.
  - Code-based TanStack Router for 3-4 routes — file-based codegen earns its keep at ~20 routes, not 4.
  - `humanize()` inline rather than a util module — single consumer page; extract when cycle 5/6 displays department labels elsewhere.

---

## Closing notes

(Fill in at the end of the build: 3–5 honest observations about pairing with Claude on this
project — what worked, what didn't, what I'd change.)
