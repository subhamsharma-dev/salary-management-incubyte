from datetime import date

from app.domain.country import Country
from app.domain.department import Department
from app.domain.email import Email
from app.domain.employee import Employee
from app.domain.employment_type import EmploymentType
from app.services.employee import CreateEmployeeInput, EmployeeService
from tests.factories import valid_employee_kwargs
from tests.fakes import InMemoryEmployeeRepository


def _service_with_employees(*employees: Employee) -> tuple[EmployeeService, InMemoryEmployeeRepository]:
    repo = InMemoryEmployeeRepository()
    for employee in employees:
        repo.add(employee)
    return EmployeeService(repo), repo


def test_service_creates_employee_from_input():
    repo = InMemoryEmployeeRepository()
    service = EmployeeService(repo)

    employee = service.create_employee(CreateEmployeeInput(
        full_name="Jane Doe",
        email="jane@example.com",
        job_title="Senior Engineer",
        department=Department.ENGINEERING,
        country="US",
        salary_cents=12_000_000,
        employment_type=EmploymentType.FULL_TIME,
        hire_date=date(2020, 1, 15),
    ))

    assert employee.full_name == "Jane Doe"
    assert employee.email.address == "jane@example.com"
    assert employee.salary.cents == 12_000_000
    assert repo.get(employee.id) == employee


def test_service_gets_employee_by_id():
    employee = Employee(**valid_employee_kwargs())
    service, _ = _service_with_employees(employee)

    fetched = service.get_employee(employee.id)

    assert fetched == employee


def test_service_lists_employees():
    e1 = Employee(**valid_employee_kwargs(email=Email(address="a@example.com")))
    e2 = Employee(**valid_employee_kwargs(email=Email(address="b@example.com")))
    service, _ = _service_with_employees(e1, e2)

    page = service.list_employees()

    assert {e.email.address for e in page.items} == {"a@example.com", "b@example.com"}


def test_service_soft_deletes_employee():
    employee = Employee(**valid_employee_kwargs())
    service, repo = _service_with_employees(employee)

    service.soft_delete_employee(employee.id)

    assert repo.get(employee.id).is_deleted is True


def test_service_returns_insights_by_country():
    employee = Employee(**valid_employee_kwargs(country=Country(code="US")))
    service, _ = _service_with_employees(employee)

    insights = service.insights_by_country()

    assert len(insights) == 1
    assert insights[0].country == "US"
    assert insights[0].headcount == 1


def test_service_returns_avg_by_country_job_title():
    employee = Employee(**valid_employee_kwargs(
        country=Country(code="US"), job_title="Engineer",
    ))
    service, _ = _service_with_employees(employee)

    insights = service.avg_by_country_job_title()

    assert len(insights) == 1
    assert insights[0].country == "US"
    assert insights[0].job_title == "Engineer"
