.PHONY: test fmt lint type check
.PHONY: fe-test fe-lint fe-type fe-build fe-check

# --- Backend ---
test:
	cd backend && uv run pytest

fmt:
	cd backend && uv run ruff format .

lint:
	cd backend && uv run ruff check .

type:
	cd backend && uv run mypy app/domain

# --- Frontend ---
fe-test:
	cd frontend && npm run test

fe-lint:
	cd frontend && npm run lint

fe-type:
	cd frontend && npx tsc -b --noEmit

fe-build:
	cd frontend && npm run build

fe-check: fe-lint fe-type fe-test

# --- Everything ---
check: lint type test fe-check
