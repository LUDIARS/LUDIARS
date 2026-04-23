# All-in-One Integration CI

Runs **Cernere + Actio + Nuntius + Imperativus** end-to-end on every push
to `main` and on every pull request, across **Linux / macOS / Windows**
self-hosted runners.

Workflow: `.github/workflows/integration.yml`. Matrix: one job per OS,
each pinned to the corresponding self-hosted runner. First run on a
fresh runner takes ~15–25 minutes (STT image alone is ~3 GB);
subsequent runs land in 2–5 minutes when no service code changed.

## Architecture

```
 self-hosted runner (per OS)
 ├── $GITHUB_WORKSPACE                (LUDIARS meta repo)
 ├── $GITHUB_WORKSPACE/../ludiars-services
 │    ├── Cernere   (git clone / pull, depth=50)
 │    ├── Actio
 │    ├── Nuntius
 │    └── Imperativus
 └── docker daemon (Docker Desktop on macOS / Windows, native on Linux)
      └── compose project "ludiars-ci"
           ├── cernere-{pg, redis, backend}        :18080
           ├── actio-{pg, redis, backend}          :13000
           ├── nuntius-{pg, redis, api, worker}    :13100
           └── imperativus-{stt, app}              :15963
```

Each service gets its own Postgres + Redis to keep schemas isolated. All
containers share a user-defined network named `ludiars` so they resolve
each other by container name (`cernere-backend`, `nuntius-api`, …).

## Per-OS runner requirements

### Linux (labels: `self-hosted,linux,docker`)

- Docker 25+ with `buildx` (BuildKit enabled by default)
- Docker Compose v2 (plugin form: `docker compose …`)
- `git`, `bash`, `curl`, `wget` on PATH (bundled with the GH runner)
- Runner user in the `docker` group
- 16 GB RAM + 30 GB free disk recommended

### macOS (labels: `self-hosted,macOS,docker`)

- Docker Desktop for Mac (VirtioFS file sharing enabled)
- Intel or Apple Silicon — both are fine; on M-series the service
  images run under Rosetta 2 emulation, Imperativus STT build is
  noticeably slower
- BSD coreutils by default — scripts only use POSIX flags so no GNU
  coreutils install needed
- `git`, `bash` (3.2+), `curl` shipped with macOS; no extra packages
- 16 GB RAM + 30 GB free disk recommended

### Windows (labels: `self-hosted,Windows,docker`)

- Windows 10/11 Pro or Windows Server 2022 with **Docker Desktop
  (WSL2 backend)**
- `git.exe` on PATH (the GH Actions runner bundles it)
- **No bash / wget / curl / coreutils required on the runner** — the
  PowerShell scripts keep everything runner-side in pwsh, and any
  container-side shell work runs inside the running container via
  `docker exec … sh -c …`
- Docker Desktop → Settings → Resources → File Sharing must allow the
  drive that hosts `$GITHUB_WORKSPACE/..`
- 16 GB RAM + 40 GB free disk recommended (WSL2 VM grows)

## Scripts: bash vs PowerShell

Identical workflows, OS-native implementation:

| Purpose | Linux/macOS | Windows |
|---|---|---|
| Clone/update service repos | `scripts/fetch-services.sh` | `scripts/fetch-services.ps1` |
| Build & start | `scripts/integration-up.sh` | `scripts/integration-up.ps1` |
| Wait for healthy | `scripts/integration-wait.sh` | `scripts/integration-wait.ps1` |
| Smoke test | `scripts/integration-test.sh` | `scripts/integration-test.ps1` |
| Capture logs | `scripts/integration-logs.sh` | `scripts/integration-logs.ps1` |
| Tear down | `scripts/integration-down.sh` | `scripts/integration-down.ps1` |

The workflow selects the right script via `runner.os` conditionals.
`bash` scripts are POSIX-portable (no GNU-only `sed -i`, `readlink -f`,
`date -d` etc.) so the same file runs unmodified on Linux and macOS
even with BSD coreutils.

## Triggers

- `push` on `main`
- `pull_request` targeting `main`
- `workflow_dispatch`:
  - `clean_services` — wipe `$SERVICES_ROOT/*` and re-clone
  - `skip_imperativus` — omit the heavy STT build while iterating
  - `os_filter` — restrict to one of `linux` / `macos` / `windows` for
    quick iteration; default `all`

## What the smoke test verifies (OS-independent)

1. Every service's host-exposed health endpoint returns HTTP 200
   - `http://localhost:18080/health` (Cernere)
   - `http://localhost:13000/api/health/live` (Actio)
   - `http://localhost:13100/api/health` (Nuntius)
   - `http://localhost:15963/api/health` (Imperativus)
2. Inside the `ludiars` network, each downstream container (`actio-backend`,
   `nuntius-api`, `imperativus-app`) can reach `cernere-backend:8080`
3. Every Postgres responds to `pg_isready` (migrations completed)

Cross-service auth (Cernere project → `service_token` → Actio/Nuntius/
Imperativus) is deferred. See *Not yet wired in* at the bottom.

## Incremental behaviour

- **Service clones** stay at `$SERVICES_ROOT/<name>` between runs and
  are refreshed with `git fetch --depth=50 && git reset --hard origin/main`.
- **Docker images** rebuild with BuildKit; unchanged layers are cached
  on the runner.
- **Named volumes** (`ludiars-ci_cernere-pg`, …) persist across runs so
  migrations aren't re-applied from scratch. Wipe them with
  `INTEGRATION_PURGE=true` (see *Local reproduction* below) when schema
  changes land and you want a clean slate.

## Failure artefacts

`integration-logs.(sh|ps1)` writes per-container `*.log` and `*.state`
files into `./logs/`; the workflow uploads them as
`integration-logs-<os>-<run>` artefacts retained for 7 days.

## Local reproduction

### Linux / macOS

```bash
export SERVICES_ROOT=$HOME/ludiars-services
export COMPOSE_FILE=$PWD/compose/all-in-one.yaml
export COMPOSE_PROJECT_NAME=ludiars-ci

bash scripts/fetch-services.sh
bash scripts/integration-up.sh
bash scripts/integration-wait.sh
bash scripts/integration-test.sh
# schema-clean teardown:
INTEGRATION_PURGE=true bash scripts/integration-down.sh
```

### Windows PowerShell

```powershell
$env:SERVICES_ROOT         = "$env:USERPROFILE\ludiars-services"
$env:COMPOSE_FILE          = "$PWD\compose\all-in-one.yaml"
$env:COMPOSE_PROJECT_NAME  = "ludiars-ci"

./scripts/fetch-services.ps1
./scripts/integration-up.ps1
./scripts/integration-wait.ps1
./scripts/integration-test.ps1
# schema-clean teardown:
$env:INTEGRATION_PURGE = "true"
./scripts/integration-down.ps1
```

## Not yet wired in

- Cernere admin bootstrap (project creation → `client_id`/`secret`
  injection for downstream services)
- Actio ↔ Nuntius notification flow end-to-end
- Imperativus STT + gRPC happy-path ping
- Artefact publishing of built images to `ghcr.io`
- Regression-tracking of integration-test duration

Extending the smoke test is a matter of editing both
`scripts/integration-test.sh` and `scripts/integration-test.ps1` to
keep OS parity.
