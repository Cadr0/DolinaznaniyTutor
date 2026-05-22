# Infra — сервер и деплой (не код приложения)

| Файл | Назначение |
|------|------------|
| `ops.sh` | status, logs, backup, rollback на сервере |
| `remote-ops.ps1` | вызов ops.sh с Windows |
| `server-bootstrap.sh` | первичная настройка VDS |
| `fix-server-env.sh` | создать `.env` на сервере |
| `nginx/dolinaznaniy.conf` | reverse proxy → :3000 |

На сервере: `/opt/dolinaznaniy/infra/ops.sh`
