"use client";

import { useCallback, useRef, useState } from "react";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

type TaskImageDropzoneProps = {
  imageUrl: string | null;
  uploading: boolean;
  error?: string;
  onUpload: (file: File) => Promise<void>;
  onRemove: () => void;
  labels?: Partial<{
    idle: string;
    dragging: string;
    uploading: string;
    replace: string;
    remove: string;
    hint: string;
  }>;
};

const defaultLabels = {
  idle: "Перетащите изображение сюда",
  dragging: "Отпустите, чтобы загрузить",
  uploading: "Загрузка…",
  replace: "Заменить",
  remove: "Удалить",
  hint: "или нажмите для выбора · JPG, PNG, WebP до 5 МБ",
};

function validateFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return "Допустимы только JPG, PNG и WebP";
  }

  if (file.size > MAX_SIZE) {
    return "Файл больше 5 МБ";
  }

  return null;
}

export function TaskImageDropzone({
  imageUrl,
  uploading,
  error,
  onUpload,
  onRemove,
  labels: labelOverrides,
}: TaskImageDropzoneProps) {
  const labels = { ...defaultLabels, ...labelOverrides };
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState("");

  const displayError = error || localError;

  const processFile = useCallback(
    async (file: File) => {
      const validationError = validateFile(file);

      if (validationError) {
        setLocalError(validationError);
        return;
      }

      setLocalError("");
      await onUpload(file);
    },
    [onUpload],
  );

  function handleDragOver(event: React.DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    setDragging(true);
  }

  function handleDragLeave(event: React.DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    setDragging(false);
  }

  function handleDrop(event: React.DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    setDragging(false);

    const file = event.dataTransfer.files[0];

    if (file) {
      void processFile(file);
    }
  }

  function handlePaste(event: React.ClipboardEvent) {
    const items = event.clipboardData?.items;

    if (!items) {
      return;
    }

    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();

        if (file) {
          event.preventDefault();
          void processFile(file);
          return;
        }
      }
    }
  }

  if (imageUrl) {
    return (
      <div className="space-y-2" onPaste={handlePaste}>
        <div className="overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--background)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Изображение задания"
            className="max-h-72 w-full object-contain"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="touch-target rounded-full border-2 border-[var(--card-border)] px-4 py-2 text-sm font-semibold text-[var(--foreground-strong)] hover:border-[var(--accent)] disabled:opacity-60"
          >
            {uploading ? labels.uploading : labels.replace}
          </button>
          <button
            type="button"
            disabled={uploading}
            onClick={onRemove}
            className="touch-target rounded-full px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            {labels.remove}
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];

            if (file) {
              void processFile(file);
            }

            event.target.value = "";
          }}
        />
        {displayError ? (
          <p className="text-sm text-red-600">{displayError}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div onPaste={handlePaste}>
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex min-h-40 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
          dragging
            ? "border-[var(--accent)] bg-[var(--accent-soft)]"
            : "border-[var(--card-border)] bg-[var(--background)] hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]/40"
        } disabled:opacity-60`}
      >
        <span className="text-2xl" aria-hidden>
          📷
        </span>
        <span className="mt-2 text-sm font-semibold text-[var(--foreground-strong)]">
          {uploading ? labels.uploading : dragging ? labels.dragging : labels.idle}
        </span>
        {!uploading && !dragging ? (
          <span className="mt-1 text-xs text-[var(--muted)]">{labels.hint}</span>
        ) : null}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];

          if (file) {
            void processFile(file);
          }

          event.target.value = "";
        }}
      />
      {displayError ? (
        <p className="mt-2 text-sm text-red-600">{displayError}</p>
      ) : null}
    </div>
  );
}
