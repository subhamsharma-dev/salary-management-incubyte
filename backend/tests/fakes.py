from __future__ import annotations

from collections import defaultdict
from datetime import UTC, datetime
from uuid import UUID

from app.db.engine import _percentile
from app.domain.department import Department
from app.domain.employee import Employee
from app.domain.salary import Salary
from app.repositories.protocol import CountryInsight, CountryJobTitleInsight, Page


class InMemoryEmployeeRepository:
    """Dict-backed fake matching the EmployeeRepository Protocol for service tests."""

    def __init__(self) -> None:
        self._store: dict[UUID, Employee] = {}

    def add(self, employee: Employee) -> None:
        self._store[employee.id] = employee

    def get(self, employee_id: UUID) -> Employee | None:
        return self._store.get(employee_id)

    def list(
        self,
        *,
        page: int = 1,
        page_size: int = 50,
        country: str | None = None,
        job_title: str | None = None,
        department: Department | None = None,
        include_deleted: bool = False,
        q: str | None = None,
    ) -> Page:
        candidates = list(self._store.values())

        if country is not None:
            candidates = [e for e in candidates if e.country.code == country]
        if job_title is not None:
            candidates = [e for e in candidates if e.job_title == job_title]
        if department is not None:
            candidates = [e for e in candidates if e.department == department]
        if not include_deleted:
            candidates = [e for e in candidates if not e.is_deleted]
        if q is not None:
            q_lower = q.lower()
            candidates = [
                e
                for e in candidates
                if q_lower in e.full_name.lower()
                or q_lower in e.email.address.lower()
                or q_lower in e.job_title.lower()
            ]

        candidates.sort(key=lambda e: (e.full_name, str(e.id)))

        offset = (page - 1) * page_size
        page_items = candidates[offset : offset + page_size]

        return Page(
            items=page_items,
            total=len(candidates),
            page=page,
            page_size=page_size,
        )

    def mark_deleted(self, employee_id: UUID) -> None:
        existing = self._store.get(employee_id)
        if existing is None:
            raise ValueError(f"Employee {employee_id} not found")
        self._store[employee_id] = existing.model_copy(
            update={"is_deleted": True, "updated_at": datetime.now(UTC)}
        )

    def update(self, employee: Employee) -> None:
        if employee.id not in self._store:
            raise ValueError(f"Employee {employee.id} not found")
        self._store[employee.id] = employee

    def aggregate_by_country(self) -> list[CountryInsight]:
        by_country: dict[str, list[int]] = defaultdict(list)
        for employee in self._store.values():
            if employee.is_deleted:
                continue
            by_country[employee.country.code].append(employee.salary.cents)

        insights = []
        for country, salaries in sorted(by_country.items()):
            floats = [float(s) for s in salaries]
            insights.append(
                CountryInsight(
                    country=country,
                    headcount=len(salaries),
                    min_salary=Salary(cents=min(salaries)),
                    max_salary=Salary(cents=max(salaries)),
                    avg_salary=Salary(cents=int(round(sum(salaries) / len(salaries)))),
                    median_salary=Salary(cents=int(round(_percentile(floats, 0.50) or 0))),
                    p25_salary=Salary(cents=int(round(_percentile(floats, 0.25) or 0))),
                    p75_salary=Salary(cents=int(round(_percentile(floats, 0.75) or 0))),
                )
            )
        return insights

    def aggregate_by_country_job_title(self) -> list[CountryJobTitleInsight]:
        by_pair: dict[tuple[str, str], list[int]] = defaultdict(list)
        for employee in self._store.values():
            if employee.is_deleted:
                continue
            key = (employee.country.code, employee.job_title)
            by_pair[key].append(employee.salary.cents)

        return [
            CountryJobTitleInsight(
                country=country,
                job_title=job_title,
                headcount=len(salaries),
                avg_salary=Salary(cents=int(round(sum(salaries) / len(salaries)))),
            )
            for (country, job_title), salaries in sorted(by_pair.items())
        ]
