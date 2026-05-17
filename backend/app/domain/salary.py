from dataclasses import dataclass


@dataclass(frozen=True)
class Salary:
    cents: int
