# Roadmap

> Обновляй при смене этапа. AI сверяется здесь перед большими задачами.

## Этап 1 — Основа ✅

- Next.js + PostgreSQL + Docker + CI/CD
- Landing, `/api/health`, `/api/version`
- Prisma-схема, ops, домен diary-ai.ru

## Этап 1.5 — UI и i18n ✅

- next-intl: ru + en
- Mobile-first landing
- Design tokens, docs/DESIGN.md

## Этап 2 — Auth ✅

- Better Auth + SMTP
- Роли TUTOR | STUDENT
- Профили, защита маршрутов, онбординг

## Этап 3 — Комнаты ✅

- CRUD комнат, приглашения, список учеников
- Drawer и страница `/dashboard/students`

## Этап 4 — Задания ✅ (основной цикл)

- TaskTopic → RoomTopic → StudentTopicAssignment
- TaskPlayer (TEXT / CHOICE / IMAGE)
- Прогресс, попытки, назначение/снятие
- **Карточка ученика** `/dashboard/students/[id]` с логами попыток
- **Проверка IMAGE** `/dashboard/review`

## Этап 5 — Маркетплейс ✅

- Каталог опубликованных тем, поиск, теги
- Копирование в комнату
- **Копирование из банка материалов в комнату** без публикации

## Этап 6 — Прод (текущий)

- diary-ai.ru, HTTPS, CI/CD ✅
- Живая главная dashboard с метриками ✅
- E2E на prod
- Мониторинг, переход на dolinaznaniy.ru (позже)

## Следующие приоритеты

- Уведомления ученику о новом назначении (email)
- E2E: полный flow assign → solve → tutor stats
- Очистка legacy Assignment/Submission в коде
- Модерация контента комнат (admin)
