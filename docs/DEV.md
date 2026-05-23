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

→ [http://localhost:3000](http://localhost:3000)

## Команды


| Команда             | Действие                  |
| ------------------- | ------------------------- |
| `npm run dev`       | dev-сервер (Turbopack)    |
| `npm run build`     | production-сборка         |
| `npm run db:push`   | синхрон схемы Prisma → БД |
| `npm run db:studio` | GUI для БД                |
| `npm run lint`      | ESLint                    |
| `npm run import:legacy-tasks` | импорт тем/заданий из старой MySQL-дампа |


## Импорт заданий из старой БД

1. Положите SQL-дамп и папку `uploads/` в `old bd/` (структура: `old bd/uploads/tasks/`).
2. Зарегистрируйте учительский аккаунт в приложении.
3. В `.env` задайте:

```bash
IMPORT_TUTOR_EMAIL="teacher@example.com"
LEGACY_SQL_PATH="./old bd/u188809_dolinaznaniy (1).sql"
LEGACY_UPLOADS_DIR="./old bd/uploads/tasks"
```

4. Проверьте, что картинки на месте:

```bash
npm run validate:legacy-assets
```

5. Запустите импорт:

```bash
npm run import:legacy-tasks
```

Скрипт идемпотентен: повторный запуск пропускает уже импортированные записи (`legacyTopicId` / `legacyTaskId`).

Изображения заданий в dev лежат в `./uploads/tasks/` и отдаются через `/uploads/tasks/[filename]`.


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

