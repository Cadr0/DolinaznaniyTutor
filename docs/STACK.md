# Стек «Долина знаний» (Dolinaznaniy Tutor)

## Цель продукта

Платформа для репетиторов: регистрация, приглашение учеников, комнаты с заданиями, личные кабинеты, маркетплейс заданий.

## Выбранный стек

| Слой | Технология | Зачем |
|------|------------|-------|
| **Frontend + API** | [Next.js 15](https://nextjs.org) (App Router) + TypeScript | Один проект: UI, API, SSR, быстрая разработка (Turbopack) |
| **Стили** | Tailwind CSS 4 | Быстрая вёрстка, единый дизайн |
| **БД** | PostgreSQL 16 | Надёжная реляционная БД для пользователей, комнат, заданий |
| **ORM** | Prisma | Миграции, типы из схемы, быстрый CRUD |
| **Auth** | Better Auth (следующий этап) | Роли: репетитор / ученик / админ |
| **Деплой** | Docker Compose на VDS | Изолированное окружение, один `docker compose up` |
| **CI/CD** | GitHub Actions | Push → сборка → SSH на сервер → перезапуск контейнеров |
| **Прокси** | nginx на хосте | SSL, домен, прокси на порт 3000 |
| **Домен + HTTPS** | Certbot (Let's Encrypt) | После привязки DNS |

## Почему не отдельный backend

Next.js App Router + Server Actions + Route Handlers закрывают 90% задач MVP без отдельного Express/Nest. Меньше инфраструктуры — быстрее итерации.

## Модель данных (MVP)

```
User (TUTOR | STUDENT)
  └── Room (комната репетитора)
        └── RoomMember (ученики)
        └── Assignment (задания в комнате)
              └── Submission (ответы ученика)

MarketplaceTask (общий каталог)
  └── может быть скопировано в Assignment
```

## Этапы разработки

1. **Сейчас** — основа: Next.js, Docker, PostgreSQL, CI/CD, landing
2. **Этап 2** — Auth + роли + профили репетитора/ученика
3. **Этап 3** — комнаты, приглашения, задания
4. **Этап 4** — маркетплейс заданий
5. **Этап 5** — домен, HTTPS, мониторинг

## Скорость сборки

- `output: 'standalone'` в Next.js — минимальный Docker-образ
- Multi-stage Dockerfile — кэш слоёв npm
- GitHub Actions — сборка на сервере (`docker compose build`) без registry на старте
