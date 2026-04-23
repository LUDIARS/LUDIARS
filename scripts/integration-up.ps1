# Windows PowerShell equivalent of integration-up.sh.

$ErrorActionPreference = "Stop"

if (-not $env:SERVICES_ROOT) { throw "SERVICES_ROOT must be set" }
if (-not $env:COMPOSE_FILE)  { throw "COMPOSE_FILE must be set" }

if (-not $env:COMPOSE_PROJECT_NAME) { $env:COMPOSE_PROJECT_NAME = "ludiars-ci" }
$env:DOCKER_BUILDKIT           = "1"
$env:COMPOSE_DOCKER_CLI_BUILD  = "1"

# Normalise SERVICES_ROOT to forward-slash path for Docker Desktop.
$env:SERVICES_ROOT = [System.IO.Path]::GetFullPath($env:SERVICES_ROOT) -replace '\\', '/'

$skipImperativus = ($env:SKIP_IMPERATIVUS -eq "true")

$services = @(
  "cernere-postgres","cernere-redis","cernere-backend",
  "actio-postgres","actio-redis","actio-backend",
  "nuntius-postgres","nuntius-redis","nuntius-api","nuntius-worker"
)
if (-not $skipImperativus) {
  $services += @("imperativus-stt","imperativus-app")
}

Write-Host "───── docker compose build (parallel, BuildKit) ─────"
& docker compose -f $env:COMPOSE_FILE build --parallel @services
if ($LASTEXITCODE -ne 0) { throw "docker compose build failed" }

Write-Host "───── docker compose up -d ─────"
& docker compose -f $env:COMPOSE_FILE up -d @services
if ($LASTEXITCODE -ne 0) { throw "docker compose up failed" }

Write-Host "───── container summary ─────"
& docker compose -f $env:COMPOSE_FILE ps
