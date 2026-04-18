#!/bin/bash
# ─────────────────────────────────────────────────────────────
# Backup script for DGRV Gap Assessment Tool
# Backs up: App DB, Keycloak DB, MinIO data, .env
# Optionally syncs to off-site S3-compatible storage via rclone
# ─────────────────────────────────────────────────────────────

set -euo pipefail

BACKUP_DIR="/opt/dgrv-backups"
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_PATH="${BACKUP_DIR}/${DATE}"
RETENTION_DAYS=7

# Off-site config — set these in .env or export before running
# RCLONE_REMOTE: name of your rclone remote (e.g. "s3-dgrv")
# RCLONE_BUCKET: bucket/path to upload to (e.g. "dgrv-backups")
RCLONE_REMOTE="${RCLONE_REMOTE:-}"
RCLONE_BUCKET="${RCLONE_BUCKET:-dgrv-backups}"
OFFSITE_RETENTION_DAYS="${OFFSITE_RETENTION_DAYS:-30}"

mkdir -p "${BACKUP_PATH}"

log() { echo "[$(date +'%Y-%m-%dT%H:%M:%S')] $*"; }

log "Starting backup to ${BACKUP_PATH}..."

# ── 1. App Database (dgat) ──────────────────────────────────
log "Backing up app database..."
docker exec dgrv-db pg_dump \
  -U postgres \
  -d dgat \
  --no-password \
  -F c \
  -f /tmp/dgat_backup.dump

docker cp dgrv-db:/tmp/dgat_backup.dump "${BACKUP_PATH}/dgat.dump"
docker exec dgrv-db rm -f /tmp/dgat_backup.dump
log "App database backup done."

# ── 2. Keycloak Database ────────────────────────────────────
log "Backing up Keycloak database..."
if docker ps --format '{{.Names}}' | grep -q "dgrv-keycloak-db"; then
  docker exec dgrv-keycloak-db pg_dump \
    -U postgres \
    -d keycloak \
    --no-password \
    -F c \
    -f /tmp/keycloak_backup.dump
  docker cp dgrv-keycloak-db:/tmp/keycloak_backup.dump "${BACKUP_PATH}/keycloak.dump"
  docker exec dgrv-keycloak-db rm -f /tmp/keycloak_backup.dump
  log "Keycloak database backup done."
else
  log "WARNING: dgrv-keycloak-db not found, trying legacy dgrv-db for keycloak schema..."
  docker exec dgrv-db pg_dump \
    -U postgres \
    -d dgat \
    --no-password \
    -F c \
    -f /tmp/keycloak_backup.dump 2>/dev/null || true
  docker cp dgrv-db:/tmp/keycloak_backup.dump "${BACKUP_PATH}/keycloak.dump" 2>/dev/null || true
  docker exec dgrv-db rm -f /tmp/keycloak_backup.dump 2>/dev/null || true
  log "Keycloak database backup done (legacy mode)."
fi

# ── 3. MinIO data ───────────────────────────────────────────
log "Backing up MinIO data..."
docker run --rm \
  --volumes-from dgrv-minio \
  -v "${BACKUP_PATH}:/backup" \
  alpine \
  tar czf /backup/minio-data.tar.gz /data 2>/dev/null || true
log "MinIO backup done."

# ── 4. Environment file ─────────────────────────────────────
log "Backing up .env..."
cp /root/DGRV-digital-gap-tool/.env "${BACKUP_PATH}/.env.bak"
log ".env backup done."

# ── 5. Keycloak realm export ────────────────────────────────
log "Exporting Keycloak realm..."
docker exec dgrv-keycloak /opt/keycloak/bin/kcadm.sh config credentials \
  --server http://localhost:8080/keycloak \
  --realm master \
  --user admin \
  --password "${KEYCLOAK_ADMIN_PASSWORD:-admin123}" 2>/dev/null || true

docker exec dgrv-keycloak /opt/keycloak/bin/kc.sh export \
  --dir /tmp/realm-export \
  --realm digital-gap \
  --users realm_file 2>/dev/null || true

docker cp dgrv-keycloak:/tmp/realm-export "${BACKUP_PATH}/realm-export" 2>/dev/null || true
log "Keycloak realm export done."

# ── 6. Compress the whole backup ────────────────────────────
log "Compressing backup..."
BACKUP_FILE="${BACKUP_DIR}/${DATE}.tar.gz"
tar czf "${BACKUP_FILE}" -C "${BACKUP_DIR}" "${DATE}"
rm -rf "${BACKUP_PATH}"
log "Backup compressed: ${BACKUP_FILE}"

# ── 7. Remove old local backups ─────────────────────────────
log "Removing local backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -name "*.tar.gz" -mtime +${RETENTION_DAYS} -delete
log "Old local backups removed."

# ── 8. Off-site sync via rclone ─────────────────────────────
if [ -n "${RCLONE_REMOTE}" ]; then
  if command -v rclone &>/dev/null; then
    log "Uploading backup to off-site storage: ${RCLONE_REMOTE}:${RCLONE_BUCKET}..."
    rclone copy "${BACKUP_FILE}" "${RCLONE_REMOTE}:${RCLONE_BUCKET}/"

    # Remove off-site backups older than OFFSITE_RETENTION_DAYS
    log "Removing off-site backups older than ${OFFSITE_RETENTION_DAYS} days..."
    rclone delete "${RCLONE_REMOTE}:${RCLONE_BUCKET}/" \
      --min-age "${OFFSITE_RETENTION_DAYS}d" 2>/dev/null || true

    log "Off-site sync completed."
  else
    log "WARNING: rclone not installed, skipping off-site sync."
    log "Install with: curl https://rclone.org/install.sh | bash"
  fi
else
  log "RCLONE_REMOTE not set — skipping off-site sync."
  log "To enable, set RCLONE_REMOTE and RCLONE_BUCKET in your environment."
fi

log "Backup completed successfully: ${DATE}.tar.gz"
