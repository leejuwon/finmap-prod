// scripts/validate-jsonld.js
const fs = require("fs");
const path = require("path");

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

function lineOfIndex(text, idx) {
  // 1-based line number
  return text.slice(0, idx).split("\n").length;
}

const root = process.cwd();
const postsDir = path.join(root, "content", "posts");

const files = walk(postsDir).filter((f) => f.endsWith(".md"));

const scriptRe =
  /<script\s+type=["']application\/ld\+json["']\s*>([\s\S]*?)<\/script>/gi;

let hasError = false;

for (const file of files) {
  const raw = fs.readFileSync(file, "utf8");
  let m;
  let idx = 0;

  while ((m = scriptRe.exec(raw))) {
    idx++;
    const jsonText = (m[1] || "").trim();
    const startLine = lineOfIndex(raw, m.index);

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (e) {
      hasError = true;
      console.log(
        `❌ JSON.parse failed: ${file}:${startLine} (block #${idx})\n   ${e.message}\n`
      );
      continue;
    }

    // FAQPage 구조 체크 (있을 때만)
    const type = parsed && parsed["@type"];
    if (type === "FAQPage") {
      const main = parsed.mainEntity;
      if (!Array.isArray(main)) {
        hasError = true;
        console.log(
          `⚠️ FAQPage mainEntity is not an array: ${file}:${startLine} (block #${idx})`
        );
      } else {
        main.forEach((q, i) => {
          const aa = q && q.acceptedAnswer;
          const text = aa && aa.text;
          if (typeof text !== "string" || !text.trim()) {
            hasError = true;
            console.log(
              `⚠️ Missing acceptedAnswer.text: ${file}:${startLine} (block #${idx}) question[${i}]`
            );
          }
        });
      }
    }
  }
}

if (hasError) {
  console.log("\nDone. Issues found.");
  process.exit(1);
} else {
  console.log("✅ All JSON-LD blocks parsed OK (and FAQPage checks passed where applicable).");
}
