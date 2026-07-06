# Database Schema — DGRV Digital Gap Assessment Tool

> Authoritative, **as-built** schema reference, aligned with the SeaORM migrations in
> `migration/` and the entities in `src/entities/`. The older `doc/Database_ER_Diagram.md`
> and `doc/Database_ER_Diagram_Update.md` are superseded by this document.

## 1. Stack & Management

- **PostgreSQL 16** (two containers: `db` → `dgat` database, `keycloak-db` → `keycloak`).
- **SeaORM 0.12** entities (`src/entities/`) + **sea-orm-migration** migrator
  (`migration/`), applied **automatically on backend startup** via `database::run_migrations`.
- App DB connection string: `DGAT_DATABASE_URL`
  (e.g. `postgres://postgres:postgres@db:5432/dgat`). Keycloak manages its own schema.

## 2. Tables

### 2.1 `dimensions`
Assessment dimensions (e.g. "Digital Strategy"). Multilingual: several rows share a
`dimension_key` but differ by `language`.

| Column | Type | Notes |
|---|---|---|
| `dimension_id` | UUID | **PK** |
| `dimension_key` | UUID | stable cross-language key (groups language variants); UQ `(dimension_key, language)` |
| `name` | VARCHAR | |
| `description` | TEXT, null | |
| `weight` | INT, null | CHECK 0–100 |
| `category` | VARCHAR, null | |
| `is_active` | BOOL, default true | |
| `language` | VARCHAR(10), not null, default 'en' | |
| `created_at`, `updated_at` | TIMESTAMP | |

Relations (has_many): `current_states`, `desired_states`, `dimension_assessments`,
`gaps`, `recommendations`, `organisation_dimension`.

### 2.2 `current_states`
The *as-is* maturity level descriptions for a dimension, per score (0–6), per language.

| Column | Type | Notes |
|---|---|---|
| `current_state_id` | UUID | **PK** |
| `dimension_id` | UUID | **FK → dimensions** (CASCADE) |
| `dimension_key` | UUID | |
| `title` | VARCHAR, not null | |
| `description` | VARCHAR, not null | |
| `score` | INT, not null | maturity level 0–6 |
| `language` | VARCHAR(10), not null, default 'en' | |
| `level` | VARCHAR, null | DB-only — **not mapped in entity** |
| `created_at`, `updated_at` | TIMESTAMPTZ | |

UQ `(dimension_id, score, language)`. **FK → dimensions** (CASCADE).

### 2.3 `desired_states`
The *to-be* maturity level descriptions — same shape as `current_states`.

| Column | Type | Notes |
|---|---|---|
| `desired_state_id` | UUID | **PK** |
| `dimension_id` | UUID | **FK → dimensions** (CASCADE) |
| `dimension_key` | UUID | |
| `title` | VARCHAR, not null | |
| `description` | VARCHAR, not null | |
| `score` | INT, not null | target maturity 0–6 |
| `language` | VARCHAR(10), not null, default 'en' | |
| `level` | VARCHAR, null | DB-only — **not mapped in entity** |
| `created_at`, `updated_at` | TIMESTAMPTZ | |

UQ `(dimension_id, score, language)`. **FK → dimensions** (CASCADE).

### 2.4 `assessments`
A single assessment (document) owned by an organization (and optionally scoped to a
cooperation).

| Column | Type | Notes |
|---|---|---|
| `assessment_id` | UUID | **PK** |
| `organization_id` | VARCHAR, not null | Keycloak org id (from JWT) |
| `cooperation_id` | VARCHAR, null | Keycloak group id / cooperation |
| `document_title` | VARCHAR, not null | |
| `status` | `assessment_status_enum` | draft / in_progress / completed / archived (default 'draft') |
| `started_at` | TIMESTAMPTZ, null | |
| `completed_at` | TIMESTAMPTZ, null | set on submission |
| `dimensions_id` | JSONB, null | dimension selection metadata |
| `created_at`, `updated_at` | TIMESTAMPTZ | |

