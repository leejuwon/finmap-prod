const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

const TARGET_DIRS = ["_components", "pages/tools", "utils"];
const TARGET_FILES = [
  "_components/DsrLtvCalculator.js",
  "_components/CompoundCTA.js",
];

const REQUIRED_EVENTS = [
  "tool_calculate",
  "tool_result_cta_view",
  "tool_result_cta_click",
  "tool_result_action",
  "tool_nav_click",
  "checklist_cta_click",
  "lead_magnet_cta_click",
  "lead_magnet_select",
  "lead_magnet_download_click",
  "lead_magnet_download_success",
  "lead_magnet_download_error",
  "result_pdf_download_success",
  "result_pdf_download_error",
];

const EXPECTED_PARAMS = [
  "source_tool",
  "locale",
  "location",
  "action",
  "lead_magnet_id",
  "email_provided",
  "storage_mode",
  "target_tool",
  "target_url",
  "error_reason",
];

function walk(dir) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return [];

  return fs.readdirSync(abs, { withFileTypes: true }).flatMap((entry) => {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(rel);
    if (!entry.isFile() || !entry.name.endsWith(".js")) return [];
    return [rel];
  });
}

function unique(items) {
  return [...new Set(items)];
}

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function findTrackBlocks(source) {
  const blocks = [];
  let index = 0;
  const needle = "trackGaEvent(";

  while ((index = source.indexOf(needle, index)) >= 0) {
    let cursor = index + needle.length;
    let depth = 1;
    let inString = null;
    let escaped = false;

    while (cursor < source.length && depth > 0) {
      const char = source[cursor];

      if (inString) {
        if (escaped) {
          escaped = false;
        } else if (char === "\\") {
          escaped = true;
        } else if (char === inString) {
          inString = null;
        }
        cursor += 1;
        continue;
      }

      if (char === '"' || char === "'" || char === "`") {
        inString = char;
      } else if (char === "(") {
        depth += 1;
      } else if (char === ")") {
        depth -= 1;
      }
      cursor += 1;
    }

    blocks.push(source.slice(index, cursor));
    index = cursor;
  }

  return blocks;
}

function hasEvent(source, eventName) {
  const pattern = new RegExp(`trackGaEvent\\(\\s*["']${eventName}["']`);
  return pattern.test(source);
}

const files = unique([
  ...TARGET_DIRS.flatMap(walk),
  ...TARGET_FILES.filter((rel) => fs.existsSync(path.join(ROOT, rel))),
].map((rel) => path.normalize(rel)));

const sources = files.map((file) => ({ file, source: read(file) }));
const allSource = sources.map((item) => item.source).join("\n");

const eventResults = REQUIRED_EVENTS.map((eventName) => {
  const foundIn = sources
    .filter(({ source }) => hasEvent(source, eventName))
    .map(({ file }) => file);
  return { eventName, found: foundIn.length > 0, foundIn };
});

const paramResults = EXPECTED_PARAMS.map((paramName) => {
  const found = new RegExp(`\\b${paramName}\\s*:`).test(allSource);
  return { paramName, found };
});

const trackBlocks = sources.flatMap(({ file, source }) =>
  findTrackBlocks(source).map((block) => ({ file, block }))
);
const unsafeEmailBlocks = trackBlocks.filter(({ block }) => /\bleadEmail\b|\bemail\s*:/.test(block));

const toolResultSource = sources.find((item) => item.file === "_components/ToolResultCta.js")?.source || "";
const dsrLtvSource = sources.find((item) => item.file === "_components\\DsrLtvCalculator.js")?.source || "";
const payloadMatch = toolResultSource.match(/const payload = \{[\s\S]*?\n\s*\};/);
const payloadBlock = payloadMatch ? payloadMatch[0] : "";
const payloadContainsRawEmail = /\bleadEmail\b|\bemail\s*:/.test(payloadBlock);
const storageOrCustomContainsRawEmail = /localStorage[\s\S]{0,240}\bleadEmail\b|CustomEvent[\s\S]{0,240}\bleadEmail\b/.test(
  toolResultSource
);
const dsrLtvCommonCalculateFound =
  /trackGaEvent\(\s*["']tool_calculate["'][\s\S]*?source_tool\s*:\s*["']dsrLtv["'][\s\S]*?currency\s*:\s*["']KRW["'][\s\S]*?location\s*:\s*["']form_submit["']/.test(
    dsrLtvSource
  );
const dsrLtvSpecificCalculateKept = /trackGaEvent\(\s*["']dsr_ltv_calculate["']/.test(dsrLtvSource);

console.log("[tool-result-cta-events] required events");
for (const result of eventResults) {
  console.log(
    `${result.found ? "PASS" : "FAIL"}\t${result.eventName}\t${
      result.foundIn.length ? result.foundIn.join(", ") : "-"
    }`
  );
}

console.log("[tool-result-cta-events] expected params");
for (const result of paramResults) {
  console.log(`${result.found ? "PASS" : "FAIL"}\t${result.paramName}`);
}

console.log("[tool-result-cta-events] privacy");
console.log(`${unsafeEmailBlocks.length === 0 ? "PASS" : "FAIL"}\ttrackGaEvent blocks exclude raw leadEmail/email`);
console.log(`${!payloadContainsRawEmail ? "PASS" : "FAIL"}\tlocal payload excludes raw leadEmail/email`);
console.log(`${!storageOrCustomContainsRawEmail ? "PASS" : "FAIL"}\tlocalStorage/CustomEvent calls exclude raw leadEmail`);

console.log("[tool-result-cta-events] dsr/ltv");
console.log(`${dsrLtvCommonCalculateFound ? "PASS" : "FAIL"}\tDSR/LTV common tool_calculate uses source_tool=dsrLtv, currency=KRW, location=form_submit`);
console.log(`${dsrLtvSpecificCalculateKept ? "PASS" : "FAIL"}\texisting dsr_ltv_calculate event is kept`);

const failed =
  eventResults.some((result) => !result.found) ||
  paramResults.some((result) => !result.found) ||
  unsafeEmailBlocks.length > 0 ||
  payloadContainsRawEmail ||
  storageOrCustomContainsRawEmail ||
  !dsrLtvCommonCalculateFound ||
  !dsrLtvSpecificCalculateKept;

if (failed) {
  process.exitCode = 1;
}
