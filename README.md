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

1. Push в `main` → GitHub Actions → **Deploy to VDS**
2. Откат: Actions → **Rollback on VDS** или `docs/OPS.md`

Подробно: [docs/OPS.md](docs/OPS.md) · [docs/GITHUB_SETUP.md](docs/GITHUB_SETUP.md)

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
