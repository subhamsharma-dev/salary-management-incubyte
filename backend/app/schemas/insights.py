from __future__ import annotations

from pydantic import BaseModel, ConfigDict

from app.repositories.protocol import CountryInsight, CountryJobTitleInsight


class CountryInsightResponse(BaseModel):
    model_config = ConfigDict(frozen=True)

    country: str
    headcount: int
    min_salary_cents: int
    max_salary_cents: int
    avg_salary_cents: int
    median_salary_cents: int
    p25_salary_cents: int
    p75_salary_cents: int

    @classmethod
    def from_domain(cls, insight: CountryInsight) -> CountryInsightResponse:
        return cls(
            country=insight.country,
            headcount=insight.headcount,
            min_salary_cents=insight.min_salary.cents,
            max_salary_cents=insight.max_salary.cents,
            avg_salary_cents=insight.avg_salary.cents,
            median_salary_cents=insight.median_salary.cents,
            p25_salary_cents=insight.p25_salary.cents,
            p75_salary_cents=insight.p75_salary.cents,
        )


class CountryJobTitleInsightResponse(BaseModel):
    model_config = ConfigDict(frozen=True)

    country: str
    job_title: str
    headcount: int
    avg_salary_cents: int

    @classmethod
    def from_domain(cls, insight: CountryJobTitleInsight) -> CountryJobTitleInsightResponse:
        return cls(
            country=insight.country,
            job_title=insight.job_title,
            headcount=insight.headcount,
            avg_salary_cents=insight.avg_salary.cents,
        )
