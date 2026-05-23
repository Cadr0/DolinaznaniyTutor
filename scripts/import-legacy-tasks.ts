import { PrismaClient, type TaskAnswerType } from "@prisma/client";
import { readFile } from "fs/promises";
import path from "path";
import { copyLegacyTaskImage } from "../src/lib/uploads";
import { mapLegacyAnswerType } from "../src/lib/tasks";

const prisma = new PrismaClient();

type LegacyTopic = {
  id: number;
  title: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
};

type LegacyTask = {
  id: number;
  topicId: number;
  title: string;
  description: string | null;
  answerType: TaskAnswerType;
  correctAnswer: string | null;
  hint: string | null;
  sortOrder: number;
  isActive: boolean;
  imagePath: string | null;
  supportsMultipleAnswers: boolean;
};

type LegacyAlternative = {
  id: number;
  taskId: number;
  answerText: string;
  explanation: string | null;
};

function extractInsertValues(sql: string, table: string): string {
  const marker = `INSERT INTO \`${table}\` VALUES `;
  const start = sql.indexOf(marker);

  if (start < 0) {
    return "";
  }

  let i = start + marker.length;
  let inQuote = false;
  let depth = 0;

  while (i < sql.length) {
    const char = sql[i];

    if (char === "'" && !inQuote) {
      inQuote = true;
      i += 1;
      continue;
    }

    if (char === "'" && inQuote) {
      if (sql[i + 1] === "'") {
        i += 2;
        continue;
      }

      inQuote = false;
      i += 1;
      continue;
    }

    if (!inQuote) {
      if (char === "(") {
        depth += 1;
      } else if (char === ")") {
        depth -= 1;
      } else if (char === ";" && depth === 0) {
        break;
      }
    }

    i += 1;
  }

  return sql.slice(start + marker.length, i);
}

function splitSqlInsertValues(raw: string): string[] {
  const rows: string[] = [];
  let current = "";
  let inQuote = false;

  for (let i = 0; i < raw.length; i += 1) {
    const char = raw[i];

    if (char === "'" && !inQuote) {
      inQuote = true;
      current += char;
      continue;
    }

    if (char === "'" && inQuote) {
      if (raw[i + 1] === "'") {
        current += "''";
        i += 1;
        continue;
      }

      inQuote = false;
      current += char;
      continue;
    }

    if (char === ")" && !inQuote && raw[i + 1] === "," && raw[i + 2] === "(") {
      rows.push(current);
      current = "";
      i += 2;
      continue;
    }

    current += char;
  }

  if (current.trim()) {
    rows.push(current);
  }

  return rows;
}

function normalizeRow(row: string): string {
  return row.trim().replace(/^\(/, "").replace(/\)$/, "");
}

function extractInsert(sql: string, table: string): string[] {
  const values = extractInsertValues(sql, table);

  if (!values) {
    return [];
  }

  return splitSqlInsertValues(values).map(normalizeRow);
}

function parseSqlValue(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  if (trimmed === "NULL") {
    return null;
  }

  if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return trimmed.slice(1, -1).replace(/''/g, "'");
  }

  return trimmed;
}

function parseSqlInt(value: string | undefined): number {
  return Number.parseInt(String(value ?? "0").trim(), 10);
}

function parseSqlBool(value: string | undefined): boolean {
  return String(value ?? "0").trim() === "1";
}

