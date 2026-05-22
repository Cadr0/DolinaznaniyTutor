# Локальная разработка

## Требования

- Node.js 22+
- Docker (для PostgreSQL)

## Первый запуск

```bash
cp .env.example .env
docker compose up -d
npm install
npm run db:push
npm run dev
```

→ http://localhost:3000

## Команды

| Команда | Действие |
|---------|----------|
| `npm run dev` | dev-сервер (Turbopack) |
| `npm run build` | production-сборка |
| `npm run db:push` | синхрон схемы Prisma → БД |
| `npm run db:studio` | GUI для БД |
| `npm run lint` | ESLint |

## Изменение БД

1. Правка `prisma/schema.prisma`
2. `npm run db:push` (dev)
3. На проде — migrate через Docker (см. OPS.md)

## Стиль кода

- TypeScript strict
- App Router: Server Components по умолчанию, `"use client"` только при необходимости
- Tailwind для стилей
- Импорты через `@/` → `src/`

## Перед push

```bash
npm run build
git push origin main   # → автодеплой
```