Relations (has_many): `dimension_assessments`, `reports`, `action_plans`,
`assessment_recommendations`.

### 2.5 `dimension_assessments`
One row per dimension selected within an assessment — records the chosen current &
desired states and the computed gap.

| Column | Type | Notes |
|---|---|---|
| `dimension_assessment_id` | UUID | **PK** |
| `assessment_id` | UUID | **FK → assessments** (CASCADE) |
| `dimension_id` | UUID | **FK → dimensions** (CASCADE) |
| `current_state_id` | UUID, null | **FK → current_states** (ON DELETE SET NULL) |
| `desired_state_id` | UUID, null | **FK → desired_states** (ON DELETE SET NULL) |
| `gap_score` | INT, not null | desired.score − current.score |
| `gap_id` | UUID, not null | **FK → gaps** (CASCADE) — one-to-one |
| `organization_id` | VARCHAR, not null | |
| `cooperation_id` | VARCHAR, null | |
| `created_at`, `updated_at` | TIMESTAMPTZ | |

### 2.6 `gaps`
Materialized gap records per dimension+language.

| Column | Type | Notes |
|---|---|---|
| `gap_id` | UUID | **PK** |
| `dimension_id` | UUID | **FK → dimensions** (CASCADE) |
| `dimension_key` | UUID | |
| `gap_size` | INT, not null | `desired.score − current.score` |
| `gap_severity` | `gap_severity` enum | LOW / MEDIUM / HIGH |
| `gap_description` | TEXT, null | |
| `language` | VARCHAR(10), not null, default 'en' | |
| `calculated_at` | TIMESTAMPTZ, not null | |
| `created_at`, `updated_at` | TIMESTAMPTZ | |

Severity buckets (design): `|gap| ≤ 1` → LOW, `|gap| ∈ {2,3}` → MEDIUM, `|gap| ≥ 4` → HIGH.
> Note: the consolidated-report service uses a different threshold (`>=3` High,
> `==2` Medium, else Low) — see `consolidated_report_logic.md`.

### 2.7 `recommendations`
Recommendations per dimension+language, matched by `priority` (not by severity).

| Column | Type | Notes |
|---|---|---|
| `recommendation_id` | UUID | **PK** |
| `dimension_id` | UUID | **FK → dimensions** (CASCADE) |
| `dimension_key` | UUID | |
| `priority` | `recommendation_priority` enum | LOW / MEDIUM / HIGH (default MEDIUM) |
| `description` | TEXT, not null | |
| `source` | VARCHAR, not null, default 'admin' | `admin` (shared) vs `action_plan` (auto-created clone) |
| `language` | VARCHAR(10), not null, default 'en' | |
| `created_at`, `updated_at` | TIMESTAMPTZ | |

Relations (has_many): `assessment_recommendations`, `action_items`.

### 2.8 `assessment_recommendations` (join)
Many-to-many link between assessments and recommendations, with selection metadata.

| Column | Type | Notes |
|---|---|---|
| `assessment_recommendation_id` | UUID | **PK** |
| `assessment_id` | UUID | **FK → assessments** (CASCADE) |
| `recommendation_id` | UUID | **FK → recommendations** (CASCADE) |
| `gap_value` | INT, not null | gap that triggered selection |
| `custom_notes` | TEXT, null | |
| `implementation_status` | enum* | planned / in_progress / completed / cancelled (default 'planned') |
| `selected_at` | TIMESTAMP, null | |
| `created_at`, `updated_at` | TIMESTAMPTZ | |

\* The entity declares `implementation_status` as a Postgres enum, but **no migration
creates the `CREATE TYPE`**; the column is created as text. See §5.

### 2.9 `reports`
Report metadata; binary content lives in MinIO.

