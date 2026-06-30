#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const {
  fileNamesForLang,
  parseMarkdown,
  resolveFromCwd,
  relativePath,
  writeJson,
  cleanText,
} = require('./lib/post_image_system');

const COVER_FIELDS = ['cover', 'image', 'thumbnail', 'ogImage'];

function printUsage() {
  console.log('Usage: node scripts/apply_post_image_cloudinary_urls.js <markdown-path> <cloudinary-or-replacement-manifest.json> [--dry-run] [--report reports/apply-post-image-urls.json]');
}

function parseArgs(argv) {
  const args = { markdownPath: null, manifestPath: null, dryRun: false, reportPath: null, help: false };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--help' || token === '-h') {
      args.help = true;
      continue;
    }
    if (token === '--dry-run') {
      args.dryRun = true;
      continue;
    }
    if (token === '--report') {
      args.reportPath = argv[i + 1];
      i += 1;
      continue;
    }
    if (token.startsWith('--report=')) {
      args.reportPath = token.slice('--report='.length);
      continue;
    }
    if (!args.markdownPath) {
      args.markdownPath = token;
      continue;
    }
    if (!args.manifestPath) {
      args.manifestPath = token;
      continue;
    }
    throw new Error(`Unknown argument: ${token}`);
  }
  return args;
}

function loadManifest(manifestPath) {
  const fullPath = resolveFromCwd(manifestPath);
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

function imageMapFromManifest(manifest) {
  const map = new Map();
  for (const image of manifest.images || []) {
    if (image.fileName) map.set(image.fileName, image.secureUrl || null);
  }
  return map;
}

function validateManifest(manifest, expectedFiles) {
  const errors = [];
  if (manifest.dryRun) errors.push('MANIFEST_IS_DRY_RUN');
  if ((manifest.errors || []).length > 0) errors.push('MANIFEST_HAS_ERRORS');
  if (Number(manifest.failCount || 0) > 0) errors.push('MANIFEST_HAS_FAILURES');
  if (Number(manifest.successCount || 0) !== expectedFiles.length) {
    errors.push(`SUCCESS_COUNT_MISMATCH expected=${expectedFiles.length} actual=${manifest.successCount || 0}`);
  }
  const map = imageMapFromManifest(manifest);
  for (const fileName of expectedFiles) {
    if (!map.has(fileName)) errors.push(`EXPECTED_FILE_MISSING ${fileName}`);
    if (!map.get(fileName)) errors.push(`SECURE_URL_MISSING ${fileName}`);
  }
  return errors;
}

function quoteYaml(value) {
  return `"${String(value).replace(/"/g, '\\"')}"`;
}

function updateFrontmatter(raw, parsed, expectedFiles, urlMap) {
  const changes = [];
  const data = { ...(parsed.data || {}) };
  const coverField = COVER_FIELDS.find((field) => Object.prototype.hasOwnProperty.call(data, field)) || 'cover';
  const coverUrl = urlMap.get(expectedFiles[0]);
  if (coverUrl && data[coverField] !== coverUrl) {
    changes.push({ type: 'frontmatter', field: coverField, before: data[coverField] || null, after: coverUrl });
    data[coverField] = coverUrl;
  }
  const nextRaw = matter.stringify(parsed.content, data, {
    lineWidth: -1,
    quotingType: '"',
  });
  return { raw: nextRaw, changes };
}

function classifyImageUrl(src, expectedFiles) {
  const lower = String(src || '').toLowerCase();
  for (const fileName of expectedFiles) {
    const stem = path.basename(fileName, path.extname(fileName)).toLowerCase();
    if (lower.endsWith(`/${fileName.toLowerCase()}`) || lower.includes(`/${fileName.toLowerCase()}`)) return fileName;
    if (lower.includes(stem)) return fileName;
  }
  if (/(cover|_cover|-cover)/i.test(src)) return expectedFiles[0];
  if (/(img1|image1|kr-img1|en-img1|-1\.|_1\.)/i.test(src)) return expectedFiles[1];
  if (/(img2|image2|kr-img2|en-img2|-2\.|_2\.)/i.test(src)) return expectedFiles[2];
  if (/(img3|image3|kr-img3|en-img3|-3\.|_3\.)/i.test(src)) return expectedFiles[3];
  return null;
}

function fallbackAlt(post, fileName, existingAlt) {
  if (existingAlt && cleanText(existingAlt).length >= 4) return existingAlt;
  const slot = path.basename(fileName, path.extname(fileName)).replace('-en', '');
  const label = slot === 'cover'
    ? post.title
    : post.lang === 'en'
      ? `${post.title} ${slot} chart`
      : `${post.title} ${slot} 설명 이미지`;
  return cleanText(label).slice(0, post.lang === 'en' ? 120 : 80);
}

function updateBodyImages(raw, post, expectedFiles, urlMap) {
  const changes = [];
  let next = raw.replace(/!\[([^\]]*)]\(([^)]+)\)/g, (full, alt, src) => {
    const fileName = classifyImageUrl(src, expectedFiles);
    if (!fileName || !urlMap.get(fileName)) return full;
    const nextAlt = fallbackAlt(post, fileName, alt);
    const nextUrl = urlMap.get(fileName);
    if (src !== nextUrl || alt !== nextAlt) {
      changes.push({ type: 'markdown-image', fileName, before: src, after: nextUrl, altBefore: alt, altAfter: nextAlt });
    }
    return `![${nextAlt}](${nextUrl})`;
  });

  next = next.replace(/<img\b([^>]*?)\bsrc=["']([^"']+)["']([^>]*)>/gi, (full, beforeSrc, src, afterSrc) => {
    const fileName = classifyImageUrl(src, expectedFiles);
    if (!fileName || !urlMap.get(fileName)) return full;
    const nextUrl = urlMap.get(fileName);
    let tag = full.replace(/\bsrc=["'][^"']+["']/i, `src="${nextUrl}"`);
    const altMatch = tag.match(/\balt=["']([^"']*)["']/i);
    const nextAlt = fallbackAlt(post, fileName, altMatch ? altMatch[1] : '');
    if (altMatch) {
      tag = tag.replace(/\balt=["'][^"']*["']/i, `alt="${nextAlt.replace(/"/g, '&quot;')}"`);
    } else {
      tag = tag.replace(/<img\b/i, `<img alt="${nextAlt.replace(/"/g, '&quot;')}"`);
    }
    changes.push({ type: 'html-image', fileName, before: src, after: nextUrl, altAfter: nextAlt });
    return tag;
  });
  return { raw: next, changes };
}

