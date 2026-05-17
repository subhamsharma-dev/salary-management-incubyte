from datetime import UTC, datetime
from uuid import UUID

from app.domain.department import Department
from app.domain.employee import Employee
from app.repositories.protocol import Page


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