| Column | Type | Notes |
|---|---|---|
| `report_id` | UUID | **PK** |
| `assessment_id` | UUID | **FK → assessments** (CASCADE) |
| `report_type` | `report_type` enum | summary / detailed / action_plan |
| `title` | VARCHAR, not null | |
| `format` | `report_format` enum | pdf / excel / json / **word** |
| `summary` | TEXT, null | |
| `report_data` | JSONB, null | |
| `file_path` | VARCHAR, null | S3 object key |
| `status` | `report_status` enum | pending / generating / completed / failed (default 'pending') |
| `minio_path` | VARCHAR, null | DB-only — **not mapped in entity** |
| `generated_at` | TIMESTAMPTZ, not null | |
| `created_at`, `updated_at` | TIMESTAMPTZ | |

### 2.10 `action_plans` (streamlined)
One action plan per assessment (slim container).

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | **PK** (column name is `id`) |
| `assessment_id` | UUID | **FK → assessments** (CASCADE) |
| `created_at`, `updated_at` | TIMESTAMPTZ | default now() |

Relations (has_many): `action_items`.

### 2.11 `action_items` (streamlined)
Ternary link between an action plan, a recommendation, and a dimension assessment.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | **PK** (column name is `id`) |
| `action_plan_id` | UUID | **FK → action_plans.id** (CASCADE) |
| `recommendation_id` | UUID | **FK → recommendations** (CASCADE) |
| `dimension_assessment_id` | UUID | **FK → dimension_assessments** (CASCADE) |
| `status` | `action_item_status` enum | todo / in_progress / done / approved (default 'todo') |
| `priority` | `action_item_priority` enum | low / medium / high (default 'medium') |
| `created_at`, `updated_at` | TIMESTAMPTZ | |

### 2.12 `organisation_dimension`
Maps which logical dimensions are assigned to an organization.

| Column | Type | Notes |
|---|---|---|
| `organisation_dimension` | UUID | **PK** |
| `organisation_id` | VARCHAR, not null | Keycloak org id |
| `dimension_id` | UUID | **FK → dimensions** (CASCADE) |
| `dimension_key` | UUID, not null | |
| `created_at`, `updated_at` | TIMESTAMPTZ | |

UQ `(organisation_id, dimension_id)`.

## 3. Entity Relationships (ER)

```
DIMENSIONS 1—∞  CURRENT_STATES, DESIRED_STATES, DIMENSION_ASSESSMENTS,
                  GAPS, RECOMMENDATIONS, ORGANISATION_DIMENSION

ASSESSMENTS 1—∞  DIMENSION_ASSESSMENTS, REPORTS, ACTION_PLANS,
                  ASSESSMENT_RECOMMENDATIONS

CURRENT_STATES 1—∞ DIMENSION_ASSESSMENTS  (nullable FK, ON DELETE SET NULL)
DESIRED_STATES 1—∞ DIMENSION_ASSESSMENTS  (nullable FK, ON DELETE SET NULL)

GAPS 1—1 DIMENSION_ASSESSMENTS  (FK dimension_assessments.gap_id → gaps, NOT NULL)

ASSESSMENTS ∞—∞ RECOMMENDATIONS  via ASSESSMENT_RECOMMENDATIONS (join)

RECOMMENDATIONS 1—∞  ASSESSMENT_RECOMMENDATIONS, ACTION_ITEMS
ACTION_PLANS 1—∞ ACTION_ITEMS
DIMENSION_ASSESSMENTS 1—∞ ACTION_ITEMS
```

There is **no** users/cooperations table — `organization_id` / `cooperation_id` are
denormalized string columns sourced from the Keycloak JWT.

## 4. Enums (PostgreSQL `CREATE TYPE`)