function updateRemainingImageReferences(raw, post, expectedFiles, urlMap) {
  const changes = [];
  let next = raw;
  for (const fileName of expectedFiles) {
    const newUrl = urlMap.get(fileName);
    if (!newUrl) continue;
    const candidates = [
      `/images/posts/${post.slug}/${fileName}`,
      `public/images/posts/${post.slug}/${fileName}`,
    ];
    for (const oldUrl of candidates) {
      let count = 0;
      while (next.includes(oldUrl)) {
        next = next.replace(oldUrl, newUrl);
        count += 1;
      }
      if (count > 0) {
        changes.push({
          type: 'inline-image-reference',
          fileName,
          before: oldUrl,
          after: newUrl,
          count,
        });
      }
    }
  }
  return { raw: next, changes };
}

function defaultReportPath(post) {
  return path.join('reports', `post-image-url-apply-${post.slug}-${post.lang}.json`);
}

function isReplacementManifest(manifest) {
  return manifest && manifest.mode === 'replace-existing' && Array.isArray(manifest.slots);
}

function validateReplacementManifest(manifest) {
  const errors = [];
  if (manifest.status && manifest.status !== 'PASS') errors.push(`REPLACEMENT_MANIFEST_STATUS_${manifest.status}`);
  if ((manifest.errors || []).length > 0) errors.push('REPLACEMENT_MANIFEST_HAS_ERRORS');
  const slots = (manifest.slots || []).filter((slot) => slot.oldUrl && slot.newCloudinaryUrl);
  if (slots.length !== (manifest.slots || []).length) errors.push('REPLACEMENT_SLOT_URL_MISSING');
  if (!slots.length) errors.push('REPLACEMENT_SLOT_EMPTY');
  return errors;
}

