import uuid
from datetime import UTC, date, datetime, timedelta

import pytest

from app.domain.employee import Employee
from tests.factories import valid_employee_kwargs as _valid_employee_kwargs


def test_employee_stores_provided_fields():
    employee = Employee(**_valid_employee_kwargs())

    assert employee.full_name == "Jane Doe"
    assert employee.email.address == "jane@example.com"
    assert employee.salary.cents == 12_000_000
    assert employee.hire_date == date(2020, 1, 15)


def test_employee_sets_sensible_defaults_for_server_fields():
    before = datetime.now(UTC)

    employee = Employee(**_valid_employee_kwargs())

    after = datetime.now(UTC)

    assert isinstance(employee.id, uuid.UUID)
    assert employee.is_deleted is False
    assert before <= employee.created_at <= after
    assert before <= employee.updated_at <= after


@pytest.mark.parametrize("full_name", ["", "a" * 201])
def test_employee_rejects_invalid_full_name(full_name):
    with pytest.raises(ValueError):
        Employee(**_valid_employee_kwargs(full_name=full_name))


@pytest.mark.parametrize("job_title", ["", "a" * 101])
def test_employee_rejects_invalid_job_title(job_title):
    with pytest.raises(ValueError):
        Employee(**_valid_employee_kwargs(job_title=job_title))


def test_employee_rejects_future_hire_date():
    tomorrow = date.today() + timedelta(days=1)

    with pytest.raises(ValueError):
        Employee(**_valid_employee_kwargs(hire_date=tomorrow))
