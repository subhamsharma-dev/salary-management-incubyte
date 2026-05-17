from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.dependencies import get_employee_service
from app.schemas.insights import CountryInsightResponse, CountryJobTitleInsightResponse
from app.services.employee import EmployeeService

router = APIRouter(prefix="/insights", tags=["insights"])


@router.get("/by-country", response_model=list[CountryInsightResponse])
def insights_by_country(
    service: Annotated[EmployeeService, Depends(get_employee_service)],
) -> list[CountryInsightResponse]:
    return [CountryInsightResponse.from_domain(i) for i in service.insights_by_country()]


@router.get(
    "/by-country-job-title",
    response_model=list[CountryJobTitleInsightResponse],
)
def avg_by_country_job_title(
    service: Annotated[EmployeeService, Depends(get_employee_service)],
) -> list[CountryJobTitleInsightResponse]:
    return [
        CountryJobTitleInsightResponse.from_domain(i)
        for i in service.avg_by_country_job_title()
    ]
