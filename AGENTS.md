# AGENTS.md — главный файл для AI-агента

> **Дай AI только этот файл + `CONNECTION.local.md` (с паролями).**  
> Остальное — по ссылкам ниже, когда нужно углубиться.

---

## За 30 секунд

| | |
|---|---|
| **Проект** | «Долина знаний» — платформа для репетиторов (комнаты, задания, маркетплейс) |
| **Стек** | Next.js 15 · PostgreSQL · Prisma · Docker · GitHub Actions |
| **Репозиторий** | https://github.com/Cadr0/DolinaznaniyTutor |
| **Прод** | https://diary-ai.ru (после DNS) · http://111.88.118.35 |
| **Домен** | [docs/DOMAIN.md](docs/DOMAIN.md) |
| **Health** | http://111.88.118.35/api/health |
| **Версия** | http://111.88.118.35/api/version |
| **Секреты** | `CONNECTION.local.md` в корне (не в Git) |
| **Этап** | [docs/ROADMAP.md](docs/ROADMAP.md) → сейчас **Этап 2: Auth** |

---

## Как подключиться и работать

### Локально (разработка)

```bash
cp .env.example .env
docker compose up -d          # PostgreSQL
npm install && npm run db:push && npm run dev
```

→ http://localhost:3000

### Сервер (VDS Selectel)

```bash
ssh root@111.88.118.35          # пароль в CONNECTION.local.md
cd /opt/dolinaznaniy            # код на сервере
cat .env                        # секреты БД
bash infra/ops.sh status        # git + docker
bash infra/ops.sh health        # API
```

### С Windows (Cursor / автomation)

```powershell
$env:VDS_PASSWORD = "..."       # из CONNECTION.local.md
.\infra\remote-ops.ps1 status
.\infra\remote-ops.ps1 health
.\infra\remote-ops.ps1 logs app
.\infra\remote-ops.ps1 backup
```

### Деплой и откат

```bash
git push origin main            # → GitHub Actions → VDS (~3–5 мин)
```

Откат: GitHub → Actions → **Rollback on VDS** → commit hash  
Подробно: [docs/OPS.md](docs/OPS.md)

### БД

- Схема: `prisma/schema.prisma`
- Adminer: SSH-туннель `ssh -L 8080:127.0.0.1:8080 root@111.88.118.35` → http://localhost:8080 (Server=`db`, User=`dolinaznaniy`)
- Консоль: `bash infra/ops.sh db-shell`

---

## Документация (читать по необходимости)

1. [docs/PRODUCT.md](docs/PRODUCT.md) — продукт и сущности
2. [docs/ROADMAP.md](docs/ROADMAP.md) — **текущие задачи**
3. [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — стек и папки
4. [docs/DEV.md](docs/DEV.md) — локальная разработка
5. [docs/OPS.md](docs/OPS.md) — деплой, откат, бэкапы
6. [docs/CONNECTION.md](docs/CONNECTION.md) — доступы без секретов
7. [docs/GITHUB_SETUP.md](docs/GITHUB_SETUP.md) — CI/CD secrets
8. [docs/DOMAIN.md](docs/DOMAIN.md) — домен diary-ai.ru + SMTP

---

## Структура репозитория

```
AGENTS.md              ← ты здесь (главный файл AI)
CONNECTION.local.md    ← пароли, SSH, API-ключи
src/app/               ← страницы и API (Next.js)
src/lib/               ← prisma, auth, utils
prisma/schema.prisma   ← модель БД (единственный источник)
infra/                 ← Docker, nginx, ops-скрипты сервера
docs/                  ← документация
.github/workflows/     ← CI, Deploy, Rollback
.cursor/rules/         ← правила Cursor
```

---

## Правила разработки

### Код

- **Минимальный diff** — не трогать несвязанное
- **Один стек** — Next.js + Prisma + PostgreSQL
- **Секреты не в Git** — только `.env.example` и `CONNECTION.local.md`
- **API** → `src/app/api/<name>/route.ts`
- **Страницы** → `src/app/<route>/page.tsx`
- **БД** → правка `prisma/schema.prisma` → `npm run db:push`
- **Деплой** → push в `main`

### Не создавать

- Отдельный Express/Nest backend
- Дубли документации в корне (кроме README и AGENTS.md)
- Скрипты вне `infra/`
- Лишние markdown-файлы

---

## Правила для сложных задач

### Предпочитать готовое и проверенное

- Сначала ищи **официальную документацию**, **npm-пакет с активной поддержкой**, **MCP-сервер** (Context7, Supabase, Vercel и т.д.)
- Не пиши с нуля то, что уже есть: auth → Better Auth, UI → shadcn, email → провайдер, файлы → S3/Blob
- Для библиотек — **Context7 MCP** или официальные docs, не полагайся на память
- Для Supabase/Postgres/Vercel/Next.js — используй skills и MCP плагинов Cursor, если доступны

### Не выдумывать — проверять

- **Не придумывай** API, флаги CLI, env-переменные, endpoints — проверь в коде или docs
- **Не утверждай**, что что-то работает, пока не проверил (build, curl, SSH, логи)
- Если API/пакет неизвестен — **прочитай документацию** или **запусти команду**, не галлюцинируй синтаксис
- Если задача блокируется (нет доступа, нет npm, нет пароля) — **скажи явно**, не симулируй результат

### MCP и инструменты (когда использовать)

| Задача | Инструмент |
|--------|------------|
| Документация библиотеки | Context7 MCP |
| Supabase / Postgres | Supabase MCP + skill |
| Next.js / Vercel | nextjs skill, Vercel MCP |
| Деплой / CI | читать `.github/workflows/`, `infra/` |
| Браузер / UI-проверка | cursor-ide-browser MCP |
| GitLab (если понадобится) | GitLab MCP |

### Перед большой задачей

1. Прочитать [docs/ROADMAP.md](docs/ROADMAP.md) — не уходить за рамки этапа
2. Прочитать [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — не ломать структуру
3. Выбрать готовое решение → проверить docs → минимальная интеграция

---

## Чеклист новой сессии AI

- [ ] Прочитал AGENTS.md
- [ ] Есть `CONNECTION.local.md` для SSH/секретов (если нужен сервер)
- [ ] Знаю этап из ROADMAP.md
- [ ] Не добавляю лишних файлов и фреймворков
- [ ] Проверяю факты перед утверждениями
