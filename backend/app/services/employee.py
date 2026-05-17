from __future__ import annotations

from datetime import date
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
