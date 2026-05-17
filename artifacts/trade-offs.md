# Trade-offs

What we deliberately did *not* build, and why.

## Timebox vs. completeness (the parent)

Chose a small, disciplined, fully-working slice over a broad, partial one. Engineering
quality compounds; feature scope does not. Every other trade-off here descends from this.

## SQLite, not Postgres

SQLite is fine at 10K rows and a single user. Schema is dialect-agnostic; migrating to
Postgres later is a connection-string change.

## Vite + React, not Next.js

Internal authenticated tool. No SSR, no SEO, no edge needs. Vite is the simpler choice.

## Fly.io / Render + Vercel, not AWS + Terraform

IaC on AWS would consume most of the day for zero rubric payoff. In production we'd use
Terraform-managed AWS (VPC, ECS Fargate, RDS, Secrets Manager). Not today.

## Deployment scope — what we did *not* set up

PaaS defaults only: auto-HTTPS on both the backend (Fly.io / Render) and the frontend
(Vercel), plus Vercel's CDN. No custom domain, no Cloudflare or WAF, no rate limiter, no
observability stack (Sentry / Datadog / Prometheus), no log aggregation, no SQLite backup
automation. The deployed URL is public because there is no auth.

## No GitHub Actions CI workflow

Solo build. Local `make test` gates every commit (CLAUDE.md §11), and Vercel + Fly.io
auto-deploy from `main`. In a team setting GHA running lint + type-check + test on push
and PR would be required.

## No auth

Out of scope per the assignment. In production: OAuth via the org's IdP, RBAC enforced at
the service layer.

## No E2E / Playwright

Backend API tests + frontend component tests + the demo video cover the same ground in a
fraction of the setup time. Playwright belongs in a multi-day CI investment.

## Server-side pagination, not client-side

10K rows is fine in the browser; 100K dies; 1M never loads. Server-side from day one
removes a future migration.

## OFFSET pagination, not keyset

`LIMIT n OFFSET m` is fine at 10K rows on indexed columns. It becomes a problem past
~100K because OFFSET re-scans the skipped rows. The migration to keyset (`WHERE id >
last_seen_id ORDER BY id LIMIT n`) is a repository-layer change with no API break.

## Monorepo, not multi-repo

One link for the reviewer. Coherent commit history. Shared CI. Until two teams own two
layers, monorepo is right.

## Soft delete, not hard delete

HR data has compliance implications. Soft delete preserves the record; insights ignore
deleted rows. A future hard-delete policy (e.g., 90 days) is a one-line cron job.

## No Redis, no queues, no read replicas

10K rows, single user, sync monolith. Adding any of these would be unjustified weight today.
Measure first, then add.
