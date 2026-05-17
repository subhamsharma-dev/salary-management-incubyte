"""Seed the DB with random employee rows via SQLAlchemy Core bulk insert.

Programmatic: `from app.seed.run import seed; seed(session, count=N)`.
CLI (next cycle): `python -m app.seed.run --count N --reset`.
"""

from __future__ import annotations

import argparse
import os
import random
import uuid
from datetime import UTC, date, datetime, timedelta
from typing import Any

from sqlalchemy import func, insert, select
from sqlalchemy.orm import Session, sessionmaker

import app.repositories.orm  # noqa: F401  -- register EmployeeORM on Base.metadata
from app.db.base import Base
from app.db.engine import create_engine_for_url
from app.domain.department import Department
from app.domain.employment_type import EmploymentType
from app.repositories.orm import EmployeeORM
from app.seed.data import COUNTRIES, FIRST_NAMES, JOB_TITLES, LAST_NAMES


def seed(session: Session, count: int = 10_000) -> None:
    """Insert `count` random employees in a single Core bulk insert + commit."""
    rows = _generate_rows(count)
    session.execute(insert(EmployeeORM), rows)
    session.commit()


def seed_if_empty(session: Session, count: int = 10_000) -> bool:
    """Seed iff the employees table is empty.

    Returns True if a seed happened, False if rows already exist. Called at app
    lifespan start so the deployed app is demo-ready on first cold start without
    a manual `fly ssh` step.
    """
    current = session.scalar(select(func.count()).select_from(EmployeeORM))
    if current and current > 0:
        return False
    seed(session, count)
    return True


def _generate_rows(count: int) -> list[dict[str, Any]]:
    n_first = len(FIRST_NAMES)
    n_last = len(LAST_NAMES)
    capacity = n_first * n_last
    if count > capacity:
        raise ValueError(
            f"count={count} exceeds unique name pairs available ({capacity})"
        )

    # random.sample(range(N*M), k) — unique pairs, no Cartesian materialisation.
    indices = random.sample(range(capacity), count)
    departments = [d.value for d in Department]
    employment_types = [e.value for e in EmploymentType]
    today = date.today()
    now = datetime.now(UTC)

    rows: list[dict[str, Any]] = []
    for serial, idx in enumerate(indices):
        first = FIRST_NAMES[idx // n_last]
        last = LAST_NAMES[idx % n_last]
        rows.append(
            {
                "id": uuid.uuid4(),
                "full_name": f"{first} {last}",
                "email": f"{first.lower()}.{last.lower()}.{serial}@example.com",
                "job_title": random.choice(JOB_TITLES),
                "department": random.choice(departments),
                "country": random.choice(COUNTRIES),
                "salary_cents": random.randint(3_000_000, 30_000_000),
                "employment_type": random.choice(employment_types),
                "hire_date": today - timedelta(days=random.randint(0, 20 * 365)),
                "is_deleted": False,
                "created_at": now,
                "updated_at": now,
            }
        )
    return rows


def main(argv: list[str] | None = None) -> None:
    """CLI entry point: `python -m app.seed.run --count N [--reset]`."""
    parser = argparse.ArgumentParser(description="Seed the salary-management database.")
    parser.add_argument("--count", type=int, default=10_000, help="Rows to insert.")
    parser.add_argument(
        "--reset",
        action="store_true",
        help="Drop and recreate the schema before seeding (destructive).",
    )
    args = parser.parse_args(argv)

    url = os.environ.get("DATABASE_URL", "sqlite:///./app.db")
    engine = create_engine_for_url(url)
    try:
        if args.reset:
            Base.metadata.drop_all(engine)
        Base.metadata.create_all(engine)
        with sessionmaker(bind=engine)() as session:
            seed(session, count=args.count)
    finally:
        engine.dispose()


if __name__ == "__main__":
    main()
