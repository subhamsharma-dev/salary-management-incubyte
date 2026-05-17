from app.seed.run import seed


def test_seed_inserts_count_rows_reconstructible_as_employees(session, employee_repository):
    seed(session, count=100)

    page = employee_repository.list(page=1, page_size=200)

    assert page.total == 100
    assert len(page.items) == 100
