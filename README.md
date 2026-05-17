# Salary Management Tool

A small salary management tool for the HR Manager of a 10,000-employee organisation.
Built test-first.

## Live

- **App:** <https://salary-management-incubyte-sandy.vercel.app/>
- **API:** <https://salary-management-incubyte.fly.dev> (`/docs` for OpenAPI)
- **Demo video:** TBD

## Prerequisites

Python 3.12 · [uv](https://docs.astral.sh/uv/) · Node 20+

## Run locally

```bash
# backend (FastAPI, SQLite stored at backend/app.db)
cd backend
uv sync
uv run uvicorn app.main:app --reload
# → http://localhost:8000/docs

# frontend (Vite dev server, talks to the deployed Fly.io API by default)
cd frontend
npm install
npm run dev
# → http://localhost:5173 (or next free port)

# tests + lint + type-check
make test     # full pytest suite
make lint     # ruff
make type     # mypy --strict on app/domain
make check    # lint + type + test

# frontend tests
cd frontend && npm test
```

The frontend reads `VITE_API_BASE_URL` and defaults to the deployed Fly.io URL — no env file
needed for local dev unless you want to point at a local backend (`VITE_API_BASE_URL=http://localhost:8000`).

## Deploy

### Backend → Fly.io

```bash
cd backend
fly auth login
fly launch --no-deploy                                # keeps the existing fly.toml
fly volume create salary_data --region bom --size 1   # 1 GiB persistent volume
fly deploy
```

The app uses a 1 GiB volume mounted at `/data`; the SQLite file lives at `/data/app.db`.
Schema is created by the app's lifespan on cold start (`Base.metadata.create_all`).
`DATABASE_URL` is set in `fly.toml`; for local dev see `backend/.env.example`.
CORS is open (`allow_origins=["*"]`) — acceptable for v1 (no auth, no PII).

### Frontend → Vercel

```bash
cd frontend
npx vercel              # follow prompts to link the project (first time)
npx vercel --prod       # promote to production
```

Vercel auto-detects Vite. `vercel.json` sets the SPA rewrite (`/(.*) → /index.html`) so
client-side routes don't 404 on direct navigation or refresh. Optional env var
`VITE_API_BASE_URL` overrides the default Fly.io API URL.

## Seed

**The app auto-seeds 10,000 random employees on cold start when the `employees` table is empty** — first deploy comes up demo-ready with no manual step. The check is idempotent: subsequent cold starts see rows and skip seeding (no extra startup cost beyond a `SELECT COUNT(*)`).

To re-seed manually (drop + repopulate):

```bash
# locally (against backend/app.db)
cd backend
uv run python -m app.seed.run --count 10000 --reset

# in production (against /data/app.db on the Fly machine)
fly ssh console -a salary-management-incubyte \
  -C "uv run --directory /app python -m app.seed.run --count 10000 --reset"
```

`--reset` drops + recreates the schema before inserting. `--count` defaults to 10,000.

## Repo

```
backend/      FastAPI · SQLAlchemy 2.0 · SQLite · pytest · ruff · mypy
              Dockerfile + fly.toml for deploy.
frontend/     Vite · React 19 · TypeScript · TanStack Router · TanStack Query
              · TanStack Table · shadcn/ui · Tailwind v4 · Recharts · MSW
              vercel.json for SPA routing.
artifacts/    design, trade-offs, architecture, performance, prompts, AI log, setup prompt
.claude/      settings.json (project permission rule)
CLAUDE.md     operating manual for AI pair-programming on this codebase
Makefile      test, lint, type, check
```

## Reading guide

- **5 min** → `artifacts/design.md` + commit history.
- **15 min** → also `artifacts/trade-offs.md` + `backend/app/domain/` + matching tests.
- **30 min** → also `CLAUDE.md` + `artifacts/ai-collaboration.md` + `artifacts/prompts.md` + `artifacts/setup-prompt.md`.
