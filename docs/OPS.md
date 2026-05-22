# Операции

## Деплой

```bash
git push origin main
```

Actions: https://github.com/Cadr0/DolinaznaniyTutor/actions

## Откат

GitHub → **Rollback on VDS** → указать commit  
или на сервере: `bash infra/ops.sh rollback <commit>`

## Мониторинг с ПК

```powershell
$env:VDS_PASSWORD = "..."
.\infra\remote-ops.ps1 status
.\infra\remote-ops.ps1 health
.\infra\remote-ops.ps1 logs app
.\infra\remote-ops.ps1 backup
```

## БД (Adminer)

```powershell
ssh -L 8080:127.0.0.1:8080 root@111.88.118.35
# http://localhost:8080  Server=db  User=dolinaznaniy
```

Консоль: `bash infra/ops.sh db-shell`

## Бэкапы

Авто перед деплоем → `/opt/dolinaznaniy-backups/`  
Ручной: `bash infra/ops.sh backup`

## Пути на сервере

| Путь | Назначение |
|------|------------|
| `/opt/dolinaznaniy` | код |
| `/opt/dolinaznaniy/.env` | секреты |
| `/opt/dolinaznaniy/.deploy/deploy-info.json` | текущий commit |

## Docker

```bash
cd /opt/dolinaznaniy
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f app
```
