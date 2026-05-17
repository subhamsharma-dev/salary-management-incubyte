from app.domain.country import Country


def test_country_stores_alpha_2_code():
    country = Country(code="US")

    assert country.code == "US"
