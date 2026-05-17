from typing import Protocol
from uuid import UUID

from app.domain.employee import Employee


class EmployeeRepository(Protocol):
    def add(self, employee: Employee) -> None: ...

    def get(self, employee_id: UUID) -> Employee | None: ...
