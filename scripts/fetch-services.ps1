# Windows PowerShell equivalent of fetch-services.sh.
# Requires: git.exe on PATH (self-hosted runner bundles it).

$ErrorActionPreference = "Stop"

if (-not $env:SERVICES_ROOT) { throw "SERVICES_ROOT must be set" }

# Normalise to an absolute path with forward slashes so docker compose
# substitution is identical between runs (mixed \\ and / confuses BuildKit
# on some Docker Desktop versions).
$servicesRoot = [System.IO.Path]::GetFullPath($env:SERVICES_ROOT) -replace '\\', '/'
$env:SERVICES_ROOT = $servicesRoot

$clean   = ($env:CLEAN_SERVICES -eq "true")
$token   = $env:GITHUB_TOKEN
$services = @("Cernere", "Actio", "Nuntius", "Imperativus")

function Get-AuthPrefix {
  if ($token) { return "https://x-access-token:$token@github.com/LUDIARS" }
  return "https://github.com/LUDIARS"
}

New-Item -Force -ItemType Directory -Path $servicesRoot | Out-Null

foreach ($svc in $services) {
  $dir = Join-Path $servicesRoot $svc
  $url = "$(Get-AuthPrefix)/$svc.git"
  Write-Host "───── $svc ─────"

  if ($clean -and (Test-Path $dir)) {
    Write-Host "  cleaning existing clone"
    Remove-Item -Recurse -Force $dir
  }

  if (Test-Path (Join-Path $dir ".git")) {
    Write-Host "  updating existing clone ($dir)"
    & git -C $dir remote set-url origin $url
    if ($LASTEXITCODE -ne 0) { throw "git remote set-url failed for $svc" }
    & git -C $dir fetch --prune --depth=50 origin main
    if ($LASTEXITCODE -ne 0) { throw "git fetch failed for $svc" }
    & git -C $dir reset --hard origin/main
    if ($LASTEXITCODE -ne 0) { throw "git reset failed for $svc" }
    & git -C $dir clean -fd
    if ($LASTEXITCODE -ne 0) { throw "git clean failed for $svc" }
  } else {
    Write-Host "  cloning fresh → $dir"
    & git clone --depth=50 --branch main $url $dir
    if ($LASTEXITCODE -ne 0) { throw "git clone failed for $svc" }
  }

  $head = & git -C $dir log -1 --oneline
  Write-Host "  HEAD: $head"
}

Write-Host "All service repos ready under $servicesRoot"
