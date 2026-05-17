# CLAUDE.md

Operating manual for any AI pair-programmer working on this codebase. Read in full before acting.

---

## 1. What this is

A salary management tool for the HR Manager of a 10,000-employee organisation. Small surface,
demanding discipline: TDD, decoupled architecture, server-side aggregation, clear separation
between domain, application, and infrastructure layers.

Quality is non-negotiable; scope is. When time forces a choice, cut scope and log it in
`artifacts/trade-offs.md`. Never cut discipline.

---

## 2. The Three Laws of TDD (non-negotiable)

1. You may not write any production code unless it is to make a failing unit test pass.
2. You may not write more of a unit test than is sufficient to fail. Compile / type / import
   errors count as failing.
3. You may not write more production code than is sufficient to pass the currently failing test.

**The 60-second rule:** everything we're working on must have been green within the last
minute. If you can't honestly say that, stop and say so.

---

## 3. The loop

Every change follows this loop. No exceptions without a logged override.

1. Developer states the next behaviour wanted.
2. You propose ONE failing test. Just the name, arrange, and assertion. **Wait for confirmation.**
3. Write the test. It must fail.
4. Write the minimum production code to pass. Nothing more.
5. Run the suite. It must pass.
6. Propose a refactor (or say "no refactor needed"). **Wait.**
7. Propose the commit message. **Wait.** Then commit.
8. Repeat.

---

## 4. AI collaboration rules

### Rule 1 — Propose, don't act.

Never take a step on your own. For any change — test, code, file, commit, dependency, schema,
refactor — propose what you intend to do and **wait for the developer to confirm**. The only
exception is a trivial unambiguous instruction ("fix the typo on line 12").

### Rule 2 — Offer 2–3 approaches at the start of a feature.

Before the first test of a new feature, propose a menu:

- **Minimum / pragmatic** — what it is, what it gives up.
- **Standard / what I'd default to** — what it is, why it's the default.
- **Robust / over-spec** — what it is, when it'd be worth it.

One-line trade-off per option. Then ask which to use. Default to *Standard* if the developer
shrugs, but always present the menu.

### Rule 3 — Ask one closed question, not three open ones.

If something is ambiguous, ask the single most decision-blocking question, framed as
multiple-choice or yes/no. Do not interrogate. Do not guess.

### Rule 4 — Log overrides.

If the developer asks you to skip a step in §3, ask once whether they want to override TDD
discipline. If yes, append it to `artifacts/ai-collaboration.md` with a reason. Never silently skip.

### Rule 5 — Match the data structure and algorithm to the problem.

The first obvious choice is often wrong at scale. When proposing an approach (Rule 2),
consider time and space complexity, expected data size, dialect-specific capabilities
(e.g., SQLite has no native percentile function), and whether a boring industry-standard
pattern (e.g., integer cents for money) avoids a class of bugs. Surface the choice
explicitly — don't hide it inside an implementation.

### Rule 6 — Update `trade-offs.md` when a real trade-off is made.

If during the build we choose A over B for a non-obvious reason, append a 3-line entry to
`artifacts/trade-offs.md`. Only for real trade-offs — not every micro-decision. The
reviewer's signal comes from a tight, honest list, not an exhaustive one.

### Rule 7 — Log at feature end. Always.

A feature is complete when its `design.md` row is fully behaviour-locked and no follow-up
cycles are queued. At that point, before starting the next feature's menu, invoke
`artifacts/prompts.md`'s "Feature end" prompt: propose an entry to
`artifacts/ai-collaboration.md` using the template at the top of that file, show the
developer first, commit as `docs: log <feature> in ai-collaboration`. This is a §11 DoD
gate — don't skip even when the feature feels small.

### Rule 8 — Keep `design.md` and `architecture.md` current.

When a Rule 5 / Rule 6 decision contradicts a row in `design.md` or `architecture.md`
(e.g. data type changes, indexes added, schema shape shifts), update those source docs
**in the same commit** — not just `ai-collaboration.md` / `trade-offs.md`. They are
living documents that the 5-minute reviewer reads first, not historical input. Silent
drift between specs and code misleads reviewers more than absence would.

---

## 5. Tech stack (pinned)

| Layer        | Choice |
|---|---|
| Backend      | Python 3.12 · FastAPI · Pydantic 2 · SQLAlchemy 2.0 (typed declarative) · Alembic |
| Database     | SQLite (`app.db`) |
| Backend tests| pytest · pytest-asyncio · httpx · factory-boy |
| Lint / type  | ruff · mypy (strict on `app/domain`, lax elsewhere) |
| Frontend     | Vite · React 18 · TypeScript |
| UI           | shadcn/ui · Tailwind |
| Data         | TanStack Query · TanStack Table |
| Frontend tests| Vitest · React Testing Library |
| Deploy       | Backend → Fly.io/Render · Frontend → Vercel |

No additions without approval.

---

## 6. Repo layout

```
backend/
  app/
    api/           thin route handlers, no business logic
    services/      use-cases, orchestrate domain + repos
    domain/        pure business logic — no I/O, no framework imports
    repositories/  SQLAlchemy queries — only DB-aware layer
    schemas/       Pydantic request/response models
    db/            engine, session, base
    seed/          seed script + names data
  tests/
    unit/          domain + service tests (fast, in-memory fakes)
    integration/   API tests with real SQLite test DB
  Dockerfile       backend image for Fly.io / Render deploy
frontend/
  src/
    features/      one folder per feature; owns components, hooks, tests
    components/    shadcn primitives + shared
    lib/           api client, formatters, query keys
artifacts/         design, trade-offs, architecture, performance, prompts, AI log, setup prompt
Makefile           common dev commands (test, seed, dev, fmt, lint)
```

