from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.domain.country import Country
from app.domain.department import Department
from app.domain.email import Email
from app.domain.employee import Employee
from app.domain.employment_type import EmploymentType
from app.domain.salary import Salary
from app.repositories.orm import EmployeeORM
from app.repositories.protocol import Page


class SqlAlchemyEmployeeRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def add(self, employee: Employee) -> None:
        row = EmployeeORM(
            id=employee.id,
            full_name=employee.full_name,
            email=employee.email.address,
            job_title=employee.job_title,
            department=employee.department.value,
            country=employee.country.code,
            salary_cents=employee.salary.cents,
            employment_type=employee.employment_type.value,
            hire_date=employee.hire_date,
            is_deleted=employee.is_deleted,
            created_at=employee.created_at,
            updated_at=employee.updated_at,
        )
        self._session.add(row)
        self._session.commit()

    def get(self, employee_id: UUID) -> Employee | None:
        row = self._session.get(EmployeeORM, employee_id)
        if row is None:
            return None
        return self._to_domain(row)

    def list(self, *, page: int = 1, page_size: int = 50) -> Page:
        offset = (page - 1) * page_size

        rows = self._session.scalars(
            select(EmployeeORM)
            .order_by(EmployeeORM.full_name, EmployeeORM.id)
            .offset(offset)
            .limit(page_size)
        ).all()

        total = self._session.scalar(select(func.count()).select_from(EmployeeORM)) or 0

        return Page(
            items=[self._to_domain(row) for row in rows],
            total=total,
            page=page,
            page_size=page_size,
        )

    @staticmethod
    def _to_domain(row: EmployeeORM) -> Employee:
        return Employee(
            id=row.id,
            full_name=row.full_name,
            email=Email(address=row.email),
            job_title=row.job_title,
            department=Department(row.department),
            country=Country(code=row.country),
            salary=Salary(cents=row.salary_cents),
            employment_type=EmploymentType(row.employment_type),
            hire_date=row.hire_date,
            is_deleted=row.is_deleted,
            created_at=_as_utc(row.created_at),
            updated_at=_as_utc(row.updated_at),
        )


def _as_utc(value: datetime) -> datetime:
    """Re-attach UTC tzinfo to a datetime read from SQLite, which strips it."""
    return value if value.tzinfo is not None else value.replace(tzinfo=UTC)
