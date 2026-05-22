# Домен diary-ai.ru

> Временный домен проекта. Позже можно перейти на dolinaznaniy.ru.

## Шаг 1 — DNS в reg.ru (вы делаете вручную)

1. Войдите в [reg.ru](https://www.reg.ru) → **Домены** → **diary-ai.ru** → **DNS-серверы и зона**
2. Убедитесь, что DNS: `ns1.reg.ru` / `ns2.reg.ru` (как сейчас)

### Изменить

| Тип | Host | Было | Стало |
|-----|------|------|-------|
| **A** | `@` | `158.160.116.199` | **`111.88.118.35`** |

### Добавить (если нет)

| Тип | Host | Значение |
|-----|------|----------|
| **A** | `www` | `111.88.118.35` |

### Не трогать (нужны для smtp.bz)

| Тип | Host | Значение |
|-----|------|----------|
| CNAME | `stats` | `smtp.bz.` |
| TXT | `@` | `v=spf1 a mx include:spf.smtp.bz ~all` |
| TXT | `smtpbz._domainkey` | (длинный DKIM-ключ) |

### Можно удалить (старое)

| Тип | Host | Значение |
|-----|------|----------|
| TXT | `@` | `diaryaimy-diary-ai-project` — старый проект, не нужен |

Сохраните. DNS обновится за **5–30 минут** (иногда до 2 часов).

---

## Шаг 2 — Проверка DNS

На ПК:
```powershell
nslookup diary-ai.ru
```
Должен быть **`111.88.118.35`**.

Или на сервере:
```bash
dig +short diary-ai.ru A
```

---

## Шаг 3 — HTTPS на сервере (AI или вы)

Когда DNS указывает на VDS:
```bash
ssh root@111.88.118.35
cd /opt/dolinaznaniy
bash infra/setup-domain.sh
```

Скрипт: nginx → Let's Encrypt → обновит `NEXT_PUBLIC_APP_URL`.

---

## Шаг 4 — Проверка

- https://diary-ai.ru
- https://diary-ai.ru/api/health
- https://diary-ai.ru/api/version

---

## SMTP (smtp.bz) — для писем позже

Уже настроено в smtp.bz для `@diary-ai.ru` (SPF, DKIM, верификация ✅).

Параметры — в `CONNECTION.local.md` (не в Git).  
Используем на **Этапе 2 (Auth)** для регистрации и сброса пароля.

| Параметр | Значение |
|----------|----------|
| Хост | `connect.smtp.bz` |
| Порт | `587` (TLS) или `2525` |
| Логин | см. CONNECTION.local.md |
| From | `noreply@diary-ai.ru` |

Сервис: [smtp.bz](https://smtp.bz/) — бесплатно до 15 000 писем/мес.

---

## Если что-то не работает

| Проблема | Решение |
|----------|---------|
| Сайт не открывается | DNS ещё не обновился — подождите |
| HTTP работает, HTTPS нет | запустите `infra/setup-domain.sh` |
| Письма не идут | проверьте SPF/DKIM в reg.ru, credentials в .env |
