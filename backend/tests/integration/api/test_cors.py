from fastapi.testclient import TestClient

from app.main import app


def test_cors_allow_origin_wildcard_on_response():
    client = TestClient(app)

    response = client.get(
        "/health", headers={"Origin": "http://localhost:5178"}
    )

    assert response.headers.get("access-control-allow-origin") == "*"
