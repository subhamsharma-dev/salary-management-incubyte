from __future__ import annotations

from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.domain.employee import Employee


class EmployeeResponse(BaseModel):
    model_config = ConfigDict(frozen=True)

    id: UUID
    full_name: str
    email: str
    job_title: str
    department: str
    country: str
    salary_cents: int
    employment_type: str
    hire_date: date
    is_deleted: bool
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_domain(cls, employee: Employee) -> EmployeeResponse:
        return cls(
            id=employee.id,
            full_name=employee.full_name,
            email=employee.email.address,
            job_title=employee.job_title,
            department=employee.department.value,
            country=employee.country.code,
            salary_cents=employee.salary.cents,
            employment_type=employee.employment_type.value,
            hire_date=employee.hire_date,
            is_deleted=employee.is_deleted,
            created_at=employee.created_at,
            updated_at=employee.updated_at,
        )
