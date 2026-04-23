#!/usr/bin/env bash
# Wait for each service container to reach `healthy` (compose healthcheck).
# Fails fast if any container becomes unhealthy or exits.

set -euo pipefail

: "${COMPOSE_FILE:?COMPOSE_FILE must be set}"

SKIP_IMPERATIVUS="${SKIP_IMPERATIVUS:-false}"
TIMEOUT_SEC="${WAIT_TIMEOUT_SEC:-300}"

CONTAINERS=(
  ludiars-ci-cernere-backend
  ludiars-ci-actio-backend
  ludiars-ci-nuntius-api
)
if [[ "$SKIP_IMPERATIVUS" != "true" ]]; then
  CONTAINERS+=(ludiars-ci-imperativus-app)
fi

wait_for_container() {
  local name="$1"
  local deadline=$(( $(date +%s) + TIMEOUT_SEC ))
  while :; do
    local status
    status=$(docker inspect --format='{{.State.Health.Status}}' "$name" 2>/dev/null || echo "missing")
    local exit_code
    exit_code=$(docker inspect --format='{{.State.ExitCode}}' "$name" 2>/dev/null || echo "")
    local running
    running=$(docker inspect --format='{{.State.Running}}' "$name" 2>/dev/null || echo "false")

    case "$status" in
      healthy)
        echo "✓ $name healthy"
        return 0
        ;;
      unhealthy)
        echo "✗ $name unhealthy"
        docker logs --tail=100 "$name" || true
        return 1
        ;;
      starting|"")
        ;;
      *)
        ;;
    esac

    if [[ "$running" != "true" ]]; then
      echo "✗ $name is not running (exit=$exit_code)"
      docker logs --tail=100 "$name" || true
      return 1
    fi

    if (( $(date +%s) >= deadline )); then
      echo "✗ $name did not become healthy within ${TIMEOUT_SEC}s (last status=$status)"
      docker logs --tail=100 "$name" || true
      return 1
    fi

    sleep 3
  done
}

for c in "${CONTAINERS[@]}"; do
  echo "───── waiting on $c ─────"
  wait_for_container "$c"
done

echo "All required services are healthy."
