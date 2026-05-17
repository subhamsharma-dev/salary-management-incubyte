# Salary Management Tool

A small salary management tool for the HR Manager of a 10,000-employee organisation.
Built test-first.

## Live

- **App:** TBD
- **API:** TBD (`/docs`)
- **Demo video:** TBD

## Prerequisites

Python 3.12 · Node 20 · uv

## Run locally

```bash
# backend
cd backend
uv sync
alembic upgrade head
python -m app.seed.run --reset
uvicorn app.main:app --reload

# frontend
cd frontend
npm install && npm run dev

# tests
make test
```

## Repo

```
backend/      FastAPI · SQLAlchemy 2.0 · Alembic · SQLite
frontend/     Vite · React · TypeScript · shadcn/ui
artifacts/    design, trade-offs, architecture, performance, prompts, AI log, setup prompt
CLAUDE.md     operating manual for AI pair-programming on this codebase
```

## Reading guide

- **5 min** → `artifacts/design.md` + commit history.
- **15 min** → also `artifacts/trade-offs.md` + `backend/app/domain/` + matching tests.
- **30 min** → also `CLAUDE.md` + `artifacts/ai-collaboration.md` + `artifacts/prompts.md` + `artifacts/setup-prompt.md`.
