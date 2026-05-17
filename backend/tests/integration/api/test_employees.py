import uuid

from app.domain.country import Country
from app.domain.email import Email
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


def test_get_employees_returns_paginated_list(client, employee_repository):
    employee_repository.add(Employee(**valid_employee_kwargs(
        email=Email(address="a@example.com"),
    )))
    employee_repository.add(Employee(**valid_employee_kwargs(
        email=Email(address="b@example.com"),
    )))

    response = client.get("/employees")

    body = response.json()
    assert response.status_code == 200
    assert body["total"] == 2
    assert len(body["items"]) == 2


def test_get_employees_supports_filter_by_country(client, employee_repository):
    employee_repository.add(Employee(**valid_employee_kwargs(
        email=Email(address="us@example.com"), country=Country(code="US"),
    )))
    employee_repository.add(Employee(**valid_employee_kwargs(
        email=Email(address="gb@example.com"), country=Country(code="GB"),
    )))

    response = client.get("/employees?country=US")

    body = response.json()
    assert body["total"] == 1
    assert body["items"][0]["country"] == "US"


def test_get_employees_supports_search_q(client, employee_repository):
    employee_repository.add(Employee(**valid_employee_kwargs(
        email=Email(address="alice@example.com"), full_name="Alice Smith",
    )))
    employee_repository.add(Employee(**valid_employee_kwargs(
        email=Email(address="bob@example.com"), full_name="Bob Jones",
    )))

    response = client.get("/employees?q=alice")

    body = response.json()
    assert body["total"] == 1


def test_patch_employee_updates_fields(client, employee_repository):
    employee = Employee(**valid_employee_kwargs(full_name="Jane Doe"))
    employee_repository.add(employee)

    response = client.patch(
        f"/employees/{employee.id}", json={"full_name": "Jane Smith"}
    )

    assert response.status_code == 200
    assert response.json()["full_name"] == "Jane Smith"


def test_patch_employee_returns_404_when_not_found(client):
    response = client.patch(f"/employees/{uuid.uuid4()}", json={"full_name": "X"})

    assert response.status_code == 404
