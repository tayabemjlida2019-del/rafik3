#!/bin/bash
# ==========================================
# Al-Rafiq — Rollback Script
# ==========================================
# Usage: ./scripts/rollback.sh [backup-file]
# Example: ./scripts/rollback.sh pre-deploy-20260226-120000.sql

set -euo pipefail

DEPLOY_DIR="/opt/rafiq"
BACKUP_DIR="${DEPLOY_DIR}/backups"

echo "🔄 Al-Rafiq Rollback Starting..."

# 1. Find backup to restore
if [ -n "${1:-}" ]; then
    BACKUP_FILE="${BACKUP_DIR}/${1}"
else
    # Use most recent backup
    BACKUP_FILE=$(ls -t ${BACKUP_DIR}/pre-deploy-*.sql 2>/dev/null | head -1)
fi

if [ -z "$BACKUP_FILE" ] || [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ No backup file found!"
    echo "Available backups:"
    ls -la ${BACKUP_DIR}/*.sql 2>/dev/null || echo "  (none)"
    exit 1
fi

echo "📦 Using backup: ${BACKUP_FILE}"

# 2. Stop application
echo "⏹️  Stopping services..."
cd ${DEPLOY_DIR}
docker compose -f docker-compose.prod.yml stop api web

# 3. Restore database
echo "🗄️  Restoring database from backup..."
docker exec -i rafiq_db psql -U ${DB_USER:-rafiq_user} -d ${DB_NAME:-rafiq} < "${BACKUP_FILE}"

# 4. Roll back to previous Docker images
echo "🐳 Rolling back Docker images..."
docker compose -f docker-compose.prod.yml up -d api web

# 5. Wait and verify
echo "⏳ Waiting for services to start..."
sleep 10

# 6. Health check
if curl -sf http://127.0.0.1:3001/api/v1/health > /dev/null; then
    echo "✅ Rollback successful! API is healthy."
else
    echo "⚠️  API health check failed after rollback!"
    echo "Check logs: docker logs rafiq_api"
    exit 1
fi

echo "🎉 Rollback completed."
