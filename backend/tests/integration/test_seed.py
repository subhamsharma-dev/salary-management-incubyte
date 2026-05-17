from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.engine import create_engine_for_url
from app.repositories.orm import EmployeeORM
from app.seed.run import main, seed


def test_seed_inserts_count_rows_reconstructible_as_employees(session, employee_repository):
    seed(session, count=100)

    page = employee_repository.list(page=1, page_size=200)

    assert page.total == 100
    assert len(page.items) == 100


def test_seed_main_count_and_reset(tmp_path, monkeypatch):
    db_path = tmp_path / "test.db"
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{db_path}")

    main(["--count", "20", "--reset"])
    main(["--count", "10", "--reset"])  # second --reset drops and re-seeds

    engine = create_engine_for_url(f"sqlite:///{db_path}")
    with Session(engine) as db:
        total = db.scalar(select(func.count()).select_from(EmployeeORM))
    engine.dispose()

    assert total == 10  # not 30 — --reset dropped the first 20
