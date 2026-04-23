# Windows PowerShell equivalent of integration-test.sh.
#
# Runner-side HTTP probes use Invoke-WebRequest (no curl dependency).
# In-network probes run `wget` *inside* the container, so that part is
# host-OS-independent.

$ErrorActionPreference = "Continue"
$skipImperativus = ($env:SKIP_IMPERATIVUS -eq "true")

function Test-Endpoint {
  param([string]$Label, [string]$Url, [int]$Expected = 200)
  Write-Host "─── $Label : $Url"
  try {
    $resp = Invoke-WebRequest -Uri $Url -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
    if ([int]$resp.StatusCode -eq $Expected) {
      Write-Host "  ✓ $($resp.StatusCode)"
      return $true
    }
    Write-Host "  ✗ expected $Expected, got $($resp.StatusCode)"
    return $false
  } catch {
    Write-Host "  ✗ request failed: $_"
    return $false
  }
}

function Invoke-InContainer {
  param([string]$Container, [string]$Cmd)
  Write-Host "─── in-network : $Container $Cmd"
  & docker exec $Container sh -c $Cmd
  if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ command failed inside $Container"
    return $false
  }
  Write-Host "  ✓ ok"
  return $true
}

$failures = 0

# 1. Host-side health
if (-not (Test-Endpoint "Cernere health"    "http://localhost:18080/health"))         { $failures++ }
if (-not (Test-Endpoint "Actio live"        "http://localhost:13000/api/health/live")){ $failures++ }
if (-not (Test-Endpoint "Nuntius health"    "http://localhost:13100/api/health"))     { $failures++ }
if (-not $skipImperativus) {
  if (-not (Test-Endpoint "Imperativus health" "http://localhost:15963/api/health"))  { $failures++ }
}

# 2. In-network: Actio / Nuntius / Imperativus → Cernere
if (-not (Invoke-InContainer "ludiars-ci-actio-backend" 'wget -qO- --timeout=5 http://cernere-backend:8080/health | head -c 200; echo')) { $failures++ }
if (-not (Invoke-InContainer "ludiars-ci-nuntius-api"   'wget -qO- --timeout=5 http://cernere-backend:8080/health | head -c 200; echo')) { $failures++ }
if (-not $skipImperativus) {
  if (-not (Invoke-InContainer "ludiars-ci-imperativus-app" 'wget -qO- --timeout=5 http://cernere-backend:8080/health | head -c 200; echo')) { $failures++ }
}

# 3. DB readiness (inside each Postgres container)
if (-not (Invoke-InContainer "ludiars-ci-cernere-pg" 'pg_isready -U cernere')) { $failures++ }
if (-not (Invoke-InContainer "ludiars-ci-actio-pg"   'pg_isready -U actio'))   { $failures++ }
if (-not (Invoke-InContainer "ludiars-ci-nuntius-pg" 'pg_isready -U nuntius')) { $failures++ }

if ($failures -gt 0) {
  Write-Host "✗ $failures integration checks failed"
  exit 1
}
Write-Host "✓ All integration smoke checks passed."
