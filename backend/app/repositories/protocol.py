from typing import Protocol
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.domain.department import Department
from app.domain.employee import Employee


class Page(BaseModel):
    model_config = ConfigDict(frozen=True)

    items: list[Employee]
    total: int
    page: int
    page_size: int


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
    ) -> Page: ...
