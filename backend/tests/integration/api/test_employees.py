import uuid

from app.domain.employee import Employee
from tests.factories import valid_employee_kwargs


def test_post_employees_creates_employee(client):
    response = client.post("/employees", json={
        "full_name": "Jane Doe",
        "email": "jane@example.com",
        "job_title": "Senior Engineer",
        "department": "engineering",
        "country": "US",
        "salary_cents": 12_000_000,
        "employment_type": "full_time",
        "hire_date": "2020-01-15",
    })

    assert response.status_code == 201
    body = response.json()
    assert body["full_name"] == "Jane Doe"
    assert body["email"] == "jane@example.com"
    assert body["salary_cents"] == 12_000_000


def test_get_employee_by_id_returns_200(client, employee_repository):
    employee = Employee(**valid_employee_kwargs())
    employee_repository.add(employee)

    response = client.get(f"/employees/{employee.id}")

    assert response.status_code == 200
    assert response.json()["id"] == str(employee.id)
    assert response.json()["full_name"] == "Jane Doe"


def test_get_employee_by_id_returns_404_when_not_found(client):
    response = client.get(f"/employees/{uuid.uuid4()}")

    assert response.status_code == 404
