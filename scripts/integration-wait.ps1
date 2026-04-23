# Windows PowerShell equivalent of integration-wait.sh.

$ErrorActionPreference = "Stop"

$timeoutSec = if ($env:WAIT_TIMEOUT_SEC) { [int]$env:WAIT_TIMEOUT_SEC } else { 300 }
$skipImperativus = ($env:SKIP_IMPERATIVUS -eq "true")

$containers = @(
  "ludiars-ci-cernere-backend",
  "ludiars-ci-actio-backend",
  "ludiars-ci-nuntius-api"
)
if (-not $skipImperativus) { $containers += "ludiars-ci-imperativus-app" }

function Wait-HealthyContainer {
  param([string]$Name, [int]$Timeout)
  $deadline = (Get-Date).AddSeconds($Timeout)
  while ($true) {
    $status   = & docker inspect --format='{{.State.Health.Status}}' $Name 2>$null
    $running  = & docker inspect --format='{{.State.Running}}'       $Name 2>$null
    $exitCode = & docker inspect --format='{{.State.ExitCode}}'      $Name 2>$null

    switch ($status) {
      "healthy" {
        Write-Host "✓ $Name healthy"
        return $true
      }
      "unhealthy" {
        Write-Host "✗ $Name unhealthy"
        & docker logs --tail=100 $Name
        return $false
      }
      default {
        # starting / "" / anything else → keep polling
      }
    }

    if ($running -ne "true") {
      Write-Host "✗ $Name is not running (exit=$exitCode)"
      & docker logs --tail=100 $Name
      return $false
    }

    if ((Get-Date) -ge $deadline) {
      Write-Host "✗ $Name did not become healthy within ${Timeout}s (last status=$status)"
      & docker logs --tail=100 $Name
      return $false
    }

    Start-Sleep -Seconds 3
  }
}

foreach ($c in $containers) {
  Write-Host "───── waiting on $c ─────"
  if (-not (Wait-HealthyContainer -Name $c -Timeout $timeoutSec)) {
    exit 1
  }
}

Write-Host "All required services are healthy."
