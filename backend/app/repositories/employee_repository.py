from __future__ import annotations

from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.domain.country import Country
from app.domain.department import Department
from app.domain.email import Email
from app.domain.employee import Employee
from app.domain.employment_type import EmploymentType
from app.domain.salary import Salary
from app.repositories.orm import EmployeeORM
from app.repositories.protocol import CountryInsight, Page


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

    def mark_deleted(self, employee_id: UUID) -> None:
        row = self._session.get(EmployeeORM, employee_id)
        if row is None:
            raise ValueError(f"Employee {employee_id} not found")
        row.is_deleted = True
        row.updated_at = datetime.now(UTC)
        self._session.commit()

    def update(self, employee: Employee) -> None:
        row = self._session.get(EmployeeORM, employee.id)
        if row is None:
            raise ValueError(f"Employee {employee.id} not found")
        row.full_name = employee.full_name
        row.email = employee.email.address
        row.job_title = employee.job_title
        row.department = employee.department.value
        row.country = employee.country.code
        row.salary_cents = employee.salary.cents
        row.employment_type = employee.employment_type.value
        row.hire_date = employee.hire_date
        row.is_deleted = employee.is_deleted
        row.updated_at = employee.updated_at
        self._session.commit()

    def aggregate_by_country(self) -> list[CountryInsight]:
        rows = self._session.execute(
            select(
                EmployeeORM.country,
                func.count().label("headcount"),
                func.min(EmployeeORM.salary_cents).label("min_cents"),
                func.max(EmployeeORM.salary_cents).label("max_cents"),
                func.avg(EmployeeORM.salary_cents).label("avg_cents"),
                func.p25(EmployeeORM.salary_cents).label("p25_cents"),
                func.p50(EmployeeORM.salary_cents).label("p50_cents"),
                func.p75(EmployeeORM.salary_cents).label("p75_cents"),
            )
            .where(EmployeeORM.is_deleted == False)  # noqa: E712
            .group_by(EmployeeORM.country)
            .order_by(EmployeeORM.country)
        ).all()

        return [
            CountryInsight(
                country=row.country,
                headcount=row.headcount,
                min_salary=Salary(cents=row.min_cents),
                max_salary=Salary(cents=row.max_cents),
                avg_salary=Salary(cents=int(round(row.avg_cents))),
                median_salary=Salary(cents=int(round(row.p50_cents))),
                p25_salary=Salary(cents=int(round(row.p25_cents))),
                p75_salary=Salary(cents=int(round(row.p75_cents))),
            )
            for row in rows
        ]

    def list(
        self,
        *,
        page: int = 1,
        page_size: int = 50,
        country: str | None = None,
        job_title: str | None = None,
        department: Department | None = None,
        include_deleted: bool = False,
        q: str | None = None,
    ) -> Page:
        filters = []
        if country is not None:
            filters.append(EmployeeORM.country == country)
        if job_title is not None:
            filters.append(EmployeeORM.job_title == job_title)
        if department is not None:
            filters.append(EmployeeORM.department == department.value)
        if not include_deleted:
            filters.append(EmployeeORM.is_deleted == False)  # noqa: E712
        if q is not None:
            pattern = f"%{q.lower()}%"
            filters.append(
                or_(
                    func.lower(EmployeeORM.full_name).like(pattern),
                    func.lower(EmployeeORM.email).like(pattern),
                    func.lower(EmployeeORM.job_title).like(pattern),
                )
            )

        offset = (page - 1) * page_size

        rows = self._session.scalars(
            select(EmployeeORM)
            .where(*filters)
            .order_by(EmployeeORM.full_name, EmployeeORM.id)
            .offset(offset)
            .limit(page_size)
        ).all()

        total = self._session.scalar(
            select(func.count()).select_from(EmployeeORM).where(*filters)
        ) or 0

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
