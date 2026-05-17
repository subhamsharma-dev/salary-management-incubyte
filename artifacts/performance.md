# Performance

The assignment calls out one requirement: *"engineers run the seed script regularly, and
performance of the script matters."* Everything below the seed-script section is
informational.

## Seed script — 10,000 employees

**Target:** under 5 seconds on a developer laptop.

**Approach:** single transaction, Core bulk insert
(`session.execute(insert(Employee), [...])`), no per-row ORM instantiation, no per-row
commit.

**Name generation:** `random.sample(range(N*M), 10_000)`, decode each index via divmod
to `(firsts[i // M], lasts[i % M])`. Never materialise the full Cartesian product.

| Approach | Time (10K) |
|---|---|
| Naive (add-in-loop, commit-per-row) | TBD |
| ORM bulk (`add_all` + single commit) | TBD |
| Core bulk (chosen) | TBD |

The gap is commit frequency, not row count — one `fsync` per row in the naive case.

## API

Aggregations run in SQL, sub-100ms locally on 10K rows. Server-side pagination.
Indexes: `email` (unique), `country`, `job_title`, composite `(country, is_deleted)`.
