from app.domain.country import Country
from app.domain.employee import Employee
from tests.factories import valid_employee_kwargs


def test_get_insights_by_country(client, employee_repository):
    employee_repository.add(Employee(**valid_employee_kwargs(
        country=Country(code="US"),
    )))

    response = client.get("/insights/by-country")

    assert response.status_code == 200
    body = response.json()
    assert len(body) == 1
    assert body[0]["country"] == "US"
    assert body[0]["headcount"] == 1
    assert "median_salary_cents" in body[0]
    assert "p25_salary_cents" in body[0]
    assert "p75_salary_cents" in body[0]


def test_get_insights_by_country_job_title(client, employee_repository):
    employee_repository.add(Employee(**valid_employee_kwargs(
        country=Country(code="US"), job_title="Engineer",
    )))

    response = client.get("/insights/by-country-job-title")

    assert response.status_code == 200
    body = response.json()
    assert len(body) == 1
    assert body[0]["country"] == "US"
    assert body[0]["job_title"] == "Engineer"
    assert body[0]["headcount"] == 1
