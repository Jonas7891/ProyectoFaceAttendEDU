#!/usr/bin/env bash
# FaceAttend EDU — respaldo programable de PRODUCCIÓN (PostgreSQL en Neon, MongoDB y MinIO en el servidor).
#
# Diferencias con backup.sh: PostgreSQL no corre en un contenedor local sino en Neon, así que el
# volcado se hace con la cadena de conexión; el cifrado es obligatorio; borra los respaldos que
# superan la retención (por defecto 30 días, la propuesta de POLITICA_TRATAMIENTO_DATOS §8) y puede
# copiar el resultado fuera del servidor. Los archivos tienen los mismos nombres que backup.sh, de
# modo que restore.sh sigue sirviendo para Mongo y para MinIO.
#
# Variables obligatorias: NEON_DATABASE_URL (postgresql://… con sslmode=require), MONGO_USER,
#   MONGO_PASSWORD, BACKUP_PASSPHRASE.
# Opcionales: BACKUP_DIR (/var/backups/faceattend), RETENTION_DAYS (30), PG_DUMP_IMAGE
#   (postgres:17-alpine; usar la misma versión mayor que Neon o superior), MONGO_CONTAINER
#   (faceattend-mongo), OFFSITE_CMD (comando que recibe la carpeta del respaldo como $1, p. ej.
#   "rclone copy" o "rsync -a"; un fallo cuenta como fallo del respaldo).
#
# Programación (cron del servidor, cada día a las 02:00, secretos en un archivo de 0600):
#   0 2 * * * set -a; . /etc/faceattend/backup.env; set +a; /opt/faceattend/database/scripts/backup-prod.sh >>/var/log/faceattend-backup.log 2>&1
#
# Probar un respaldo: ./database/scripts/verify-restore.sh (stack local) y, en el servidor,
# DRY_RUN=1 ./database/scripts/backup-prod.sh para ver qué haría sin escribir ni borrar.

set -euo pipefail

: "${NEON_DATABASE_URL:?NEON_DATABASE_URL is required}"
: "${MONGO_USER:?MONGO_USER is required}"
: "${MONGO_PASSWORD:?MONGO_PASSWORD is required}"
: "${BACKUP_PASSPHRASE:?BACKUP_PASSPHRASE is required (production backups are always encrypted)}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/faceattend}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
PG_DUMP_IMAGE="${PG_DUMP_IMAGE:-postgres:17-alpine}"
MONGO_CONTAINER="${MONGO_CONTAINER:-faceattend-mongo}"
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="$BACKUP_DIR/$STAMP"

[[ "$RETENTION_DAYS" =~ ^[0-9]+$ && "$RETENTION_DAYS" -ge 1 ]] || { echo "RETENTION_DAYS must be a positive integer" >&2; exit 2; }

prune() {
  # Solo carpetas con nombre de respaldo (AAAAMMDD-HHMMSS): nunca borra otra cosa.
  find "$BACKUP_DIR" -mindepth 1 -maxdepth 1 -type d -regextype posix-extended \
    -regex '.*/[0-9]{8}-[0-9]{6}' -mtime "+$RETENTION_DAYS" "$@"
}

if [[ "${DRY_RUN:-0}" == "1" ]]; then
  echo "[dry-run] would back up Neon, $MONGO_CONTAINER and MinIO to $OUT (encrypted)"
  echo "[dry-run] would delete backups older than $RETENTION_DAYS days:"
  prune -print
  exit 0
fi

mkdir -p "$BACKUP_DIR"
umask 077
mkdir -p "$OUT"
trap 'rc=$?; if [[ $rc -ne 0 ]]; then echo "BACKUP FAILED (exit $rc): removing partial $OUT" >&2; rm -rf "$OUT"; fi' EXIT

echo "Backing up to $OUT"

# PostgreSQL (Neon): pg_dump desde un contenedor desechable; la URL viaja por entorno, no por argumentos.
NEON_DATABASE_URL="$NEON_DATABASE_URL" docker run --rm -e NEON_DATABASE_URL "$PG_DUMP_IMAGE" \
  sh -c 'pg_dump --format=custom --no-owner "$NEON_DATABASE_URL"' > "$OUT/faceattend_db.dump"

# MongoDB (plantillas biométricas, ya cifradas por la aplicación)
docker exec "$MONGO_CONTAINER" mongodump --username "$MONGO_USER" --password "$MONGO_PASSWORD" \
  --authenticationDatabase admin --archive=/tmp/mongo.archive --gzip
docker cp "$MONGO_CONTAINER:/tmp/mongo.archive" "$OUT/mongo.archive.gz"
docker exec "$MONGO_CONTAINER" rm /tmp/mongo.archive

# MinIO (soportes cifrados SSE-S3; restaurar exige el mismo MINIO_KMS_SECRET_KEY)
if docker ps --format '{{.Names}}' | grep -qx faceattend-minio; then
  docker cp faceattend-minio:/data "$OUT/minio-data"
fi

# Cifrado obligatorio, igual que backup.sh (restore.sh descifra con BACKUP_PASSPHRASE)
for f in "$OUT/faceattend_db.dump" "$OUT/mongo.archive.gz"; do
  [[ -s "$f" ]] || { echo "Empty dump: $f" >&2; exit 1; }
  openssl enc -aes-256-cbc -pbkdf2 -iter 600000 -salt -pass env:BACKUP_PASSPHRASE -in "$f" -out "$f.enc"
  rm -f "$f"
done

if [[ -n "${OFFSITE_CMD:-}" ]]; then
  # shellcheck disable=SC2086
  $OFFSITE_CMD "$OUT"
  echo "Copied off-server with: $OFFSITE_CMD"
fi

prune -print -exec rm -rf {} +
echo "Done: $OUT (retention $RETENTION_DAYS days)"
