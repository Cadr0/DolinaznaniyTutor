import { access } from "fs/promises";
import { readFile } from "fs/promises";
import path from "path";

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

async function main() {
  const sqlPath =
    process.env.LEGACY_SQL_PATH ??
    path.join(process.cwd(), "old bd", "u188809_dolinaznaniy (1).sql");
  const legacyUploadsDir =
    process.env.LEGACY_UPLOADS_DIR ??
    path.join(process.cwd(), "old bd", "uploads", "tasks");

  const sql = await readFile(sqlPath, "utf8");
  const topicRows = extractInsert(sql, "topics");
  const taskRows = extractInsert(sql, "tasks");
  const altRows = extractInsert(sql, "task_alternative_answers");

  let withImage = 0;
  let foundImages = 0;
  let missingImages = 0;
  const missingSamples: string[] = [];

  for (const row of taskRows) {
    const parts = row.split(/,(?=(?:[^']*'[^']*')*[^']*$)/);
    const imagePath = parseSqlValue(parts[12]);

    if (!imagePath) {
      continue;
    }

    withImage += 1;
    const basename = path.basename(imagePath.replace(/^uploads\/tasks\//, ""));
    const filePath = path.join(legacyUploadsDir, basename);

    try {
      await access(filePath);
      foundImages += 1;
    } catch {
      missingImages += 1;

      if (missingSamples.length < 5) {
        missingSamples.push(basename);
      }
    }
  }

  console.log(
    JSON.stringify(
      {
        sqlPath,
        legacyUploadsDir,
        topics: topicRows.length,
        tasks: taskRows.length,
        alternatives: altRows.length,
        tasksWithImageInDb: withImage,
        imagesFoundOnDisk: foundImages,
        imagesMissingOnDisk: missingImages,
        missingSamples,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
