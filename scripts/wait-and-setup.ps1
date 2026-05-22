# Ждёт SSH и настраивает nginx. Использует OpenSSH (ssh/scp).
# Пример: .\scripts\wait-and-setup.ps1 -Password "новый_пароль_из_панели"

param(
  [string]$Server = "111.88.118.35",
  [string]$User = "root",
  [string]$Password = "",
  [string]$KeyPath = "$env:USERPROFILE\.ssh\dolinaznaniy_deploy"
)

$rootDir = Split-Path $PSScriptRoot -Parent
$setupScript = Join-Path $rootDir "scripts\setup-server.sh"
$indexHtml = Join-Path $rootDir "site\index.html"

function Get-SshArgs {
  $a = @("-o", "StrictHostKeyChecking=accept-new", "-o", "BatchMode=yes")
  if ($Password) {
    if (-not (Get-Command sshpass -ErrorAction SilentlyContinue)) {
      Write-Host "Для пароля установите sshpass или используйте ключ (см. DEPLOY.md)"
    }
  } elseif (Test-Path $KeyPath) {
    $a += @("-i", $KeyPath)
  }
  return $a
}

function Invoke-Ssh([string]$Command) {
  $target = "${User}@${Server}"
  if ($Password -and (Get-Command sshpass -ErrorAction SilentlyContinue)) {
    $env:SSHPASS = $Password
    & sshpass -e ssh @((Get-SshArgs)) $target $Command
  } else {
    & ssh @((Get-SshArgs)) $target $Command
  }
  return $LASTEXITCODE -eq 0
}

Write-Host "Проверка SSH ($Server)..."
if (-not (Invoke-Ssh "echo ok")) {
  Write-Host @"

SSH пока недоступен. Один раз в панели Selectel (https://my.selectel.ru):

  Продукты → Облачные серверы → сервер → Консоль → «Сгенерировать новый» (пароль root)

Скопируйте пароль и запустите:

  .\scripts\wait-and-setup.ps1 -Password 'ВАШ_ПАРОЛЬ'

Либо добавьте ключ из deploy/ssh_pubkey.txt в SSH-ключи сервера и запустите без -Password.

"@
  exit 1
}

Write-Host "Установка nginx..."
& scp @((Get-SshArgs)) $setupScript "${User}@${Server}:/root/setup-server.sh"
Invoke-Ssh "bash /root/setup-server.sh" | Out-Null

Write-Host "Загрузка сайта..."
& ssh @((Get-SshArgs)) "${User}@${Server}" "mkdir -p /var/www/dolinaznaniy"
& scp @((Get-SshArgs)) $indexHtml "${User}@${Server}:/var/www/dolinaznaniy/index.html"
Invoke-Ssh "chown www-data:www-data /var/www/dolinaznaniy/index.html" | Out-Null

Write-Host "Готово: http://$Server"
