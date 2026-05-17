from datetime import date

from app.domain.department import Department
from app.domain.employment_type import EmploymentType
from app.services.employee import CreateEmployeeInput, EmployeeService
from tests.fakes import InMemoryEmployeeRepository


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
