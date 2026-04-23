#!/usr/bin/env bash
# Fetch / update the four LUDIARS service repos into $SERVICES_ROOT.
#
# Designed for a self-hosted runner where $SERVICES_ROOT persists between
# runs, so clones turn into cheap `git fetch + git reset` operations.
# Honours $CLEAN_SERVICES=true to wipe and re-clone from scratch.

set -euo pipefail

: "${SERVICES_ROOT:?SERVICES_ROOT must be set}"
: "${GITHUB_TOKEN:=}"          # optional; supplied by actions/checkout

CLEAN="${CLEAN_SERVICES:-false}"
SERVICES=(Cernere Actio Nuntius Imperativus)

mkdir -p "$SERVICES_ROOT"

auth_prefix() {
  # If a token is available, use https with token auth so private repos work.
  if [[ -n "${GITHUB_TOKEN}" ]]; then
    printf 'https://x-access-token:%s@github.com/LUDIARS' "$GITHUB_TOKEN"
  else
    printf 'https://github.com/LUDIARS'
  fi
}

for svc in "${SERVICES[@]}"; do
  dir="$SERVICES_ROOT/$svc"
  url="$(auth_prefix)/$svc.git"
  echo "───── $svc ─────"

  if [[ "$CLEAN" == "true" ]] && [[ -d "$dir" ]]; then
    echo "  cleaning existing clone"
    rm -rf "$dir"
  fi

  if [[ -d "$dir/.git" ]]; then
    echo "  updating existing clone ($dir)"
    git -C "$dir" remote set-url origin "$url"
    git -C "$dir" fetch --prune --depth=50 origin main
    git -C "$dir" reset --hard origin/main
    git -C "$dir" clean -fd
  else
    echo "  cloning fresh → $dir"
    git clone --depth=50 --branch main "$url" "$dir"
  fi

  # Show HEAD for the CI log
  echo "  HEAD: $(git -C "$dir" log -1 --oneline)"
done

echo "All service repos ready under $SERVICES_ROOT"
