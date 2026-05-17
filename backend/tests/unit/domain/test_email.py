import pytest

from app.domain.email import Email


def test_email_stores_address():
    email = Email(address="user@example.com")

    assert email.address == "user@example.com"


def test_email_normalises_address_to_lowercase():
    email = Email(address="USER@Example.COM")

    assert email.address == "user@example.com"


@pytest.mark.parametrize("address", [
    "",
    "no-at",
    "user@",
    "user@nodot",
    "user @example.com",
])
def test_email_rejects_malformed_address(address):
    with pytest.raises(ValueError):
        Email(address=address)
