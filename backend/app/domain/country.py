import json
from dataclasses import dataclass
from pathlib import Path


_VALID_CODES: frozenset[str] = frozenset(
    json.loads(
        (Path(__file__).parent / "data" / "iso3166_alpha2.json").read_text(encoding="utf-8")
    )
)


@dataclass(frozen=True)
class Country:
    code: str

    def __post_init__(self) -> None:
        if self.code not in _VALID_CODES:
            raise ValueError("Unknown ISO-3166 alpha-2 code")
