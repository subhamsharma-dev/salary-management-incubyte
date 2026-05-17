from app.domain.country import Country
from app.domain.department import Department
from app.domain.email import Email
from app.domain.employee import Employee
from app.domain.salary import Salary
from tests.factories import valid_employee_kwargs as _valid_employee_kwargs


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


def test_repository_mark_deleted_sets_is_deleted_flag(employee_repository):
    employee = Employee(**_valid_employee_kwargs())
    employee_repository.add(employee)

    employee_repository.mark_deleted(employee.id)

    fetched = employee_repository.get(employee.id)
    assert fetched is not None
    assert fetched.is_deleted is True


def test_repository_update_replaces_employee_fields(employee_repository):
    original = Employee(**_valid_employee_kwargs(full_name="Jane Doe"))
    employee_repository.add(original)

    updated = original.model_copy(update={"full_name": "Jane Smith"})
    employee_repository.update(updated)

    fetched = employee_repository.get(original.id)
    assert fetched is not None
    assert fetched.full_name == "Jane Smith"


def test_repository_aggregates_basic_stats_by_country(employee_repository):
    for i, cents in enumerate([100, 200, 300, 400, 500]):
        employee_repository.add(Employee(**_valid_employee_kwargs(
            email=Email(address=f"u{i}@example.com"),
            country=Country(code="US"),
            salary=Salary(cents=cents),
        )))

    insights = employee_repository.aggregate_by_country()

    assert len(insights) == 1
    us = insights[0]
    assert us.country == "US"
    assert us.headcount == 5
    assert us.min_salary.cents == 100
    assert us.max_salary.cents == 500
    assert us.avg_salary.cents == 300


def test_repository_aggregates_percentiles_by_country(employee_repository):
    for i, cents in enumerate([100, 200, 300, 400, 500]):
        employee_repository.add(Employee(**_valid_employee_kwargs(
            email=Email(address=f"u{i}@example.com"),
            country=Country(code="US"),
            salary=Salary(cents=cents),
        )))

    insights = employee_repository.aggregate_by_country()

    us = insights[0]
    assert us.median_salary.cents == 300
    assert us.p25_salary.cents == 200
    assert us.p75_salary.cents == 400


def test_repository_aggregates_avg_salary_by_country_and_job_title(employee_repository):
    employee_repository.add(Employee(**_valid_employee_kwargs(
        email=Email(address="us-eng-1@example.com"),
        country=Country(code="US"), job_title="Engineer", salary=Salary(cents=100),
    )))
    employee_repository.add(Employee(**_valid_employee_kwargs(
        email=Email(address="us-eng-2@example.com"),
        country=Country(code="US"), job_title="Engineer", salary=Salary(cents=200),
    )))
    employee_repository.add(Employee(**_valid_employee_kwargs(
        email=Email(address="us-mgr@example.com"),
        country=Country(code="US"), job_title="Manager", salary=Salary(cents=500),
    )))

    insights = employee_repository.aggregate_by_country_job_title()

    by_pair = {(i.country, i.job_title): i for i in insights}
    assert by_pair[("US", "Engineer")].avg_salary.cents == 150
    assert by_pair[("US", "Engineer")].headcount == 2
    assert by_pair[("US", "Manager")].avg_salary.cents == 500
    assert by_pair[("US", "Manager")].headcount == 1
