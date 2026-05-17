from dataclasses import dataclass


@dataclass(frozen=True)
class Email:
    address: str
