# Architecture

## System

```mermaid
---
config:
  look: handDrawn
  theme: neutral
---
flowchart TD
    HR([HR Manager])
    HR -->|browser| FE
    FE -->|HTTPS · JSON| API

    subgraph FE["Frontend · Vercel"]
        FEEmp["features/employees"]
        FEIns["features/insights"]
    end

    subgraph BE["Backend · Fly.io"]
        API["api/ — thin routes"]
        SVC["services/ — use-cases"]
        DOM["domain/ — pure logic"]
        REPO["repositories/ — SQLAlchemy"]
        API --> SVC
        SVC --> DOM
        SVC --> REPO
    end

    REPO --> DB[(SQLite · app.db)]
```

Arrows point in the dependency direction. `domain/` depends on nothing; everything that
matters depends on `domain/`.

## Data model

```mermaid
---
config:
  look: handDrawn
  theme: neutral
---
erDiagram
    EMPLOYEE {
        uuid id PK
        string full_name
        string email UK
        string job_title
        string department
        string country
        int salary_cents
        enum employment_type
        date hire_date
        boolean is_deleted
        datetime created_at
        datetime updated_at
    }
```

One aggregate. No joins in v1.

Indexes: `email` (unique), `country`, `job_title`, composite `(country, is_deleted)` for
the insight queries.

## Request: "salary insights by country"

```mermaid
---
config:
  look: handDrawn
  theme: neutral
---
sequenceDiagram
    actor HR as HR Manager
    participant FE as Frontend
    participant API as api/
    participant SVC as services/
    participant REPO as repositories/
    participant DB as SQLite

    HR->>FE: open insights
    FE->>API: GET /insights/by-country
    API->>SVC: get_insights_by_country()
    SVC->>REPO: aggregate_by_country()
    REPO->>DB: SELECT country, MIN, MAX, AVG, percentiles GROUP BY country
    DB-->>REPO: rows
    REPO-->>SVC: domain objects
    SVC-->>API: response model
    API-->>FE: JSON
    FE-->>HR: rendered chart
```

Aggregation happens in SQL. The frontend never sees 10K rows.

## Invariants

- Dependencies point downward only.
- `domain/` imports nothing — no framework, no I/O.
- `repositories/` is the only layer with SQLAlchemy imports.
- Insights are SQL aggregates, not Python loops over rows.
- Soft-deleted rows are excluded from every default query.
