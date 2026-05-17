from dataclasses import dataclass


@dataclass(frozen=True)
class Email:
    address: str

    def __post_init__(self) -> None:
        object.__setattr__(self, "address", self.address.lower())
