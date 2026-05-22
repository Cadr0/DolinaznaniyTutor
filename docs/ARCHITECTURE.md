# Архитектура

## Стек


| Слой       | Технология                                    |
| ---------- | --------------------------------------------- |
| i18n       | next-intl (ru, en)                            |
| UI         | Tailwind 4, mobile-first — см. docs/DESIGN.md |
| БД         | PostgreSQL 16                                 |
| ORM        | Prisma                                        |
| Auth       | Better Auth (этап 2)                          |
| Контейнеры | Docker Compose                                |
| CI/CD      | GitHub Actions                                |
| Прокси     | nginx → :3000                                 |


Отдельный backend не используем — Server Components, Route Handlers, Server Actions.

## Структура папок

```
/
├── AGENTS.md              ← AI: читать первым
├── README.md              ← люди: точка входа
├── CONNECTION.local.md    ← секреты (gitignore)
│
├── src/
│   ├── app/[locale]/      ← страницы (i18n)
│   ├── app/api/           ← REST
│   ├── components/        ← UI
│   ├── i18n/              ← next-intl
│   └── lib/
├── messages/              ← ru.json, en.json
│
├── prisma/
│   └── schema.prisma      ← модель данных
│
├── infra/                 ← сервер, не приложение
│   ├── ops.sh
│   ├── server-bootstrap.sh
│   ├── remote-ops.ps1
│   └── nginx/
│
├── docs/                  ← документация
├── .github/workflows/     ← ci.yml, deploy.yml, rollback.yml
├── Dockerfile
├── docker-compose.yml     ← dev (только postgres)
└── docker-compose.prod.yml
```

## Маршруты API


| Endpoint           | Назначение      |
| ------------------ | --------------- |
| `GET /api/health`  | статус app + БД |
| `GET /api/version` | commit деплоя   |


## Модель данных

См. `prisma/schema.prisma`. Кратко:

- `User` — email, role (TUTOR/STUDENT/ADMIN)
- `Room` — комната репетитора
- `RoomMember` — ученик в комнате
- `Assignment` — задание
- `Submission` — ответ ученика
- `MarketplaceTask` — задание в каталоге

## Сборка

- Next.js `output: 'standalone'` → компактный Docker-образ
- `GIT_COMMIT` передаётся при сборке → `/api/version`

