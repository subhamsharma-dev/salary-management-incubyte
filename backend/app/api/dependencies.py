from collections.abc import Iterator
from typing import Annotated

from fastapi import Depends, Request
from sqlalchemy.orm import Session

from app.repositories.employee_repository import SqlAlchemyEmployeeRepository
from app.services.employee import EmployeeService


def get_session(request: Request) -> Iterator[Session]:
    session_factory = request.app.state.session_factory
    session = session_factory()
    try:
        yield session
    finally:
        session.close()


def get_employee_service(
    session: Annotated[Session, Depends(get_session)],
) -> EmployeeService:
    repo = SqlAlchemyEmployeeRepository(session)
    return EmployeeService(repo)
