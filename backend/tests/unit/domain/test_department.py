from app.domain.department import Department


def test_department_lists_canonical_business_areas():
    values = {member.value for member in Department}

    assert values == {
        "engineering",
        "sales",
        "marketing",
        "human_resources",
        "finance",
        "operations",
        "customer_support",
        "product",
    }
