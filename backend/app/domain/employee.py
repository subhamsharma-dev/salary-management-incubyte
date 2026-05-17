import uuid
from datetime import date, datetime, timezone

from pydantic import BaseModel, ConfigDict, Field

from app.domain.country import Country
from app.domain.department import Department
from app.domain.email import Email
from app.domain.employment_type import EmploymentType
from app.domain.salary import Salary


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Employee(BaseModel):
    model_config = ConfigDict(frozen=True)

    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    full_name: str = Field(min_length=1, max_length=200)
    email: Email
    job_title: str
    department: Department
    country: Country
    salary: Salary
    employment_type: EmploymentType
    hire_date: date
    is_deleted: bool = False
    created_at: datetime = Field(default_factory=_now)
    updated_at: datetime = Field(default_factory=_now)
