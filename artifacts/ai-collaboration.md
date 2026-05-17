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
  - Claude's history-rewrite attempts (sandbox + explicit refusal also stopped these,
    but framing the redesign as forward commits was the right call).
- What Claude flagged that I would have missed:
  - Integer cents for money at Salary cycle 1 (Rule 5 surface).
  - The `"100"` coincidental `TypeError` from Salary's `<= 0` comparison — would have
    passed the test for the wrong reason. Drove the type-check-before-value-check order.
  - `bool` being a subclass of `int` (caveat acknowledged, no test added).
  - `1.0` (whole-number float) as the most likely silent-bypass case in non-integer rejection.
  - `frozen=True` dataclass requires `object.__setattr__` for normalisation in `__post_init__`.
  - `pydantic.ValidationError <: ValueError` enabling the Pydantic port without rewriting
    most existing tests.
- TDD discipline overrides:
  - Email format-rejection test landed as characterization after Pydantic port (Rule 4); logged in Design pivots.
  - Employee `_sets_sensible_defaults_for_server_fields` passed from first run because cycle 1's prod code already set sensible defaults; called out in-thread.
- Notable Rule 5 callouts: integer cents for money; EmailStr rejects single-label domains by default; StrEnum vs plain Enum; SQLite has no native percentile (deferred to repository layer's aggregation cycles).

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
