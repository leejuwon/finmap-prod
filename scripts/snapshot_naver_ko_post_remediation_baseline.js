const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execSync } = require("child_process");

const ROOT = process.cwd();
const DATE_STAMP = "2026-09-16";

const STEP1_JSON = path.join(ROOT, "reports", `naver-ko-post-search-inventory-${DATE_STAMP}.json`);
const STEP2_JSON = path.join(ROOT, "reports", `naver-ko-post-query-intent-${DATE_STAMP}.json`);
const STEP4_JSON = path.join(ROOT, "reports", `naver-ko-post-topic-links-${DATE_STAMP}.json`);

const REPORT_JSON = path.join(ROOT, "reports", `naver-ko-pre-implementation-baseline-${DATE_STAMP}.json`);
const REPORT_CSV = path.join(ROOT, "reports", `naver-ko-pre-implementation-baseline-${DATE_STAMP}.csv`);

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing required input: ${path.relative(ROOT, filePath)}`);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function sha256(text) {
  return crypto.createHash("sha256").update(text, "utf8").digest("hex");
}

function getGitHead() {
  try {
    return execSync("git rev-parse HEAD", { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "GIT_HEAD_UNAVAILABLE";
  }
}

function csvEscape(value) {
  if (Array.isArray(value)) return csvEscape(value.join("|"));
  const text = value == null ? "" : String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function writeCsv(filePath, rows, columns) {
  const lines = [columns.join(",")];
  for (const row of rows) {
    lines.push(columns.map((column) => csvEscape(row[column])).join(","));
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${lines.join("\n")}\n`, "utf8");
}

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) return {};
  const result = {};
  for (const line of match[1].split(/\r?\n/)) {
    const lineMatch = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!lineMatch) continue;
    const [, key, rawValue] = lineMatch;
    result[key] = rawValue.replace(/^["']|["']$/g, "").trim();
  }
  return result;
}

function extractMarkdownH2s(content) {
  return [...content.matchAll(/^##\s+(?!#)(.+)$/gm)].map((match) => match[1].trim());
}

function extractFaqQuestions(content) {
  const questions = new Set();
  for (const match of content.matchAll(/"@type"\s*:\s*"Question"[\s\S]{0,500}?"name"\s*:\s*"([^"]+)"/g)) {
    questions.add(match[1].trim());
  }
  for (const match of content.matchAll(/^###\s+(.+\?)\s*$/gm)) {
    questions.add(match[1].trim());
  }
  for (const match of content.matchAll(/^\*\*Q\.?\s*(.+?\?)\*\*/gm)) {
    questions.add(match[1].trim());
  }
  return [...questions];
}

function main() {
  const step1 = readJson(STEP1_JSON);
  const step2 = readJson(STEP2_JSON);
  const step4 = readJson(STEP4_JSON);
  const queryById = new Map(step2.queryMap.map((row) => [row.id, row]));
  const linkById = new Map(step4.postLinkRows.map((row) => [row.id, row]));
  const gitHead = getGitHead();

  const rows = step1.posts
    .filter((post) => post.lang === "ko")
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((post) => {
      const filePathAbs = path.join(ROOT, post.filePath);
      const content = fs.readFileSync(filePathAbs, "utf8");
      const frontmatter = parseFrontmatter(content);
      const query = queryById.get(post.id) || {};
      const links = linkById.get(post.id) || {};
      return {
        category: post.categorySlug,
        slug: post.slug,
        id: post.id,
        url: post.url,
        filePath: post.filePath,
        title: post.title,
        description: post.description,
        dateModified: frontmatter.dateModified || post.dateModified || "",
        primaryQuery: query.primaryQuery || "",
        topicFamily: query.topicFamily || "",
        queryRole: links.role || (query.coreDocumentCandidate ? "CORE_DOCUMENT_CANDIDATE" : "POST"),
        currentInboundContextualCount: links.contextualInbound ?? post.links?.inboundExplicitPostCount ?? "",
        currentOutboundContextualCount: post.links?.explicitOutboundInternalCount ?? "",
        h2List: extractMarkdownH2s(content),
        faqQuestions: extractFaqQuestions(content),
        fileContentSha256: sha256(content),
        gitHead,
        naverRank: "MANUAL_OR_EXTERNAL_BASELINE_REQUIRED",
        naverImpressions: "MANUAL_OR_EXTERNAL_BASELINE_REQUIRED",
        naverClicks: "MANUAL_OR_EXTERNAL_BASELINE_REQUIRED",
        naverCtr: "MANUAL_OR_EXTERNAL_BASELINE_REQUIRED",
      };
    });

  const result = {
    generatedAt: new Date().toISOString(),
    dateStamp: DATE_STAMP,
    scope: {
      language: "ko",
      postCount: rows.length,
      sourceReports: [
        path.relative(ROOT, STEP1_JSON).replace(/\\/g, "/"),
        path.relative(ROOT, STEP2_JSON).replace(/\\/g, "/"),
        path.relative(ROOT, STEP4_JSON).replace(/\\/g, "/"),
      ],
    },
    gitHead,
    externalNaverMetricsStatus: "MANUAL_OR_EXTERNAL_BASELINE_REQUIRED",
    rows,
    validation: {
      expectedRows: 79,
      actualRows: rows.length,
      uniqueUrls: new Set(rows.map((row) => row.url)).size,
      allRowsHaveHash: rows.every((row) => /^[a-f0-9]{64}$/.test(row.fileContentSha256)),
      allRowsHaveGitHead: rows.every((row) => row.gitHead === gitHead),
    },
  };

  fs.mkdirSync(path.dirname(REPORT_JSON), { recursive: true });
  fs.writeFileSync(REPORT_JSON, `${JSON.stringify(result, null, 2)}\n`, "utf8");
  writeCsv(
    REPORT_CSV,
    rows.map((row) => ({
      ...row,
      h2List: row.h2List.join("|"),
      faqQuestions: row.faqQuestions.join("|"),
    })),
    [
      "category",
      "slug",
      "url",
      "filePath",
      "title",
      "description",
      "dateModified",
      "primaryQuery",
      "topicFamily",
      "queryRole",
      "currentInboundContextualCount",
      "currentOutboundContextualCount",
      "h2List",
      "faqQuestions",
      "fileContentSha256",
      "gitHead",
      "naverRank",
      "naverImpressions",
      "naverClicks",
      "naverCtr",
    ]
  );

  console.log(
    JSON.stringify(
      {
        verdict: "BASELINE_SNAPSHOT_CREATED",
        rows: rows.length,
        output: {
          json: path.relative(ROOT, REPORT_JSON).replace(/\\/g, "/"),
          csv: path.relative(ROOT, REPORT_CSV).replace(/\\/g, "/"),
        },
        validation: result.validation,
      },
      null,
      2
    )
  );
}

main();