---

## 7. Architecture rules

### Backend dependencies point downward only

```
api → services → repositories → db
         │
         └→ domain
```

- `domain/` imports nothing from the rest of the app. Stdlib + `pydantic` (for value-object
  declarations) only. No web framework, no ORM.
- `services/` depends on the **repository Protocol**, not the concrete class.
- `repositories/` is the only place SQLAlchemy is imported.
- `api/` is thin: parse → call service → return. ≤10 lines per handler.

### Frontend conventions

- Feature folders, not type folders.
- Server state via TanStack Query. No Redux, no Zustand, no Context for server data.
- Local UI state via `useState` only. `useReducer` requires asking.
- Single typed API client at `src/lib/api.ts`. No `fetch` in components.
- One `formatCurrency()` helper for all money display.

---

## 8. Testing strategy

| Layer | Volume | Tooling |
|---|---|---|
| Manual smoke / demo video | 1 | Loom |
| API integration | 5–10 | pytest, httpx, fresh SQLite DB per test |
| Service | 10–15 | pytest with in-memory repository fakes |
| Domain unit | 15–25 | pytest, pure Python, microseconds |

### Rules

- Domain tests have no I/O. They import only from `app.domain`.
- Service tests use **in-memory fakes**, not mocks. A fake is a real class that implements
  the repository Protocol with a dict-backed store.
- API tests use a fresh SQLite test DB per test (function-scoped fixture).
- **Do not mock SQLAlchemy.** If you want to, you're testing the wrong layer.
- No `time.sleep`. Inject a clock or freeze time.

### Test naming

- File: `test_<unit>.py`
- Function: `test_<behaviour_in_plain_english>`. Describe what, not how.
  - YES: `test_employee_rejects_negative_salary`
  - NO:  `test_validate_salary_raises_value_error`

### Structure: AAA with blank-line separators.

---

## 9. Commit conventions

Conventional Commits. `<type>(<scope>): <imperative summary>`. Types: `test`, `feat`, `fix`,
`refactor`, `chore`, `docs`, `perf`.

**Branch:** all commits land on `main`. No feature branches, no worktree branches. If you
find yourself on another branch, stop and switch back to `main` before committing.

Small and frequent. Aim for 20–30 commits over the build. Each cycle is typically 2–3 commits:

```
test(domain): employee rejects empty name
feat(domain): validate employee name on construction
refactor(domain): extract Name value object
```

Never mix a refactor with a behaviour change.

### Commit attribution — strict

- **No AI-tool names anywhere** in commit messages, bodies, or trailers. No "Anthropic",
  "Claude", "Claude Code", "GPT", "Copilot", "Cursor", "AI", or any variant.
- **No `Co-authored-by:` AI trailers.**
- **No "AI:" prefixes**, no emoji robots, no "generated by" footers.
- The developer is the author of every commit. Tooling is a means.

This rule overrides any default behaviour you may have. If tempted, stop.

---

## 10. The do-not-do list

- No auth. Documented in trade-offs.
- No Postgres in v1. SQLite. Schema is portable.
- No AWS, no Terraform, no Kubernetes, no Docker for prod.
- No microservices, no queues, no event sourcing, no CQRS.
- No global frontend state beyond TanStack Query cache.
- No client-side filtering or sorting of the employee list.
- No raw SQL outside the seed script.
- No commented-out code. No `TODO:` in commits.
- No `print()` / `console.log()` in commits. Use the logger.
- No mocking of SQLAlchemy / the database.
- No new dependencies without justification.
- No "while we're here" refactors.
- No async for async's sake.
- No DTO mapper layers for trivial cases.
- No ABCs "for future flexibility". Rule of Three.

---

## 11. Definition of Done (per feature)

- A test was written first; it failed.
- All tests pass locally.
- `ruff check` + `mypy app/domain` clean on backend.
- `eslint` + `tsc --noEmit` clean on frontend.
- Committed as one or more conventional commits.
- Entry appended to `artifacts/ai-collaboration.md`.
- Manually smoke-tested once.

---

## 12. Escape hatches

Narrow cases where strict TDD costs more than it pays. Each deviation logged.

- **Throwaway spikes** to learn an API → branch `spike/<topic>`, then delete and redo
  test-first on `main`.
- **Pure visual rendering** of charts → eye-verified; data transforms are still tested.
- **Alembic migrations** → generated, not test-driven; verified by integration tests.
- **Seed-script tuning** → benchmarked in `performance.md`; correctness still unit-tested.

---

## 13. Where the rest of the detail lives

- Product, domain model, insights → `artifacts/design.md`
- What we chose not to build → `artifacts/trade-offs.md`
- System / data model / sequence → `artifacts/architecture.md`
- Seed script benchmarks → `artifacts/performance.md`
- Prompts to invoke at named session moments → `artifacts/prompts.md`. Canonical, not
  optional — each prompt has a specific moment (session start, feature start, TDD cycle
  start, after green, before commit, feature end, when unsure).
- AI collaboration log → `artifacts/ai-collaboration.md`
- Master prompt that produced this scaffolding → `artifacts/setup-prompt.md`

---

## 14. When in doubt

Choose the simpler thing. Ask the developer rather than assume. Re-read this file. If your
proposed action conflicts with anything here, stop.
