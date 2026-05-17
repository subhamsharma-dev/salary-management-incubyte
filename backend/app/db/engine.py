"""Engine factory that registers domain-specific SQLite aggregate functions.

SQLite has no native PERCENTILE_CONT/DISC. We register Python aggregates
(`p25`, `p50`, `p75`) on every new connection so insight queries can stay
in SQL: `SELECT MIN, MAX, AVG, p25(salary_cents), p50(...), p75(...) GROUP BY country`.
"""

from __future__ import annotations

from typing import Any

from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.pool import StaticPool


def _percentile(values: list[float], p: float) -> float | None:
    """Linear-interpolation percentile (Excel/Pandas `inclusive` method)."""
    if not values:
        return None
    sorted_vals = sorted(values)
    n = len(sorted_vals)
    if n == 1:
        return sorted_vals[0]
    pos = p * (n - 1)
    lower = int(pos)
    upper = min(lower + 1, n - 1)
    return sorted_vals[lower] + (sorted_vals[upper] - sorted_vals[lower]) * (pos - lower)


def _make_percentile_aggregate(p: float) -> type:
    class _Percentile:
        def __init__(self) -> None:
            self._values: list[float] = []

        def step(self, value: float | None) -> None:
            if value is not None:
                self._values.append(value)

        def finalize(self) -> float | None:
            return _percentile(self._values, p)

    return _Percentile


def create_engine_for_url(url: str, **kwargs: Any) -> Engine:
    """Create a SQLAlchemy Engine with `p25`/`p50`/`p75` SQLite aggregates registered.

    For SQLite URLs, sets `check_same_thread=False` so FastAPI's threaded request
    handlers can share a single connection pool (SQLite's default rejects cross-thread
    use). For our single-writer HR-tool workload this is safe.
    """
    if url.startswith("sqlite"):
        if "connect_args" not in kwargs:
            kwargs["connect_args"] = {"check_same_thread": False}
        # `:memory:` databases are per-connection; pin to a single connection
        # so all sessions on this engine see the same in-memory DB.
        if ":memory:" in url and "poolclass" not in kwargs:
            kwargs["poolclass"] = StaticPool
    engine = create_engine(url, **kwargs)

    @event.listens_for(engine, "connect")
    def _register_aggregates(dbapi_connection: Any, _connection_record: Any) -> None:
        dbapi_connection.create_aggregate("p25", 1, _make_percentile_aggregate(0.25))
        dbapi_connection.create_aggregate("p50", 1, _make_percentile_aggregate(0.50))
        dbapi_connection.create_aggregate("p75", 1, _make_percentile_aggregate(0.75))

    return engine
