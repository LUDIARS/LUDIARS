# All-in-One Integration CI

Runs **Cernere + Actio + Nuntius + Imperativus** end-to-end on every push
to `main` and on every pull request.

The workflow is `.github/workflows/integration.yml` and is pinned to a
self-hosted runner so that image builds, `node_modules`, and Rust/STT
caches survive between runs. First run on a fresh runner takes ~15–25
minutes (STT image alone is ~3 GB); subsequent runs land in 2–5 minutes
when no service code changed.

## Architecture

```
 self-hosted runner
 ├── $GITHUB_WORKSPACE                (LUDIARS meta repo)
 ├── $GITHUB_WORKSPACE/../ludiars-services
 │    ├── Cernere   (git clone / pull, depth=50)
 │    ├── Actio
 │    ├── Nuntius
 │    └── Imperativus
 └── docker daemon
      └── compose project "ludiars-ci"
           ├── cernere-{pg, redis, backend}        :18080
           ├── actio-{pg, redis, backend}          :13000
           ├── nuntius-{pg, redis, api, worker}    :13100
           └── imperativus-{stt, app}              :15963
```

Every service gets its own Postgres + Redis pair to keep their schemas
isolated. All containers share a single user-defined network named
`ludiars` so they can resolve each other by service name
(`cernere-backend`, `nuntius-api`, …).

## Setting up a self-hosted runner

1. Provision a Linux host with Docker 25+, Docker Compose v2, git,
   bash, and wget. 16 GB RAM + 30 GB disk is comfortable; 8 GB + 15 GB
   is the minimum for Imperativus (STT model downloads).
2. Register the runner against the LUDIARS/LUDIARS repository with
   labels `self-hosted,linux,docker`.
3. Make sure the runner user is in the `docker` group
   (`usermod -aG docker $USER`).
4. Enable BuildKit persistently:
   ```bash
   sudo mkdir -p /etc/docker
   echo '{"features": {"buildkit": true}}' | sudo tee /etc/docker/daemon.json
   sudo systemctl restart docker
   ```
5. (Optional) Pre-warm the service clones:
   ```bash
   export SERVICES_ROOT=$HOME/actions-runner/_work/ludiars-services
   bash scripts/fetch-services.sh
   ```

## Triggers

- `push` on `main`
- `pull_request` targeting `main`
- `workflow_dispatch` with optional switches:
  - `clean_services` — wipe `$SERVICES_ROOT/*` and re-clone
  - `skip_imperativus` — omit the heavy STT build when iterating on the
    other three services

## What the smoke test verifies

`scripts/integration-test.sh` runs these checks. First iteration is
boot-correctness, not cross-service flow:

1. Each service's host-exposed health endpoint returns HTTP 200
   - `http://localhost:18080/health` (Cernere)
   - `http://localhost:13000/api/health/live` (Actio)
   - `http://localhost:13100/api/health` (Nuntius)
   - `http://localhost:15963/api/health` (Imperativus)
2. Inside the docker network, each downstream service can reach the
   Cernere container by its service name (`http://cernere-backend:8080`)
3. Every Postgres instance responds to `pg_isready`

Cross-service auth (Cernere project → `service_token` → Actio/Nuntius/
Imperativus) is not yet automated here; when the service SDKs expose a
CI-friendly bootstrap path, we'll extend `integration-test.sh`.

## Incremental behaviour

- **Service clones** stay at `$SERVICES_ROOT/<name>` between runs and
  are updated via `git fetch && git reset --hard origin/main`.
- **Docker images** are rebuilt with BuildKit; unchanged layers reuse
  the runner's layer cache. A Dockerfile or `package.json` change
  triggers a rebuild of only the affected image.
- **Named volumes** (`cernere-pg`, `actio-pg`, …) persist across runs
  so migrations aren't re-applied from scratch. Wipe them with
  `INTEGRATION_PURGE=true bash scripts/integration-down.sh` when schema
  changes land and you want a clean slate.

## Failure artefacts

On failure (or success — it always runs), `scripts/integration-logs.sh`
writes `logs/<container>.log` and `logs/<container>.state` files, then
the workflow uploads them as an artefact named
`integration-logs-<run_number>` retained for 7 days.

## Local reproduction

```bash
export SERVICES_ROOT=$HOME/ludiars-services
export COMPOSE_FILE=$PWD/compose/all-in-one.yaml
export COMPOSE_PROJECT_NAME=ludiars-ci

bash scripts/fetch-services.sh
bash scripts/integration-up.sh
bash scripts/integration-wait.sh
bash scripts/integration-test.sh
# when done:
bash scripts/integration-down.sh
```

## Not yet wired in

- Cernere admin bootstrap (project creation → `client_id`/`secret`
  injection for downstream services)
- Actio ↔ Nuntius notification flow end-to-end
- Imperativus STT + gRPC happy-path ping
- Artefact publishing of built images to `ghcr.io`
- Regression-tracking of integration-test duration

All of these are cleanly extensible by editing `scripts/integration-test.sh`
and (for image publishing) adding a step to the workflow after the
smoke test passes.
