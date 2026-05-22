# Подключение к инфраструктуре

Секреты (пароли, API-ключи) храните только в **`CONNECTION.local.md`** в корне проекта — этот файл в `.gitignore`.

## VDS (Selectel)

```bash
ssh root@111.88.118.35
```

- Ubuntu 24.04, hostname: `dolinaznaniy`
- Проект на сервере: `/opt/dolinaznaniy`
- Сайт: http://111.88.118.35 (позже — домен + HTTPS)

## GitHub

- Репозиторий: [Cadr0/DolinaznaniyTutor](https://github.com/Cadr0/DolinaznaniyTutor)
- Push в `main` → GitHub Actions собирает и деплоит на VDS

## Локальная разработка

```bash
cp .env.example .env
docker compose up -d    # PostgreSQL
npm install
npm run db:push
npm run dev             # http://localhost:3000
```

## Selectel API (опционально)

```powershell
$env:SELECTEL_TOKEN = "ваш_ключ"
.\scripts\selectel-api.ps1 -Action projects
```

## Переменные на сервере (`/opt/dolinaznaniy/.env`)

Смотреть на сервере: `ssh root@111.88.118.35 "cat /opt/dolinaznaniy/.env"`

| Переменная | Назначение |
|------------|------------|
| `POSTGRES_PASSWORD` | пароль PostgreSQL |
| `AUTH_SECRET` | секрет для auth (будущий этап) |
| `NEXT_PUBLIC_APP_URL` | `http://111.88.118.35` |

## GitHub Secrets (для CI/CD)

См. [docs/GITHUB_SETUP.md](GITHUB_SETUP.md)
