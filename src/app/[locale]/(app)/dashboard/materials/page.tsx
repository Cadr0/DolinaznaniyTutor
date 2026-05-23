import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { MaterialsPanel } from "@/components/tasks/MaterialsPanel";
import { localePath } from "@/lib/routes";
import { requireSession } from "@/lib/session";
import {
  getTutorTaskById,
  getTutorTasksForTopic,
  getTutorTopics,
} from "@/lib/tasks";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ topic?: string; task?: string; new?: string }>;
};

export const dynamic = "force-dynamic";

export default async function MaterialsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);

  const session = await requireSession(locale);

  if (session.user.role !== "TUTOR") {
    redirect(localePath(locale, "/dashboard"));
  }

  const topics = (await getTutorTopics(session.user.id)).map((topic) => ({
    id: topic.id,
    title: topic.title,
    description: topic.description,
    tags: topic.tags,
    isPublished: topic.isPublished,
    taskCount: topic._count.tasks,
  }));

  const selectedTopicId =
    query.topic && topics.some((topic) => topic.id === query.topic)
      ? query.topic
      : null;

  if (query.new === "1" && !selectedTopicId && topics.length > 0) {
    redirect(localePath(locale, `/dashboard/materials?topic=${topics[0].id}&new=1`));
  }

  const tasks = selectedTopicId
    ? await getTutorTasksForTopic(session.user.id, selectedTopicId)
    : [];

  const selectedTaskId =
    query.task && tasks.some((task) => task.id === query.task) ? query.task : null;

  const selectedTask = selectedTaskId
    ? await getTutorTaskById(session.user.id, selectedTaskId)
    : null;

  const isNewTask = query.new === "1";

  return (
    <MaterialsPanel
      locale={locale}
      topics={topics}
      tasks={tasks}
      selectedTopicId={selectedTopicId}
      selectedTaskId={selectedTaskId}
      selectedTask={selectedTask}
      isNewTask={isNewTask}
    />
  );
}
