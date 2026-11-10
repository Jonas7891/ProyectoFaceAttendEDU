#!/usr/bin/env bash
# FaceAttend EDU — creates the two service accounts a fresh install needs and
# writes their variables to .env. Run it once, right after bootstrap-admin.sh.
#
#   svc.notification  ms-notification signs in with it to mark absences and raise
#                     attendance alerts when a class closes
#                     (NOTIFICATION_SERVICE_USERNAME / NOTIFICATION_SERVICE_PASSWORD).
#   svc.onboarding    the public school sign-up opens its internal session as this
#                     account (ONBOARDING_SERVICE_USER_ID).
#
# Without them the system starts, but closing a class records no absences and
# POST /api/v1/onboarding/schools answers 503.
#
# Usage (from the repository root, with the stack up):
#   SERVICE_ACCOUNT_EMAIL_DOMAIN=sede.edu.co ./database/scripts/service-accounts.sh [.env]
#   docker compose up -d --force-recreate ms-identity ms-notification
#
# Passwords are random, are never printed and nobody signs in with them. If an
# account already exists it gets a new password (--reset), so the script can be
# run again. PSQL works as in bootstrap-admin.sh.
set -euo pipefail

ENV_FILE=${1:-.env}
DOMAIN=${SERVICE_ACCOUNT_EMAIL_DOMAIN:-example.test}
NOTIFY_USER=${NOTIFICATION_SERVICE_USER:-svc.notification}
ONBOARDING_USER=${ONBOARDING_SERVICE_USER:-svc.onboarding}
HERE=$(cd "$(dirname "$0")" && pwd)
BOOT="$HERE/bootstrap-admin.sh"
PSQL=${PSQL:-docker exec -i faceattend-postgres psql -U ${POSTGRES_USER:-postgres} -d ${POSTGRES_DB:-faceattend_db}}
export PSQL

[[ -f "$ENV_FILE" ]] || { echo "$ENV_FILE not found: run this from the repository root" >&2; exit 1; }

# 19 characters: bootstrap-admin.sh asks for 12 or more and identity.password_policy
# allows 20 at most. No '#', which some .env readers take as the start of a comment.
password() { printf 'Svc%s!7' "$(openssl rand -hex 7)"; }

# Creates the account, or sets a new password when it already exists.
# Prints the user_id.
account() {
  local user=$1 pass=$2 out
  out=$(BOOTSTRAP_ADMIN_USERNAME=$user BOOTSTRAP_ADMIN_EMAIL="$user@$DOMAIN" \
        BOOTSTRAP_ADMIN_PASSWORD=$pass bash "$BOOT" 2>&1) || true
  if grep -qi 'already exists' <<<"$out" || ! user_id "$user" > /dev/null; then
    BOOTSTRAP_ADMIN_USERNAME=$user BOOTSTRAP_ADMIN_PASSWORD=$pass bash "$BOOT" --reset > /dev/null
  fi
  user_id "$user"
}

user_id() {
  local id
  id=$($PSQL -tA -c "SELECT user_id FROM \"identity\".app_user WHERE username = '$1' AND deleted_at IS NULL" | tr -d '[:space:]')
  [[ -n "$id" ]] || { echo "account $1 was not created" >&2; return 1; }
  printf '%s' "$id"
}

# Replaces the line KEY=... in ENV_FILE, or appends it.
set_env() {
  local tmp
  tmp=$(mktemp)
  grep -v "^$1=" "$ENV_FILE" > "$tmp" || true
  printf '%s=%s\n' "$1" "$2" >> "$tmp"
  cat "$tmp" > "$ENV_FILE"
  rm -f "$tmp"
}

NOTIFY_PW=$(password)
account "$NOTIFY_USER" "$NOTIFY_PW" > /dev/null
ONBOARDING_ID=$(account "$ONBOARDING_USER" "$(password)")

set_env NOTIFICATION_SERVICE_USERNAME "$NOTIFY_USER"
set_env NOTIFICATION_SERVICE_PASSWORD "$NOTIFY_PW"
set_env ONBOARDING_SERVICE_USER_ID "$ONBOARDING_ID"

echo "Service accounts ready: $NOTIFY_USER and $ONBOARDING_USER ($ONBOARDING_ID)."
echo "Recreate the two services so they read the new values:"
echo "  docker compose up -d --force-recreate ms-identity ms-notification"
