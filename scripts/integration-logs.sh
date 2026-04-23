#!/usr/bin/env bash
# Collect logs for every container the integration workflow manages,
# into ./logs/ for artefact upload.

set -u +e

: "${COMPOSE_FILE:?COMPOSE_FILE must be set}"

LOGDIR="${GITHUB_WORKSPACE:-$PWD}/logs"
mkdir -p "$LOGDIR"

CONTAINERS=(
  ludiars-ci-cernere-pg
  ludiars-ci-cernere-redis
  ludiars-ci-cernere-backend
  ludiars-ci-actio-pg
  ludiars-ci-actio-redis
  ludiars-ci-actio-backend
  ludiars-ci-nuntius-pg
  ludiars-ci-nuntius-redis
  ludiars-ci-nuntius-api
  ludiars-ci-nuntius-worker
  ludiars-ci-imperativus-stt
  ludiars-ci-imperativus-app
)

for c in "${CONTAINERS[@]}"; do
  if docker inspect "$c" >/dev/null 2>&1; then
    echo "───── $c ─────"
    docker logs "$c" > "$LOGDIR/$c.log" 2>&1 || true
    docker inspect --format='State:   running={{.State.Running}} exit={{.State.ExitCode}} health={{.State.Health.Status}}' "$c" > "$LOGDIR/$c.state" 2>&1 || true
    tail -n 30 "$LOGDIR/$c.log" || true
  else
    echo "───── $c : not present ─────"
  fi
done

echo "Logs written to $LOGDIR"
ls -la "$LOGDIR"