async function main() {
  const tutorEmail = process.env.IMPORT_TUTOR_EMAIL;
  const sqlPath =
    process.env.LEGACY_SQL_PATH ??
    path.join(process.cwd(), "old bd", "u188809_dolinaznaniy (1).sql");
  const legacyUploadsDir =
    process.env.LEGACY_UPLOADS_DIR ??
    path.join(process.cwd(), "old bd", "uploads", "tasks");

  if (!tutorEmail) {
    throw new Error("Set IMPORT_TUTOR_EMAIL in environment");
  }

  const tutor = await prisma.user.findUnique({ where: { email: tutorEmail } });

  if (!tutor) {
    throw new Error(`Tutor not found: ${tutorEmail}`);
  }

  if (tutor.role !== "TUTOR" && tutor.role !== "ADMIN") {
    throw new Error(`User ${tutorEmail} is not a tutor`);
  }

  const sql = await readFile(sqlPath, "utf8");
  const topicRows = extractInsert(sql, "topics");
  const taskRows = extractInsert(sql, "tasks");
  const altRows = extractInsert(sql, "task_alternative_answers");

  const topics: LegacyTopic[] = topicRows.map((row) => {
    const parts = row.split(/,(?=(?:[^']*'[^']*')*[^']*$)/);
    return {
      id: parseSqlInt(parts[0]),
      title: parseSqlValue(parts[1]) ?? "",
      description: parseSqlValue(parts[2]),
      isActive: parseSqlBool(parts[3]),
      sortOrder: parseSqlInt(parts[4]),
    };
  });

  const tasks: LegacyTask[] = taskRows.map((row) => {
    const parts = row.split(/,(?=(?:[^']*'[^']*')*[^']*$)/);
    const answerTypeRaw = parseSqlValue(parts[4]) ?? "text";

    return {
      id: parseSqlInt(parts[0]),
      topicId: parseSqlInt(parts[1]),
      title: parseSqlValue(parts[2]) ?? "",
      description: parseSqlValue(parts[3]),
      answerType: mapLegacyAnswerType(answerTypeRaw),
      correctAnswer: parseSqlValue(parts[5]),
      hint: parseSqlValue(parts[7]),
      sortOrder: parseSqlInt(parts[8]),
      isActive: parseSqlBool(parts[9]),
      imagePath: parseSqlValue(parts[12]),
      supportsMultipleAnswers: parseSqlBool(parts[13]),
    };
  });

  const alternatives: LegacyAlternative[] = altRows.map((row) => {
    const parts = row.split(/,(?=(?:[^']*'[^']*')*[^']*$)/);
    return {
      id: parseSqlInt(parts[0]),
      taskId: parseSqlInt(parts[1]),
      answerText: parseSqlValue(parts[2]) ?? "",
      explanation: parseSqlValue(parts[4]),
    };
  });

  const topicIdMap = new Map<number, string>();
  let topicsImported = 0;
  let topicsSkipped = 0;

  for (const topic of topics) {
    const existing = await prisma.taskTopic.findUnique({
      where: { legacyTopicId: topic.id },
    });

    if (existing) {
      topicIdMap.set(topic.id, existing.id);
      topicsSkipped += 1;
      continue;
    }

    const created = await prisma.taskTopic.create({
      data: {
        tutorId: tutor.id,
        title: topic.title,
        description: topic.description,
        sortOrder: topic.sortOrder,
        isActive: topic.isActive,
        legacyTopicId: topic.id,
      },
    });

    topicIdMap.set(topic.id, created.id);
    topicsImported += 1;
  }

  let tasksImported = 0;
  let tasksSkipped = 0;
  let missingImages = 0;
  const taskIdMap = new Map<number, string>();

  for (const task of tasks) {
    const topicId = topicIdMap.get(task.topicId);

    if (!topicId) {
      continue;
    }

    const existing = await prisma.task.findUnique({
      where: { legacyTaskId: task.id },
    });

    if (existing) {
      taskIdMap.set(task.id, existing.id);
      tasksSkipped += 1;
      continue;
    }

    let imageUrl: string | null = null;

    if (task.imagePath) {
      imageUrl = await copyLegacyTaskImage(task.imagePath, legacyUploadsDir);

      if (!imageUrl) {
        missingImages += 1;
      }
    }

    const created = await prisma.task.create({
      data: {
        topicId,
        tutorId: tutor.id,
        title: task.title,
        description: task.description,
        answerType: task.answerType,
        correctAnswer: task.correctAnswer,
        hint: task.hint,
        imageUrl,
        sortOrder: task.sortOrder,
        supportsMultipleAnswers: task.supportsMultipleAnswers,
        isActive: task.isActive,
        legacyTaskId: task.id,
      },
    });

    taskIdMap.set(task.id, created.id);
    tasksImported += 1;
  }

  let alternativesImported = 0;

  for (const alt of alternatives) {
    const taskId = taskIdMap.get(alt.taskId);

    if (!taskId || !alt.answerText.trim()) {
      continue;
    }

    const exists = await prisma.taskAlternativeAnswer.findFirst({
      where: {
        taskId,
        answerText: alt.answerText,
      },
    });

    if (exists) {
      continue;
    }

    await prisma.taskAlternativeAnswer.create({
      data: {
        taskId,
        answerText: alt.answerText,
        explanation: alt.explanation,
      },
    });

    alternativesImported += 1;
  }

  console.log(
    JSON.stringify(
      {
        tutorEmail,
        topics: { total: topics.length, imported: topicsImported, skipped: topicsSkipped },
        tasks: { total: tasks.length, imported: tasksImported, skipped: tasksSkipped },
        alternatives: { total: alternatives.length, imported: alternativesImported },
        missingImages,
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
