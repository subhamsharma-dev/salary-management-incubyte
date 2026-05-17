# Salary Management Tool

A small salary management tool for the HR Manager of a 10,000-employee organisation.
Built test-first.

## Live

- **App:** TBD (frontend pending)
- **API:** TBD (`/docs` for OpenAPI)
- **Demo video:** TBD

## Prerequisites

Python 3.12 · [uv](https://docs.astral.sh/uv/) · (Node 20 once the frontend lands)

## Run locally

```bash
# backend (FastAPI, SQLite stored at backend/app.db)
cd backend
uv sync
uv run uvicorn app.main:app --reload
# → http://localhost:8000/docs

# tests + lint + type-check
make test     # full pytest suite
make lint     # ruff
make type     # mypy --strict on app/domain
make check    # lint + type + test
```

The frontend (Vite + React + TanStack + shadcn/ui) lands in a later feature.

## Deploy

Backend → Fly.io. One-time setup on a fresh account:

```bash
cd backend
fly auth login
fly launch --no-deploy                                # keeps the existing fly.toml
fly volume create salary_data --region bom --size 1   # 1 GiB persistent volume
fly deploy
```

The app uses a 1 GiB volume mounted at `/data`; the SQLite file lives at `/data/app.db`. Schema is created by the app's lifespan on cold start (`Base.metadata.create_all`). `DATABASE_URL` is set in `fly.toml`; for local dev see `backend/.env.example`.

Frontend → Vercel (TBD when the frontend lands).

## Repo

```
backend/      FastAPI · SQLAlchemy 2.0 · SQLite · pytest · ruff · mypy
              Dockerfile + fly.toml for deploy.
frontend/     Vite · React · TypeScript · shadcn/ui   (TBD)
artifacts/    design, trade-offs, architecture, performance, prompts, AI log, setup prompt
.claude/      settings.json (project permission rule)
CLAUDE.md     operating manual for AI pair-programming on this codebase
Makefile      test, lint, type, check
```

## Reading guide

- **5 min** → `artifacts/design.md` + commit history.
- **15 min** → also `artifacts/trade-offs.md` + `backend/app/domain/` + matching tests.
- **30 min** → also `CLAUDE.md` + `artifacts/ai-collaboration.md` + `artifacts/prompts.md` + `artifacts/setup-prompt.md`.
