/**
 * Export the resume page to A4 PDFs without using the browser print dialog.
 *
 * Requires the local dev server to be running:
 *   pnpm dev
 * Then run:
 *   pnpm pdf:resume     (short version)
 *   pnpm pdf:cv-full    (every project and publication)
 *   pnpm pdf:publications  (standalone publication list)
 */

import { existsSync, mkdirSync, readFileSync, statSync } from "fs";
import { spawnSync } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "exports");
const BASE_URL = process.env.RESUME_BASE_URL || "http://localhost:3000";

// --full switches the page to its long variant: same layout, but all projects
// and publications instead of the curated selection.
const FULL = process.argv.includes("--full");

// --section=publications exports a single section as its own sheet.
const sectionArg = process.argv.find((arg) => arg.startsWith("--section="));
const SECTION = sectionArg ? sectionArg.split("=")[1] : "";

// The long variant defaults to the single-column layout: the two-column resume
// keeps a fixed 200px sidebar, which leaves very little room and pages badly
// once every project and publication is listed.
const layoutArg = process.argv.find((arg) => arg.startsWith("--layout="));
const LAYOUT = layoutArg ? layoutArg.split("=")[1] : FULL ? "classic" : "";

// Phone numbers are kept out of the published config, so they live here instead.
// Create "resume.local.json" (git-ignored) to have the PDFs carry a phone number:
//   { "en": { "phone": "+49 …" }, "zh": { "phone": "+86 …" } }
const LOCAL_CONTACTS = join(ROOT, "resume.local.json");
const localContacts = existsSync(LOCAL_CONTACTS)
  ? JSON.parse(readFileSync(LOCAL_CONTACTS, "utf8"))
  : {};

const EDGE_CANDIDATES = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
];

const browser = EDGE_CANDIDATES.find((candidate) => existsSync(candidate));

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

const targets =
  SECTION === "publications"
    ? [
        { lang: "en", file: "publications-en.pdf" },
        { lang: "zh", file: "publications-zh.pdf" },
      ]
    : FULL
      ? [
          { lang: "en", file: "cv-full-en.pdf" },
          { lang: "zh", file: "cv-full-zh.pdf" },
        ]
      : [
          { lang: "en", file: "resume-en.pdf" },
          { lang: "zh", file: "resume-zh.pdf" },
        ];

for (const target of targets) {
  const output = join(OUT_DIR, target.file);
  const phone = localContacts[target.lang]?.phone;
  if (!phone) {
    console.warn(
      `  ! no phone configured for "${target.lang}" — add it to resume.local.json`
    );
  }
  const phoneQuery = phone ? `&phone=${encodeURIComponent(phone)}` : "";
  const location = localContacts[target.lang]?.location;
  const locationQuery = location
    ? `&location=${encodeURIComponent(location)}`
    : "";
  const fullQuery = FULL ? "&full=1" : "";
  const layoutQuery = LAYOUT ? `&layout=${LAYOUT}` : "";
  const sectionQuery = SECTION ? `&section=${SECTION}` : "";
  const url = `${BASE_URL}/?lang=${target.lang}${phoneQuery}${locationQuery}${fullQuery}${layoutQuery}${sectionQuery}#/resume`;
  const args = [
    "--headless=new",
    "--disable-gpu",
    "--no-pdf-header-footer",
    "--virtual-time-budget=8000",
    `--print-to-pdf=${output}`,
    url,
  ];

  console.log(`Exporting ${target.lang.toUpperCase()} → ${output}`);
  const result = spawnSync(browser, args, { stdio: "inherit" });

  if (result.status !== 0 || !existsSync(output)) {
    console.error(`Failed to export ${target.lang.toUpperCase()} resume.`);
    process.exit(1);
  }

  const size = Math.round(statSync(output).size / 1024);
  console.log(`  ✓ ${target.file} (${size} KB)`);
}

console.log(`\nDone. PDFs are in: ${OUT_DIR}`);
