# Design

## Product

A salary management tool for the HR Manager of a 10,000-employee organisation.

Features:

- Add, view, update, soft-delete employees.
- Search, filter, paginate the list server-side.
- Salary insights by country: min, max, avg, median, p25/p75, headcount.
- Average salary by (country, job title).
- Seed 10,000 employees in under 5 seconds.

## Out of scope (with reasons in trade-offs.md)

Auth · multi-tenancy · multi-currency · audit log · realtime · E2E tests · Postgres in v1 · IaC.

## Architecture in one paragraph

FastAPI backend over SQLite. Business logic in a pure `domain/` package; orchestration in
`services/`; persistence in `repositories/` — the only layer that imports SQLAlchemy. A
Vite + React SPA consumes the REST API via TanStack Query and renders with shadcn/ui.
See `architecture.md` for the diagrams.

## Employee model

| Field | Type | Notes |
|---|---|---|
| id | UUID | server |
| full_name | str | ≤200 chars |
| email | str | unique |
| job_title | str | ≤100 chars |
| department | str | from a fixed list |
| country | str | ISO-3166 alpha-2 |
| salary | int (cents) | USD cents, > 0 — integer cents avoids float/Decimal rounding bugs in aggregates |
| employment_type | enum | full_time / part_time / contractor |
| hire_date | date | not in future |
| is_deleted | bool | soft delete |
| created_at, updated_at | datetime | server |

Beyond the four required fields, we added `email` (identity), `department` (slicing),
`hire_date` (tenure), `employment_type` (otherwise contractor vs. full-time comparisons
mislead).

## Insights

| Metric | Required? | Why |
|---|---|---|
| min / max / avg by country | yes | assignment |
| avg by (country, job title) | yes | assignment |
| median + p25/p75 by country | added | central tendency hides distribution |
| headcount + avg by country | added | spot under/over-paid regions at a glance |

All exclude soft-deleted rows. All computed in SQL.
