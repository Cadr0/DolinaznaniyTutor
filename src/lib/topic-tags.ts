export const SUGGESTED_TOPIC_TAGS = [
  "ЕГЭ",
  "ОГЭ",
  "Математика",
  "Алгебра",
  "Геометрия",
  "Русский",
  "Физика",
  "Химия",
  "Биология",
  "Английский",
  "История",
  "Обществознание",
  "Информатика",
  "Степени",
  "Корни",
  "Дроби",
  "Уравнения",
  "Неравенства",
  "Функции",
  "Формулы",
  "Теория вероятности",
  "Утверждения",
] as const;

const KEYWORD_TAGS: [RegExp, string][] = [
  [/задание\s*\d+/i, "ОГЭ"],
  [/степен/i, "Степени"],
  [/корн/i, "Корни"],
  [/дроб/i, "Дроби"],
  [/уравнен/i, "Уравнения"],
  [/неравен/i, "Неравенства"],
  [/функц/i, "Функции"],
  [/формул/i, "Формулы"],
  [/вероятност/i, "Теория вероятности"],
  [/утвержден/i, "Утверждения"],
  [/русск/i, "Русский"],
  [/физик/i, "Физика"],
  [/англ/i, "Английский"],
];

export function inferTagsFromTopicTitle(title: string, description?: string | null): string[] {
  const text = `${title} ${description ?? ""}`;
  const tags = new Set<string>(["ОГЭ", "Математика"]);

  for (const [pattern, tag] of KEYWORD_TAGS) {
    if (pattern.test(text)) {
      tags.add(tag);
    }
  }

  return [...tags];
}

/** Tags for platform catalog topics (Долина знаний legacy import). */
export function normalizePlatformCatalogTags(
  title: string,
  description: string | null | undefined,
  existingTags: string[] = [],
): string[] {
  const base =
    existingTags.length > 0
      ? existingTags
      : inferTagsFromTopicTitle(title, description);

  return normalizeTags(base.map((tag) => (tag === "ЕГЭ" ? "ОГЭ" : tag)));
}

export function parseTagsInput(raw: string): string[] {
  return raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function normalizeTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const tag of tags) {
    const normalized = tag.trim();
    if (!normalized) {
      continue;
    }

    const key = normalized.toLowerCase();
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(normalized);
  }

  return result;
}
