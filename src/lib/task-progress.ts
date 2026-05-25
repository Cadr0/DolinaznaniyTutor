import type { TaskProgressStatus } from "@prisma/client";

const COMPLETED_STATUSES: TaskProgressStatus[] = ["CORRECT", "SKIPPED", "SUBMITTED"];

export function isTaskCompleted(status: TaskProgressStatus) {
  return COMPLETED_STATUSES.includes(status);
}

export function isTaskInProgress(status: TaskProgressStatus | undefined | null) {
  return Boolean(status && !isTaskCompleted(status) && status !== "NOT_STARTED");
}
