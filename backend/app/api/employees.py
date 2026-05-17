from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.api.dependencies import get_employee_service
from app.schemas.employee import EmployeeResponse
from app.services.employee import CreateEmployeeInput, EmployeeService

router = APIRouter(prefix="/employees", tags=["employees"])


@router.post("", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_employee(
    data: CreateEmployeeInput,
    service: Annotated[EmployeeService, Depends(get_employee_service)],
) -> EmployeeResponse:
    employee = service.create_employee(data)
    return EmployeeResponse.from_domain(employee)
