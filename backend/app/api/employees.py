from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies import get_employee_service
from app.domain.department import Department
from app.schemas.employee import EmployeePageResponse, EmployeeResponse
from app.services.employee import CreateEmployeeInput, EmployeeService, UpdateEmployeeInput

router = APIRouter(prefix="/employees", tags=["employees"])


@router.post("", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_employee(
    data: CreateEmployeeInput,
    service: Annotated[EmployeeService, Depends(get_employee_service)],
) -> EmployeeResponse:
    employee = service.create_employee(data)
    return EmployeeResponse.from_domain(employee)


@router.get("", response_model=EmployeePageResponse)
def list_employees(
    service: Annotated[EmployeeService, Depends(get_employee_service)],
    page: int = 1,
    page_size: int = 50,
    country: str | None = None,
    job_title: str | None = None,
    department: Department | None = None,
    include_deleted: bool = False,
    q: str | None = None,
) -> EmployeePageResponse:
    result = service.list_employees(
        page=page,
        page_size=page_size,
        country=country,
        job_title=job_title,
        department=department,
        include_deleted=include_deleted,
        q=q,
    )
    return EmployeePageResponse.from_page(result)


@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee(
    employee_id: UUID,
    service: Annotated[EmployeeService, Depends(get_employee_service)],
) -> EmployeeResponse:
    employee = service.get_employee(employee_id)
    if employee is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found",
        )
    return EmployeeResponse.from_domain(employee)


@router.patch("/{employee_id}", response_model=EmployeeResponse)
def update_employee(
    employee_id: UUID,
    data: UpdateEmployeeInput,
    service: Annotated[EmployeeService, Depends(get_employee_service)],
) -> EmployeeResponse:
    if service.get_employee(employee_id) is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found",
        )
    employee = service.update_employee(employee_id, data)
    return EmployeeResponse.from_domain(employee)


@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(
    employee_id: UUID,
    service: Annotated[EmployeeService, Depends(get_employee_service)],
) -> None:
    if service.get_employee(employee_id) is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found",
        )
    service.soft_delete_employee(employee_id)
