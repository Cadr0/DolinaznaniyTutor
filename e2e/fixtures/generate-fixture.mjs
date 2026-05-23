// Run once: node e2e/fixtures/generate-fixture.mjs
import { writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const dir = dirname(fileURLToPath(import.meta.url));
mkdirSync(dir, { recursive: true });

// Minimal 1x1 PNG
const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);
writeFileSync(join(dir, "test-photo.png"), png);
console.log("Created test-photo.png");
