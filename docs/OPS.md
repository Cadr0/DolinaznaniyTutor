# Операции: деплой, откат, БД, мониторинг

## Автодеплой (основной способ)

```bash
git add .
git commit -m "описание"
git push origin main
```

GitHub Actions → **Deploy to VDS** (≈3–5 мин на сборку Docker).

Проверка:
- http://111.88.118.35
- http://111.88.118.35/api/health
- http://111.88.118.35/api/version — commit текущей версии

## Откат версии

### Через GitHub (удобно)

1. https://github.com/Cadr0/DolinaznaniyTutor/actions/workflows/rollback.yml
2. **Run workflow**
3. Укажите commit, например `8297575` (из истории Git)
4. Run

### На сервере вручную

```bash
ssh root@111.88.118.35
cd /opt/dolinaznaniy
bash scripts/ops.sh rollback 8297575
```

### Через Git (вернуть код и задеплоить)

```bash
git revert HEAD          # или checkout старого коммита
git push origin main     # запустит обычный deploy
```

## База данных

### Adminer (GUI через SSH-туннель)

На ПК:
```powershell
ssh -L 8080:127.0.0.1:8080 root@111.88.118.35
```

Браузер: http://localhost:8080

| Поле | Значение |
|------|----------|
| System | PostgreSQL |
| Server | `db` |
| Username | `dolinaznaniy` |
| Password | из `/opt/dolinaznaniy/.env` |
| Database | `dolinaznaniy` |

> Adminer слушает только localhost на сервере — снаружи недоступен.

### Консоль PostgreSQL

```bash
ssh root@111.88.118.35 "cd /opt/dolinaznaniy && bash scripts/ops.sh db-shell"
```

### Prisma Studio (локально)

```bash
# DATABASE_URL указывает на сервер через SSH-туннель:
# ssh -L 5432:127.0.0.1:5432 root@111.88.118.35  (если пробросите порт db)
npm run db:studio
```

## Бэкапы БД

Автоматически перед каждым деплоем → `/opt/dolinaznaniy-backups/`

Ручной бэкап:
```bash
bash scripts/ops.sh backup
bash scripts/ops.sh backups   # список файлов
```

Восстановление:
```bash
docker compose -f docker-compose.prod.yml exec -T db \
  psql -U dolinaznaniy -d dolinaznaniy < /opt/dolinaznaniy-backups/ИМЯ_ФАЙЛА.sql
```

## Мониторинг с ПК (PowerShell)

```powershell
$env:VDS_PASSWORD = "пароль_root"
.\scripts\remote-ops.ps1 status
.\scripts\remote-ops.ps1 health
.\scripts\remote-ops.ps1 logs app
.\scripts\remote-ops.ps1 backup
```

## Структура на сервере

| Путь | Назначение |
|------|------------|
| `/opt/dolinaznaniy` | код (git) |
| `/opt/dolinaznaniy/.env` | секреты (не в git) |
| `/opt/dolinaznaniy/.deploy/deploy-info.json` | текущий commit деплоя |
| `/opt/dolinaznaniy-backups/` | дампы PostgreSQL |

## Docker-команды

```bash
cd /opt/dolinaznaniy
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f app
docker compose -f docker-compose.prod.yml restart app
```

## CI (проверка без деплоя)

Pull Request → workflow **CI** (сборка Next.js на GitHub).
