"""Shared test data factories. Module-level helpers; not pytest fixtures.

Module-level so parametrised tests can call them without fixture-resolution gymnastics.
"""

from __future__ import annotations

from datetime import date
from typing import Any

from app.domain.country import Country
from app.domain.department import Department
from app.domain.email import Email
from app.domain.employment_type import EmploymentType
from app.domain.salary import Salary


def valid_employee_kwargs(**overrides: Any) -> dict[str, Any]:
    """Kwargs for a valid `Employee(...)` call. Override any field via kwarg."""
    return {
        "full_name": "Jane Doe",
        "email": Email(address="jane@example.com"),
        "job_title": "Senior Engineer",
        "department": Department.ENGINEERING,
        "country": Country(code="US"),
        "salary": Salary(cents=12_000_000),
        "employment_type": EmploymentType.FULL_TIME,
        "hire_date": date(2020, 1, 15),
        **overrides,
    }
