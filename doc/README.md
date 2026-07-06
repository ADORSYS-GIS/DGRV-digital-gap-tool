# Documentation Index — DGRV Digital Gap Assessment Tool

This is the handover documentation set. Start here.

## Primary (read first)
- [`../README.md`](../README.md) — project overview & quick start
- [`ARCHITECTURE.md`](ARCHITECTURE.md) — **as-built** system architecture, components, data flow
- [`DEPLOYMENT.md`](DEPLOYMENT.md) — server setup, docker compose, TLS (certbot), Keycloak provisioning
- [`RBAC_AND_ROLES.md`](RBAC_AND_ROLES.md) — all roles, what each can do, where/how authorization is enforced (and where it isn't)
- [`DATABASE_SCHEMA.md`](DATABASE_SCHEMA.md) — full DB schema, ER, enums, migrations, drift notes
- [`FEATURES.md`](FEATURES.md) — end-to-end feature index: where each feature lives in code + DB + API + frontend
- [`CI_CD_PIPELINE.md`](CI_CD_PIPELINE.md) — GitHub Actions workflows, image build & push, SSH deploy
- [`BACKUP_AND_RECOVERY.md`](BACKUP_AND_RECOVERY.md) — backup/restore runbook, scheduling, DR procedure
- [`DEVELOPMENT.md`](DEVELOPMENT.md) — local full-stack setup, env-var catalog, commands, testing

## Auth & Security (deep dive)
- [`RBAC_AND_AUTH_SYSTEM.md`](RBAC_AND_AUTH_SYSTEM.md) — exhaustive Keycloak realm/client/token/mapper config, claim extraction, offline token persistence, bootstrap provisioning, security-gaps analysis (1179 lines)

## Rust backend internals (`docs/rust/`)
- [`rust/rust-architecture.md`](rust/rust-architecture.md)
- [`rust/rust-api-handlers.md`](rust/rust-api-handlers.md)
- [`rust/rust-routes.md`](rust/rust-routes.md)
- [`rust/rust-services.md`](rust/rust-services.md)
- [`rust/rust-repositories.md`](rust/rust-repositories.md)
- [`rust/rust-entities.md`](rust/rust-entities.md)
- [`rust/rust-dto.md`](rust/rust-dto.md)
- [`rust/rust-error-handling.md`](rust/rust-error-handling.md)
- [`rust/rust-caching.md`](rust/rust-caching.md)
- [`rust/rust-openapi.md`](rust/rust-openapi.md)
- [`rust/rust-best-practices.md`](rust/rust-best-practices.md)
- [`rust/rust-testing.md`](rust/rust-testing.md)

## Frontend internals (`docs/frontend/`)
- [`frontend/api-integration.md`](frontend/api-integration.md)
- [`frontend/authentication.md`](frontend/authentication.md)
- [`frontend/components.md`](frontend/components.md)
- [`frontend/data-types.md`](frontend/data-types.md)
- [`frontend/database.md`](frontend/database.md)
- [`frontend/design.md`](frontend/design.md)
- [`frontend/forms.md`](frontend/forms.md)
- [`frontend/hooks.md`](frontend/hooks.md)
- [`frontend/internationalization.md`](frontend/internationalization.md)
- [`frontend/layout.md`](frontend/layout.md)
- [`frontend/offline-sync-conflict.md`](frontend/offline-sync-conflict.md)
- [`frontend/pages.md`](frontend/pages.md)
- [`frontend/progress.md`](frontend/progress.md)
- [`frontend/routing.md`](frontend/routing.md)
- [`frontend/security.md`](frontend/security.md)
- [`frontend/sync-manager.md`](frontend/sync-manager.md)
- [`frontend/tables.md`](frontend/tables.md)
- [`frontend/testing.md`](frontend/testing.md)
- [`frontend/ui-design.md`](frontend/ui-design.md)
- [`frontend/user_manual.md`](frontend/user_manual.md)

## Design (legacy/older)
- [`templates/design.md`](templates/design.md), [`templates/progress.md`](templates/progress.md), [`templates/ui-ux-gold-standard.md`](templates/ui-ux-gold-standard.md)

## Other (`doc/` — older, kept for reference)
- [`../doc/Arc42.md`](../doc/Arc42.md) — design-target architecture (aspirational; some details differ from the as-built)
- [`../doc/USER_MANUAL.md`](../doc/USER_MANUAL.md) — end-user operational manual (v7.0)
- [`../doc/consolidated_report_logic.md`](../doc/consolidated_report_logic.md) — consolidated report algorithm
- [`../doc/MinIO_Integration.md`](../doc/MinIO_Integration.md) — MinIO/S3 storage design
- [`../doc/assessment_flow_updates.md`](../doc/assessment_flow_updates.md) — assessment flow change spec
- [`../doc/Database_ER_Diagram.md`](../doc/Database_ER_Diagram.md), [`../doc/Database_ER_Diagram_Update.md`](../doc/Database_ER_Diagram_Update.md) — older ER diagrams (superseded by `DATABASE_SCHEMA.md`)

## Root-level
- [`../API_GENERATION.md`](../API_GENERATION.md) — OpenAPI codegen workflow
- [`../CODE_IMPROVEMENTS.md`](../CODE_IMPROVEMENTS.md) — frontend improvement notes (advisory)

## Frontend-local docs (`frontend/docs/`)
- `AUTHENTICATION.md`, `CORS_FIX.md`, `frontend_Arc_Document.md`, `Keycloak.md`,
  `OFFLINE_ARCHITECTURE.md`, `workflow.md`
- > ⚠️ Several of these predate the Keycloak 26 `digital-gap` realm migration and use
  > older role names (`Org_User`, `Org_Expert`, `DGRV_Admin`) / realm names
  > (`sustainability-realm`). Prefer `RBAC_AND_AUTH_SYSTEM.md` and the docs above for
  > the current truth; treat these as historical context only.