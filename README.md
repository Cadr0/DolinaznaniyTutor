# Долина знаний — платформа для репетиторов

[MVP] Next.js 15 · PostgreSQL · Prisma · Docker · GitHub Actions

## Быстрый старт (локально)

```bash
cp .env.example .env
docker compose up -d          # PostgreSQL
npm install
npm run db:push
npm run dev                   # http://localhost:3000
```

## Стек

См. [docs/STACK.md](docs/STACK.md)

## Подключение к серверу

См. [docs/CONNECTION.md](docs/CONNECTION.md) — секреты в `CONNECTION.local.md` (не в Git).

## Git + автодеплой

1. Push в `main` на [GitHub](https://github.com/Cadr0/DolinaznaniyTutor)
2. GitHub Actions собирает проект (CI) и деплоит на VDS (Deploy)

### Secrets в GitHub (Settings → Secrets → Actions)

| Secret | Пример |
|--------|--------|
| `VDS_HOST` | `111.88.118.35` |
| `VDS_USER` | `root` |
| `VDS_PASSWORD` | пароль root |
| `POSTGRES_PASSWORD` | сильный пароль БД |
| `AUTH_SECRET` | случайная строка 32+ символов |

На сервере один раз создайте `/opt/dolinaznaniy/.env` (см. `.env.example`).

## Структура

```
src/app/          — страницы и API (Next.js App Router)
prisma/           — схема БД
docker-compose*   — локально и прод
.github/workflows — CI/CD
docs/             — документация
```

## API

- `GET /api/health` — статус приложения и БД
