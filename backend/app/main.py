import os
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from sqlalchemy.orm import sessionmaker

import app.repositories.orm  # noqa: F401  -- register EmployeeORM on Base.metadata
from app.api.employees import router as employees_router
from app.db.base import Base
from app.db.engine import create_engine_for_url


def _database_url() -> str:
    return os.environ.get("DATABASE_URL", "sqlite:///./app.db")


@asynccontextmanager
async def lifespan(fastapi_app: FastAPI) -> AsyncIterator[None]:
    engine = create_engine_for_url(_database_url())
    Base.metadata.create_all(engine)
    fastapi_app.state.engine = engine
    fastapi_app.state.session_factory = sessionmaker(bind=engine)
    try:
        yield
    finally:
        engine.dispose()


app = FastAPI(title="Salary Management API", lifespan=lifespan)
app.include_router(employees_router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
