"use client";

import { useMemo, useState } from "react";
import { SUGGESTED_TOPIC_TAGS } from "@/lib/topic-tags";

type TagPickerProps = {
  name?: string;
  defaultTags?: string[];
};

export function TagPicker({ name = "tagsJson", defaultTags = [] }: TagPickerProps) {
  const [selected, setSelected] = useState<string[]>(defaultTags);
  const [customTag, setCustomTag] = useState("");

  const tagsJson = useMemo(() => JSON.stringify(selected), [selected]);

  function toggleTag(tag: string) {
    setSelected((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag],
    );
  }

  function addCustomTag() {
    const tag = customTag.trim();
    if (!tag || selected.includes(tag)) {
      return;
    }

    setSelected((current) => [...current, tag]);
    setCustomTag("");
  }

  return (
    <div>
      <input type="hidden" name={name} value={tagsJson} />
      <p className="text-sm font-semibold text-[var(--foreground-strong)]">Теги</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {SUGGESTED_TOPIC_TAGS.map((tag) => {
          const active = selected.includes(tag);

          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                active
                  ? "bg-[var(--accent)] text-white"
                  : "border border-[var(--card-border)] bg-white text-[var(--muted)] hover:border-[var(--accent)]"
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          value={customTag}
          onChange={(event) => setCustomTag(event.target.value)}
          placeholder="Свой тег"
          className="touch-target min-w-0 flex-1 rounded-2xl border-2 border-[var(--card-border)] px-4 py-2 text-sm outline-none focus:border-[var(--accent)]"
        />
        <button
          type="button"
          onClick={addCustomTag}
          className="touch-target rounded-full border-2 border-[var(--card-border)] px-4 py-2 text-sm font-semibold text-[var(--foreground-strong)] hover:border-[var(--accent)]"
        >
          Добавить
        </button>
      </div>
      {selected.length > 0 ? (
        <p className="mt-2 text-xs text-[var(--muted)]">Выбрано: {selected.join(", ")}</p>
      ) : null}
    </div>
  );
}

export function TagBadges({ tags }: { tags: string[] }) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--accent)]"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
