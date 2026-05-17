import pytest

from app.domain.salary import Salary


def test_salary_stores_amount_in_cents():
    salary = Salary(cents=100_000)

    assert salary.cents == 100_000


@pytest.mark.parametrize("cents", [0, -1, -100_000])
def test_salary_rejects_non_positive_cents(cents):
    with pytest.raises(ValueError):
        Salary(cents=cents)
