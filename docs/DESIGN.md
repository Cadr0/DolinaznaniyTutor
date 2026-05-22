# UI и UX

## Принципы (психология + UX)

| Принцип | Как применяем |
|---------|----------------|
| **Один главный CTA** | Одна зелёная кнопка на экран — «Начать бесплатно» |
| **Снижение тревоги** | Trust-блоки: бесплатно, мобильно, безопасно |
| **Правило 3** | Три карточки возможностей — не перегружать |
| **Mobile-first** | Вёрстка с телефона, `min-h-dvh`, safe-area |
| **Touch targets** | Минимум 44px (`.touch-target`) |
| **Читаемость** | `max-width: 65ch`, контраст slate/emerald |
| **Прогресс** | (этап 3+) видимый прогресс ученика — мотивация |

## Цвета

- Фон: `#0b1220` — спокойный, не утомляет
- Акцент: emerald — рост, обучение, доверие
- Текст: slate — иерархия через opacity

Токены: `src/app/globals.css` → `:root`

## i18n (next-intl)

| | |
|---|---|
| Библиотека | [next-intl](https://next-intl.dev) |
| Языки | `ru` (default), `en` |
| URL | `/` = ru, `/en` = english (`localePrefix: as-needed`) |
| Переводы | `messages/ru.json`, `messages/en.json` |
| Навигация | `@/i18n/navigation` — Link, useRouter |
| Новый текст | ключ в **оба** JSON-файла |

### Добавить перевод

1. Ключ в `messages/ru.json` и `messages/en.json`
2. `useTranslations('namespace')` в компоненте
3. Не хардкодить строки в JSX

## Структура компонентов

```
src/components/
  layout/     Header, Footer
  landing/    секции главной
  ui/         LanguageSwitcher, будущие кнопки
```

## Mobile

- Sticky header + backdrop blur
- Кнопки на всю ширину на `< sm`
- `pb-[env(safe-area-inset-bottom)]` в footer
- `viewport` theme-color в layout

## Дальше (по ROADMAP)

- [ ] shadcn/ui — формы Auth (этап 2)
- [ ] Skeleton loaders
- [ ] PWA manifest (опционально)
- [ ] Тёмная/светлая тема — не приоритет (dark by default)
