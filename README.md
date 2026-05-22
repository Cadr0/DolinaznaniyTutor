# Долина знаний — платформа для репетиторов

Next.js 15 · PostgreSQL · Prisma · Docker · GitHub Actions

## Старт

- AI и автоматизация: [AGENTS.md](AGENTS.md)
- Локальные секреты: `CONNECTION.local.md` (не в Git)

## Быстрый старт (разработчик)

```bash
cp .env.example .env && docker compose up -d
npm install && npm run db:push && npm run dev
```

## Документация

- [docs/PRODUCT.md](docs/PRODUCT.md)
- [docs/ROADMAP.md](docs/ROADMAP.md)
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/DESIGN.md](docs/DESIGN.md)
- [docs/DEV.md](docs/DEV.md)
- [docs/OPS.md](docs/OPS.md)

## Деплой

```bash
git push origin main   # → GitHub Actions → VDS
```

## Прод

- https://diary-ai.ru
- https://diary-ai.ru/api/health
- https://diary-ai.ru/api/version
