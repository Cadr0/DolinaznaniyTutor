# AGENTS.md — старт для AI и автоматизации

> Перед любой задачей прочитай этот файл и (если нужен сервер) `CONNECTION.local.md`.

## За 30 секунд

| Пункт | Значение |
| --- | --- |
| Проект | «Долина знаний» — платформа для репетиторов |
| Стек | Next.js 15 · PostgreSQL · Prisma · Docker · GitHub Actions |
| Репозиторий | [https://github.com/Cadr0/DolinaznaniyTutor](https://github.com/Cadr0/DolinaznaniyTutor) |
| Прод | [https://diary-ai.ru](https://diary-ai.ru) |
| Health | [https://diary-ai.ru/api/health](https://diary-ai.ru/api/health) |
| Version | [https://diary-ai.ru/api/version](https://diary-ai.ru/api/version) |
| Секреты | `CONNECTION.local.md` (не в Git) |
| Текущий этап | [docs/ROADMAP.md](docs/ROADMAP.md) |

## Каноничная документация

1. [docs/SYSTEM.md](docs/SYSTEM.md) — функционал, цикл репетитор↔ученик, аудит prod
2. [docs/PRODUCT.md](docs/PRODUCT.md) — продукт и сущности
3. [docs/ROADMAP.md](docs/ROADMAP.md) — этапы и приоритеты
4. [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — структура и техническая схема
5. [docs/DESIGN.md](docs/DESIGN.md) — UI и UX правила
6. [docs/DEV.md](docs/DEV.md) — локальная разработка
7. [docs/OPS.md](docs/OPS.md) — сервер, доступы, деплой, откат, домен, CI/CD

## Базовые команды

Локально:
```bash
cp .env.example .env
docker compose up -d
npm install
npm run db:push
npm run dev
```

Сервер:
```bash
ssh root@111.88.118.35
cd /opt/dolinaznaniy
bash infra/ops.sh status
bash infra/ops.sh health
```

Деплой:
```bash
git push origin main
```

## Структура репозитория

```text
src/                  код приложения (Next.js App Router)
prisma/schema.prisma  единственный источник модели БД
infra/                скрипты сервера и деплоя
docs/                 каноничная документация проекта
.github/workflows/    CI/CD пайплайны
```

## Правила

- Минимальный diff, без несвязанных изменений.
- Не хранить секреты в Git.
- Не создавать отдельный backend вне Next.js App Router.
- Скрипты деплоя и ops держать только в `infra/`.
- Любые утверждения о состоянии системы подтверждать проверкой (`build`, `curl`, `ssh`, логи).

## Чеклист новой сессии

- Прочитан `AGENTS.md`.
- Понят текущий этап из `docs/ROADMAP.md`.
- Для серверных задач открыт `CONNECTION.local.md`.
- Перед реализацией сверены `docs/ARCHITECTURE.md` и `docs/OPS.md`.

