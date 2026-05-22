# UI и UX

## Стиль

Мягкий, дружелюбный, светлый — **без чёрного (#000)**. Референс: образовательные лендинги с mint/teal + off-white.

| Элемент | Значение |
|---------|----------|
| Фон | `#f7fafa` |
| Текст | `#2a3e47` (тёплый charcoal) |
| Вторичный текст | `#7a9199` |
| Акцент | `#3daa9a` (mint/teal) |
| Карточки | белые, мягкая тень |
| Кнопки | pill (полностью скруглённые) |

## Типографика

- **Заголовки:** Fraunces (serif) — `.font-display`
- **Текст:** Nunito (sans) — округлый, дружелюбный

## Паттерны Ozon / Wildberries

| Паттерн | Где |
|---------|-----|
| Logo слева, nav по центру, CTA справа | Header |
| «Войти» outline + «Начать» filled pill | Header |
| Sticky bottom bar с главной кнопкой | Mobile (≤ sm) |
| Горизонтальный скролл карточек | Features (mobile) |
| «Подробнее →» в карточке | Features |
| Email + кнопка в одной pill-форме | Hero |

## i18n

См. предыдущие правила — `messages/ru.json` + `messages/en.json`, `@/i18n/navigation`.

## Компоненты

```
ui/Button.tsx          primary | secondary | ghost
layout/MobileActionBar sticky CTA на mobile
landing/ValuesSection  3 колонки (учиться / практиковать / расти)
landing/BenefitsSection 2×2 чеклист
```

Токены: `src/app/globals.css`
