#!/usr/bin/env bash
# Tear down the stack. Keeps named volumes by default so next run still
# benefits from warm caches; set INTEGRATION_PURGE=true to wipe them too.

set -u +e

: "${COMPOSE_FILE:?COMPOSE_FILE must be set}"
: "${COMPOSE_PROJECT_NAME:=ludiars-ci}"

export COMPOSE_PROJECT_NAME

PURGE="${INTEGRATION_PURGE:-false}"

if [[ "$PURGE" == "true" ]]; then
  echo "INTEGRATION_PURGE=true → removing containers AND volumes"
  docker compose -f "$COMPOSE_FILE" down -v --remove-orphans
else
  echo "Stopping containers (volumes retained for incremental runs)"
  docker compose -f "$COMPOSE_FILE" down --remove-orphans
fi
