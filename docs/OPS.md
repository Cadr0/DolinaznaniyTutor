# Операции

## Деплой

```bash
git push origin main
```

**Как работает (быстро):**
1. GitHub Actions **собирает** Docker-образ (~3 мин на мощном runner)
2. Пушит в `ghcr.io/cadr0/dolinaznaniy-tutor:main`
3. Сервер **скачивает** образ и перезапускает (~1 мин)

**Раньше было медленно**, потому что Next.js собирался прямо на VDS (5–20 мин, мало CPU/RAM).

Actions: https://github.com/Cadr0/DolinaznaniyTutor/actions

### Ручной деплой на сервере

```bash
cd /opt/dolinaznaniy
export GHCR_TOKEN="ваш_pat"
export GHCR_USER=cadr0
bash infra/deploy.sh
```

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

## Если деплой упал

1. Actions → Deploy to VDS → лог job **build** (ошибка сборки)
2. Actions → Deploy to VDS → лог job **deploy** (SSH / pull)
3. На сервере: `bash infra/ops.sh logs app`
4. Проверить secret `GHCR_PAT` — без него pull не работает
