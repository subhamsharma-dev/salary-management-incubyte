from app.domain.salary import Salary


def test_salary_stores_amount_in_cents():
    salary = Salary(cents=100_000)

    assert salary.cents == 100_000