function replaceFrontmatterSlot(raw, slot, changes) {
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  const lines = raw.split(/\r?\n/);
  let inFrontmatter = false;
  for (let i = 0; i < lines.length; i += 1) {
    if (i === 0 && lines[i].trim() === '---') {
      inFrontmatter = true;
      continue;
    }
    if (inFrontmatter && lines[i].trim() === '---') break;
    if (!inFrontmatter) continue;
    const fieldPattern = new RegExp(`^\\s*${slot.fieldName}\\s*:`);
    if (fieldPattern.test(lines[i]) && lines[i].includes(slot.oldUrl)) {
      lines[i] = lines[i].replace(slot.oldUrl, slot.newCloudinaryUrl);
      changes.push({
        type: 'frontmatter',
        slotId: slot.slotId,
        field: slot.fieldName,
        before: slot.oldUrl,
        after: slot.newCloudinaryUrl,
        line: i + 1,
      });
      return lines.join(eol);
    }
  }
  return raw;
}

function updateMarkdownSlots(raw, slots, changes) {
  const queue = slots.filter((slot) => slot.source === 'markdown-body').map((slot) => ({ ...slot, used: false }));
  return raw.replace(/!\[([^\]]*)]\(([^)]+)\)/g, (full, alt, src) => {
    const slot = queue.find((item) => !item.used && item.oldUrl === src);
    if (!slot) return full;
    slot.used = true;
    changes.push({
      type: 'markdown-image',
      slotId: slot.slotId,
      before: src,
      after: slot.newCloudinaryUrl,
      altBefore: alt,
      altAfter: alt,
      line: slot.line || null,
    });
    return `![${alt}](${slot.newCloudinaryUrl})`;
  });
}

function updateHtmlImageSlots(raw, slots, changes) {
  const queue = slots.filter((slot) => slot.source === 'html-img').map((slot) => ({ ...slot, used: false }));
  return raw.replace(/<img\b([^>]*?)\bsrc=["']([^"']+)["']([^>]*)>/gi, (full, beforeSrc, src) => {
    const slot = queue.find((item) => !item.used && item.oldUrl === src);
    if (!slot) return full;
    slot.used = true;
    changes.push({
      type: 'html-img',
      slotId: slot.slotId,
      before: src,
      after: slot.newCloudinaryUrl,
      line: slot.line || null,
    });
    return full.replace(/\bsrc=["'][^"']+["']/i, `src="${slot.newCloudinaryUrl}"`);
  });
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function updateExistingArticleJsonLdImages(raw, slots, changes) {
  const mappings = [];
  for (const slot of slots) {
    if (!mappings.some((item) => item.oldUrl === slot.oldUrl && item.newCloudinaryUrl === slot.newCloudinaryUrl)) {
      mappings.push(slot);
    }
  }
  return raw.replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, (scriptBlock) => {
    if (!/"@type"\s*:\s*"(?:Article|BlogPosting)"/i.test(scriptBlock)) return scriptBlock;
    const replaceImageValue = (imageValue) => {
      let nextValue = imageValue;
      for (const slot of mappings) {
        const oldUrlPattern = new RegExp(escapeRegExp(slot.oldUrl), 'g');
        if (!oldUrlPattern.test(nextValue)) continue;
        oldUrlPattern.lastIndex = 0;
        nextValue = nextValue.replace(oldUrlPattern, slot.newCloudinaryUrl);
        changes.push({
          type: 'json-ld-image',
          slotId: slot.slotId,
          before: slot.oldUrl,
          after: slot.newCloudinaryUrl,
          line: null,
        });
      }
      return nextValue;
    };
    let nextBlock = scriptBlock.replace(/("image"\s*:\s*\[)([\s\S]*?)(\])/g, (full, prefix, imageValues, suffix) => (
      `${prefix}${replaceImageValue(imageValues)}${suffix}`
    ));
    nextBlock = nextBlock.replace(/("image"\s*:\s*")([^"]*)(")/g, (full, prefix, imageValue, suffix) => (
      `${prefix}${replaceImageValue(imageValue)}${suffix}`
    ));
    return nextBlock;
  });
}

function defaultReplacementMarkdownReportPath(manifest) {
  return path.join('reports', `post-image-cloudinary-replace-${manifest.slug}-${manifest.dateStamp}.md`);
}

