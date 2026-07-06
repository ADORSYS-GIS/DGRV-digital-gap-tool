# Features & Implementation — DGRV Digital Gap Assessment Tool

> An **end-to-end feature index**: for each user-facing feature, where it lives in the
> code (backend handlers/services/repositories + DB tables) and frontend. Use this as
> the map when handing over or extending a feature.

## 0. How to Read This

Each feature entry follows:

- **Backend:** `handler` → `service` → `repository` → `entity/tables`
- **Frontend:** page/component → hook/service → generated client (or Dexie offline)
- **Endpoints:** exact HTTP routes

Routes are defined in `src/api/routes/api.rs` (orchestrator) + per-resource routers in
`src/api/routes/`. Handlers are in `src/api/handlers/`. All endpoints require a valid
Keycloak JWT (global auth middleware) unless noted. Role enforcement is limited — see
`RBAC_AND_ROLES.md`.

## 1. Dimensions & Maturity States

The content library that assessments are built from.

- **DB:** `dimensions` (multilingual, grouped by `dimension_key`), `current_states`,
  `desired_states` (maturity levels 0–6 per language, UQ `(dimension_id, score, language)`).
- **Backend endpoints:**
  - `POST/GET /dimensions`, `GET/PUT/DELETE /dimensions/:id`
  - `GET /dimensions/:id/with-states` (dimension + its current/desired states)
  - `POST/PUT/DELETE /dimensions/:dimension_id/current-states[/:id]`
  - `POST/PUT/DELETE /dimensions/:dimension_id/desired-states[/:id]`
- **Code:** `handlers/dimension.rs`, `services/dimension_scoring.rs` (weights; dead
  code per mod.rs omission), `repositories/{dimensions,current_states,desired_states}.rs`.
- **Frontend:** admin pages `ManageDimensions.tsx`, `ManageDigitalisationLevels.tsx`,
  `DimensionTranslationsPage.tsx` (multilingual edit per `dimension_key`); hooks under
  `hooks/dimensions/`, `hooks/digitalisationLevels/`.

### Multilingual content model
`dimension_key` is a stable UUID grouping all language-variant rows of one logical
dimension. Child tables (`current_states`, `desired_states`, `recommendations`, `gaps`,
`organisation_dimension`) duplicate `dimension_key` + `language` so the user's language
can be resolved without joins. `organisation_dimension` is keyed by `dimension_key`
so assignments apply across all languages.

## 2. Gaps

Computed gap records per dimension+language.

- **DB:** `gaps` (`gap_size`, `gap_severity` enum LOW/MEDIUM/HIGH, `dimension_key`,
  `language`).
- **Backend endpoints:**
  - `GET /gaps`, `GET /gaps/:id`, `PUT/DELETE /gaps/:id`
  - `GET /dimension-assessments/:dimension_assessment_id/gaps`
  - `GET /assessments/:assessment_id/gaps`
  - `POST /admin/gaps` (admin Creates gap definitions)
- **Code:** `handlers/gap.rs`, `repositories/gaps.rs`. Severity buckets (design):
  `|gap|≤1` LOW, `2-3` MEDIUM, `≥4` HIGH.
- **Frontend:** admin `ManageDigitalGaps.tsx`, `ManageGapRecommendations.tsx`; hooks
  `hooks/digitalisationGaps/`.

> **Note:** `gaps` to `dimension_assessments` relationship is **inverted** —
> `dimension_assessments.gap_id` (NOT NULL) references `gaps.gap_id`. See
> `DATABASE_SCHEMA.md`.

## 3. Recommendations

Per-dimension recommendations matched by `priority`.

- **DB:** `recommendations` (`priority` enum, `source` = `admin` shared vs `action_plan`
  auto-clone, `dimension_key`, `language`).
- **Backend endpoints (`/recommendations`):** POST/, GET/, GET/:id, PUT/:id, DELETE/:id,
  `GET /recommendations/dimensions/:dimension_id/recommendations`.
