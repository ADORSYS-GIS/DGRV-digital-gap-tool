# CI/CD Pipeline — DGRV Digital Gap Assessment Tool

> **As-built** description of the GitHub Actions workflows in `.github/workflows/`.

## 1. Overview

Four workflow files:

| File | Trigger | Scope |
|---|---|---|
| `ci.yml` | `pull_request` | Frontend checks: OpenAPI codegen, build, lint, prettier, tsc, unit tests |
| `rust-backend.yml` | `pull_request` | Rust backend checks: build, test (nextest), fmt, clippy, docs |
| `deploy.yml` | `push` to `main` | Build & push the **frontend** image to GHCR |
| `active-deployment.yml` | `push` to `main` **and any branch** | Build & push **frontend + backend** images to GHCR, then SSH-deploy to EC2 |

> The active end-to-end pipeline is `active-deployment.yml`. `deploy.yml` is an older,
> frontend-only variant (still enabled on `main`) — it overlaps but does not deploy.

GitHub secrets consumed by the deployment job (`active-deployment.yml`):

| Secret | Used for |
|---|---|
| `GITHUB_TOKEN` | push images to GHCR (auto-provided) |
| `EC2_HOST` | target server host |
| `EC2_USER` (default `ubuntu`) | SSH user |
| `EC2_SSH_KEY` | SSH private key |
| `EC2_APP_DIR` (default `transac`) | remote project dir name |
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | app DB |
| `DGAT_KEYCLOAK_CLIENT_SECRET`, `DGAT_JWT_SECRET`, `DGAT_KEYCLOAK_ADMIN_TOKEN` | backend |
| `KEYCLOAK_ADMIN`, `KEYCLOAK_ADMIN_PASSWORD` | Keycloak master admin |
| `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD` | MinIO |
| `VITE_KEYCLOAK_URL`, `VITE_API_BASE_URL` | frontend build args |

## 2. Pull-Request CI

### `ci.yml` (frontend)
Run on every PR. Pipeline of jobs (with caching by `github.sha`):

```
openapi_codegen ──┐
frontend_install ─┴─┬─► frontend_build
                    ├─► frontend_lint      (npm run lint:check)
                    ├─► frontend_prettier  (npm run prettier:check)
                    ├─► frontend_typescript (npm run ts:check)
                    └─► frontend_unit_tests (npm run test:unit → coverage → artifact)
```

- `openapi_codegen` runs `npm run codegen` (`openapi-ts --input openapi.json --client
  fetch`) and uploads `frontend/src/openapi-client` as an artifact; the downstream jobs
  download it so they don't need a live backend.
- SonarQube analysis job is present but **commented out** (needs `SONAR_TOKEN` /
  `SONAR_HOST_URL`).

### `rust-backend.yml` (backend)
Run on every PR. Jobs share a `setup` job that installs the stable Rust toolchain
(rustfmt + clippy) and caches `~/.cargo` + `./target` keyed on `Cargo.lock`:

```
setup ──┬─► Build   (cargo build --workspace --all-targets --all-features)
        ├─► Test    (cargo nextest run --workspace --all-targets --all-features --no-fail-fast)
        ├─► Lint    (cargo fmt --all --check  +  cargo clippy -- -D warnings)
        └─► Docs    (cargo doc --workspace --all-features --no-deps)
```

## 3. Continuous Deployment (`active-deployment.yml`)

Triggered on push to `main` or any branch. Two jobs:

### 3.1 `build-and-push`
- Sets up Docker Buildx.
- Logs into `ghcr.io` with `GITHUB_TOKEN`.
- Computes image names lowercased from `${{ github.repository }}`: e.g.
  `ghcr.io/<owner>/<repo>/frontend` and `…/backend`.
- Builds and pushes **both** images with two tags each: `latest` and the short git SHA
  (`${GITHUB_SHA:0:7}`).
- Uses GitHub Actions cache (`cache-from: type=gha`, `cache-to: type=gha,mode=max`).
- Outputs `git-sha`, `image-frontend`, `image-backend` for the deploy job.

### 3.2 `deploy` (depends on build-and-push)
Uses `appleboy/ssh-action` to SSH into the EC2 host and run an inline script:

