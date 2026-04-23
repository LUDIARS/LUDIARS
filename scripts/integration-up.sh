#!/usr/bin/env bash
# Build all images and bring up the All-in-One stack with BuildKit caching.
# Assumes fetch-services.sh has already run.

set -euo pipefail

: "${SERVICES_ROOT:?SERVICES_ROOT must be set}"
: "${COMPOSE_FILE:?COMPOSE_FILE must be set}"
: "${COMPOSE_PROJECT_NAME:=ludiars-ci}"

export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
export COMPOSE_PROJECT_NAME

COMPOSE_ARGS=(-f "$COMPOSE_FILE")

# Optional: drop Imperativus when $SKIP_IMPERATIVUS=true (the STT image is
# ~3 GB on first build).
SKIP_IMPERATIVUS="${SKIP_IMPERATIVUS:-false}"
SERVICES_TO_UP=(
  cernere-postgres cernere-redis cernere-backend
  actio-postgres actio-redis actio-backend
  nuntius-postgres nuntius-redis nuntius-api nuntius-worker
)
if [[ "$SKIP_IMPERATIVUS" != "true" ]]; then
  SERVICES_TO_UP+=(imperativus-stt imperativus-app)
fi

echo "───── docker compose build (parallel, BuildKit) ─────"
docker compose "${COMPOSE_ARGS[@]}" build --parallel "${SERVICES_TO_UP[@]}"

echo "───── docker compose up -d ─────"
docker compose "${COMPOSE_ARGS[@]}" up -d "${SERVICES_TO_UP[@]}"

echo "───── container summary ─────"
docker compose "${COMPOSE_ARGS[@]}" ps
