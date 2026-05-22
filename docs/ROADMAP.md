# Roadmap

> Обновляй при смене этапа. AI сверяется здесь перед большими задачами.

## Этап 1 — Основа ✅

- Next.js + PostgreSQL + Docker + CI/CD
- Landing, `/api/health`, `/api/version`
- Prisma-схема, ops, домен diary-ai.ru (ожидает DNS)

## Этап 1.5 — UI и i18n ✅

- next-intl: ru + en
- Mobile-first landing (Header, Hero, Features, CTA)
- Design tokens, touch targets, safe-area
- docs/DESIGN.md

## Этап 2 — Auth (текущий)

- Better Auth + SMTP (smtp.bz)
- Роли TUTOR | STUDENT
- Профили, защита маршрутов
- Формы входа — mobile-friendly

## Этап 3 — Комнаты

- CRUD комнат, приглашения, список учеников

## Этап 4 — Задания

- CRUD, Submission, feedback репетитора

## Этап 5 — Маркетплейс

- Каталог, поиск, копирование в комнату

## Этап 6 — Прод

- Домен diary-ai.ru (временный)
- HTTPS после DNS
- Мониторинг
- Переход на dolinaznaniy.ru (позже)