```bash
APP_DIR="${EC2_APP_DIR:-transac}"
mkdir -p "$APP_DIR"; cd "$APP_DIR"

# Pull code (for docker-compose.yml) — clone if not present
if [ -d ".git" ]; then git pull origin main; \
else git clone https://github.com/${{ github.repository }}.git .; fi

# Write .env with secrets injected from GH secrets
cat > .env <<EOF
FRONTEND_IMAGE=ghcr.io/<repo>/frontend:<sha>
BACKEND_IMAGE=ghcr.io/<repo>/backend:<sha>
POSTGRES_USER=...  POSTGRES_PASSWORD=...  POSTGRES_DB=...
DGAT_KEYCLOAK_CLIENT_SECRET=...  DGAT_JWT_SECRET=...  DGAT_KEYCLOAK_ADMIN_TOKEN=...
KEYCLOAK_ADMIN=...  KEYCLOAK_ADMIN_PASSWORD=...
MINIO_ROOT_USER=...  MINIO_ROOT_PASSWORD=...
VITE_KEYCLOAK_URL=...  VITE_API_BASE_URL=...
EOF

docker compose pull
docker compose up -d
docker system prune -f
```

Key points:
- The `.env` written by the script **overwrites** the remote `.env` each deploy, seeded
  entirely from GitHub secrets. Any extra env vars not in the secret set are lost.
- `docker compose pull` pulls the just-pushed images (matched by the `FRONTEND_IMAGE` /
  `BACKEND_IMAGE` overrides in `.env`, since `docker-compose.yml` uses
  `image: ${FRONTEND_IMAGE:-...}`).
- No health gate or rollback stage — if `up -d` brings up a broken image, the previous
  image is gone (pruned). Consider pinning to the SHA tag and keeping the prior SHA for
  manual rollback.

## 4. Image Registry & Tagging

- Registry: **GHCR** (`ghcr.io`).
- Two images per repo: `frontend`, `backend`.
- Tags: `:latest` (mutable, rolling) and `:<short-sha>` (immutable, per build).
- `docker-compose.yml` honors `FRONTEND_IMAGE` / `BACKEND_IMAGE` env overrides so the
  CI can pin the exact build via `.env`.

## 5. Container Image Build (reference)

### Backend — `infrastructure/Dockerfile.backend`
Multi-stage build:
1. `rust:1.88.0-slim-bookworm` base; install `pkg-config libssl-dev build-essential`.
2. Pre-build dependencies (`Cargo.toml`/`Cargo.lock` + `migration/`, fake `src/main.rs`)
   to cache the dependency layer.
3. Copy `src/` and `cargo build --release`.
4. Runtime image `debian:bookworm-slim`; installs `libssl-dev ca-certificates curl
   **chromium**`; sets `CHROME=/usr/bin/chromium` (needed for PDF/Word generation);
   copies the binary as `/app/dgrv-digital-gap-tool`, plus `doc/` and `templates/`.
5. Entrypoint `/app/dgrv-digital-gap-tool`.

### Frontend — `infrastructure/Dockerfile.frontend`
1. `node:20-slim`; `npm ci`; copy source; pass build-time VITE_* args; `npm run build`.
2. Runtime `nginx:alpine`; copies `dist/` to `/usr/share/nginx/html`, the `.env` file,
   and `infrastructure/nginx.conf` as the default site; installs `curl openssl bash`;
   exposes 80/443; runs Nginx.

## 6. Manual Deployment (no CI)

See `DEPLOYMENT.md` §3 and §6. In short: SSH in, `git pull`, ensure `.env`, then
`docker compose up -d --build` (build on server) or `docker compose pull && docker
compose up -d` (use registry images).

## 7. Known Gaps / Recommendations

1. `active-deployment.yml` triggers on **every** branch push, not just `main`. This
   overwrites production on any branch push that lands on the default branch reference
   used by the runner. Tighten the trigger to `main` (and/or a `deploy:` environment
   with approvals) to prevent accidental prod deploys.
2. `deploy.yml` (frontend-only) and `active-deployment.yml` both run on `main`; they
   duplicate work and the frontend-only one cannot deploy the backend. Consider
   removing `deploy.yml`.
3. The deploy script **overwrites `.env`** each run. If you rely on any host-local env
   var (e.g. SMTP creds not stored as GH secrets), it will be lost. Move all required
   config into GitHub secrets, or change the script to merge instead of overwrite.
4. No automated tests gate the deploy — PR checks run, but `main` can be pushed
   directly (bypassing PR checks) and `deploy` will still run. Enable branch
   protection on `main` (require PR + passing checks).
5. No rollback. Keep the previous SHA tag and add a manual rollback override
   (`BACKEND_IMAGE=<prev-sha>` in `.env` + `docker compose up -d`).
6. OpenAPI spec used by frontend codegen lives in `frontend/openapi.json` (committed).
   To regenerate after backend API changes: start the backend, run
   `node scripts/fetch_openapi.js` (writes `frontend/openapi.json`), then
   `npm run codegen` in `frontend/`. See `API_GENERATION.md`.