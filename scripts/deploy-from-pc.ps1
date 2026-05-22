# Запуск с вашего ПК (спросит passphrase ключа один раз)
$Server = "111.88.118.35"
$Key = "$env:USERPROFILE\.ssh\id_ed25519"
$rootDir = Split-Path $PSScriptRoot -Parent

Write-Host "Копируем скрипт на сервер..."
scp -i $Key "$rootDir\scripts\install-all.sh" "root@${Server}:/root/install-all.sh"
Write-Host "Запускаем установку..."
ssh -i $Key "root@$Server" "bash /root/install-all.sh"
Write-Host "Готово: http://$Server"
