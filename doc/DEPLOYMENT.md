# Deployment — DGRV Digital Gap Assessment Tool

> **As-built** deployment runbook for a fresh server. This is the procedure the team has
> been using: SSH into the EC2 host, pull code, bring up docker-compose, issue TLS certs
> with certbot, and run ports through host Nginx.

## 1. Target Environment

- **Host:** a single EC2 instance (Ubuntu) — `gat.dgrvcoop360.com` (A record → EC2 public IP).
- **Runtime:** Docker + Docker Compose (the `docker compose` v2 plugin).
- **Edge:** host-level Nginx (installed on the OS, not in a container) terminates TLS
  (Let's Encrypt via `certbot`) and reverse-proxies into the docker network.
- The compose stack runs 6 containers: `backend`, `frontend`, `keycloak`, `keycloak-db`,
  `db`, `minio`.

## 2. Prerequisites on a Fresh Server

Open the following inbound security-group / firewall ports **only as needed**:

| Port | Exposed to | Purpose |
|---|---|---|
| 22 | SSH only | admin access |
| 80 | public | HTTP → ACME challenge + redirect to HTTPS |
| 443 | public | HTTPS (host Nginx) |
| 3001 | private (127.0.0.1) | backend direct (optional, debug) |
| 5430 | private (127.0.0.1) | app DB direct (optional, debug) |
| 8080 | private (127.0.0.1) | keycloak direct (optional, debug) |
| 9000/9001 | private | MinIO API/console (optional) |

Install on the host:

```bash
# Docker engine + compose plugin (Ubuntu)
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg lsb-release
# (install docker per docs.docker.com for your distro)
sudo usermod -aG docker $USER   # re-login afterwards

# Host Nginx + certbot
sudo apt-get install -y nginx certbot python3-certbot-nginx

# (optional, for off-site backups) rclone
curl https://rclone.org/install.sh | sudo bash
```

## 3. Bring the Stack Up (First Time)

```bash
# 1. SSH into the server
ssh -i <key.pem> ubuntu@gat.dgrvcoop360.com

# 2. Get the project
cd ~
git clone https://github.com/<owner>/DGRV-digital-gap-tool.git
cd DGRV-digital-gap-tool

# 3. Create the .env file with real secrets (see §4)
cp .env.example .env
# edit .env — NEVER commit it. It is gitignored.

# 4. (optional, only if you build on-server) build images
docker compose build

# 5. Start the whole stack
docker compose up -d
```

`docker compose up -d` will:
- start `keycloak-db` and `db` (health-checked),
- start `minio` (health-checked),
- start `keycloak` — which runs `keycloak-startup.sh`: boots Keycloak with
  `--import-realm` (loads `infrastructure/keycloak/realm-export.json`), waits for port
  8080, then runs `scripts/keycloak-provisioning.sh` (see below),
- start `backend` — runs DB migrations, validates OpenAPI, init MinIO bucket, listens
  on `:3001`,
- start `frontend` — serves the built SPA via its inner Nginx on `:80`.

Verify:

```bash
docker compose ps
docker compose logs -f backend      # watch for "migrations completed" + "Server listening"
curl -s http://localhost:3001/docs   # Swagger UI (inside the net)
```

### What `keycloak-provisioning.sh` does on first run
(subject to a run-once `.user_provisioned` marker)

1. Logs into master realm as `admin` / `admin123`.
2. Creates the bootstrap user `360@dgrv.coop` with temp password `dgrv@coop360`.
3. Grants it all `realm-management` client roles + `application_admin` + `dgrv_admin`.
4. Grants `realm-admin` to the `dgat-admin-client` service account.
5. Configures realm SMTP from `KC_SPI_EMAIL_DEFAULT_*` env vars.
6. Sets realm `frontendUrl` to the public HTTPS URL so action-token emails use it.
7. Resets the `dgat-admin-client` secret (the realm export masks it with `***`) to
   `$DGAT_KEYCLOAK_CLIENT_SECRET`.
8. Adds the `organization` + `user_attributes` scopes to `dgat-client`.

To re-provision from scratch, delete the marker inside the container:
`docker exec dgrv-keycloak rm -f /opt/keycloak/bin/.user_provisioned` then restart
keycloak.

## 4. The `.env` File

`.env` is read by `docker compose` and injected into containers. Example production
`.env` (placeholder values — replace with real secrets):

```dotenv
# ── Image overrides (set by CI; for on-server builds, delete these to use built images) ──
# FRONTEND_IMAGE=ghcr.io/<owner>/<repo>/frontend:<sha>
# BACKEND_IMAGE=ghcr.io/<owner>/<repo>/backend:<sha>

# ── Database ──
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<strong-password>
POSTGRES_DB=dgat

# ── Keycloak ──
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=<strong-password>
DGAT_KEYCLOAK_CLIENT_SECRET=<strong-secret>     # must match the dgat-admin-client secret
DGAT_JWT_SECRET=<strong-secret>
DGAT_KEYCLOAK_ADMIN_TOKEN=<token>
DGAT_KEYCLOAK_URL=http://keycloak:8080/keycloak           # internal (container)
DGAT_KEYCLOAK_PUBLIC_URL=https://gat.dgrvcoop360.com/keycloak  # public (for JWT issuer check)
VITE_KEYCLOAK_URL=https://gat.dgrvcoop360.com/keycloak
VITE_KEYCLOAK_REALM=digital-gap
VITE_KEYCLOAK_CLIENT_ID=dgat-client
VITE_API_BASE_URL=https://gat.dgrvcoop360.com/api

# ── MinIO ──
MINIO_ROOT_USER=<minio-user>
MINIO_ROOT_PASSWORD=<strong-password>

# ── Email (for Keycloak SMTP — invites & verification) ──
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_FROM=dgrvesw@gmail.com
EMAIL_FROM_DISPLAY_NAME=DGRV COOPERATION
EMAIL_USER=<smtp-user>
EMAIL_PASSWORD=<smtp-password>
EMAIL_SSL=false
EMAIL_STARTTLS=true
EMAIL_AUTH=true

# ── CORS / URLs ──
CORS_ORIGIN=https://gat.dgrvcoop360.com

# Server domain used by scripts/generate_ssl.sh (self-signed fallback only; not used in prod with certbot)
SERVER_DN=gat.dgrvcoop360.com
```

> The backend also reads `DGAT_*` vars directly (see `src/config.rs`). In
> docker-compose, the `environment:` block for `backend` re-derives most of them from
> the values above (e.g. `DGAT_DATABASE_URL=postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}`).

## 5. TLS Certificates (Let's Encrypt via `certbot`)

The host Nginx terminates TLS. The **container** Nginx in `frontend` listens on port 80
only (`infrastructure/nginx.conf`, comment "SSL is terminated by host Nginx").

### 5.1 Install / renew a real certificate

```bash
# Stop or ensure host Nginx is up on :80 first (it will serve the ACME challenge)
sudo systemctl start nginx

# Obtain the cert (this edits the host nginx site for you)
sudo certbot --nginx -d gat.dgrvcoop360.com \
  --redirect --agree-tos -m <admin-email> --no-eff-email

# Certbot installs a systemd timer for auto-renew by default; verify:
sudo systemctl list-timers | grep certbot
sudo certbot renew --dry-run
```

This produces `/etc/letsencrypt/live/gat.dgrvcoop360.com/fullchain.pem` and `privkey.pem`.

### 5.2 Configure host Nginx to use the cert and proxy to the stack

A minimal host-site (`/etc/nginx/sites-available/gat` → enabled):

```nginx
server {
    listen 80;
    server_name gat.dgrvcoop360.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name gat.dgrvcoop360.com;

    ssl_certificate     /etc/letsencrypt/live/gat.dgrvcoop360.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/gat.dgrvcoop360.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    client_max_body_size 50m;

    # SPA + inner-proxy (frontend container proxies /keycloak/ and /api/)
    location / {
        proxy_pass http://127.0.0.1:8110;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }

    # Or, route directly (bypassing the frontend's inner proxy):
    # location /api/     { proxy_pass http://127.0.0.1:3001/; proxy_set_header Host $host; }
    # location /keycloak/{ proxy_pass http://127.0.0.1:8080/keycloak/; ... }

    # Make sure the frontend SPA's service worker / manifest aren't cached aggressively
    location ~* /(sw\.js|workbox-.*\.js|manifest\.webmanifest)$ {
        proxy_pass http://127.0.0.1:8110;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}
```

Reload: `sudo nginx -t && sudo systemctl reload nginx`.

### 5.3 Self-signed fallback (dev only)

`scripts/generate_ssl.sh` produces a self-signed cert at `ssl/nginx.crt` / `ssl/nginx.key`
for local/EC2-bare-IP setups. It is **not** what you want on a public domain with a real
hostname — use certbot instead.

## 6. Updating an Existing Deployment (manual)

```bash
ssh -i <key.pem> ubuntu@gat.dgrvcoop360.com
cd ~/DGRV-digital-gap-tool
git pull origin main
# re-read .env (do NOT clobber — keep your secrets)
docker compose pull          # if using registry images
docker compose up -d --build # rebuild if building on server
docker compose logs -f backend
```

The automated equivalent of this is the `deploy` job in the CI pipeline
(`active-deployment.yml`) — see `CI_CD_PIPELINE.md`.

## 7. Keycloak Realm Updates

Two layers cooperate:
- `infrastructure/keycloak/realm-export.json` is imported on every Keycloak **boot**
  (`--import-realm`). Keycloak only applies it for resources that **don't already
  exist** (import is non-destructive after first import).
- `scripts/keycloak-provisioning.sh` runs every container start but is gated by the
  `.user_provisioned` marker for the user-creation steps; the role assignments and
  SMTP/frontendUrl/secret/scope steps re-run each start (idempotent).

If you need to change the realm config (clients, mappers, scopes), edit
`realm-export.json` (or export a fresh copy: `docker exec dgrv-keycloak kc.sh export
--dir /tmp/realm-export --realm digital-gap --users realm_file`) and **restart
Keycloak on a fresh DB** — on an existing DB Keycloak will NOT overwrite existing
resources on import.

## 8. Common Operational Tasks

| Task | Command |
|---|---|
| View logs (all) | `docker compose logs -f` |
| Backend logs | `docker compose logs -f backend` |
| Restart one service | `docker compose restart backend` |
| Shell into backend | `docker compose exec backend bash` |
| Open psql on app DB | `docker compose exec db psql -U postgres -d dgat` |
| Open psql on Keycloak DB | `docker compose exec keycloak-db psql -U postgres -d keycloak` |
| Keycloak admin CLI | `docker compose exec keycloak /opt/keycloak/bin/kcadm.sh` |
| Re-run provisioning | delete `.user_provisioned` marker (see §3), `docker compose restart keycloak` |
| Back up | `bash scripts/backup.sh` (as root, see `BACKUP_AND_RECOVERY.md`) |
| Restore | `bash scripts/restore.sh /opt/dgrv-backups/<file>.tar.gz` |

## 9. Troubleshooting

- **Backend fails to start: "Invalid OpenAPI specification"** — release builds panic on
  an invalid utoipa spec; debug builds only warn. Run
  `cargo test test_openapi_spec_is_valid` locally and fix annotations.
- **JWT 401 "issuer does not match"** — verify `DGAT_KEYCLOAK_PUBLIC_URL` equals the
  public URL (the issuer Keycloak puts in tokens), and `KC_HOSTNAME` / realm
  `frontendUrl` point to the same public host. Mismatch is the #1 auth issue.
- **Keycloak can't reach the DB** — `keycloak-db` must be healthy before `keycloak`
  starts (compose `depends_on: condition: service_healthy`). Check
  `docker compose logs keycloak-db`.
- **Reports fail to generate** — the backend image (`Dockerfile.backend`) installs
  `chromium` and sets `CHROME=/usr/bin/chromium`. If you use a different base image,
  ensure Chromium is present; otherwise headless-Chrome PDF/Word generation will error.
- **Invitation emails not sending** — verify the `KC_SPI_EMAIL_DEFAULT_*` env vars and
  that SMTP allows the `EMAIL_FROM` address. Check Keycloak server log for SMTP errors.
- **Frontend blank page / redirect loop** — usually a Keycloak URL mismatch; ensure
  `VITE_KEYCLOAK_URL` is the public `https://.../keycloak` and that host Nginx proxies
  `/keycloak/` correctly.
- **CORS errors** — backend CORS allow-list is hardcoded to localhost origins in
  `lib.rs::create_app`. If you serve from a different origin, update that list and
  rebuild, or terminate everything through the frontend's inner proxy / host Nginx.