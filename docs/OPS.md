# Операции (Prod, Deploy, Domain, Access)

## Быстрые ссылки

- GitHub Actions: [https://github.com/Cadr0/DolinaznaniyTutor/actions](https://github.com/Cadr0/DolinaznaniyTutor/actions)
- Repo secrets: [https://github.com/Cadr0/DolinaznaniyTutor/settings/secrets/actions](https://github.com/Cadr0/DolinaznaniyTutor/settings/secrets/actions)
- Прод: [https://diary-ai.ru](https://diary-ai.ru)

## Доступ и пути

- SSH: `ssh root@111.88.118.35`
- Код на сервере: `/opt/dolinaznaniy`
- Секреты на сервере: `/opt/dolinaznaniy/.env`
- Секреты локально (не в Git): `CONNECTION.local.md`

```powershell
$env:VDS_PASSWORD = "..."
.\infra\remote-ops.ps1 status
```

## Основной деплой

```bash
git push origin main
```

Пайплайн:

1. GitHub Actions собирает и пушит образы в GHCR.
2. Сервер делает pull готовых образов.
3. Миграции применяются в контейнере `migrate`.
4. `app` перезапускается, `/api/health` и `/api/version` должны отвечать.

## Ручной деплой на сервере

```bash
cd /opt/dolinaznaniy
export GHCR_TOKEN="your_pat"
export GHCR_USER=cadr0
bash infra/deploy.sh
```

## Команды ops

На сервере:

```bash
bash infra/ops.sh status
bash infra/ops.sh health
bash infra/ops.sh logs app
bash infra/ops.sh backup
bash infra/ops.sh db-shell
bash infra/ops.sh domain
```

С Windows:

```powershell
$env:VDS_PASSWORD = "..."
.\infra\remote-ops.ps1 init-ssh-key   # один раз на новом ПК
.\infra\remote-ops.ps1 status
.\infra\remote-ops.ps1 health
.\infra\remote-ops.ps1 logs app
.\infra\remote-ops.ps1 backup
.\infra\remote-ops.ps1 domain
```

## Импорт заданий на production

```bash
# 1. Скопировать legacy-данные на сервер
scp -r "old bd/uploads/tasks" root@111.88.118.35:/opt/dolinaznaniy/old-bd/uploads/
scp "old bd/u188809_dolinaznaniy (1).sql" root@111.88.118.35:/opt/dolinaznaniy/old-bd/

# 2. На сервере после deploy
cd /opt/dolinaznaniy
docker compose -f docker-compose.prod.yml run --rm migrate

docker run --rm --network dolinaznaniy_app \
  -e DATABASE_URL="$(grep DATABASE_URL .env | cut -d= -f2- | tr -d '\"')" \
  -e UPLOADS_DIR=/work/uploads \
  -e IMPORT_TUTOR_EMAIL=catalog@dolinaznaniy.ru \
  -e LEGACY_SQL_PATH=/work/old-bd/u188809_dolinaznaniy\ \(1\).sql \
  -e LEGACY_UPLOADS_DIR=/work/old-bd/uploads/tasks \
  -v "$(pwd)":/work -w /work \
  -v dolinaznaniy_uploads_data:/work/uploads \
  node:22-alpine sh -c "npm install && npx prisma generate && npm run ensure:platform-user && npm run import:legacy-tasks && npm run publish:legacy-topics"
```

Проверка: `/dashboard/marketplace` — темы от «Долина знаний».

## Домен и HTTPS

- Домен: `diary-ai.ru`
- A-записи: `@` и `www` -> `111.88.118.35`
- HTTPS настраивается скриптом:

```bash
cd /opt/dolinaznaniy
bash infra/setup-domain.sh
```

Проверка:

```bash
curl -I https://diary-ai.ru
curl -s https://diary-ai.ru/api/health
curl -s https://diary-ai.ru/api/version
```

## GitHub Secrets (обязательные)


| Secret              | Значение                       |
| ------------------- | ------------------------------ |
| `VDS_HOST`          | `111.88.118.35`                |
| `VDS_USER`          | `root`                         |
| `VDS_PASSWORD`      | пароль root SSH                |
| `GHCR_PAT`          | token с правом `read:packages` |
| `POSTGRES_PASSWORD` | из `/opt/dolinaznaniy/.env`    |
| `AUTH_SECRET`       | из `/opt/dolinaznaniy/.env`    |


`GHCR_PAT` обязателен: без него сервер не сможет скачать готовый образ и начнет локальную сборку.

## Откат

- GitHub: `Rollback on VDS` -> commit hash
- Сервер: `bash infra/ops.sh rollback <commit>`

## База данных и бэкапы

- Auto backup перед деплоем: `/opt/dolinaznaniy-backups/`
- Ручной backup: `bash infra/ops.sh backup`
- SQL shell: `bash infra/ops.sh db-shell`
- Adminer tunnel:

```bash
ssh -L 8080:127.0.0.1:8080 root@111.88.118.35
```

Далее: `http://localhost:8080` (`Server=db`, `User=dolinaznaniy`).

## Диагностика проблем

1. Проверить workflow `Deploy to VDS`:
  - job `build` (сборка/публикация образов)
  - job `deploy` (SSH/запуск deploy.sh)
2. На сервере: `bash infra/ops.sh status`
3. Логи приложения: `bash infra/ops.sh logs app`
4. Проверка API:
  - `curl -s http://127.0.0.1:3000/api/health`
  - `curl -s http://127.0.0.1:3000/api/version`

