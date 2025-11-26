#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KEYCLOAK_START_CMD="${KEYCLOAK_START_CMD:-/opt/keycloak/bin/kc.sh start}"

log() { echo "[$(date +'%Y-%m-%dT%H:%M:%S%z')] $*"; }

log "Starting Keycloak with: $KEYCLOAK_START_CMD"
bash -lc "$KEYCLOAK_START_CMD" &
KC_PID=$!

cleanup() {
  log "Forwarding termination to Keycloak (PID $KC_PID)"
  kill -TERM "$KC_PID" 2>/dev/null || true
  wait "$KC_PID" || true
}
trap cleanup INT TERM

# Wait for Keycloak to be ready before provisioning
log "Waiting for Keycloak to be ready on port 8080..."
while ! bash -c "exec 6<>/dev/tcp/localhost/8080" 2>/dev/null; do
  echo "Keycloak is not yet available on port 8080. Retrying in 2 seconds..."
  sleep 2
done
log "Keycloak is ready. Starting provisioning..."

# Run provisioning
bash "/scripts/keycloak-provisioning.sh" || true

# Keep the container/process alive with Keycloak in foreground
wait "$KC_PID"
