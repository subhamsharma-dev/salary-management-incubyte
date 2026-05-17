from __future__ import annotations

from typing import Protocol
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.domain.department import Department
from app.domain.employee import Employee
from app.domain.salary import Salary


class Page(BaseModel):
    model_config = ConfigDict(frozen=True)

    items: list[Employee]
    total: int
    page: int
    page_size: int


class CountryInsight(BaseModel):
    model_config = ConfigDict(frozen=True)

    country: str
    headcount: int
    min_salary: Salary
    max_salary: Salary
    avg_salary: Salary
    median_salary: Salary
    p25_salary: Salary
    p75_salary: Salary


class EmployeeRepository(Protocol):
    def add(self, employee: Employee) -> None: ...

    def get(self, employee_id: UUID) -> Employee | None: ...

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
    ) -> Page: ...

    def mark_deleted(self, employee_id: UUID) -> None: ...

    def update(self, employee: Employee) -> None: ...

    def aggregate_by_country(self) -> list[CountryInsight]: ...
