import { PrismaClient } from "@prisma/client";
import { inferTagsFromTopicTitle } from "../src/lib/topic-tags";

const prisma = new PrismaClient();

const PLATFORM_EMAIL =
  process.env.PLATFORM_CATALOG_EMAIL ?? "catalog@dolinaznaniy.ru";

async function main() {
  const platformUser = await prisma.user.findUnique({
    where: { email: PLATFORM_EMAIL },
  });

  if (!platformUser) {
    throw new Error(`Platform user not found: ${PLATFORM_EMAIL}. Run ensure-platform-user first.`);
  }

  const topics = await prisma.taskTopic.findMany({
    where: { tutorId: platformUser.id },
  });

  let published = 0;

  for (const topic of topics) {
    const tags =
      topic.tags.length > 0
        ? topic.tags
        : inferTagsFromTopicTitle(topic.title, topic.description);

    await prisma.taskTopic.update({
      where: { id: topic.id },
      data: {
        isPublished: true,
        publishedAt: topic.publishedAt ?? new Date(),
        tags,
      },
    });

    published += 1;
  }

  console.log(
    JSON.stringify(
      {
        platformEmail: PLATFORM_EMAIL,
        topicsPublished: published,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
