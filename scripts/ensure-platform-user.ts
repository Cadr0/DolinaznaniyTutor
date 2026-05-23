import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PLATFORM_EMAIL =
  process.env.PLATFORM_CATALOG_EMAIL ?? "catalog@dolinaznaniy.ru";

async function main() {
  const user = await prisma.user.upsert({
    where: { email: PLATFORM_EMAIL },
    create: {
      email: PLATFORM_EMAIL,
      name: "Долина знаний",
      role: "ADMIN",
      emailVerified: true,
    },
    update: {
      name: "Долина знаний",
      role: "ADMIN",
    },
  });

  console.log(JSON.stringify({ id: user.id, email: user.email, name: user.name }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
