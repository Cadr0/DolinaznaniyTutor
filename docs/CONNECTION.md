# Подключение

Секреты → `CONNECTION.local.md` (gitignore).

## SSH

```bash
ssh root@111.88.118.35
```

## GitHub

https://github.com/Cadr0/DolinaznaniyTutor

Secrets: [GITHUB_SETUP.md](GITHUB_SETUP.md)

## Локальная разработка

[DEV.md](DEV.md)

## Переменные на сервере

`/opt/dolinaznaniy/.env` — POSTGRES_PASSWORD, AUTH_SECRET, NEXT_PUBLIC_APP_URL

## Ops с ПК

```powershell
$env:VDS_PASSWORD = "..."
.\infra\remote-ops.ps1 status
```
