"use client";

import { useEffect, useId, useRef, useState } from "react";

export type SelectOption = {
  value: string;
  label: string;
};

type SelectFieldProps = {
  name: string;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
};

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={`shrink-0 text-[var(--muted)] transition-transform ${open ? "rotate-180" : ""}`}
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SelectField({
  name,
  options,
  value,
  defaultValue,
  onChange,
  required,
  disabled,
  placeholder = "Выберите…",
  className = "",
}: SelectFieldProps) {
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const initial = value ?? defaultValue ?? options[0]?.value ?? "";
  const [selected, setSelected] = useState(initial);
  const [open, setOpen] = useState(false);

  const selectedLabel =
    options.find((option) => option.value === selected)?.label ?? placeholder;

  useEffect(() => {
    if (value !== undefined) {
      setSelected(value);
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  function pick(nextValue: string) {
    setSelected(nextValue);
    onChange?.(nextValue);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <input type="hidden" name={name} value={selected} required={required && Boolean(selected)} />
      <button
        type="button"
        disabled={disabled || options.length === 0}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((current) => !current)}
        className={`touch-target flex w-full items-center justify-between gap-3 rounded-2xl border-2 bg-white px-4 py-3 text-left text-base transition-colors ${
          open
            ? "border-[var(--accent)] ring-2 ring-[var(--accent-soft)]"
            : "border-[var(--card-border)] hover:border-[var(--accent)]/60"
        } disabled:cursor-not-allowed disabled:opacity-60`}
      >
        <span
          className={`truncate font-normal ${
            selected ? "text-[var(--foreground-strong)]" : "text-[var(--muted)]"
          }`}
        >
          {selectedLabel}
        </span>
        <ChevronIcon open={open} />
      </button>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-2 max-h-56 w-full overflow-y-auto rounded-2xl border border-[var(--card-border)] bg-white p-2 shadow-[0_12px_40px_rgba(42,62,71,0.12)]"
        >
          {options.map((option) => {
            const active = option.value === selected;

            return (
              <li key={option.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => pick(option.value)}
                  className={`w-full rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                    active
                      ? "bg-[var(--accent-soft)] font-semibold text-[var(--accent)]"
                      : "text-[var(--foreground-strong)] hover:bg-[var(--background-soft)]"
                  }`}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
