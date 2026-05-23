export type TopicReadinessInput = {
  title: string;
  description: string | null;
  taskCount: number;
};

export function isTopicReadyForMarketplace(topic: TopicReadinessInput): boolean {
  return topic.taskCount > 0 && topic.title.trim().length > 0;
}
