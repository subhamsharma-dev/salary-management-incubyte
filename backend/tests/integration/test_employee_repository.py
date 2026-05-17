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

    page = employee_repository.list()

    assert {e.email.address for e in page.items} == {"a@example.com", "b@example.com"}


def test_repository_list_returns_paginated_page(employee_repository):
    for i in range(5):
        employee_repository.add(
            Employee(**_valid_employee_kwargs(email=Email(address=f"user{i}@example.com")))
        )

    page = employee_repository.list(page=2, page_size=2)

    assert page.total == 5
    assert len(page.items) == 2
    assert page.page == 2
    assert page.page_size == 2


def test_repository_list_filters_by_country(employee_repository):
    employee_repository.add(Employee(**_valid_employee_kwargs(
        email=Email(address="us@example.com"), country=Country(code="US"),
    )))
    employee_repository.add(Employee(**_valid_employee_kwargs(
        email=Email(address="gb@example.com"), country=Country(code="GB"),
    )))

    page = employee_repository.list(country="US")

    assert {e.email.address for e in page.items} == {"us@example.com"}


def test_repository_list_filters_by_job_title(employee_repository):
    employee_repository.add(Employee(**_valid_employee_kwargs(
        email=Email(address="eng@example.com"), job_title="Senior Engineer",
    )))
    employee_repository.add(Employee(**_valid_employee_kwargs(
        email=Email(address="mgr@example.com"), job_title="Engineering Manager",
    )))

    page = employee_repository.list(job_title="Senior Engineer")

    assert {e.email.address for e in page.items} == {"eng@example.com"}


def test_repository_list_filters_by_department(employee_repository):
    employee_repository.add(Employee(**_valid_employee_kwargs(
        email=Email(address="e1@example.com"), department=Department.ENGINEERING,
    )))
    employee_repository.add(Employee(**_valid_employee_kwargs(
        email=Email(address="e2@example.com"), department=Department.SALES,
    )))

    page = employee_repository.list(department=Department.ENGINEERING)

    assert {e.email.address for e in page.items} == {"e1@example.com"}


def test_repository_list_excludes_soft_deleted_by_default(employee_repository):
    employee_repository.add(Employee(**_valid_employee_kwargs(
        email=Email(address="active@example.com"),
    )))
    employee_repository.add(Employee(**_valid_employee_kwargs(
        email=Email(address="deleted@example.com"), is_deleted=True,
    )))

    page = employee_repository.list()

    assert {e.email.address for e in page.items} == {"active@example.com"}


def test_repository_list_includes_soft_deleted_when_requested(employee_repository):
    employee_repository.add(Employee(**_valid_employee_kwargs(
        email=Email(address="active@example.com"),
    )))
    employee_repository.add(Employee(**_valid_employee_kwargs(
        email=Email(address="deleted@example.com"), is_deleted=True,
    )))

    page = employee_repository.list(include_deleted=True)

    assert {e.email.address for e in page.items} == {"active@example.com", "deleted@example.com"}


def test_repository_list_searches_by_name(employee_repository):
    employee_repository.add(Employee(**_valid_employee_kwargs(
        email=Email(address="a@example.com"), full_name="Alice Anderson",
    )))
    employee_repository.add(Employee(**_valid_employee_kwargs(
        email=Email(address="b@example.com"), full_name="Bob Brown",
    )))

    page = employee_repository.list(q="alice")

    assert {e.email.address for e in page.items} == {"a@example.com"}


def test_repository_list_searches_by_email(employee_repository):
    employee_repository.add(Employee(**_valid_employee_kwargs(
        email=Email(address="alice@example.com"), full_name="Jane Doe",
    )))
    employee_repository.add(Employee(**_valid_employee_kwargs(
        email=Email(address="bob@example.com"), full_name="John Doe",
    )))

    page = employee_repository.list(q="alice")

    assert {e.email.address for e in page.items} == {"alice@example.com"}


def test_repository_list_searches_by_job_title(employee_repository):
    employee_repository.add(Employee(**_valid_employee_kwargs(
        email=Email(address="a@example.com"), job_title="Senior Engineer",
    )))
    employee_repository.add(Employee(**_valid_employee_kwargs(
        email=Email(address="b@example.com"), job_title="Sales Manager",
    )))

    page = employee_repository.list(q="engineer")

    assert {e.email.address for e in page.items} == {"a@example.com"}
