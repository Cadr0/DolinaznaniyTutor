# Долина знаний — платформа для репетиторов

Next.js 15 · PostgreSQL · Prisma · Docker · GitHub Actions

## AI-агент — начни здесь

**Главный файл:** [AGENTS.md](AGENTS.md) — подключение, стек, правила, деплой.  
**С паролями:** `AGENTS.md` + `CONNECTION.local.md`

## Быстрый старт (разработчик)

```bash
cp .env.example .env && docker compose up -d
npm install && npm run db:push && npm run dev
```

## Документация

| Кому | Файл |
|------|------|
| **Cursor AI** | **[AGENTS.md](AGENTS.md)** + `CONNECTION.local.md` |
| **Разработчик** | [docs/README.md](docs/README.md) |
| **Секреты** | `CONNECTION.local.md` (не в Git) |

## Деплой

```bash
git push origin main   # → GitHub Actions → VDS
```

## Прод

http://111.88.118.35 · `/api/health` · `/api/version`
