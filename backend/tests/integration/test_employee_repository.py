from datetime import date

from app.domain.country import Country
from app.domain.department import Department
from app.domain.email import Email
from app.domain.employee import Employee
from app.domain.employment_type import EmploymentType
from app.domain.salary import Salary


def _valid_employee_kwargs(**overrides):
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


def test_employee_repository_round_trips_an_employee(employee_repository):
    original = Employee(**_valid_employee_kwargs())

    employee_repository.add(original)
    fetched = employee_repository.get(original.id)

    assert fetched == original


def test_repository_lists_all_added_employees(employee_repository):
    e1 = Employee(**_valid_employee_kwargs(email=Email(address="a@example.com")))
    e2 = Employee(**_valid_employee_kwargs(email=Email(address="b@example.com")))

    employee_repository.add(e1)
    employee_repository.add(e2)

    employees = employee_repository.list()

    assert {e.email.address for e in employees} == {"a@example.com", "b@example.com"}
