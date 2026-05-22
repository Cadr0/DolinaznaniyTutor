# GitHub Secrets

https://github.com/Cadr0/DolinaznaniyTutor/settings/secrets/actions

| Secret | Значение |
|--------|----------|
| `VDS_HOST` | `111.88.118.35` |
| `VDS_USER` | `root` |
| `VDS_PASSWORD` | пароль SSH |
| `POSTGRES_PASSWORD` | из `/opt/dolinaznaniy/.env` |
| `AUTH_SECRET` | из `/opt/dolinaznaniy/.env` |
| `GHCR_PAT` | **новый** — PAT для pull образов на сервере |

## GHCR_PAT (обязательно для быстрого деплоя)

1. GitHub → Settings → Developer settings → Personal access tokens
2. Fine-grained token или Classic с правом **`read:packages`**
3. Добавить secret `GHCR_PAT` в репозиторий

Без него сервер не сможет скачать готовый образ и будет собирать локально (~10–20 мин).

Push `main` → **Deploy to VDS** (сборка в Actions ~3 мин, деплой на сервер ~1 мин)
