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

---

## Closing notes

(Fill in at the end of the build: 3–5 honest observations about pairing with Claude on this
project — what worked, what didn't, what I'd change.)
