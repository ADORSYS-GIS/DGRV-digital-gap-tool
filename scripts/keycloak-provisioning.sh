#!/bin/bash

# ==== CONFIGURATION ====
export KEYCLOAK_BIN_DIR=/opt/keycloak/bin
export KEYCLOAK_SERVER=${KEYCLOAK_SERVER:-http://keycloak:8080/keycloak}
export TRUSTSTORE=/opt/keycloak/bin/truststore.jks
export REALM=digital-gap
export ADMIN_USER=admin
export ADMIN_PASS=admin123
export TRUSTSTORE_PASS=changeit
export NEW_USER_EMAIL=fespinosatest@dgrv.coop
export TEMP_PASSWORD=changeme123
export NEW_USER_FIRSTNAME=fernando
export NEW_USER_LASTNAME=espinosa

echo "[a.sh] Current working directory: $(pwd)"
echo "[a.sh] Changing directory to ${KEYCLOAK_BIN_DIR}"
cd "${KEYCLOAK_BIN_DIR}"
echo "[a.sh] Now in: $(pwd)"

# Run-once guard to avoid re-provisioning
RUN_ONCE_MARKER="${KEYCLOAK_BIN_DIR}/.provisioning_done"
if [ -f "${RUN_ONCE_MARKER}" ]; then
  echo "[a.sh] Provisioning already completed previously; exiting."
  exit 0
fi

# Certificate and truststore logic is no longer needed for internal HTTP communication.

# --- 1. LOG IN AS ADMIN ON MASTER REALM (retry until ready) ---
login_ok=false
for i in {1..120}; do
  # Use curl to check if Keycloak is ready
  if curl -s --head --fail "${KEYCLOAK_SERVER}/realms/master" > /dev/null; then
    echo "Keycloak is up!"
    if ./kcadm.sh config credentials --server "${KEYCLOAK_SERVER}" --realm master --user "${ADMIN_USER}" --password "${ADMIN_PASS}"; then
        login_ok=true
        break
    else
        echo "Keycloak is up, but login failed. Retrying..."
    fi
  fi
  echo "Waiting for Keycloak to start... ($i/120)"
  sleep 2
done

if [ "$login_ok" != true ]; then
  echo "Failed to authenticate with Keycloak after multiple attempts"
  exit 1
fi

# --- 2. CREATE THE USER ---
./kcadm.sh create users \
    -r "${REALM}" \
    -s username="${NEW_USER_EMAIL}" \
    -s email="${NEW_USER_EMAIL}" \
    -s enabled=true \
    -s firstName="${NEW_USER_FIRSTNAME}" \
    -s lastName="${NEW_USER_LASTNAME}" \
    --server "${KEYCLOAK_SERVER}"

# --- 3. SET TEMPORARY PASSWORD ---
./kcadm.sh set-password \
    -r "${REALM}" \
    --username "${NEW_USER_EMAIL}" \
    --new-password "${TEMP_PASSWORD}" \
    --temporary \
    --server "${KEYCLOAK_SERVER}"


# --- 4. ASSIGN REALM-MANAGEMENT ROLES (replace or add/remove as needed) ---
./kcadm.sh add-roles -r "${REALM}" --uusername "${NEW_USER_EMAIL}" --cclientid realm-management \
  --rolename create-client \
  --rolename create-organization \
  --rolename impersonation \
  --rolename manage-authorization \
  --rolename manage-clients \
  --rolename manage-events \
  --rolename manage-identity-providers \
  --rolename manage-organizations \
  --rolename manage-realm \
  --rolename manage-users \
  --rolename publish-events \
  --rolename query-clients \
  --rolename query-groups \
  --rolename query-realms \
  --rolename query-users \
  --rolename realm-admin \
  --rolename view-authorization \
  --rolename view-clients \
  --rolename view-events \
  --rolename view-identity-providers \
  --rolename view-organizations \
  --rolename view-realm \
  --rolename view-users \
  --server "${KEYCLOAK_SERVER}"

# --- 5. ASSIGN application_admin and drgv_admin realm roles ---
./kcadm.sh add-roles -r "${REALM}" --uusername "${NEW_USER_EMAIL}" --rolename application_admin --rolename dgrv_admin \
  --server "${KEYCLOAK_SERVER}"

echo ${KC_KC_SPI_EMAIL_DEFAULT_PASSWORD}

echo "[a.sh] Configuring realm email settings..."
./kcadm.sh update realms/"${REALM}" \
  -s 'smtpServer.host='"${KC_SPI_EMAIL_DEFAULT_HOST:-smtp.gmail.com}" \
  -s 'smtpServer.port='"${KC_SPI_EMAIL_DEFAULT_PORT:-25}" \
  -s 'smtpServer.from='"${KC_SPI_EMAIL_DEFAULT_FROM:-noreply@dgrv.coop}" \
  -s 'smtpServer.fromDisplayName='"${KC_SPI_EMAIL_DEFAULT_FROM_DISPLAY_NAME:-DGRV COOPERATION}" \
  -s 'smtpServer.user='"${KC_SPI_EMAIL_DEFAULT_USER:-yemelechristian2@gmail.com}" \
  -s 'smtpServer.password='"${KC_SPI_EMAIL_DEFAULT_PASSWORD}" \
  -s 'smtpServer.ssl='"${KC_SPI_EMAIL_DEFAULT_SSL:-false}" \
  -s 'smtpServer.starttls='"${KC_SPI_EMAIL_DEFAULT_STARTTLS:-true}" \
  -s 'smtpServer.auth='"${KC_SPI_EMAIL_DEFAULT_AUTH:-true}" \
  -s 'smtpServer.replyTo='"${KC_SPI_EMAIL_DEFAULT_FROM:-noreply@dgrv.coop}" \
  -s 'smtpServer.replyToDisplayName='"${KC_SPI_EMAIL_DEFAULT_FROM_DISPLAY_NAME:-DGRV COOPERATION}" \
  -s 'smtpServer.envelopeFrom=' \
  -s 'smtpServer.debug=false' \
  --server "${KEYCLOAK_SERVER}"

echo "[a.sh] Email configuration completed successfully"

# Mark provisioning as done to avoid re-running on subsequent starts
touch "${RUN_ONCE_MARKER}"
echo "[a.sh] Provisioning completed; marker created at ${RUN_ONCE_MARKER}"