function writeReplacementMarkdownReport(report, manifest) {
  const mdPath = resolveFromCwd(defaultReplacementMarkdownReportPath(manifest));
  const lines = [
    `# Finmap Post Image Cloudinary Replace - ${manifest.slug}`,
    '',
    `Date: ${manifest.dateStamp}`,
    '',
    '## Summary',
    '',
    `- Markdown: \`${manifest.markdownPath}\``,
    `- Mode: \`${manifest.mode}\``,
    `- Replacement slots: ${manifest.slots.length}`,
    `- Apply status: ${report.status}`,
    `- Dry run: ${report.dryRun ? 'yes' : 'no'}`,
    '',
    '## Existing Image Slots',
    '',
    '| Slot | Source | Field | Old URL | Role | New local file |',
    '| --- | --- | --- | --- | --- | --- |',
    ...manifest.slots.map((slot) => `| ${slot.slotId} | ${slot.source} | ${slot.fieldName || '-'} | \`${slot.oldUrl}\` | ${slot.inferredRole || '-'} | \`${slot.newLocalFile || '-'}\` |`),
    '',
    '## oldUrl -> newUrl',
    '',
    '| Slot | New Cloudinary URL |',
    '| --- | --- |',
    ...manifest.slots.map((slot) => `| ${slot.slotId} | ${slot.newCloudinaryUrl ? `\`${slot.newCloudinaryUrl}\`` : 'missing'} |`),
    '',
    '## Markdown Changes',
    '',
    '| Type | Slot | Line | Before | After |',
    '| --- | --- | ---: | --- | --- |',
    ...(report.changes.length
      ? report.changes.map((change) => `| ${change.type} | ${change.slotId || '-'} | ${change.line || '-'} | \`${change.before || '-'}\` | \`${change.after || '-'}\` |`)
      : ['| - | - | - | - | - |']),
    '',
    '## Verification',
    '',
    `- Remaining old URLs: ${report.remainingOldUrls.length ? report.remainingOldUrls.map((v) => `\`${v}\``).join(', ') : 'none'}`,
    `- Missing new URLs: ${report.missingNewUrls.length ? report.missingNewUrls.map((v) => `\`${v}\``).join(', ') : 'none'}`,
    `- Duplicate new URLs: ${report.duplicateNewUrls.length ? report.duplicateNewUrls.map((v) => `\`${v}\``).join(', ') : 'none'}`,
    '',
    '## Build Result',
    '',
    '- Not run by this apply script. Run `npm.cmd run build` after actual Markdown replacement.',
    '',
    '## Manual Review Suggestions',
    '',
    '- 이미지 추가/삭제는 자동 적용하지 않았다.',
    '- alt 문구는 기존 값을 보존했다. 비어 있거나 부정확한 alt는 별도 검토한다.',
    '- Cloudinary 기존 public_id는 덮어쓰지 않고 rework 폴더의 새 URL을 사용한다.',
    '',
  ];
  fs.writeFileSync(mdPath, `${lines.join('\n')}\n`, 'utf8');
  return relativePath(mdPath);
}

function countOccurrences(text, needle) {
  if (!needle) return 0;
  let count = 0;
  let index = text.indexOf(needle);
  while (index >= 0) {
    count += 1;
    index = text.indexOf(needle, index + needle.length);
  }
  return count;
}

function applyReplacementManifest(post, manifest, args) {
  const manifestErrors = validateReplacementManifest(manifest);
  const reportPath = resolveFromCwd(args.reportPath || defaultReportPath(post));
  const report = {
    markdownPath: post.path,
    manifestPath: relativePath(resolveFromCwd(args.manifestPath)),
    mode: 'replace-existing',
    dryRun: args.dryRun,
    status: 'PENDING',
    manifestErrors,
    changes: [],
    remainingOldUrls: [],
    missingNewUrls: [],
    duplicateNewUrls: [],
    markdownReportPath: null,
  };
  if (manifestErrors.length) {
    report.status = 'FAIL';
    writeJson(reportPath, report);
    console.error(`Replacement manifest validation failed. Report: ${relativePath(reportPath)}`);
    for (const error of manifestErrors) console.error(`- ${error}`);
    process.exit(1);
  }

  let nextRaw = post.raw;
  const slots = manifest.slots.filter((slot) => slot.oldUrl && slot.newCloudinaryUrl);
  for (const slot of slots.filter((item) => item.source === 'frontmatter')) {
    nextRaw = replaceFrontmatterSlot(nextRaw, slot, report.changes);
  }
  nextRaw = updateMarkdownSlots(nextRaw, slots, report.changes);
  nextRaw = updateHtmlImageSlots(nextRaw, slots, report.changes);
  nextRaw = updateExistingArticleJsonLdImages(nextRaw, slots, report.changes);

  report.remainingOldUrls = slots
    .filter((slot) => nextRaw.includes(slot.oldUrl))
    .map((slot) => slot.oldUrl);
  report.missingNewUrls = slots
    .filter((slot) => !nextRaw.includes(slot.newCloudinaryUrl))
    .map((slot) => slot.newCloudinaryUrl);
  report.duplicateNewUrls = slots
    .filter((slot) => countOccurrences(nextRaw, slot.newCloudinaryUrl) > 1)
    .map((slot) => slot.newCloudinaryUrl);
  report.status = report.remainingOldUrls.length || report.missingNewUrls.length ? 'FAIL' : 'PASS';
  report.markdownReportPath = writeReplacementMarkdownReport(report, manifest);

  if (!args.dryRun && report.status === 'PASS' && report.changes.length > 0) {
    fs.writeFileSync(post.absolutePath, nextRaw, 'utf8');
  }
  writeJson(reportPath, report);

  console.log(`Apply report: ${relativePath(reportPath)}`);
  console.log(`Markdown report: ${report.markdownReportPath}`);
  console.log(`Status: ${report.status}`);
  console.log(`Changes: ${report.changes.length}`);
  if (args.dryRun) console.log('Dry-run only. Markdown was not modified.');
  if (report.status !== 'PASS') process.exit(1);
}

function run() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.markdownPath || !args.manifestPath) {
    printUsage();
    process.exit(args.help ? 0 : 1);
  }
  const post = parseMarkdown(args.markdownPath);
  const manifest = loadManifest(args.manifestPath);

  if (isReplacementManifest(manifest)) {
    applyReplacementManifest(post, manifest, args);
    return;
  }

  const expectedFiles = fileNamesForLang(post.lang);
  const manifestErrors = validateManifest(manifest, expectedFiles);
  const reportPath = resolveFromCwd(args.reportPath || defaultReportPath(post));
  const report = {
    markdownPath: post.path,
    manifestPath: relativePath(resolveFromCwd(args.manifestPath)),
    dryRun: args.dryRun,
    expectedFiles,
    status: 'PENDING',
    manifestErrors,
    changes: [],
  };

  if (manifestErrors.length) {
    report.status = 'FAIL';
    writeJson(reportPath, report);
    console.error(`Manifest validation failed. Report: ${relativePath(reportPath)}`);
    for (const error of manifestErrors) console.error(`- ${error}`);
    process.exit(1);
  }

  const urlMap = imageMapFromManifest(manifest);
  const parsed = matter(post.raw);
  const fmResult = updateFrontmatter(post.raw, parsed, expectedFiles, urlMap);
  const bodyResult = updateBodyImages(fmResult.raw, post, expectedFiles, urlMap);
  const inlineResult = updateRemainingImageReferences(bodyResult.raw, post, expectedFiles, urlMap);
  report.changes = [...fmResult.changes, ...bodyResult.changes, ...inlineResult.changes];
  report.status = 'PASS';

  if (!args.dryRun && report.changes.length > 0) {
    fs.writeFileSync(post.absolutePath, inlineResult.raw, 'utf8');
  }

  writeJson(reportPath, report);
  console.log(`Apply report: ${relativePath(reportPath)}`);
  console.log(`Changes: ${report.changes.length}`);
  if (args.dryRun) console.log('Dry-run only. Markdown was not modified.');
}

try {
  run();
} catch (err) {
  console.error(`apply_post_image_cloudinary_urls failed: ${err.stack || err.message || err}`);
  process.exit(1);
}
