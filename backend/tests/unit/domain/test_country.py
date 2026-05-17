import pytest

from app.domain.country import Country


def test_country_stores_alpha_2_code():
    country = Country(code="US")

    assert country.code == "US"


def test_country_rejects_unknown_alpha_2_code():
    with pytest.raises(ValueError):
        Country(code="ZZ")
