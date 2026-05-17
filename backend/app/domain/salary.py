from typing import Self

from pydantic import BaseModel, ConfigDict, Field, StrictInt


class Salary(BaseModel):
    model_config = ConfigDict(frozen=True)

    cents: StrictInt = Field(gt=0)

    @classmethod
    def from_dollars(cls, dollars: int) -> Self:
        return cls(cents=dollars * 100)
