#!/bin/bash
# ─────────────────────────────────────────────────────────────
# Restore script for DGRV Gap Assessment Tool
# Usage: ./scripts/restore.sh /opt/dgrv-backups/2026-04-07_12-00-00.tar.gz
# ─────────────────────────────────────────────────────────────

set -euo pipefail

BACKUP_FILE="${1:-}"
RESTORE_DIR="/tmp/dgrv-restore"

if [ -z "${BACKUP_FILE}" ]; then
  echo "Usage: $0 <backup-file.tar.gz>"
  echo "Available backups:"
  ls -lh /opt/dgrv-backups/*.tar.gz 2>/dev/null || echo "No backups found."
  exit 1
fi

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "Backup file not found: ${BACKUP_FILE}"
  exit 1
fi

log() { echo "[$(date +'%Y-%m-%dT%H:%M:%S')] $*"; }

log "Restoring from ${BACKUP_FILE}..."

# Extract backup
rm -rf "${RESTORE_DIR}"
mkdir -p "${RESTORE_DIR}"
tar xzf "${BACKUP_FILE}" -C "${RESTORE_DIR}" --strip-components=1

# ── 1. Restore App Database ─────────────────────────────────
if [ -f "${RESTORE_DIR}/dgat.dump" ]; then
  log "Restoring app database..."
  docker cp "${RESTORE_DIR}/dgat.dump" dgrv-db:/tmp/dgat_backup.dump
  docker exec dgrv-db psql -U postgres -c "DROP DATABASE IF EXISTS dgat;"
  docker exec dgrv-db psql -U postgres -c "CREATE DATABASE dgat;"
  docker exec dgrv-db pg_restore -U postgres -d dgat /tmp/dgat_backup.dump
  docker exec dgrv-db rm -f /tmp/dgat_backup.dump
  log "App database restored."
fi

# ── 2. Restore Keycloak Database ────────────────────────────
if [ -f "${RESTORE_DIR}/keycloak.dump" ]; then
  log "Restoring Keycloak database..."
  docker cp "${RESTORE_DIR}/keycloak.dump" dgrv-keycloak-db:/tmp/keycloak_backup.dump
  docker exec dgrv-keycloak-db psql -U postgres -c "DROP DATABASE IF EXISTS keycloak;"
  docker exec dgrv-keycloak-db psql -U postgres -c "CREATE DATABASE keycloak;"
  docker exec dgrv-keycloak-db pg_restore -U postgres -d keycloak /tmp/keycloak_backup.dump
  docker exec dgrv-keycloak-db rm -f /tmp/keycloak_backup.dump
  log "Keycloak database restored."
fi

# ── 3. Restore .env ─────────────────────────────────────────
if [ -f "${RESTORE_DIR}/.env.bak" ]; then
  log "Restoring .env..."
  cp "${RESTORE_DIR}/.env.bak" /root/DGRV-digital-gap-tool/.env
  log ".env restored."
fi

# Cleanup
rm -rf "${RESTORE_DIR}"

log "Restore completed. Restart services with: docker compose restart"
