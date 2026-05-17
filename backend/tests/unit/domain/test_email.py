from app.domain.email import Email


def test_email_stores_address():
    email = Email(address="user@example.com")

    assert email.address == "user@example.com"
