from __future__ import annotations

from datetime import UTC, date, datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.domain.country import Country
from app.domain.department import Department
from app.domain.email import Email
from app.domain.employee import Employee
from app.domain.employment_type import EmploymentType
from app.domain.salary import Salary
from app.repositories.protocol import (
    CountryInsight,
    CountryJobTitleInsight,
    EmployeeRepository,
    Page,
)


class CreateEmployeeInput(BaseModel):
    model_config = ConfigDict(frozen=True)

    full_name: str
    email: str
    job_title: str
    department: Department
    country: str
    salary_cents: int
    employment_type: EmploymentType
    hire_date: date


class UpdateEmployeeInput(BaseModel):
    model_config = ConfigDict(frozen=True)

    full_name: str | None = None
    email: str | None = None
    job_title: str | None = None
    department: Department | None = None
    country: str | None = None
    salary_cents: int | None = None
    employment_type: EmploymentType | None = None
    hire_date: date | None = None


class EmployeeService:
    def __init__(self, repo: EmployeeRepository) -> None:
        self._repo = repo

    def create_employee(self, data: CreateEmployeeInput) -> Employee:
        employee = Employee(
            full_name=data.full_name,
            email=Email(address=data.email),
            job_title=data.job_title,
            department=data.department,
            country=Country(code=data.country),
            salary=Salary(cents=data.salary_cents),
            employment_type=data.employment_type,
            hire_date=data.hire_date,
        )
        self._repo.add(employee)
        return employee

    def get_employee(self, employee_id: UUID) -> Employee | None:
        return self._repo.get(employee_id)

    def list_employees(self, **kwargs: Any) -> Page:
        return self._repo.list(**kwargs)

    def soft_delete_employee(self, employee_id: UUID) -> None:
        self._repo.mark_deleted(employee_id)

    def insights_by_country(self) -> list[CountryInsight]:
        return self._repo.aggregate_by_country()

    def avg_by_country_job_title(self) -> list[CountryJobTitleInsight]:
        return self._repo.aggregate_by_country_job_title()

    def update_employee(self, employee_id: UUID, data: UpdateEmployeeInput) -> Employee:
        current = self._repo.get(employee_id)
        if current is None:
            raise ValueError(f"Employee {employee_id} not found")

        updates: dict[str, Any] = {}
        if data.full_name is not None:
            updates["full_name"] = data.full_name
        if data.email is not None:
            updates["email"] = Email(address=data.email)
        if data.job_title is not None:
            updates["job_title"] = data.job_title
        if data.department is not None:
            updates["department"] = data.department
        if data.country is not None:
            updates["country"] = Country(code=data.country)
        if data.salary_cents is not None:
            updates["salary"] = Salary(cents=data.salary_cents)
        if data.employment_type is not None:
            updates["employment_type"] = data.employment_type
        if data.hire_date is not None:
            updates["hire_date"] = data.hire_date
        updates["updated_at"] = datetime.now(UTC)

        updated = current.model_copy(update=updates)
        self._repo.update(updated)
        return updated
