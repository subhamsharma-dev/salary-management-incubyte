from pydantic import BaseModel, ConfigDict, EmailStr, field_validator


class Email(BaseModel):
    model_config = ConfigDict(frozen=True)

    address: EmailStr

    @field_validator("address", mode="after")
    @classmethod
    def _to_lowercase(cls, value: str) -> str:
        return value.lower()
