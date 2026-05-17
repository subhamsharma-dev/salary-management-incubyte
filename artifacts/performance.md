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

| Approach | Time (10K) | Note |
|---|---|---|
| Naive (add-in-loop, commit-per-row) | ~42 s (extrapolated from 1K at ~4.2 s) | One `fsync` per row. |
| ORM bulk (`add_all` + single commit) | 0.7 s | Single commit; per-row ORM instantiation cost. |
| Core bulk (chosen) | 0.3 s | Single multi-row INSERT; bypasses ORM identity map. |

Measured on a dev laptop (Windows + SSD). Both ORM bulk and Core bulk comfortably
beat the 5-second budget; Core wins by ~3× because it skips per-row ORM
instantiation. The dominant factor is commit frequency — one `fsync` per row in the
naive case is what costs 100× over the chosen approach.

## API

Aggregations run in SQL, sub-100ms locally on 10K rows. Server-side pagination.
Indexes: `email` (unique), `country`, `job_title`, composite `(country, is_deleted)`.
