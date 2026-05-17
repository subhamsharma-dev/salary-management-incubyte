from app.domain.email import Email


def test_email_stores_address():
    email = Email(address="user@example.com")

    assert email.address == "user@example.com"


def test_email_normalises_address_to_lowercase():
    email = Email(address="USER@Example.COM")

    assert email.address == "user@example.com"
