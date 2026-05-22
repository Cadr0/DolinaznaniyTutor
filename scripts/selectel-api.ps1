# Работа с Selectel API (статический ключ X-Token)
# $env:SELECTEL_TOKEN = "ваш_ключ"

param(
  [ValidateSet("account", "projects", "floatingips", "balance")]
  [string]$Action = "projects"
)

$token = $env:SELECTEL_TOKEN
if (-not $token) {
  Write-Error "Задайте переменную: `$env:SELECTEL_TOKEN = 'ваш_api_ключ'"
  exit 1
}

$headers = @{ "X-Token" = $token }
$base = "https://api.selectel.ru/vpc/resell/v2"

switch ($Action) {
  "account" { $url = "$base/accounts" }
  "projects" { $url = "$base/projects" }
  "floatingips" { $url = "$base/floatingips?detailed=true" }
  "balance" { $url = "https://api.selectel.ru/v3/balances" }
}

Invoke-RestMethod -Uri $url -Headers $headers | ConvertTo-Json -Depth 6
