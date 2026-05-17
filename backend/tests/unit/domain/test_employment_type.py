from app.domain.employment_type import EmploymentType


def test_employment_type_lists_full_time_part_time_contractor():
    values = {member.value for member in EmploymentType}

    assert values == {"full_time", "part_time", "contractor"}
