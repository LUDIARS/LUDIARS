#!/usr/bin/env bash
# Smoke-level integration checks against the running All-in-One stack.
# What this validates today:
#   1. Every service's health endpoint returns 2xx from the host
#   2. The containers can reach each other on the internal `ludiars` network
#      (Actio → Cernere over HTTP inside docker)
# Cross-service auth flow (Cernere project → Actio/Nuntius/Imperativus
# service_token) is intentionally out of scope for the first iteration.

set -euo pipefail

SKIP_IMPERATIVUS="${SKIP_IMPERATIVUS:-false}"

check_http() {
  local label="$1" url="$2" expected_status="${3:-200}"
  echo "─── $label : $url"
  local status
  status=$(curl --silent --output /dev/null --write-out "%{http_code}" --max-time 10 "$url" || echo "000")
  if [[ "$status" != "$expected_status" ]]; then
    echo "  ✗ expected $expected_status, got $status"
    return 1
  fi
  echo "  ✓ $status"
}

run_in() {
  # Exec a command inside a running container and report non-zero exit.
  local container="$1"; shift
  echo "─── in-network : $container $*"
  if ! docker exec "$container" sh -c "$*"; then
    echo "  ✗ command failed inside $container"
    return 1
  fi
  echo "  ✓ ok"
}

failures=0

# 1. Host-side health
check_http "Cernere health"    "http://localhost:18080/health"          200 || failures=$((failures+1))
check_http "Actio live"        "http://localhost:13000/api/health/live" 200 || failures=$((failures+1))
check_http "Nuntius health"    "http://localhost:13100/api/health"      200 || failures=$((failures+1))
if [[ "$SKIP_IMPERATIVUS" != "true" ]]; then
  check_http "Imperativus health" "http://localhost:15963/api/health" 200 || failures=$((failures+1))
fi

# 2. In-network reachability — Actio container should resolve & hit Cernere.
#    We use `wget -qO-` because the Actio image is a Node slim base that
#    has wget available.
run_in ludiars-ci-actio-backend \
  'wget -qO- --timeout=5 http://cernere-backend:8080/health | head -c 200; echo' \
  || failures=$((failures+1))

# 3. Nuntius → Cernere (network)
run_in ludiars-ci-nuntius-api \
  'wget -qO- --timeout=5 http://cernere-backend:8080/health | head -c 200; echo' \
  || failures=$((failures+1))

if [[ "$SKIP_IMPERATIVUS" != "true" ]]; then
  run_in ludiars-ci-imperativus-app \
    'wget -qO- --timeout=5 http://cernere-backend:8080/health | head -c 200; echo' \
    || failures=$((failures+1))
fi

# 4. Each service's DB is reachable (ensures migrations ran)
run_in ludiars-ci-cernere-pg  'pg_isready -U cernere'  || failures=$((failures+1))
run_in ludiars-ci-actio-pg    'pg_isready -U actio'    || failures=$((failures+1))
run_in ludiars-ci-nuntius-pg  'pg_isready -U nuntius'  || failures=$((failures+1))

if (( failures > 0 )); then
  echo "✗ $failures integration checks failed"
  exit 1
fi
echo "✓ All integration smoke checks passed."
