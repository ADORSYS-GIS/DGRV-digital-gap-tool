# Development Setup — DGRV Digital Gap Assessment Tool

> How to bring the full stack up locally for development.

## 1. Prerequisites

- **Docker** + **Docker Compose v2** (the `docker compose` plugin)
- **Node.js 20** and **npm** (frontend dev)
- **Rust 1.88** toolchain (`rustup`; `cargo`) for backend dev without Docker
- **PostgreSQL client** (optional, for direct DB access)

## 2. Repository Layout

```
DGRV-digital-gap-tool/
├── src/                 # Rust backend (Axum)
├── migration/           # SeaORM migrations crate
├── frontend/            # React PWA (Vite)
├── infrastructure/      # Dockerfiles, nginx.conf, keycloak realm, postgres init, themes
├── scripts/             # backup/restore, ssl, keycloak provisioning, openapi fetch
├── templates/           # report.html (Tera) for PDF/Word generation
├── tests/               # backend integration / openapi validation tests
├── doc/ docs/           # documentation
├── docker-compose.yml
├── Cargo.toml
└── README.md
```

## 3. Running the Full Stack with Docker (recommended)

This brings up Postgres×2, MinIO, Keycloak, backend, frontend — all wired together.

```bash
git clone <repo>
cd DGRV-digital-gap-tool

# 1. Create .env
cp .env.example .env
# edit .env: choose strong secrets; keep DGAT_KEYCLOAK_URL=http://keycloak:8080/keycloak
# (internal container URL) and DGAT_KEYCLOAK_PUBLIC_URL=http://localhost:8080/keycloak
# (what matches the issuer on localhost). For local-only, public == internal URL works.

# 2. Build & start everything
docker compose up -d --build

# 3. Follow logs
docker compose logs -f backend
# look for: "Database migrations completed" and "Server listening on 0.0.0.0:3001"

# 4. Seed sample data (optional)
docker compose exec backend /app/dgrv-digital-gap-tool  # already running; use the seed bin instead:
docker compose run --rm  backend /app/seed   # if you wire a seed entrypoint; else build & run src/bin/seed locally
```

### Local URLs (with docker-compose)
- Frontend: `http://localhost:8000` (run `npm run dev` in `frontend/`) **or** the
  container at `http://localhost:8110`.
- Backend API: `http://localhost:3001` (container host port 3001).
- Swagger UI: `http://localhost:3001/docs`.
- Keycloak Admin: `http://localhost:8080/keycloak` — admin/admin123
  (bootstrap user `360@dgrv.coop` / temp password `dgrv@coop360` after provisioning).
- MinIO Console: `http://localhost:9001` (root creds from `.env`).

> Keycloak provisioning runs on container start (gated by `.user_provisioned`). To
> re-run: `docker exec dgrv-keycloak rm -f /opt/keycloak/bin/.user_provisioned` then
> `docker compose restart keycloak`.

## 4. Running the Backend Locally (without Docker)

Use this when actively developing the Rust backend, pointing at the dockerized
Postgres/MinIO/Keycloak.

```bash
# Keep db / keycloak / minio up (not the backend container):
docker compose up -d db keycloak-db keycloak minio

# App DB is exposed on host 127.0.0.1:5430
export DGAT_DATABASE_URL="postgres://postgres:postgres@localhost:5430/dgat"
export DGAT_PORT=3001
export DGAT_KEYCLOAK_URL="http://localhost:8080/keycloak"
export DGAT_KEYCLOAK_PUBLIC_URL="http://localhost:8080/keycloak"
export DGAT_KEYCLOAK_REALM=digital-gap
export DGAT_KEYCLOAK_CLIENT_ID=dgat-admin-client
export DGAT_KEYCLOAK_CLIENT_SECRET=dev-secret
export DGAT_JWT_SECRET=dev-secret
export DGAT_KEYCLOAK_ADMIN_TOKEN=test-token
export DGAT_MINIO_ENDPOINT=http://localhost:9000
export DGAT_MINIO_ACCESS_KEY=<MINIO_ROOT_USER>
export DGAT_MINIO_SECRET_KEY=<MINIO_ROOT_PASSWORD>
export DGAT_MINIO_BUCKET_NAME=reports
export DGAT_MINIO_USE_SSL=false
export CHROME=/usr/bin/chromium     # or your local Chrome binary — needed for PDF/Word gen

cargo run            # runs the server (migrations applied on boot)
cargo run --bin seed # seed sample data
cargo test           # unit + integration tests (see tests/)
```

## 5. Running the Frontend Locally

```bash
cd frontend
cp .env.example .env   # edit: VITE_KEYCLOAK_URL=http://localhost:8080
                       #       VITE_KEYCLOAK_REALM=digital-gap
                       #       VITE_KEYCLOAK_CLIENT_ID=dgat-client
                       #       VITE_API_BASE_URL=http://localhost:3001

npm install          # also runs `npm run codegen` (postinstall)
npm run dev          # Vite dev server on http://localhost:8000
```

Generating the API client requires `frontend/openapi.json`:
- Auto-fetched by `npm run dev` (`predev` runs `node ../scripts/fetch_openapi.js`,
  which hits `http://127.0.0.1:3001/docs/openapi.json`). Start the backend first.
- Manually: `node scripts/fetch_openapi.js`, then `npm run codegen`.

## 6. Common Commands

### Backend (Rust)
| Command | Purpose |
|---|---|
| `cargo run` | run backend server (runs migrations first) |
| `cargo run --bin seed` | seed sample dimensions/states/recommendations/gaps |
| `cargo build --workspace --all-targets --all-features` | full build |
| `cargo nextest run --workspace --all-targets --all-features --no-fail-fast` | run all tests (CI uses this) |
| `cargo fmt --all --check` | format check |
| `cargo clippy --workspace --all-targets --all-features -- -D warnings` | lint (CI enforces) |
| `cargo doc --workspace --all-features --no-deps` | build docs |
| `cargo test test_openapi_spec_is_valid` | validate the OpenAPI spec |

