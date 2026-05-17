.PHONY: test fmt lint type check

test:
	cd backend && uv run pytest

fmt:
	cd backend && uv run ruff format .

lint:
	cd backend && uv run ruff check .

type:
	cd backend && uv run mypy app/domain

check: lint type test