- **Code:** `handlers/recommendation.rs`, `repositories/recommendations.rs`
  (`find_admin_by_dimension`, `find_by_dimension_and_priority` excludes `action_plan`
  source so user copies don't leak across submissions).
- **Frontend:** admin `ManageRecommendations.tsx`; hooks `hooks/recommendations/`.

## 4. Assessment Lifecycle

### 4.1 Assessment CRUD
- **DB:** `assessments` (`organization_id`, `cooperation_id`, `status` enum draft/
  in_progress/completed/archived, `dimensions_id` JSONB).
- **Endpoints (`/assessments`):**
  - `POST/GET/GET/:id/PUT/:id/DELETE/:id`
  - `GET /assessments/:id/summary`
  - `GET /assessments/organizations/:organization_id` (list by org)
  - `DELETE /assessments/organizations/:organization_id/:assessment_id` (scoped delete)
  - `GET /assessments/cooperations/:cooperation_id` (list by cooperation)
- **Code:** `handlers/assessment.rs`, `repositories/assessments.rs`
  (`delete_by_organization_and_id` is the ownership-scoped delete).

### 4.2 Dimension Assessments (answering)
The per-dimension selection of a current + desired state.

- **DB:** `dimension_assessments` (`assessment_id`, `dimension_id`,
  `current_state_id`, `desired_state_id`, `gap_score = desired.score − current.score`,
  `gap_id` → gaps).
- **Endpoints (`/assessments/:id/dimension-assessments`):**
  - `POST` create, `GET` list, `PUT /assessments/:assessment_id/dimension-assessments/:dimension_assessment_id` update.
- **Code:** `handlers/assessment.rs`, `repositories/dimension_assessments.rs`.
- **Frontend:** `AnswerDimensionAssessmentPage.tsx` (shared), role assessment pages.

### 4.3 Submission & Report Generation
- **Endpoint:** `POST /api/submissions/submit` (`SubmitAssessmentRequest`).
- **Service:** `submission_service.rs::submit_assessment`:
  1. Mark assessment `status=Completed`, set `completed_at`.
  2. Insert a `reports` row (`status=Pending`, type=Summary, format=Pdf).
  3. `tokio::spawn` background `report_service.generate_report_for_submission`
     (PDF generation → MinIO upload → flip report to `Completed`/`Failed`).
- **Endpoint:** `GET /assessments/.../submissions` lists submissions (by org/cooperation).

## 5. Reports (PDF & Word/DOCX)

### 5.1 Generation pipeline
- `PdfGeneratorService::generate_assessment_pdf`
  (`src/services/pdf_generator.rs`):
  1. `fetch_report_data` — load assessment → dimension_assessments → dimensions,
     gaps, current/desired scores, action plan items (using `item.description` from the
     linked recommendation). Build localized `PdfReportData` (labels: en/fr/pt/ss).
  2. `render_html_template` — `Tera` renders `templates/report.html` with a Chart.js
     bar chart (current vs desired per dimension).
  3. `html_to_pdf` — `headless_chrome` navigates to `data:text/html;base64,...`,
     waits for `img#chartImage`, then `print_to_pdf`.
- `WordGeneratorService::generate_assessment_word`
  (`src/services/word_generator.rs`): reuses the same data + HTML, captures the chart
  PNG via `chartImage.src`, then builds a DOCX with `docx-rs` (styled header, color-coded
  table, embedded chart image 600×300 px). Packed via `doc.build().pack`.

### 5.2 Storage
- `ReportService` (`src/services/report_service.rs`) wraps `S3StorageService`
  (MinIO-backed AWS SDK S3, `force_path_style(true)`). Bucket `reports` auto-created.
- Object layout: `reports/{id}/report.{ext}`.
  - On-demand export uses fixed names `reports/{assessment_id}/report.{pdf|docx}`
    (overwrite-on-each-export) and **upserts** the matching `reports` row.
  - Submission background generation uses `reports/{report_id}/report.pdf` (new UUID
    per report row).
- `impl FileStorageService for ReportService` lets it act as a storage facade.

### 5.3 Endpoints (`/reports`)
| Method | Path |
|---|---|
| POST | `/reports/` |
| GET | `/reports/`, `GET /reports/:id` |
| PUT | `/reports/:id` |
| DELETE | `/reports/:id` (deletes S3 object + DB row) |
| GET | `/reports/:id/status`, `GET /reports/:id/download`, `GET /reports/:id/file`, `GET /reports/:id/file` |
| GET | `/reports/assessment/:assessment_id` |
| GET | `/reports/assessment/:assessment_id/download` |
| POST | `/reports/assessment/:assessment_id/generate-and-export` (PDF) |
| POST | `/reports/assessment/:assessment_id/generate-and-export-word` (DOCX) |

- **Code:** `handlers/report.rs`, `services/{report_service,pdf_generator,word_generator,s3_storage}.rs`,
  `repositories/reports.rs`.
- **Frontend:** `ViewReports.tsx`, `ReportsPage.tsx`, `OrganizationReportsPage.tsx`,
  `ExportReportPage.tsx`, `ConsolidatedReportPage.tsx`; hooks `hooks/reports/`,
  `hooks/consolidated_reports/`.

## 6. Consolidated Reports

Aggregate analytics across completed submissions.

- **Backend endpoints:**
  - `GET /consolidated-reports/dgrv-admin` — platform-wide (all completed).
  - `GET /consolidated-reports/org-admin/:organization_id` — one organization.
- **Service:** `consolidated_report.rs::process_submissions` buckets
  `dimension_assessments` by `dimension_key`, computes per-dimension average gap score
  + risk-level distribution (thresholds `>=3` High, `==2` Medium, else Low) + overall
  averages; attaches High-priority *admin* recommendations per dimension.
- **DTOs:** `ConsolidatedReport`, `DimensionSummary`, `RiskLevelDistribution`.
- See `doc/consolidated_report_logic.md` for the precise algorithm.
- **Frontend:** admin & org-admin `ConsolidatedReportPage.tsx`; hooks
  `hooks/consolidated_reports/`.

## 7. Action Plans & Action Items

- **DB:** `action_plans` (one per assessment, slim container), `action_items` (ternary
  link: action_plan + recommendation + dimension_assessment; `status` todo/in_progress/
  done/approved, `priority` low/medium/high).
- **Endpoints (`/action-plans`):**
  - `GET /action-plans/`, `GET /action-plans/assessment/:assessment_id`
  - `POST /action-plans/:action_plan_id/action-items` (create)
  - `PUT /action-plans/:action_plan_id/action-items/:action_item_id` (update)
  - `DELETE /action-plans/:action_plan_id/action-items/:action_item_id`
- **Service:** `action_plan_service.rs`:
  - `create_action_item`: if no `recommendation_id` supplied, auto-creates an
    `action_plan`-sourced recommendation with `source="action_plan"`.
  - **Immutability rule:** editing an action item whose recommendation is
    `source="admin"` **clones** it into a new `action_plan`-scoped recommendation
    (new UUID, copied fields) and repoints the item. Admin content is never mutated.
- **Code:** `handlers/action_plan.rs`, `repositories/{action_plans,action_items}.rs`
  (`find_action_plan_with_items_by_assessment_id` eager-loads the plan, items,
  recommendations, dimension_assessments, dimensions).
- **Frontend:** `ActionPlansPage.tsx`, `ManageActionPlan.tsx`, `ActionPlanPage.tsx`,
  `ActionPlansListPage.tsx`; hooks `hooks/action_plans/`.

## 8. Organizations & Cooperations (Keycloak-backed)

Users/organizations/cooperations are **not** in the app DB — they live in Keycloak
(Organizations + Groups). The app DB only holds denormalized string IDs.

### 8.1 Organizations (Keycloak Organizations)
- **Endpoints (`/admin/organizations`):**
  - `POST/, GET/, GET/:org_id, PUT/:org_id, DELETE/:org_id`
  - `GET /admin/organizations/:org_id/members`
  - `POST /admin/organizations/:org_id/dimensions` (assign)
  - `GET/PUT /admin/organizations/:org_id/dimensions`
  - `DELETE /admin/organizations/:org_id/dimensions/:dimension_id`
- **Service:** `keycloak.rs` — Keycloak Admin REST: create/get/update/delete org,
  add/list members. Group names may carry a `{orgId}-` UUID prefix that the service
  strips when displaying and reconstructs when updating.
- **DB:** `organisation_dimension` maps orgs (by id string) to `dimension_key`s; the
  repository resolves keys to the English (fallback first-available) dimension row for FK.

### 8.2 Groups (Cooperations)
- **Endpoints (`/admin/groups`):**
  - `POST /admin/organizations/:org_id/groups` (create)
  - `GET /admin/organizations/:org_id/groups` (list by org)
  - `GET /admin/groups/path` (by path), `GET/PUT/DELETE /admin/groups/:group_id`
  - `POST /admin/groups/:group_id/members` (add member), `GET …/members`
- **Service:** `keycloak.rs::create_group/get_groups/get_group_by_id/get_group_by_path/
  update_group/delete_group/add_user_to_group/get_group_members`. `get_group_members`
  also fetches role mappings + full user attributes for each member.

### 8.3 Users
- **Endpoints (`/admin/users`):**
  - `DELETE /admin/users/:user_id`
  - `PUT /admin/users/:user_id/dimensions` (assign per-user dimensions)
- **Self-service (`/user/me`):** `GET`, `PATCH` (profile), `POST /user/me/password`.
- **Service:** `keycloak.rs` — find/create users, email-verification flow
  (`create_user_with_email_verification` generates a temp password `Temp{12 alnum}!`,
  sets `requiredActions:["VERIFY_EMAIL"]`), update attributes (Keycloak replaces on PUT,
  so the service merges), reset password, delete.
- **Handler `add_member` (`user.rs`):** takes `payload.roles` from the request body and
  assigns each realm role; for `coop_admin`/`coop_user` also assigns the matching
  realm-management + account client roles. ⚠️ Roles come from the request body with no
  authorization check (see `RBAC_AND_ROLES.md` §4).

### 8.4 Invitations
- **Endpoints (`/admin/organizations/:org_id/invitations`):**
  - `POST /` invite (`UserInvitationRequest`) — **requires `dgrv_admin`**
  - `GET /` list pending (`PendingInvitation`, includes a fallback path scanning all
    unverified users for the `invited_organization` attribute)
  - `DELETE /:invitation_id` — **requires `dgrv_admin`**
  - `POST /:invitation_id/resend` — **requires `dgrv_admin`**
- **Service:** `keycloak.rs::create_invitation` (form-encoded invite-user; roles and
  expiration are assigned separately in the handler which sets `org_admin` + realm-
  management client roles), `get_organization_invitations` (with the fallback parser),
  delete/resend. The handler also stores an `invited_organization` attribute and
  triggers email verification.

## 9. Offline-First PWA & Sync (Frontend)

A defining architectural property — implemented in the frontend only; the backend is a
standard synchronous REST API.

- **Service Worker:** `vite-plugin-pwa` generates `sw.js` (Workbox). Registered in
  `main.tsx` on `window load`. `registerType: "prompt"`, `skipWaiting: true`,
  `clientsClaim: true`. Runtime caching: API `NetworkFirst` (10s timeout, 200/7d),
  Keycloak OIDC `StaleWhileRevalidate` (10/24h). `navigateFallback: "/index.html"`,
  denylist `/api/`, `/backend/`, `/keycloak/`.
- **IndexedDB (Dexie):** `frontend/src/services/db.ts` — `AppDB` with tables:
  `users, dimensionAssessments, assessments, submissions, organizations, cooperations,
  cooperationUsers, digitalisationGaps, digitalisationLevels, action_plans,
  sync_queue, dimensions, recommendations, organizationDimensions, dimensionWithStates*`
  (v10→v20 schema). Auth tokens/profile stored via `idb-keyval` (`auth_tokens`,
  `auth_profile`).
- **Sync Manager:** `frontend/src/services/sync/syncManager.ts` — `initialize()`
  subscribes to `online`/`offline`; on online runs `syncAll(orgId)` (sequentially
  through per-entity sync services) + `precacheAll(orgId)` (proactive hydration in 4
  languages). `App.tsx` runs `processSyncQueue()` every 5 minutes + on `online`.
- **Sync Queue:** `db.sync_queue` drives writes; `syncService.ts::trySync` retries up
  to `MAX_RETRIES=3`, then drops. `addToSyncQueue` triggers a sync.
- **Offline auth:** `ProtectedRoute` trusts cached `auth_tokens` after a 3s timeout
  when offline, so users can keep working without Keycloak reachability.
- **UI:** `OfflineBanner` + `useOnlineStatus`/`usePendingSyncCount`.
- See `docs/frontend/offline-sync-conflict.md` and `sync-manager.md`, plus the legacy
  `frontend/docs/OFFLINE_ARCHITECTURE.md`.

## 10. Internationalization

- **UI:** `i18next` + `react-i18next` + `LanguageDetector`. Locales in
  `frontend/src/i18n/locales/{en,fr,pt,ss}.json`. Fallback `en`; detection via
  localStorage `i18nextLng` then `navigator`.
- **Report templates:** localized labels in
  `pdf_generator.rs::get_labels(lang)` (en/fr/pt/ss).
- **DB content:** `language` column on `dimensions`, `current_states`,
  `desired_states`, `recommendations`, `gaps`; grouped by `dimension_key`.
- **Admin locale editing:** `DimensionTranslationsPage.tsx`, `ContentLanguageSelector`,
  `AdminLangFilterBar`.

## 11. Reporting / OpenAPI / Client Codegen

- Backend serves `/docs` (Swagger UI) and `/docs/openapi.json`.
- `scripts/fetch_openapi.js` fetches the spec into `frontend/openapi.json` (with local
  fallback).
- `frontend` `npm run codegen` runs `openapi-ts --input openapi.json --output
  ./src/openapi-client --client fetch`.
- `CI` uses this in `openapi_codegen` job (uploads the generated client as an artifact).
- See `API_GENERATION.md`.

## 12. Seeding (dev data)

- `src/bin/seed.rs` (`cargo run --bin seed`): seeds 7 sample dimensions, levels 1–5
  current+desired states, generic recommendations (High/Med/Low), generic gaps.
  Clears related rows first — dev only.