| Enum type | Values | Column | Created by |
|---|---|---|---|
| `assessment_status_enum` | draft, in_progress, completed, archived | assessments.status | m20240922 + m20251112_140000 |
| `gap_severity` | LOW, MEDIUM, HIGH | gaps.gap_severity | m20251115_112421 |
| `recommendation_priority` | LOW, MEDIUM, HIGH | recommendations.priority | m20251113_105117 |
| `report_type` | summary, detailed, action_plan | reports.report_type | m20251122_000001 |
| `report_format` | pdf, excel, json, **word** | reports.format | m20251122 + m20260429 |
| `report_status` | pending, generating, completed, failed | reports.status | m20251122_000001 |
| `action_item_status` | todo, in_progress, done, approved | action_items.status | m20251115_084826 |
| `action_item_priority` | low, medium, high | action_items.priority | m20251115_084826 |
| `implementation_status` | planned, in_progress, completed, cancelled | assessment_recommendations.implementation_status | **not created** — text column (see §5) |

Other constrained columns: `dimensions.weight` INT CHECK 0–100;
`recommendations.source` text convention (`admin` vs `action_plan`, enforced in code).

## 5. Known Schema / Entity Drift (handover notes)

1. **`implementation_status`** — entity declares it a Postgres enum, but no migration
   `CREATE TYPE`s it; the column is plain `text` with default `'planned'`. A fresh DB
   will therefore not have the enum type. Functional, but the active-model enum derive
   expects an enum type — verify on schema reset.
2. **`reports.minio_path`** — exists in DB (with index `idx_reports_minio_path`) but is
   **not mapped** in the `reports` entity; the active code uses `file_path` instead.
3. **`current_states.level` / `desired_states.level`** — added by an unregistered
   migration (`m20251219_140537`); present in some deployments but **unused** by
   application code and not in the entity models.
4. **Two migration files are NOT registered** in `migration/src/lib.rs`, so they never run:
   - `m20251113_000001_safely_drop_file_name_column.rs`
   - `m20251115_083637_add_dimension_assessment_id_to_action_items.rs` (commented out)
5. **Maturity "tier"** is the integer `score` (0–6) on `current_states`/`desired_states`.
   There is no `tier_id`. The optional `level` varchar is unused.
6. **Gap↔dimension_assessment relationship was inverted:** originally `gaps` held
   `dimension_assessment_id`; now `dimension_assessments.gap_id` references `gaps`
   (one-to-one, NOT NULL).

## 6. Migration History (registered, in order)

39 registered migrations. Highlights (full list in `migration/src/lib.rs`):

1. `m20240922_000001_create_initial_tables` — core tables.
2. `m20240922_000002_create_remaining_tables` — original action_plans/action_items.
3. `m20240924_000001_add_dimension_weights` — `dimensions.weight` (CHECK 0–100).
8. `m20251024_000001_update_schema` — `organisation_dimension` table, drop old cols.
19. `m20251112_142500_update_dimension_assessments_table` — replaces current/desired
    scores with single `gap_score`.
25. `m20251114_190500_add_gap_id_to_dimension_assessments` — invert gap relationship.
26–27. `m20251115_084723` / `_084826` — drop & recreate streamlined action_plans/items.
28–29. `m20251115_112421` / `_113323` — `gap_severity` enum.
32. `m20251122_000001_create_report_enums` — report_type/format/status enums.
34. `m20260109_082600_add_title_to_states` — re-add `title` to states.
35. `m20260408_000001_add_source_to_recommendations` — `source` column.
36. `m20260420_000001_add_language_to_content_tables` — `language` columns.
37. `m20260421_000001_multilang_dimension_keys` — `dimension_key` + language UQ.
38. `m20260421_000002_add_dimension_key_to_org_dimensions`.
39. `m20260429_000001_add_word_to_report_format` — `ALTER TYPE … ADD VALUE 'word'`.

## 7. Seeding

`src/bin/seed.rs` (`cargo run --bin seed`) seeds 7 sample dimensions,
current/desired states (levels 1–5), generic recommendations (High/Med/Low), and
generic gaps. Use only for local/dev data; it clears related rows first.