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
- Most useful prompt or moment: _TODO_
- What I rejected from Claude's suggestions: _TODO_
- What Claude flagged that I would have missed: _TODO_
- TDD discipline overrides:
  - Email format-rejection test landed as characterization after Pydantic port (Rule 4); logged in Design pivots.
  - Employee `_sets_sensible_defaults_for_server_fields` passed from first run because cycle 1's prod code already set sensible defaults; called out in-thread.
- Notable Rule 5 callouts: integer cents for money; EmailStr rejects single-label domains by default; StrEnum vs plain Enum; SQLite has no native percentile (deferred to repository layer's aggregation cycles).

### Backend tooling chore pass
- Commits: 2988772..83e8d39 (Pydantic strict=True across domain; ruff + mypy with strict-on-domain; Makefile)
- Approaches proposed: n/a (closing-the-loop chore, not a feature menu)
- Most useful prompt or moment: _TODO_
- What I rejected from Claude's suggestions: _TODO_
- What Claude flagged that I would have missed: _TODO_
- TDD discipline overrides: none (refactors with tests staying green at each step).

---

## Closing notes

(Fill in at the end of the build: 3–5 honest observations about pairing with Claude on this
project — what worked, what didn't, what I'd change.)
