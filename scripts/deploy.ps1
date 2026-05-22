# Деплой site/index.html на VDS
# $env:VDS_PASSWORD = "пароль_root"
# .\scripts\deploy.ps1

$Server = "111.88.118.35"
$User = "root"
$Password = $env:VDS_PASSWORD
$RemotePath = "/var/www/dolinaznaniy/index.html"
$LocalFile = Join-Path $PSScriptRoot "..\site\index.html"
$HostKey = "SHA256:6NGlgrWnOqC6o8vF8RaQ7kvPdMhsYO6eRYERgSyHYxw"

if (-not $Password) {
  Write-Error "Задайте: `$env:VDS_PASSWORD = 'пароль_root'"
  exit 1
}

$plink = "C:\Program Files\PuTTY\plink.exe"
$pscp = "C:\Program Files\PuTTY\pscp.exe"

if (-not (Test-Path $LocalFile)) {
  Write-Error "Не найден файл: $LocalFile"
  exit 1
}

Write-Host "Создаём каталог на сервере..."
& $plink -ssh "${User}@${Server}" -pw $Password -hostkey $HostKey -batch "mkdir -p /var/www/dolinaznaniy && chown www-data:www-data /var/www/dolinaznaniy"

Write-Host "Загружаем index.html..."
& $pscp -hostkey $HostKey -pw $Password $LocalFile "${User}@${Server}:${RemotePath}"

Write-Host "Права для nginx..."
& $plink -ssh "${User}@${Server}" -pw $Password -hostkey $HostKey -batch "chown www-data:www-data $RemotePath"

Write-Host "Готово: http://$Server"
