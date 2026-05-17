import json
from pathlib import Path

from pydantic import BaseModel, ConfigDict, field_validator


_VALID_CODES: frozenset[str] = frozenset(
    json.loads(
        (Path(__file__).parent / "data" / "iso3166_alpha2.json").read_text(encoding="utf-8")
    )
)


class Country(BaseModel):
    model_config = ConfigDict(frozen=True)

    code: str

    @field_validator("code")
    @classmethod
    def _must_be_known_alpha_2(cls, value: str) -> str:
        if value not in _VALID_CODES:
            raise ValueError("Unknown ISO-3166 alpha-2 code")
        return value
