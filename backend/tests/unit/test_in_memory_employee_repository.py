from datetime import date

from app.domain.country import Country
from app.domain.department import Department
from app.domain.email import Email
from app.domain.employee import Employee
from app.domain.employment_type import EmploymentType
from app.domain.salary import Salary
from tests.fakes import InMemoryEmployeeRepository


def _valid_kwargs(**overrides):
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


def test_in_memory_repository_round_trips_an_employee():
    repo = InMemoryEmployeeRepository()
    original = Employee(**_valid_kwargs())

    repo.add(original)
    fetched = repo.get(original.id)

    assert fetched == original


def test_in_memory_repository_list_paginates_and_filters():
    repo = InMemoryEmployeeRepository()
    for i, country in enumerate(["US", "US", "GB"]):
        repo.add(Employee(**_valid_kwargs(
            email=Email(address=f"user{i}@example.com"),
            country=Country(code=country),
        )))

    page = repo.list(country="US")

    assert page.total == 2
    assert all(e.country.code == "US" for e in page.items)


def test_in_memory_repository_mark_deleted_and_excluded_from_list():
    repo = InMemoryEmployeeRepository()
    employee = Employee(**_valid_kwargs())
    repo.add(employee)

    repo.mark_deleted(employee.id)
    page = repo.list()

    assert page.items == []
    assert repo.get(employee.id) is not None  # still retrievable, just flagged
