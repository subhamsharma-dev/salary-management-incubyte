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
