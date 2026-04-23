# Windows PowerShell equivalent of integration-logs.sh.

$ErrorActionPreference = "Continue"

$logDir = if ($env:GITHUB_WORKSPACE) {
  Join-Path $env:GITHUB_WORKSPACE "logs"
} else {
  Join-Path $PWD "logs"
}
New-Item -Force -ItemType Directory -Path $logDir | Out-Null

$containers = @(
  "ludiars-ci-cernere-pg","ludiars-ci-cernere-redis","ludiars-ci-cernere-backend",
  "ludiars-ci-actio-pg","ludiars-ci-actio-redis","ludiars-ci-actio-backend",
  "ludiars-ci-nuntius-pg","ludiars-ci-nuntius-redis","ludiars-ci-nuntius-api","ludiars-ci-nuntius-worker",
  "ludiars-ci-imperativus-stt","ludiars-ci-imperativus-app"
)

foreach ($c in $containers) {
  & docker inspect $c *>$null
  if ($LASTEXITCODE -eq 0) {
    Write-Host "───── $c ─────"
    & docker logs $c *> (Join-Path $logDir "$c.log")
    & docker inspect --format='State:   running={{.State.Running}} exit={{.State.ExitCode}} health={{.State.Health.Status}}' $c *> (Join-Path $logDir "$c.state")
    Get-Content -Tail 30 (Join-Path $logDir "$c.log") | ForEach-Object { Write-Host $_ }
  } else {
    Write-Host "───── $c : not present ─────"
  }
}

Write-Host "Logs written to $logDir"
Get-ChildItem $logDir | Format-Table Name, Length
