"""Seed the DB with random employee rows via SQLAlchemy Core bulk insert.

Programmatic: `from app.seed.run import seed; seed(session, count=N)`.
CLI (next cycle): `python -m app.seed.run --count N --reset`.
"""

from __future__ import annotations

import random
import uuid
from datetime import UTC, date, datetime, timedelta
from typing import Any

from sqlalchemy import insert
from sqlalchemy.orm import Session

from app.domain.department import Department
from app.domain.employment_type import EmploymentType
from app.repositories.orm import EmployeeORM
from app.seed.data import COUNTRIES, FIRST_NAMES, JOB_TITLES, LAST_NAMES


def seed(session: Session, count: int = 10_000) -> None:
    """Insert `count` random employees in a single Core bulk insert + commit."""
    rows = _generate_rows(count)
    session.execute(insert(EmployeeORM), rows)
    session.commit()


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