### Frontend
| Command | Purpose |
|---|---|
| `npm run dev` | Vite dev server (also fetches openapi.json first) |
| `npm run build` | production build → `dist/` |
| `npm run lint:check` / `npm run lint` | ESLint (CI uses `lint:check`) |
| `npm run prettier:check` | Prettier check |
| `npm run ts:check` | TypeScript type check |
| `npm run test:unit` / `npm run coverage` | Vitest unit tests |
| `npm run codegen` | regenerate `src/openapi-client` from `openapi.json` |

## 7. Environment Variables Catalog

### Backend — `src/config.rs` / `.env`
All keys use the `DGAT_` prefix and have dev defaults in `config.rs`.

| Env var | Default | Purpose |
|---|---|---|
| `DGAT_DATABASE_URL` | `postgres://postgres:postgres@localhost:5435/dgat` | App DB |
| `DGAT_HOST` | `0.0.0.0` | bind host |
| `DGAT_PORT` | `3001` | bind port |
| `DGAT_SERVER_URL` | derived `http://{host}:{port}` | OpenAPI server URL |
| `DGAT_KEYCLOAK_URL` | `http://localhost:8080` | internal Keycloak (Admin REST + JWKS fetch) |
| `DGAT_KEYCLOAK_PUBLIC_URL` | `http://localhost:8080` | public Keycloak — used for JWT issuer check |
| `DGAT_KEYCLOAK_REALM` | `digital-gap` | realm |
| `DGAT_KEYCLOAK_CLIENT_ID` | `dgat-client` | (compose overrides to `dgat-admin-client` for server) |
| `DGAT_KEYCLOAK_CLIENT_SECRET` | `dev-secret` | service-account secret |
| `DGAT_JWT_SECRET` | `dev-secret` | (used as a fallback; Keycloak JWKS is the real validation) |
| `DGAT_KEYCLOAK_ADMIN_TOKEN` | `your_admin_token` | legacy admin token |
| `DGAT_MINIO_ENDPOINT` | `http://localhost:9000` | MinIO/S3 endpoint |
| `DGAT_MINIO_ACCESS_KEY` | `minioadmin` | |
| `DGAT_MINIO_SECRET_KEY` | `minioadmin` | |
| `DGAT_MINIO_BUCKET_NAME` | `reports` | bucket (auto-created) |
| `DGAT_MINIO_USE_SSL` | `false` | |
| `CHROME` | `/usr/bin/chromium` (in image) | headless Chrome path for PDF/Word generation |

### Keycloak (docker-compose) — env vars read by the `keycloak` container
`KC_DB*`, `KEYCLOAK_ADMIN*`, `KEYCLOAK_REALM`, `KEYCLOAK_FRONTEND_URL`,
`KEYCLOAK_SERVER`, `KC_PROXY_HEADERS`, `KC_FEATURES`, `KC_HOSTNAME*`,
`KC_HTTP_ENABLED`, `KC_HOSTNAME_STRICT`, `SSL_CERT_PATH`, `SSL_KEY_PATH`,
`KC_SSL_TRUSTSTORE_*`, `KC_SPI_EMAIL_DEFAULT_*`, `KC_HTTP_RELATIVE_PATH`,
`KEYCLOAK_START_CMD`, `DGAT_KEYCLOAK_CLIENT_SECRET`.

### Frontend — `frontend/.env`
| Env var | Purpose |
|---|---|
| `VITE_KEYCLOAK_URL` | Keycloak public root (e.g. `https://gat.dgrvcoop360.com/keycloak`) |
| `VITE_KEYCLOAK_REALM` | `digital-gap` |
| `VITE_KEYCLOAK_CLIENT_ID` | `dgat-client` |
| `VITE_API_BASE_URL` | backend API base |
| `VITE_APP_PUBLIC_URL` | app public URL |

### Compose-only (read by `docker-compose.yml`)
`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `MINIO_ROOT_USER`,
`MINIO_ROOT_PASSWORD`, `CORS_ORIGIN`, `FRONTEND_IMAGE`, `BACKEND_IMAGE`, `SERVER_DN`.

## 8. Testing

- **Backend:** unit tests in modules + integration tests in `tests/`
  (`integration_test.rs`, `minio_integration_test.rs`, `openapi_validation.rs`). Run with
  `cargo nextest run` (CI). Some integration tests need live DB + MinIO.
- **Frontend:** Vitest + Testing Library; `npm run test:unit` → coverage → artifact in CI.
- **OpenAPI validation:** `cargo test test_openapi_spec_is_valid` parses the generated
  spec with `openapiv3`; release builds also panic on invalid specs at startup.

## 9. Regenerating the API Client (after backend API changes)

```bash
# 1. Backend running on :3001
# 2. fetch fresh spec
node scripts/fetch_openapi.js        # writes frontend/openapi.json (with local fallback)
# 3. regenerate the typed client
cd frontend && npm run codegen
```

The CI `openapi_codegen` job does steps 2–3 and uploads the result as an artifact for
downstream PR jobs.

## 10. Conventions

- No comments in source unless necessary (per repo style).
- Rust: follow `rustfmt` + `clippy` (CI fails on warnings).
- Frontend: ESLint + Prettier enforced in CI (`lint:check`, `prettier:check`).
- Commit messages use the `type(): subject` convention seen in history.
- `.env` is gitignored — never commit secrets. Use GitHub Actions/Secrets for CI.
- Documentation: keep `docs/` as the source of truth; `doc/` holds older/legacy docs.