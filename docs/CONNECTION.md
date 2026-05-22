# Подключение к инфраструктуре

Секреты (пароли, API-ключи) храните только в **`CONNECTION.local.md`** в корне проекта — этот файл в `.gitignore`.

## VDS (Selectel)

```bash
ssh root@111.88.118.35
```

- Ubuntu 24.04, hostname: `dolinaznaniy`
- Проект на сервере: `/opt/dolinaznaniy`
- Сайт: http://111.88.118.35 (позже — домен + HTTPS)

## GitHub

- Репозиторий: [Cadr0/DolinaznaniyTutor](https://github.com/Cadr0/DolinaznaniyTutor)
- Push в `main` → GitHub Actions собирает и деплоит на VDS

## Локальная разработка

```bash
cp .env.example .env
docker compose up -d    # PostgreSQL
npm install
npm run db:push
npm run dev             # http://localhost:3000
```

## Selectel API (опционально)

```powershell
$env:SELECTEL_TOKEN = "ваш_ключ"
.\scripts\selectel-api.ps1 -Action projects
```

## GitHub Secrets (для CI/CD)

В репозитории: **Settings → Secrets and variables → Actions**

| Secret | Описание |
|--------|----------|
| `VDS_HOST` | `111.88.118.35` |
| `VDS_USER` | `root` |
| `VDS_PASSWORD` | пароль root |
| `POSTGRES_PASSWORD` | пароль БД на сервере |
| `AUTH_SECRET` | случайная строка 32+ символов |
