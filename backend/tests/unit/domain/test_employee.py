from datetime import date

from app.domain.country import Country
from app.domain.department import Department
from app.domain.email import Email
from app.domain.employee import Employee
from app.domain.employment_type import EmploymentType
from app.domain.salary import Salary


def test_employee_stores_provided_fields():
    employee = Employee(
        full_name="Jane Doe",
        email=Email(address="jane@example.com"),
        job_title="Senior Engineer",
        department=Department.ENGINEERING,
        country=Country(code="US"),
        salary=Salary(cents=12_000_000),
        employment_type=EmploymentType.FULL_TIME,
        hire_date=date(2020, 1, 15),
    )

    assert employee.full_name == "Jane Doe"
    assert employee.email.address == "jane@example.com"
    assert employee.salary.cents == 12_000_000
    assert employee.hire_date == date(2020, 1, 15)
