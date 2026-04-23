# Windows PowerShell equivalent of integration-down.sh.

$ErrorActionPreference = "Continue"

if (-not $env:COMPOSE_FILE) { throw "COMPOSE_FILE must be set" }
if (-not $env:COMPOSE_PROJECT_NAME) { $env:COMPOSE_PROJECT_NAME = "ludiars-ci" }

$purge = ($env:INTEGRATION_PURGE -eq "true")

if ($purge) {
  Write-Host "INTEGRATION_PURGE=true → removing containers AND volumes"
  & docker compose -f $env:COMPOSE_FILE down -v --remove-orphans
} else {
  Write-Host "Stopping containers (volumes retained for incremental runs)"
  & docker compose -f $env:COMPOSE_FILE down --remove-orphans
}
