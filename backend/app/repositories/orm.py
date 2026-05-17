from datetime import date, datetime
from uuid import UUID

from sqlalchemy import Boolean, Date, DateTime, Integer, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class EmployeeORM(Base):
    __tablename__ = "employees"

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True)
    full_name: Mapped[str] = mapped_column(String(200))
    email: Mapped[str] = mapped_column(String, unique=True)
    job_title: Mapped[str] = mapped_column(String(100))
    department: Mapped[str] = mapped_column(String)
    country: Mapped[str] = mapped_column(String(2))
    salary_cents: Mapped[int] = mapped_column(Integer)
    employment_type: Mapped[str] = mapped_column(String)
    hire_date: Mapped[date] = mapped_column(Date)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
