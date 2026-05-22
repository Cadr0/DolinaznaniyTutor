import { prisma } from "@/lib/prisma";

const sampleTasks = [
  {
    title: "Линейные уравнения",
    description: "Базовый набор задач для 7–8 класса",
    content:
      "1. Решите уравнение: 2x + 5 = 17\n2. Решите уравнение: 3x - 4 = 11\n3. Сформулируйте условие задачи про покупки в магазине и решите её через уравнение.",
    subject: "Математика",
    gradeLevel: "7–8 класс",
  },
  {
    title: "Present Simple",
    description: "Упражнения на настоящее простое время",
    content:
      "1. Put the verb in the correct form: She ___ (go) to school every day.\n2. Make negative: They play football on Sundays.\n3. Write 5 sentences about your daily routine.",
    subject: "Английский",
    gradeLevel: "5–9 класс",
  },
  {
    title: "Законы Ньютона",
    description: "Краткий тест по основам механики",
    content:
      "1. Сформулируйте три закона Ньютона.\n2. Приведите пример инерции из жизни.\n3. Решите задачу на второй закон Ньютона для тела массой 2 кг.",
    subject: "Физика",
    gradeLevel: "9 класс",
  },
];

export async function ensureMarketplaceSampleTasks(authorId: string) {
  const count = await prisma.marketplaceTask.count({
    where: { isPublic: true },
  });

  if (count > 0) {
    return;
  }

  await prisma.marketplaceTask.createMany({
    data: sampleTasks.map((task) => ({
      ...task,
      authorId,
      isPublic: true,
    })),
  });
}

export async function getPublicMarketplaceTasks() {
  return prisma.marketplaceTask.findMany({
    where: { isPublic: true },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { name: true } },
    },
  });
}
