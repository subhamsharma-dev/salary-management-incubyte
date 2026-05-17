from decimal import Decimal

import pytest

from app.domain.salary import Salary


def test_salary_stores_amount_in_cents():
    salary = Salary(cents=100_000)

    assert salary.cents == 100_000


@pytest.mark.parametrize("cents", [0, -1, -100_000])
def test_salary_rejects_non_positive_cents(cents):
    with pytest.raises(ValueError):
        Salary(cents=cents)


@pytest.mark.parametrize("cents", [1.0, 1.5, Decimal("100"), "100"])
def test_salary_rejects_non_integer_cents(cents):
    with pytest.raises(TypeError):
        Salary(cents=cents)


def test_salary_can_be_built_from_dollars():
    salary = Salary.from_dollars(50_000)

    assert salary.cents == 5_000_000
