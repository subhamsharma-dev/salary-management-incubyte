from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session, sessionmaker

import app.repositories.orm  # noqa: F401  -- register EmployeeORM on Base.metadata
from app.api.dependencies import get_session
from app.db.base import Base
from app.db.engine import create_engine_for_url
from app.main import app
from app.repositories.employee_repository import SqlAlchemyEmployeeRepository


@pytest.fixture
def session() -> Iterator[Session]:
    engine = create_engine_for_url("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    session_factory = sessionmaker(bind=engine)
    db = session_factory()
    try:
        yield db
    finally:
        db.close()
        engine.dispose()


@pytest.fixture
def employee_repository(session: Session) -> SqlAlchemyEmployeeRepository:
    return SqlAlchemyEmployeeRepository(session)


@pytest.fixture
def client(session: Session) -> Iterator[TestClient]:
    """TestClient with `get_session` overridden to yield the test session.

    Does not enter TestClient as a context manager, so the app's lifespan does
    not run — no real `app.db` file is created during tests.
    """
    app.dependency_overrides[get_session] = lambda: session
    try:
        yield TestClient(app)
    finally:
        app.dependency_overrides.clear()
