"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { reviewImageSubmissionAction } from "@/app/[locale]/(app)/dashboard/review/actions";
import { Button } from "@/components/ui/Button";
import type { PendingReviewItem } from "@/lib/tutor-review";

type ReviewQueueProps = {
  locale: string;
  items: PendingReviewItem[];
};

export function ReviewQueue({ locale, items }: ReviewQueueProps) {
  const t = useTranslations("app.reviewPage");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feedbackById, setFeedbackById] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  function handleReview(progressId: string, accept: boolean) {
    startTransition(async () => {
      try {
        await reviewImageSubmissionAction(
          locale,
          progressId,
          accept,
          feedbackById[progressId],
        );
        setError("");
        router.refresh();
      } catch (reviewError) {
        setError(reviewError instanceof Error ? reviewError.message : t("genericError"));
      }
    });
  }

  if (items.length === 0) {
    return (
      <p className="mt-8 rounded-[1.5rem] border border-dashed border-[var(--card-border)] bg-[var(--background)] p-8 text-center text-sm text-[var(--muted)]">
        {t("empty")}
      </p>
    );
  }

  return (
    <ul className="mt-8 space-y-4">
      {items.map((item) => (
        <li
          key={item.progressId}
          className="rounded-[1.5rem] border border-[var(--card-border)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[var(--foreground-strong)]">
                {item.studentName}
              </p>
              <p className="text-xs text-[var(--muted)]">
                {item.roomTitle} · {item.topicTitle}
              </p>
              <p className="mt-1 text-sm text-[var(--foreground-strong)]">{item.taskTitle}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {new Date(item.submittedAt).toLocaleString("ru-RU")}
              </p>
            </div>
            <Link
              href={`/dashboard/students/${item.studentId}?roomId=${item.roomId}`}
              className="text-xs font-semibold text-[var(--accent)] hover:underline"
            >
              {t("openStudent")} →
            </Link>
          </div>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.imageUrl}
            alt=""
            className="mt-4 max-h-80 w-full rounded-2xl border border-[var(--card-border)] object-contain bg-[var(--background)]"
          />

          <textarea
            value={feedbackById[item.progressId] ?? ""}
            onChange={(event) =>
              setFeedbackById((prev) => ({ ...prev, [item.progressId]: event.target.value }))
            }
            placeholder={t("feedbackPlaceholder")}
            rows={2}
            className="mt-4 w-full rounded-2xl border-2 border-[var(--card-border)] px-4 py-3 text-sm outline-none focus:border-[var(--accent)]"
          />

          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              type="button"
              disabled={pending}
              onClick={() => handleReview(item.progressId, true)}
            >
              {t("accept")}
            </Button>
            <button
              type="button"
              disabled={pending}
              onClick={() => handleReview(item.progressId, false)}
              className="touch-target rounded-full border-2 border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
            >
              {t("reject")}
            </button>
          </div>
        </li>
      ))}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </ul>
  );
}
