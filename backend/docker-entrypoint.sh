#!/bin/sh
set -e

echo "[RackDraw] Starting Backend..."
echo "[RackDraw] Waiting for PostgreSQL database to be ready and synchronizing schema..."

MAX_RETRIES=30
RETRY_COUNT=0

until ./node_modules/.bin/prisma db push --skip-generate || [ $RETRY_COUNT -ge $MAX_RETRIES ]; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  echo "[RackDraw] PostgreSQL not ready yet (attempt $RETRY_COUNT/$MAX_RETRIES). Waiting 2 seconds..."
  sleep 2
done

if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
  echo "[RackDraw] FATAL: Could not connect to PostgreSQL after $MAX_RETRIES attempts."
  exit 1
fi

echo "[RackDraw] Database schema synchronized successfully!"
echo "[RackDraw] Starting Express API server..."
exec node dist/app.js
