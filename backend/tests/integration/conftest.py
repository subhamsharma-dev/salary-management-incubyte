from collections.abc import Iterator

import pytest
from sqlalchemy.orm import Session, sessionmaker

import app.repositories.orm  # noqa: F401  -- register EmployeeORM on Base.metadata
from app.db.base import Base
from app.db.engine import create_engine_for_url
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
