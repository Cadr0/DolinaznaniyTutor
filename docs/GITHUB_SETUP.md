# GitHub Actions — секреты для автодеплоя

Репозиторий: https://github.com/Cadr0/DolinaznaniyTutor/settings/secrets/actions

Добавьте secrets:

| Name | Value |
|------|-------|
| `VDS_HOST` | `111.88.118.35` |
| `VDS_USER` | `root` |
| `VDS_PASSWORD` | пароль root SSH |
| `POSTGRES_PASSWORD` | см. `/opt/dolinaznaniy/.env` на сервере |
| `AUTH_SECRET` | см. `/opt/dolinaznaniy/.env` на сервере |

После добавления secrets: push в `main` → Actions → Deploy to VDS.

Посмотреть `.env` на сервере:
```bash
ssh root@111.88.118.35 "cat /opt/dolinaznaniy/.env"
```
