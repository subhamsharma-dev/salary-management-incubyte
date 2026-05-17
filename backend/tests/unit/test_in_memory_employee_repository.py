from app.domain.country import Country
from app.domain.email import Email
from app.domain.employee import Employee
from tests.factories import valid_employee_kwargs as _valid_kwargs
from tests.fakes import InMemoryEmployeeRepository


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
