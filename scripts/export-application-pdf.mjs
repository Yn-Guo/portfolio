/**
 * Export the application portfolio page to a single A4 PDF.
 *
 * Requires the local dev server:
 *   pnpm dev
 * Then run:
 *   pnpm pdf:application
 */

import { existsSync, mkdirSync, statSync } from "fs";
import { spawnSync } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "exports");
const BASE_URL = process.env.RESUME_BASE_URL || "http://localhost:3000";
const cliArgs = process.argv.slice(2);
const langIndex = cliArgs.indexOf("--lang");
const outIndex = cliArgs.indexOf("--out");
const language = langIndex >= 0 ? cliArgs[langIndex + 1] : "en";
const outputName =
  outIndex >= 0
    ? cliArgs[outIndex + 1]
    : language === "zh"
      ? "portfolio-zh.pdf"
      : "portfolio-en.pdf";
const OUTPUT = join(OUT_DIR, outputName);

const BROWSER_CANDIDATES = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
];

const browser = BROWSER_CANDIDATES.find((candidate) => existsSync(candidate));

if (!browser) {
  console.error("No Edge/Chrome executable found for PDF export.");
  process.exit(1);
}

try {
  const response = await fetch(BASE_URL, { signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
} catch {
  console.error(
    `Local dev server is not reachable at ${BASE_URL}. Start it with "pnpm dev" first.`
  );
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });

const url = `${BASE_URL}/?lang=${language}#/application`;
const args = [
  "--headless=new",
  "--disable-gpu",
  "--no-pdf-header-footer",
  "--virtual-time-budget=10000",
  `--print-to-pdf=${OUTPUT}`,
  url,
];

console.log(`Exporting application portfolio → ${OUTPUT}`);
const result = spawnSync(browser, args, { stdio: "inherit" });

if (result.status !== 0 || !existsSync(OUTPUT)) {
  console.error("Failed to export application portfolio.");
  process.exit(1);
}

const size = Math.round(statSync(OUTPUT).size / 1024);
console.log(`  ✓ ${outputName} (${size} KB)`);
