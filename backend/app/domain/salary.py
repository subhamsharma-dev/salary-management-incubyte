from dataclasses import dataclass


@dataclass(frozen=True)
class Salary:
    cents: int

    def __post_init__(self) -> None:
        if not isinstance(self.cents, int):
            raise TypeError("Salary cents must be int")
        if self.cents <= 0:
            raise ValueError("Salary cents must be positive")
