# AGENTS.md — инструкция для Cursor AI

> Читай этот файл **первым** в каждой сессии. Детали — по ссылкам, не дублируй.

## Проект

**Долина знаний (Dolinaznaniy Tutor)** — платформа для репетиторов: комнаты, ученики, задания, маркетплейс материалов.

| | |
|---|---|
| Репозиторий | https://github.com/Cadr0/DolinaznaniyTutor |
| Прод | http://111.88.118.35 |
| Секреты | `CONNECTION.local.md` (не в Git) |

## Документация (цепочка)

1. [docs/PRODUCT.md](docs/PRODUCT.md) — **зачем** и сущности продукта
2. [docs/ROADMAP.md](docs/ROADMAP.md) — **текущий этап** и задачи
3. [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — **стек** и структура папок
4. [docs/DEV.md](docs/DEV.md) — локальная разработка
5. [docs/OPS.md](docs/OPS.md) — деплой, откат, БД
6. [docs/CONNECTION.md](docs/CONNECTION.md) — доступы (без секретов)

## Структура репозитория

```
src/app/          UI + API (Next.js App Router) — основной код
src/lib/          общие модули (prisma, auth, utils)
prisma/           схема БД — единственный источник модели данных
infra/            Docker, nginx, скрипты сервера — не бизнес-логика
docs/             вся документация
.github/workflows CI/CD
```

## Правила кода

- **Минимальный diff** — не трогать несвязанное
- **Один стек** — Next.js + Prisma + PostgreSQL, без лишних фреймворков
- **Нет секретов в Git** — только `.env.example`, секреты в `.env` / `CONNECTION.local.md`
- **Новые API** — `src/app/api/<name>/route.ts`
- **Новые страницы** — `src/app/<route>/page.tsx`
- **Изменение БД** — правка `prisma/schema.prisma` → `npm run db:push` (dev) / migrate на проде
- **Деплой** — push в `main`, не ручной деплой без причины

## Не создавать

- Отдельный Express/Nest backend
- Дубли docs в корне (кроме README и AGENTS.md)
- Скрипты в корне — только `infra/`
- Статический `site/` — всё через Next.js
- Лишние markdown-файлы без необходимости

## Текущий этап

См. [docs/ROADMAP.md](docs/ROADMAP.md). Сейчас: **Этап 1 завершён** (основа). Следующий: **Auth + роли**.

## Быстрые команды

```bash
npm run dev          # локально
npm run db:push      # синхрон схемы БД
git push origin main # деплой на VDS
```

```powershell
$env:VDS_PASSWORD = "..." ; .\infra\remote-ops.ps1 status
```
