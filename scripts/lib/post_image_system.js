const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const sharp = require('sharp');

const ROOT = process.cwd();
const PLAN_VERSION = '2026-06-23';
const COVER_SIZE = { width: 1600, height: 900 };
const BODY_SIZE = { width: 1200, height: 675 };
const SAFE_RATIO = 0.09;
const OUT_ROOT = path.join(ROOT, 'public', 'images', 'posts');
const REPORT_ROOT = path.join(ROOT, 'reports');
const IMAGE_FIELDS = [
  'cover',
  'image',
  'thumbnail',
  'ogImage',
  'socialImage',
  'heroImage',
  'coverImage',
  'bannerImage',
];

const COLORS = {
  bg: '#f6fbff',
  panel: '#ffffff',
  navy: '#102a43',
  slate: '#52647a',
  muted: '#74849a',
  line: '#d8e4f2',
  blue: '#2563eb',
  cyan: '#38bdf8',
  green: '#10b981',
  amber: '#f59e0b',
  red: '#ef4444',
  paleBlue: '#dbeafe',
  paleGreen: '#dcfce7',
  paleAmber: '#fef3c7',
};

const CATEGORY_PALETTES = {
  neutral: {
    name: 'neutral',
    categoryLabel: 'unknown',
    background: '#f6fbff',
    backgroundAccent: '#eef7ff',
    cardBackground: '#ffffff',
    cardBorder: '#d8e4f2',
    primaryText: '#102a43',
    secondaryText: '#52647a',
    mutedText: '#74849a',
    accent: '#2563eb',
    mutedAccent: '#38bdf8',
    secondaryAccent: '#10b981',
    tertiaryAccent: '#f59e0b',
    danger: '#ef4444',
    dot: '#cfe2f3',
  },
  economicInfo: {
    name: 'economic-macro',
    categoryLabel: '경제',
    background: '#111827',
    backgroundAccent: '#1f2a44',
    cardBackground: '#f8fafc',
    cardBorder: '#64748b',
    primaryText: '#f8fafc',
    secondaryText: '#cbd5e1',
    mutedText: '#94a3b8',
    accent: '#60a5fa',
    mutedAccent: '#38bdf8',
    secondaryAccent: '#2dd4bf',
    tertiaryAccent: '#fbbf24',
    danger: '#fb7185',
    dot: '#334155',
  },
  investingInfo: {
    name: 'investing-dashboard',
    categoryLabel: '투자',
    background: '#172033',
    backgroundAccent: '#12313a',
    cardBackground: '#f7fbf8',
    cardBorder: '#5b7f7a',
    primaryText: '#f8fafc',
    secondaryText: '#c8d7d2',
    mutedText: '#8ea7a1',
    accent: '#34d399',
    mutedAccent: '#14b8a6',
    secondaryAccent: '#60a5fa',
    tertiaryAccent: '#f59e0b',
    danger: '#f87171',
    dot: '#294451',
  },
  personalFinance: {
    name: 'personal-finance-card',
    categoryLabel: '재테크',
    background: '#16312f',
    backgroundAccent: '#f4ead8',
    cardBackground: '#fffdf7',
    cardBorder: '#cfe3d3',
    primaryText: '#f9fafb',
    secondaryText: '#dce8e3',
    mutedText: '#8ca39a',
    accent: '#10b981',
    mutedAccent: '#d9b46b',
    secondaryAccent: '#38bdf8',
    tertiaryAccent: '#f59e0b',
    danger: '#ef4444',
    dot: '#31524c',
  },
};

const TEXT_FIT_POLICY = {
  name: 'word-fit-no-korean-orphan-v1',
  wrapUnit: 'space-or-token',
  prohibitKoreanSyllableSplit: true,
  prohibitKoreanOrphanLine: true,
  defaultMaxLines: 2,
  defaultMinFontSize: 18,
  roleMaxLines: {
    title: 2,
    subtitle: 2,
    keyword: 1,
    'card-label': 2,
    'step-label': 2,
    'panel-label': 2,
    'check-label': 2,
    'panel-note': 1,
  },
  roleMinFontSize: {
    title: 34,
    subtitle: 22,
    keyword: 18,
    'card-label': 22,
    'step-label': 22,
    'panel-label': 22,
    'check-label': 22,
    'panel-note': 18,
  },
};

function normalizeSlash(value) {
  return String(value || '').replace(/\\/g, '/');
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function resolveFromCwd(inputPath) {
  return path.isAbsolute(inputPath) ? inputPath : path.resolve(ROOT, inputPath);
}

function relativePath(inputPath) {
  return normalizeSlash(path.relative(ROOT, inputPath) || '.');
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function esc(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function cleanText(value) {
  return String(value || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
    .replace(/\[[^\]]+]([^)]+)/g, ' ')
    .replace(/[`*_>#|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function inferLang(mdPath, data) {
  if (data.lang) return String(data.lang).toLowerCase();
  const parts = normalizeSlash(mdPath).split('/');
  if (parts.includes('en')) return 'en';
  return 'ko';
}

function extractHeadings(content) {
  return Array.from(content.matchAll(/^#{2,3}\s+(.+)$/gm))
    .map((m) => cleanText(m[1]))
    .filter(Boolean)
    .slice(0, 18);
}

function extractFaqs(content) {
  const faqIndex = content.search(/^##\s+FAQ\b|^##\s+자주 묻는 질문/m);
  const source = faqIndex >= 0 ? content.slice(faqIndex) : content;
  return Array.from(source.matchAll(/^###\s+(?:Q\d+\.\s*)?(.+\?)\s*$/gm))
    .map((m) => cleanText(m[1]))
    .filter(Boolean)
    .slice(0, 8);
}

function extractTables(content) {
  const blocks = [];
  const lines = content.split(/\r?\n/);
  let current = [];
  for (const line of lines) {
    if (/^\s*\|.+\|\s*$/.test(line)) {
      current.push(line.trim());
    } else if (current.length) {
      if (current.length >= 2) blocks.push(current);
      current = [];
    }
  }
  if (current.length >= 2) blocks.push(current);
  return blocks.slice(0, 6).map((block) => ({
    rows: block.length,
    header: block[0],
    sample: block.slice(0, 4),
  }));
}

function extractImages(content) {
  const images = [];
  for (const m of content.matchAll(/!\[([^\]]*)]\(([^)]+)\)/g)) {
    images.push({ type: 'markdown', alt: m[1] || '', src: m[2] || '' });
  }
  for (const m of content.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)) {
    const tag = m[0];
    const alt = (tag.match(/\balt=["']([^"']*)["']/i) || [])[1] || '';
    images.push({ type: 'html', alt, src: m[1] || '' });
  }
  return images;
}

function parseMarkdown(mdPath) {
  const absolutePath = resolveFromCwd(mdPath);
  const raw = fs.readFileSync(absolutePath, 'utf8');
  const parsed = matter(raw);
  const data = parsed.data || {};
  const lang = inferLang(absolutePath, data);
  const slug = String(data.slug || path.basename(absolutePath, path.extname(absolutePath)));
  const rel = relativePath(absolutePath);
  const headings = extractHeadings(parsed.content);
  const faqs = extractFaqs(parsed.content);
  const tables = extractTables(parsed.content);
  const images = extractImages(parsed.content);
  const tags = Array.isArray(data.tags) ? data.tags.map(String) : [];
  return {
    path: rel,
    absolutePath,
    raw,
    data,
    content: parsed.content,
    frontmatter: data,
    slug,
    lang,
    category: data.postCategory || data.category || '',
    title: cleanText(data.title || headings[0] || slug),
    description: cleanText(data.seoDescription || data.description || ''),
    tags,
    headings,
    faqs,
    tables,
    images,
  };
}

function truncate(value, maxChars) {
  const text = cleanText(value);
  if (text.length <= maxChars) return text;
  return `${text.slice(0, Math.max(0, maxChars - 1)).trim()}…`;
}

function truncateAtWord(value, maxChars) {
  const text = cleanText(value);
  if (text.length <= maxChars) return text;
  const limit = Math.max(1, maxChars - 1);
  const words = text.split(/\s+/).filter(Boolean);
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > limit) break;
    current = next;
  }
  if (current && current.length >= Math.max(4, Math.floor(limit * 0.55))) return `${current}…`;
  return `${text.slice(0, limit).trim()}…`;
}

function pickKeyword(post) {
  const fromTags = post.tags.slice(0, 3).join(' · ');
  if (fromTags) return truncate(fromTags, post.lang === 'en' ? 58 : 36);
  return post.lang === 'en' ? 'Finance guide' : 'FinMap 가이드';
}

function categoryKey(category) {
  const value = String(category || '').trim();
  const lower = value.toLowerCase();
  if (lower === 'economicinfo' || value === '경제정보' || value === '경제') return 'economicInfo';
  if (lower === 'investinginfo' || value === '투자정보' || value === '투자') return 'investingInfo';
  if (lower === 'personalfinance' || value === '개인재무' || value === '재테크' || value === '생활금융') return 'personalFinance';
  return 'neutral';
}

function getCategoryPalette(category) {
  const key = categoryKey(category);
  return {
    ...CATEGORY_PALETTES.neutral,
    ...(CATEGORY_PALETTES[key] || {}),
    key,
  };
}

function planPresentationMeta(post) {
  const palette = getCategoryPalette(post.category);
  return {
    categoryLabel: palette.categoryLabel,
    paletteName: palette.name,
    textFitPolicy: TEXT_FIT_POLICY,
    maxLines: TEXT_FIT_POLICY.defaultMaxLines,
    minFontSize: TEXT_FIT_POLICY.defaultMinFontSize,
  };
}

function fileNamesForLang(lang) {
  return lang === 'en'
    ? ['cover-en.png', 'img1-en.png', 'img2-en.png', 'img3-en.png']
    : ['cover.png', 'img1.png', 'img2.png', 'img3.png'];
}

function makeDateStamp(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${map.year}${map.month}${map.day}`;
}

function isImageUrl(value) {
  const text = String(value || '').trim();
  if (!text) return false;
  return (
    /^https?:\/\/res\.cloudinary\.com\//i.test(text) ||
    /^\/images\/posts\//i.test(text) ||
    /^public\/images\/posts\//i.test(text) ||
    /\.(png|jpe?g|webp|svg)(\?.*)?$/i.test(text)
  );
}

function bodyStartOffset(raw) {
  if (!raw.startsWith('---')) return 0;
  const end = raw.indexOf('\n---', 3);
  if (end < 0) return 0;
  const after = raw.indexOf('\n', end + 4);
  return after < 0 ? raw.length : after + 1;
}

function lineForOffset(raw, offset) {
  return raw.slice(0, offset).split(/\r?\n/).length;
}

function nearHeadingForLine(raw, lineNumber) {
  const lines = raw.split(/\r?\n/);
  for (let i = Math.min(lineNumber - 1, lines.length - 1); i >= 0; i -= 1) {
    const match = lines[i].match(/^#{2,3}\s+(.+?)\s*$/);
    if (match) return cleanText(match[1]);
  }
  return '';
}

function inferImageRole({ source, fieldName, alt, nearHeading, oldUrl }) {
  const haystack = `${fieldName || ''} ${alt || ''} ${nearHeading || ''} ${oldUrl || ''}`.toLowerCase();
  if (source === 'frontmatter' && /cover|og|thumb|social|hero/.test(fieldName || '')) {
    return /hero/.test(fieldName || '') ? 'hero' : 'cover';
  }
  if (/cover|hero|대표|썸네일/.test(haystack)) return 'cover';
  if (/flow|step|process|순서|단계|흐름|로드맵/.test(haystack)) return 'flow';
  if (/compare|comparison|vs|versus|비교|좌우|scenario|시나리오/.test(haystack)) return 'comparison';
  if (/chart|table|graph|dashboard|계산|표|차트|대시보드|수익률|금리|가격|월/.test(haystack)) return 'chart';
  if (/summary|요약|check|체크|faq|질문/.test(haystack)) return 'summary';
  if (/logo|icon|decorative|brand/.test(haystack)) return 'decorative';
  return 'body-explanation';
}

function templateForRole(role) {
  if (role === 'cover' || role === 'hero') return 'cover';
  if (role === 'flow') return 'flow';
  if (role === 'comparison') return 'comparison';
  if (role === 'chart') return 'chart-summary';
  if (role === 'summary') return 'checklist';
  return 'body-summary';
}

function suffixForRole(role) {
  if (role === 'cover' || role === 'hero') return 'cover';
  if (role === 'flow') return 'flow';
  if (role === 'comparison') return 'comparison';
  if (role === 'chart') return 'chart';
  if (role === 'summary') return 'summary';
  return 'body';
}

function makeSlotFileName(index, role, lang) {
  const suffix = suffixForRole(role);
  const langSuffix = lang === 'en' ? '-en' : '';
  return `slot-${String(index).padStart(3, '0')}-${suffix}${langSuffix}.png`;
}

function shouldReplaceImage({ oldUrl, role }) {
  if (!isImageUrl(oldUrl)) {
    return { shouldReplace: false, reason: 'Not a recognized Cloudinary or local post image URL.' };
  }
  if (role === 'decorative') {
    return { shouldReplace: false, reason: 'Decorative/logo-like image; replacement should be reviewed manually.' };
  }
  return { shouldReplace: true, reason: 'Existing Markdown image slot eligible for rework replacement.' };
}

function createImageInventory(mdPath, options = {}) {
  const post = parseMarkdown(mdPath);
  const raw = post.raw;
  const parsed = matter(raw);
  const slots = [];
  let order = 0;
  let recommendedIndex = 0;

  function pushSlot(slot) {
    order += 1;
    const role = inferImageRole(slot);
    const decision = shouldReplaceImage({ oldUrl: slot.oldUrl, role });
    let recommendedNewLocalFile = null;
    if (decision.shouldReplace) {
      recommendedIndex += 1;
      recommendedNewLocalFile = makeSlotFileName(recommendedIndex, role, post.lang);
    }
    slots.push({
      slotId: slot.slotId,
      source: slot.source,
      fieldName: slot.fieldName || null,
      oldUrl: slot.oldUrl,
      alt: slot.alt || '',
      order,
      line: slot.line || null,
      nearHeading: slot.nearHeading || '',
      inferredRole: role,
      shouldReplace: decision.shouldReplace,
      reason: decision.reason,
      recommendedTemplate: templateForRole(role),
      recommendedNewLocalFile,
    });
  }

  for (const fieldName of IMAGE_FIELDS) {
    const value = parsed.data && parsed.data[fieldName];
    if (typeof value !== 'string' || !isImageUrl(value)) continue;
    const line = lineForOffset(raw, raw.indexOf(value));
    pushSlot({
      slotId: `frontmatter-${fieldName}`,
      source: 'frontmatter',
      fieldName,
      oldUrl: value,
      alt: '',
      line,
      nearHeading: 'frontmatter',
    });
  }

  const start = bodyStartOffset(raw);
  let markdownIndex = 0;
  for (const match of raw.matchAll(/!\[([^\]]*)]\(([^)]+)\)/g)) {
    if (match.index < start) continue;
    markdownIndex += 1;
    const line = lineForOffset(raw, match.index);
    pushSlot({
      slotId: `body-${String(markdownIndex).padStart(3, '0')}`,
      source: 'markdown-body',
      oldUrl: match[2],
      alt: match[1] || '',
      line,
      nearHeading: nearHeadingForLine(raw, line),
    });
  }

  let htmlIndex = 0;
  for (const match of raw.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)) {
    if (match.index < start) continue;
    htmlIndex += 1;
    const tag = match[0];
    const alt = (tag.match(/\balt=["']([^"']*)["']/i) || [])[1] || '';
    const line = lineForOffset(raw, match.index);
    pushSlot({
      slotId: `html-${String(htmlIndex).padStart(3, '0')}`,
      source: 'html-img',
      oldUrl: match[1],
      alt,
      line,
      nearHeading: nearHeadingForLine(raw, line),
    });
  }

  const dateStamp = options.dateStamp || makeDateStamp();
  const replaceableSlots = slots.filter((slot) => slot.shouldReplace);
  return {
    version: PLAN_VERSION,
    markdownPath: post.path,
    slug: post.slug,
    lang: post.lang,
    mode: replaceableSlots.length > 0 ? 'replace-existing' : 'new',
    dateStamp,
    createdAt: new Date().toISOString(),
    slotCount: slots.length,
    replaceableCount: replaceableSlots.length,
    outputDir: `public/images/posts/${post.slug}/rework-${dateStamp}`,
    cloudinaryFolder: `blog/insight/${post.slug}/rework-${dateStamp}`,
    slots,
    suggestions: replaceableSlots.length > 0
      ? []
      : ['No existing image slots found. New-image mode may use default cover/img1/img2/img3 slots when appropriate.'],
  };
}

function defaultInventoryPath(postOrInventory) {
  return path.join(REPORT_ROOT, `post-image-inventory-${postOrInventory.slug}.json`);
}

function defaultReplacementManifestPath(inventory) {
  return path.join(REPORT_ROOT, `post-image-replacement-${inventory.slug}-${inventory.dateStamp}.json`);
}

function chooseItems(values, fallback, maxCount) {
  const merged = values.filter(Boolean);
  for (const item of fallback) {
    if (merged.length >= maxCount) break;
    if (!merged.includes(item)) merged.push(item);
  }
  return merged.slice(0, maxCount);
}

function imageFromSlot(post, slot, index) {
  const isEn = post.lang === 'en';
  const headings = post.headings.filter((h) => !/^FAQ\b|자주 묻는 질문/.test(h));
  const baseItems = chooseItems(
    [
      slot.nearHeading && truncateAtWord(slot.nearHeading, isEn ? 28 : 16),
      slot.alt && truncateAtWord(slot.alt, isEn ? 28 : 16),
      ...headings.slice(index - 1, index + 3).map((h) => truncateAtWord(h, isEn ? 28 : 16)),
    ],
    isEn ? ['Input', 'Scenario', 'Compare', 'Decision'] : ['입력값', '시나리오', '비교', '판단'],
    4
  );
  const title = slot.inferredRole === 'cover'
    ? truncate(post.title, isEn ? 62 : 42)
    : truncate(slot.nearHeading || slot.alt || (isEn ? 'Article Image' : '본문 이미지'), isEn ? 44 : 28);
  const subtitle = truncate(slot.alt || post.description || post.title, isEn ? 90 : 56);
  const isCover = slot.inferredRole === 'cover' || slot.inferredRole === 'hero';
  const template = slot.recommendedTemplate;
  const fileName = slot.recommendedNewLocalFile;

  return {
    slot: slot.slotId,
    sourceSlot: slot,
    fileName,
    width: isCover ? COVER_SIZE.width : BODY_SIZE.width,
    height: isCover ? COVER_SIZE.height : BODY_SIZE.height,
    template,
    title,
    subtitle,
    keyword: isCover ? pickKeyword(post) : (isEn ? 'Image rework' : '이미지 교체'),
    cards: baseItems.slice(0, 3),
    items: baseItems,
    expected: template === 'flow'
      ? { kind: 'flow', stepCount: baseItems.length, boxCount: baseItems.length, connectorCount: Math.max(0, baseItems.length - 1) }
      : template === 'comparison' || template === 'chart-summary'
        ? { kind: 'comparison', panelCount: Math.min(3, baseItems.length), boxCount: Math.min(3, baseItems.length), connectorCount: 0 }
        : { kind: isCover ? 'cover' : 'checklist', stepCount: baseItems.length, boxCount: baseItems.length, connectorCount: 0 },
  };
}

function makePlan(mdPath, options = {}) {
  const post = parseMarkdown(mdPath);
  const dateStamp = options.dateStamp || makeDateStamp();
  const mode = options.mode || 'auto';
  const inventory = createImageInventory(mdPath, { dateStamp });
  const replaceableSlots = inventory.slots.filter((slot) => slot.shouldReplace);
  const presentation = planPresentationMeta(post);

  if ((mode === 'auto' || mode === 'replace-existing') && replaceableSlots.length > 0) {
    const images = replaceableSlots.map((slot, index) => imageFromSlot(post, slot, index + 1));
    return {
      version: PLAN_VERSION,
      markdownPath: post.path,
      slug: post.slug,
      lang: post.lang,
      mode: 'replace-existing',
      dateStamp,
      title: post.title,
      description: post.description,
      category: post.category,
      categoryLabel: presentation.categoryLabel,
      paletteName: presentation.paletteName,
      textFitPolicy: presentation.textFitPolicy,
      maxLines: presentation.maxLines,
      minFontSize: presentation.minFontSize,
      tags: post.tags,
      source: {
        headingCount: post.headings.length,
        tableCount: post.tables.length,
        faqCount: post.faqs.length,
        imageCount: post.images.length,
        imageSlotCount: inventory.slotCount,
        replaceableSlotCount: inventory.replaceableCount,
        headings: post.headings.slice(0, 12),
        faqs: post.faqs,
        existingImages: post.images,
      },
      inventory,
      outputDir: inventory.outputDir,
      cloudinaryFolder: inventory.cloudinaryFolder,
      expectedFiles: images.map((image) => image.fileName),
      generatedAt: new Date().toISOString(),
      images,
    };
  }

  if (mode === 'replace-existing' && replaceableSlots.length === 0) {
    throw new Error('replace-existing mode requested, but no replaceable image slots were found.');
  }

  const outputDir = path.join(OUT_ROOT, post.slug);
  const fileNames = fileNamesForLang(post.lang);
  const isEn = post.lang === 'en';
  const headings = post.headings.filter((h) => !/^FAQ\b|자주 묻는 질문/.test(h));
  const firstHeadings = chooseItems(
    headings.slice(0, 4).map((h) => truncateAtWord(h, isEn ? 30 : 16)),
    isEn ? ['Inputs', 'Scenario', 'Compare', 'Decision'] : ['입력값', '시나리오', '비교', '판단'],
    4
  );
  const tableItems = post.tables.length
    ? chooseItems(
        post.tables[0].sample
          .filter((line) => !/^\|\s*-/.test(line))
          .slice(1, 4)
          .map((line) => truncateAtWord(line.split('|').map((v) => v.trim()).filter(Boolean)[0], isEn ? 22 : 16)),
        isEn ? ['Base case', 'Higher rate', 'Longer horizon'] : ['기준값', '높은 가정', '긴 기간'],
        3
      )
    : chooseItems(post.tags.map((t) => truncateAtWord(t, isEn ? 20 : 12)), isEn ? ['Base', 'Upside', 'Stress'] : ['기준', '상승', '스트레스'], 3);
  const faqItems = chooseItems(
    post.faqs.map((q) => truncateAtWord(q.replace(/\?$/, ''), isEn ? 32 : 18)),
    isEn ? ['Check assumptions', 'Compare scenarios', 'Use calculator'] : ['가정 확인', '시나리오 비교', '계산기 연결'],
    4
  );

  const images = [
    {
      slot: 'cover',
      fileName: fileNames[0],
      width: COVER_SIZE.width,
      height: COVER_SIZE.height,
      template: 'cover',
      title: truncate(post.title, isEn ? 62 : 42),
      subtitle: truncate(post.description || firstHeadings.join(' · '), isEn ? 120 : 82),
      keyword: pickKeyword(post),
      cards: firstHeadings.slice(0, 3),
      expected: { kind: 'cover', textCount: 5, boxCount: 4, connectorCount: 0 },
    },
    {
      slot: 'img1',
      fileName: fileNames[1],
      width: BODY_SIZE.width,
      height: BODY_SIZE.height,
      template: 'flow',
      title: isEn ? 'Reading Order' : '읽는 순서',
      subtitle: truncate(firstHeadings.join(' → '), isEn ? 90 : 62),
      keyword: isEn ? 'Step by step' : '단계별 흐름',
      items: firstHeadings,
      expected: { kind: 'flow', stepCount: firstHeadings.length, boxCount: firstHeadings.length, connectorCount: Math.max(0, firstHeadings.length - 1) },
    },
    {
      slot: 'img2',
      fileName: fileNames[2],
      width: BODY_SIZE.width,
      height: BODY_SIZE.height,
      template: 'comparison',
      title: isEn ? 'Scenario Check' : '시나리오 비교',
      subtitle: truncate(post.tables.length ? 'Table-based reference from the article' : post.tags.slice(0, 3).join(' · '), isEn ? 88 : 54),
      keyword: isEn ? 'Compare assumptions' : '가정 비교',
      items: tableItems,
      expected: { kind: 'comparison', panelCount: tableItems.length, boxCount: tableItems.length, connectorCount: 0 },
    },
    {
      slot: 'img3',
      fileName: fileNames[3],
      width: BODY_SIZE.width,
      height: BODY_SIZE.height,
      template: 'checklist',
      title: isEn ? 'Decision Checklist' : '판단 체크',
      subtitle: truncate(faqItems.join(' · '), isEn ? 88 : 54),
      keyword: isEn ? 'Before you decide' : '결정 전 점검',
      items: faqItems,
      expected: { kind: 'checklist', stepCount: faqItems.length, boxCount: faqItems.length, connectorCount: 0 },
    },
  ];

  return {
    version: PLAN_VERSION,
    markdownPath: post.path,
    slug: post.slug,
    lang: post.lang,
    mode: 'new',
    dateStamp,
    title: post.title,
    description: post.description,
    category: post.category,
    categoryLabel: presentation.categoryLabel,
    paletteName: presentation.paletteName,
    textFitPolicy: presentation.textFitPolicy,
    maxLines: presentation.maxLines,
    minFontSize: presentation.minFontSize,
    tags: post.tags,
    source: {
      headingCount: post.headings.length,
      tableCount: post.tables.length,
      faqCount: post.faqs.length,
      imageCount: post.images.length,
      headings: post.headings.slice(0, 12),
      faqs: post.faqs,
      existingImages: post.images,
    },
    inventory,
    outputDir: relativePath(outputDir),
    cloudinaryFolder: `blog/insight/${post.slug}`,
    expectedFiles: fileNames,
    generatedAt: new Date().toISOString(),
    images,
  };
}

function defaultPlanPath(planOrPost) {
  const slug = planOrPost.slug;
  const lang = planOrPost.lang;
  return path.join(REPORT_ROOT, `post-image-plan-${slug}-${lang}.json`);
}

function defaultRenderManifestPath(plan) {
  return path.join(resolveFromCwd(plan.outputDir), 'image-layout-manifest.json');
}

function defaultValidationReportPath(plan) {
  return path.join(REPORT_ROOT, `post-image-validation-${plan.slug}-${plan.lang}.json`);
}

function defaultAuditReportPath(post) {
  return path.join(REPORT_ROOT, `post-image-audit-${post.slug}-${post.lang}.md`);
}

function approxTextWidth(text, fontSize, lang) {
  let width = 0;
  for (const ch of String(text || '')) {
    if (/\s/.test(ch)) width += fontSize * 0.32;
    else if (/[A-Z0-9]/.test(ch)) width += fontSize * 0.62;
    else if (/[a-z.,/%():+-]/.test(ch)) width += fontSize * 0.52;
    else width += lang === 'en' ? fontSize * 0.62 : fontSize * 0.94;
  }
  return width;
}

function isKoreanOrphanLine(line, lang) {
  return lang !== 'en' && /^[가-힣]$/.test(String(line || '').trim());
}

function hasKoreanOrphanLine(lines, lang) {
  if (lang === 'en' || !Array.isArray(lines) || lines.length <= 1) return false;
  return lines.some((line, index) => index > 0 && isKoreanOrphanLine(line, lang));
}

function mergeProtectedTokens(tokens) {
  const merged = [];
  for (let i = 0; i < tokens.length; i += 1) {
    const current = tokens[i];
    const next = tokens[i + 1];
    if (/^[A-Z]{2,}$/.test(current) && /^[\d,.]+%?$/.test(next || '')) {
      merged.push(`${current} ${next}`);
      i += 1;
      continue;
    }
    merged.push(current);
  }
  return merged;
}

function tokensForWrap(text) {
  const source = cleanText(text).replace(/\s+/g, ' ').trim();
  if (!source) return [''];
  return mergeProtectedTokens(source.split(' ').filter(Boolean));
}

function minFontSizeForRole(role, fallback = TEXT_FIT_POLICY.defaultMinFontSize) {
  return TEXT_FIT_POLICY.roleMinFontSize[role] || fallback;
}

function maxLinesForRole(role, fallback = TEXT_FIT_POLICY.defaultMaxLines) {
  return TEXT_FIT_POLICY.roleMaxLines[role] || fallback;
}

function lineHeightForFont(fontSize) {
  return fontSize * 1.22;
}

function fitMetrics(lines, fontSize, lang) {
  const widths = lines.map((line) => approxTextWidth(line, fontSize, lang));
  return {
    maxLineWidth: Math.max(...widths, 1),
    height: lines.length * lineHeightForFont(fontSize),
  };
}

function wrapTokens(tokens, fontSize, boxWidth, lang) {
  const lines = [];
  let current = '';
  let tokenOverflow = false;
  for (const token of tokens) {
    if (approxTextWidth(token, fontSize, lang) > boxWidth) {
      tokenOverflow = true;
    }
    const next = current ? `${current} ${token}` : token;
    if (current && approxTextWidth(next, fontSize, lang) > boxWidth) {
      lines.push(current);
      current = token;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return { lines, tokenOverflow };
}

function fitTextToBox({
  text,
  boxWidth,
  maxLines = TEXT_FIT_POLICY.defaultMaxLines,
  initialFontSize,
  minFontSize = TEXT_FIT_POLICY.defaultMinFontSize,
  lang = 'ko',
  fontWeight = 700,
  boxHeight = Infinity,
}) {
  const source = cleanText(text);
  const normalizedLang = String(lang || 'ko').toLowerCase().startsWith('en') ? 'en' : 'ko';
  const safeInitial = Number(initialFontSize || 24);
  const safeMin = Math.min(safeInitial, Number(minFontSize || TEXT_FIT_POLICY.defaultMinFontSize));
  const widthLimit = Math.max(1, Number(boxWidth || 1));
  const heightLimit = Number.isFinite(boxHeight) ? Math.max(1, Number(boxHeight)) : Infinity;
  if (!source) {
    return {
      lines: [''],
      fontSize: safeInitial,
      overflow: false,
      shrinkApplied: false,
      wrapApplied: false,
      orphanLine: false,
      fontWeight,
    };
  }

  const step = safeInitial >= 30 ? 2 : 1;
  for (let fontSize = safeInitial; fontSize >= safeMin; fontSize -= step) {
    const lines = [source];
    const metrics = fitMetrics(lines, fontSize, normalizedLang);
    if (metrics.maxLineWidth <= widthLimit && metrics.height <= heightLimit) {
      return {
        lines,
        fontSize,
        overflow: false,
        shrinkApplied: fontSize < safeInitial,
        wrapApplied: false,
        orphanLine: false,
        maxLineWidth: metrics.maxLineWidth,
        textHeight: metrics.height,
        fontWeight,
      };
    }
  }

  const tokens = tokensForWrap(source);
  let best = null;
  for (let fontSize = safeInitial; fontSize >= safeMin; fontSize -= step) {
    const wrapped = wrapTokens(tokens, fontSize, widthLimit, normalizedLang);
    const metrics = fitMetrics(wrapped.lines, fontSize, normalizedLang);
    const orphanLine = hasKoreanOrphanLine(wrapped.lines, normalizedLang);
    const overflow = wrapped.tokenOverflow
      || wrapped.lines.length > maxLines
      || metrics.maxLineWidth > widthLimit
      || metrics.height > heightLimit
      || orphanLine;
    best = { wrapped, metrics, fontSize, orphanLine, overflow };
    if (!overflow) {
      return {
        lines: wrapped.lines,
        fontSize,
        overflow: false,
        shrinkApplied: fontSize < safeInitial,
        wrapApplied: wrapped.lines.length > 1,
        orphanLine: false,
        maxLineWidth: metrics.maxLineWidth,
        textHeight: metrics.height,
        fontWeight,
      };
    }
  }

  const fallbackLines = (best && best.wrapped.lines.length ? best.wrapped.lines : [source]).slice(0, maxLines);
  const fallbackMetrics = fitMetrics(fallbackLines, safeMin, normalizedLang);
  return {
    lines: fallbackLines,
    fontSize: best ? best.fontSize : safeMin,
    overflow: true,
    shrinkApplied: true,
    wrapApplied: fallbackLines.length > 1,
    orphanLine: best ? best.orphanLine : hasKoreanOrphanLine(fallbackLines, normalizedLang),
    maxLineWidth: fallbackMetrics.maxLineWidth,
    textHeight: fallbackMetrics.height,
    fontWeight,
  };
}

function rectSvg({ x, y, w, h, r = 18, fill = COLORS.panel, stroke = COLORS.line, sw = 2, opacity = 1 }) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" opacity="${opacity}"/>`;
}

function lineSvg({ x1, y1, x2, y2, stroke = COLORS.line, sw = 4, opacity = 1 }) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" opacity="${opacity}"/>`;
}

function circleSvg({ cx, cy, r, fill = COLORS.blue, stroke = 'none', sw = 0, opacity = 1 }) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" opacity="${opacity}"/>`;
}

function addBox(layout, image, box) {
  layout.elements.push({
    image: image.fileName,
    type: 'box',
    ...box,
  });
}

function addConnector(layout, image, connector) {
  layout.elements.push({
    image: image.fileName,
    type: 'connector',
    ...connector,
  });
}

function textBlock(layout, image, opts) {
  const role = opts.role || 'body';
  const initialFontSize = opts.size;
  const maxLines = opts.maxLines || maxLinesForRole(role);
  const minFontSize = opts.minSize || minFontSizeForRole(role);
  const fit = fitTextToBox({
    text: opts.value,
    boxWidth: opts.maxWidth,
    maxLines,
    initialFontSize,
    minFontSize,
    lang: image.lang || 'ko',
    fontWeight: opts.weight || 700,
    boxHeight: opts.maxHeight || Infinity,
  });
  const fontSize = fit.fontSize;
  const lineHeight = lineHeightForFont(fontSize);
  const anchor = opts.anchor || 'start';
  const x = opts.x;
  const lines = fit.lines;
  const maxLineWidth = Math.max(...lines.map((line) => approxTextWidth(line, fontSize, image.lang || 'ko')), 1);
  const boxH = lines.length * lineHeight;
  const boxX = anchor === 'middle' ? x - maxLineWidth / 2 : anchor === 'end' ? x - maxLineWidth : x;
  const verticalAnchor = opts.verticalAnchor || 'baseline';
  const boxY = verticalAnchor === 'middle' ? opts.y - boxH / 2 : opts.y - fontSize;
  const firstBaseline = verticalAnchor === 'middle' ? boxY + fontSize : opts.y;
  layout.elements.push({
    image: image.fileName,
    type: 'text',
    text: cleanText(opts.value),
    renderedText: lines.join(' / '),
    lines,
    x: boxX,
    y: boxY,
    w: maxLineWidth,
    h: boxH,
    parentId: opts.parentId || null,
    role,
    fontSize,
    initialFontSize,
    minFontSize,
    maxLines,
    boxWidth: opts.maxWidth,
    lineCount: lines.length,
    overflow: Boolean(fit.overflow),
    shrinkApplied: Boolean(fit.shrinkApplied),
    wrapApplied: Boolean(fit.wrapApplied),
    orphanLine: Boolean(fit.orphanLine),
    truncated: Boolean(fit.overflow),
  });
  return `
    <text x="${x}" y="${firstBaseline}" text-anchor="${anchor}" font-family="'Malgun Gothic','Noto Sans KR','Inter','Arial',sans-serif" font-size="${fontSize}" font-weight="${opts.weight || 700}" fill="${opts.fill || COLORS.navy}">
      ${lines.map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${esc(line)}</tspan>`).join('')}
    </text>
  `;
}

function backgroundSvg(w, h, palette) {
  const tone = palette || CATEGORY_PALETTES.neutral;
  const dots = [];
  for (let x = 60; x < w; x += 96) {
    for (let y = 60; y < h; y += 96) {
      dots.push(circleSvg({ cx: x, cy: y, r: 2, fill: tone.dot, opacity: 0.55 }));
    }
  }
  return `
    <rect width="${w}" height="${h}" fill="${tone.background}"/>
    ${dots.join('')}
    <path d="M 0 ${h * 0.82} C ${w * 0.22} ${h * 0.72}, ${w * 0.34} ${h * 0.92}, ${w * 0.52} ${h * 0.80} S ${w * 0.78} ${h * 0.70}, ${w} ${h * 0.80} L ${w} ${h} L 0 ${h} Z" fill="${tone.backgroundAccent}" opacity="0.72"/>
  `;
}

function renderCover(image, layout) {
  const w = image.width;
  const h = image.height;
  const safe = safeArea(w, h);
  const palette = image.palette || CATEGORY_PALETTES.neutral;
  const panel = { id: 'cover-panel', x: safe.x, y: 230, w: w - safe.x * 2, h: 430 };
  addBox(layout, image, panel);
  const cards = image.cards.slice(0, 3);
  const cardGap = 32;
  const cardW = (panel.w - 88 - cardGap * (cards.length - 1)) / Math.max(1, cards.length);
  return `
    ${backgroundSvg(w, h, palette)}
    ${circleSvg({ cx: w - 165, cy: 145, r: 110, fill: palette.mutedAccent, opacity: 0.18 })}
    ${circleSvg({ cx: w - 85, cy: 262, r: 52, fill: palette.accent, opacity: 0.22 })}
    ${textBlock(layout, image, { x: safe.x, y: 140, value: image.keyword, size: 32, weight: 900, fill: palette.accent, maxWidth: 650, maxLines: 1, role: 'keyword' })}
    ${textBlock(layout, image, { x: safe.x, y: 222, value: image.title, size: 68, weight: 900, fill: palette.primaryText, maxWidth: 1040, maxLines: 2, minSize: 34, role: 'title' })}
    ${rectSvg({ ...panel, r: 34, fill: palette.cardBackground, stroke: palette.cardBorder, opacity: 0.94 })}
    ${textBlock(layout, image, { x: panel.x + 44, y: panel.y + 192, value: image.subtitle, size: 32, weight: 800, fill: COLORS.slate, maxWidth: panel.w - 88, maxLines: 2, maxHeight: 86, parentId: panel.id, role: 'subtitle' })}
    ${cards.map((card, index) => {
      const x = panel.x + 44 + index * (cardW + cardGap);
      const y = panel.y + 272;
      const box = { id: `cover-card-${index + 1}`, x, y, w: cardW, h: 108 };
      addBox(layout, image, box);
      const fill = index === 0 ? palette.accent : index === 1 ? palette.secondaryAccent : palette.tertiaryAccent;
      return `
        ${rectSvg({ ...box, r: 24, fill: palette.cardBackground, stroke: palette.cardBorder })}
        ${textBlock(layout, image, { x: x + 28, y: y + box.h / 2, value: card, size: 26, weight: 900, fill, maxWidth: cardW - 56, maxLines: 2, minSize: 22, maxHeight: box.h - 20, verticalAnchor: 'middle', parentId: box.id, role: 'card-label' })}
      `;
    }).join('')}
    ${textBlock(layout, image, { x: w - safe.x, y: h - safe.y - 14, value: 'FinMap', size: 28, weight: 900, fill: palette.mutedText, maxWidth: 180, maxLines: 1, anchor: 'end', role: 'brand' })}
  `;
}

function renderFlow(image, layout) {
  const w = image.width;
  const h = image.height;
  const safe = safeArea(w, h);
  const palette = image.palette || CATEGORY_PALETTES.neutral;
  const items = image.items.slice(0, 4);
  const cardW = 220;
  const gap = (w - safe.x * 2 - cardW * items.length) / Math.max(1, items.length - 1);
  return `
    ${backgroundSvg(w, h, palette)}
    ${textBlock(layout, image, { x: safe.x, y: 86, value: image.keyword, size: 22, weight: 900, fill: palette.accent, maxWidth: 420, maxLines: 1, role: 'keyword' })}
    ${textBlock(layout, image, { x: safe.x, y: 150, value: image.title, size: 48, weight: 900, fill: palette.primaryText, maxWidth: 760, maxLines: 1, role: 'title' })}
    ${textBlock(layout, image, { x: safe.x, y: 202, value: image.subtitle, size: 23, weight: 800, fill: palette.secondaryText, maxWidth: 820, maxLines: 2, role: 'subtitle' })}
    ${items.map((item, index) => {
      const x = safe.x + index * (cardW + gap);
      const y = 298;
      const box = { id: `step-${index + 1}`, x, y, w: cardW, h: 210 };
      addBox(layout, image, box);
      const color = index === 0 ? palette.accent : index === 1 ? palette.secondaryAccent : index === 2 ? palette.tertiaryAccent : palette.mutedAccent;
      if (index < items.length - 1) {
        addConnector(layout, image, { x1: x + cardW + 12, y1: y + 105, x2: x + cardW + gap - 12, y2: y + 105 });
      }
      return `
        ${rectSvg({ ...box, r: 26, fill: palette.cardBackground, stroke: palette.cardBorder })}
        ${circleSvg({ cx: x + cardW / 2, cy: y + 58, r: 34, fill: color })}
        ${textBlock(layout, image, { x: x + cardW / 2, y: y + 69, value: String(index + 1), size: 28, weight: 900, fill: palette.cardBackground, maxWidth: 42, maxLines: 1, anchor: 'middle', parentId: box.id, role: 'step-number' })}
        ${textBlock(layout, image, { x: x + cardW / 2, y: y + 148, value: item, size: 26, weight: 900, fill: COLORS.navy, maxWidth: cardW - 34, maxLines: 2, minSize: 22, maxHeight: 78, anchor: 'middle', verticalAnchor: 'middle', parentId: box.id, role: 'step-label' })}
        ${index < items.length - 1 ? lineSvg({ x1: x + cardW + 12, y1: y + 105, x2: x + cardW + gap - 12, y2: y + 105, stroke: palette.mutedAccent, sw: 8 }) : ''}
      `;
    }).join('')}
  `;
}

function renderComparison(image, layout) {
  const w = image.width;
  const h = image.height;
  const safe = safeArea(w, h);
  const palette = image.palette || CATEGORY_PALETTES.neutral;
  const items = image.items.slice(0, 3);
  const cardW = (w - safe.x * 2 - 44 * (items.length - 1)) / items.length;
  return `
    ${backgroundSvg(w, h, palette)}
    ${textBlock(layout, image, { x: safe.x, y: 86, value: image.keyword, size: 22, weight: 900, fill: palette.accent, maxWidth: 500, maxLines: 1, role: 'keyword' })}
    ${textBlock(layout, image, { x: safe.x, y: 150, value: image.title, size: 48, weight: 900, fill: palette.primaryText, maxWidth: 790, maxLines: 1, role: 'title' })}
    ${textBlock(layout, image, { x: safe.x, y: 202, value: image.subtitle, size: 23, weight: 800, fill: palette.secondaryText, maxWidth: 820, maxLines: 2, role: 'subtitle' })}
    ${items.map((item, index) => {
      const x = safe.x + index * (cardW + 44);
      const y = 290;
      const box = { id: `panel-${index + 1}`, x, y, w: cardW, h: 260 };
      addBox(layout, image, box);
      const color = index === 0 ? palette.accent : index === 1 ? palette.secondaryAccent : palette.tertiaryAccent;
      return `
        ${rectSvg({ ...box, r: 30, fill: palette.cardBackground, stroke: color, sw: 4 })}
        ${circleSvg({ cx: x + 62, cy: y + 66, r: 34, fill: color, opacity: 0.95 })}
        ${textBlock(layout, image, { x: x + 62, y: y + 78, value: String(index + 1), size: 28, weight: 900, fill: palette.cardBackground, maxWidth: 42, maxLines: 1, anchor: 'middle', parentId: box.id, role: 'panel-number' })}
        ${textBlock(layout, image, { x: x + 34, y: y + 145, value: item, size: 34, weight: 900, fill: COLORS.navy, maxWidth: cardW - 68, maxLines: 2, minSize: 22, maxHeight: 90, verticalAnchor: 'middle', parentId: box.id, role: 'panel-label' })}
        ${textBlock(layout, image, { x: x + 34, y: y + 212, value: image.lang === 'en' ? 'Compare before action' : '행동 전 비교', size: 22, weight: 800, fill: COLORS.slate, maxWidth: cardW - 68, maxLines: 1, parentId: box.id, role: 'panel-note' })}
      `;
    }).join('')}
  `;
}

function renderChecklist(image, layout) {
  const w = image.width;
  const h = image.height;
  const safe = safeArea(w, h);
  const palette = image.palette || CATEGORY_PALETTES.neutral;
  const items = image.items.slice(0, 4);
  const startY = 268;
  return `
    ${backgroundSvg(w, h, palette)}
    ${textBlock(layout, image, { x: safe.x, y: 86, value: image.keyword, size: 22, weight: 900, fill: palette.accent, maxWidth: 500, maxLines: 1, role: 'keyword' })}
    ${textBlock(layout, image, { x: safe.x, y: 150, value: image.title, size: 48, weight: 900, fill: palette.primaryText, maxWidth: 790, maxLines: 1, role: 'title' })}
    ${textBlock(layout, image, { x: safe.x, y: 202, value: image.subtitle, size: 23, weight: 800, fill: palette.secondaryText, maxWidth: 820, maxLines: 2, role: 'subtitle' })}
    ${items.map((item, index) => {
      const x = safe.x;
      const y = startY + index * 86;
      const box = { id: `check-${index + 1}`, x, y, w: w - safe.x * 2, h: 68 };
      addBox(layout, image, box);
      const color = index % 2 === 0 ? palette.accent : palette.secondaryAccent;
      return `
        ${rectSvg({ ...box, r: 22, fill: palette.cardBackground, stroke: palette.cardBorder })}
        ${circleSvg({ cx: x + 44, cy: y + 34, r: 24, fill: color })}
        ${textBlock(layout, image, { x: x + 44, y: y + 43, value: String(index + 1), size: 22, weight: 900, fill: palette.cardBackground, maxWidth: 34, maxLines: 1, anchor: 'middle', parentId: box.id, role: 'check-number' })}
        ${textBlock(layout, image, { x: x + 88, y: y + box.h / 2, value: item, size: 30, weight: 900, fill: COLORS.navy, maxWidth: box.w - 120, maxLines: 2, minSize: 22, maxHeight: box.h - 16, verticalAnchor: 'middle', parentId: box.id, role: 'check-label' })}
      `;
    }).join('')}
  `;
}

function safeArea(width, height) {
  const x = Math.round(width * SAFE_RATIO);
  const y = Math.round(height * SAFE_RATIO);
  return { x, y, w: width - x * 2, h: height - y * 2 };
}

function renderSvg(image, layout) {
  const palette = layout.palette || getCategoryPalette(layout.category);
  const enriched = { ...image, lang: layout.lang, category: layout.category, palette };
  const body = image.template === 'cover'
    ? renderCover(enriched, layout)
    : image.template === 'flow'
      ? renderFlow(enriched, layout)
      : image.template === 'comparison' || image.template === 'chart-summary'
        ? renderComparison(enriched, layout)
        : renderChecklist(enriched, layout);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${image.width}" height="${image.height}" viewBox="0 0 ${image.width} ${image.height}">${body}</svg>`;
}

async function generateImages(plan) {
  const outDir = resolveFromCwd(plan.outputDir);
  ensureDir(outDir);
  const palette = getCategoryPalette(plan.category);
  const layout = {
    version: PLAN_VERSION,
    slug: plan.slug,
    lang: plan.lang,
    category: plan.category || '',
    categoryLabel: plan.categoryLabel || palette.categoryLabel,
    paletteName: plan.paletteName || palette.name,
    palette,
    textFitPolicy: plan.textFitPolicy || TEXT_FIT_POLICY,
    outputDir: plan.outputDir,
    generatedAt: new Date().toISOString(),
    images: [],
    elements: [],
  };
  for (const image of plan.images) {
    const svg = renderSvg(image, layout);
    const pngPath = path.join(outDir, image.fileName);
    await sharp(Buffer.from(svg)).resize(image.width, image.height).png({ compressionLevel: 9 }).toFile(pngPath);
    const meta = await sharp(pngPath).metadata();
    layout.images.push({
      slot: image.slot,
      fileName: image.fileName,
      path: relativePath(pngPath),
      width: meta.width,
      height: meta.height,
      expected: image.expected,
    });
  }
  const manifestPath = defaultRenderManifestPath(plan);
  writeJson(manifestPath, layout);
  return { outputDir: plan.outputDir, layoutManifest: relativePath(manifestPath), imageCount: plan.images.length };
}

function boxById(elements, id) {
  return elements.find((el) => el.id === id && el.type === 'box') || null;
}

function intersects(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function gapBetween(a, b) {
  if (a.x + a.w <= b.x) return b.x - (a.x + a.w);
  if (b.x + b.w <= a.x) return a.x - (b.x + b.w);
  return 0;
}

async function validateImages(plan) {
  const outDir = resolveFromCwd(plan.outputDir);
  const layoutPath = defaultRenderManifestPath(plan);
  const layout = fs.existsSync(layoutPath) ? readJson(layoutPath) : null;
  const errors = [];
  const warnings = [];
  const imageResults = [];

  for (const image of plan.images) {
    const filePath = path.join(outDir, image.fileName);
    const result = {
      fileName: image.fileName,
      exists: fs.existsSync(filePath),
      width: null,
      height: null,
      ratioOk: false,
      safeAreaOk: true,
      textOk: true,
      layoutOk: true,
      errors: [],
      warnings: [],
    };
    if (!result.exists) {
      result.errors.push('FILE_NOT_FOUND');
      errors.push(`${image.fileName}: file not found`);
      imageResults.push(result);
      continue;
    }
    const meta = await sharp(filePath).metadata();
    result.width = meta.width;
    result.height = meta.height;
    if (meta.width !== image.width || meta.height !== image.height) {
      result.errors.push(`DIMENSION_MISMATCH expected=${image.width}x${image.height} actual=${meta.width}x${meta.height}`);
    }
    result.ratioOk = Math.abs((meta.width / meta.height) - (16 / 9)) < 0.002;
    if (!result.ratioOk) result.errors.push('ASPECT_RATIO_NOT_16_9');

    if (layout) {
      const elements = layout.elements.filter((el) => el.image === image.fileName);
      const safe = safeArea(image.width, image.height);
      const textEls = elements.filter((el) => el.type === 'text');
      const boxEls = elements.filter((el) => el.type === 'box');
      const connectorEls = elements.filter((el) => el.type === 'connector');
      for (const el of elements.filter((item) => item.type === 'text' || item.type === 'box')) {
        if (el.x < safe.x - 2 || el.y < safe.y - 2 || el.x + el.w > safe.x + safe.w + 2 || el.y + el.h > safe.y + safe.h + 2) {
          result.safeAreaOk = false;
          result.errors.push(`SAFE_AREA_OVERFLOW ${el.type}:${el.role || el.id || ''}`);
        }
      }
      for (const textEl of textEls) {
        if (textEl.overflow || textEl.truncated) {
          result.textOk = false;
          result.errors.push(`TEXT_FIT_OVERFLOW ${textEl.role}:${textEl.text}`);
        }
        if (textEl.lineCount > (textEl.maxLines || maxLinesForRole(textEl.role))) {
          result.textOk = false;
          result.errors.push(`TEXT_TOO_MANY_LINES ${textEl.role} lines=${textEl.lineCount} max=${textEl.maxLines || maxLinesForRole(textEl.role)}`);
        }
        if (plan.lang === 'ko' && textEl.orphanLine) {
          result.textOk = false;
          result.errors.push(`KO_ORPHAN_LINE ${textEl.role}:${textEl.renderedText}`);
        }
        if (textEl.fontSize < (textEl.minFontSize || minFontSizeForRole(textEl.role))) {
          result.textOk = false;
          result.errors.push(`TEXT_FONT_TOO_SMALL ${textEl.role} font=${textEl.fontSize} min=${textEl.minFontSize || minFontSizeForRole(textEl.role)}`);
        }
        if (textEl.boxWidth && textEl.w > textEl.boxWidth + 1) {
          result.textOk = false;
          result.errors.push(`TEXT_WIDTH_OVERFLOW ${textEl.role} width=${Math.round(textEl.w)} box=${Math.round(textEl.boxWidth)}`);
        }
        const parent = textEl.parentId ? boxById(elements, textEl.parentId) : null;
        if (parent && (textEl.x < parent.x + 10 || textEl.x + textEl.w > parent.x + parent.w - 10 || textEl.y < parent.y + 8 || textEl.y + textEl.h > parent.y + parent.h - 8)) {
          result.textOk = false;
          result.errors.push(`TEXT_PARENT_OVERFLOW ${textEl.role}`);
        }
      }
      for (let i = 0; i < textEls.length; i += 1) {
        for (let j = i + 1; j < textEls.length; j += 1) {
          if (textEls[i].parentId && textEls[i].parentId === textEls[j].parentId) continue;
          if (intersects(textEls[i], textEls[j])) {
            result.layoutOk = false;
            result.errors.push(`TEXT_OVERLAP ${textEls[i].role}/${textEls[j].role}`);
          }
        }
      }
      if (image.expected.kind === 'flow') {
        const stepBoxes = boxEls.filter((box) => /^step-/.test(box.id || ''));
        const centerYs = stepBoxes.map((box) => box.y + box.h / 2);
        const maxY = Math.max(...centerYs);
        const minY = Math.min(...centerYs);
        if (stepBoxes.length !== image.expected.stepCount) result.errors.push(`STEP_BOX_COUNT expected=${image.expected.stepCount} actual=${stepBoxes.length}`);
        if (connectorEls.length !== image.expected.connectorCount) result.errors.push(`CONNECTOR_COUNT expected=${image.expected.connectorCount} actual=${connectorEls.length}`);
        if (maxY - minY > 8) result.errors.push(`STEP_CENTER_Y_DRIFT ${maxY - minY}`);
        for (let i = 0; i < stepBoxes.length - 1; i += 1) {
          const gap = gapBetween(stepBoxes[i], stepBoxes[i + 1]);
          if (gap < 24) result.errors.push(`STEP_GAP_TOO_SMALL ${gap}`);
        }
      }
      if (image.expected.kind === 'comparison') {
        const panelBoxes = boxEls.filter((box) => /^panel-/.test(box.id || ''));
        if (panelBoxes.length !== image.expected.panelCount) result.errors.push(`PANEL_COUNT expected=${image.expected.panelCount} actual=${panelBoxes.length}`);
      }
    } else {
      result.warnings.push('LAYOUT_MANIFEST_NOT_FOUND');
      warnings.push('Layout manifest not found; structural validation was limited.');
    }

    if (result.errors.length) {
      errors.push(...result.errors.map((err) => `${image.fileName}: ${err}`));
    }
    imageResults.push(result);
  }

  const report = {
    version: PLAN_VERSION,
    slug: plan.slug,
    lang: plan.lang,
    generatedAt: new Date().toISOString(),
    status: errors.length ? 'FAIL' : 'PASS',
    outputDir: plan.outputDir,
    checkedFiles: plan.images.map((image) => image.fileName),
    images: imageResults,
    errors,
    warnings,
  };
  const reportPath = defaultValidationReportPath(plan);
  writeJson(reportPath, report);
  return { report, reportPath: relativePath(reportPath) };
}

function escapeMarkdownTableCell(value) {
  return String(value == null ? '' : value)
    .replace(/\r?\n/g, ' ')
    .replace(/\|/g, '\\|')
    .trim();
}

function auditMarkdown(mdPath, options = {}) {
  const post = parseMarkdown(mdPath);
  const plan = options.planPath
    ? readJson(resolveFromCwd(options.planPath))
    : makePlan(mdPath);
  const outDir = resolveFromCwd(plan.outputDir);
  const localFiles = plan.expectedFiles.map((fileName) => {
    const fullPath = path.join(outDir, fileName);
    return { fileName, exists: fs.existsSync(fullPath), path: relativePath(fullPath) };
  });
  const cover = post.frontmatter.cover || post.frontmatter.image || post.frontmatter.thumbnail || post.frontmatter.ogImage || null;
  const imageSources = [cover, ...post.images.map((image) => image.src)].filter(Boolean);
  const localPostImageCount = imageSources.filter((src) => new RegExp(`(^|/)images/posts/${post.slug}/`, 'i').test(String(src))).length;
  const cloudinaryImageCount = imageSources.filter((src) => /^https:\/\/res\.cloudinary\.com\//i.test(String(src))).length;
  const lines = [
    `# Finmap Post Image Audit - ${post.slug} (${post.lang})`,
    '',
    `- Markdown: \`${post.path}\``,
    `- Plan: ${options.planPath ? `\`${relativePath(resolveFromCwd(options.planPath))}\`` : '`auto`'}`,
    `- Plan mode: \`${plan.mode || 'unknown'}\``,
    `- Frontmatter cover-like field: ${cover ? `\`${cover}\`` : 'missing'}`,
    `- Body image count: ${post.images.length}`,
    `- Expected local dir: \`${plan.outputDir}\``,
    `- Cloudinary image references: ${cloudinaryImageCount}`,
    `- Local post image references: ${localPostImageCount}`,
    '',
    '## Expected Files',
    '',
    '| File | Exists | Path |',
    '| --- | --- | --- |',
    ...localFiles.map((item) => `| \`${item.fileName}\` | ${item.exists ? 'yes' : 'no'} | \`${item.path}\` |`),
    '',
    '## Existing Markdown Images',
    '',
    '| Type | Alt | Src |',
    '| --- | --- | --- |',
    ...post.images.map((item) => {
      const alt = escapeMarkdownTableCell(item.alt);
      const src = escapeMarkdownTableCell(item.src);
      return `| ${item.type} | ${alt ? `\`${alt}\`` : '-'} | \`${src}\` |`;
    }),
    '',
  ];
  const reportPath = defaultAuditReportPath(post);
  ensureDir(path.dirname(reportPath));
  fs.writeFileSync(reportPath, `${lines.join('\n')}\n`, 'utf8');
  return { reportPath: relativePath(reportPath), post, plan, localFiles };
}

function createReplacementManifest({ markdownPath, inventoryPath, uploadManifestPath }) {
  const post = parseMarkdown(markdownPath);
  const inventory = readJson(resolveFromCwd(inventoryPath));
  const uploadManifest = readJson(resolveFromCwd(uploadManifestPath));
  const replaceableSlots = (inventory.slots || []).filter((slot) => slot.shouldReplace);
  const uploadedByFile = new Map((uploadManifest.images || []).map((image) => [image.fileName, image]));
  const errors = [];

  if (uploadManifest.dryRun) errors.push('UPLOAD_MANIFEST_IS_DRY_RUN');
  if ((uploadManifest.errors || []).length > 0) errors.push('UPLOAD_MANIFEST_HAS_ERRORS');
  if (Number(uploadManifest.failCount || 0) > 0) errors.push('UPLOAD_MANIFEST_HAS_FAILURES');
  if (Number(uploadManifest.successCount || 0) !== replaceableSlots.length) {
    errors.push(`UPLOAD_SUCCESS_COUNT_MISMATCH expected=${replaceableSlots.length} actual=${uploadManifest.successCount || 0}`);
  }

  const slots = replaceableSlots.map((slot) => {
    const uploaded = uploadedByFile.get(slot.recommendedNewLocalFile);
    if (!uploaded) errors.push(`UPLOADED_FILE_NOT_FOUND ${slot.recommendedNewLocalFile}`);
    if (uploaded && !uploaded.secureUrl) errors.push(`UPLOADED_SECURE_URL_MISSING ${slot.recommendedNewLocalFile}`);
    return {
      slotId: slot.slotId,
      source: slot.source,
      fieldName: slot.fieldName || null,
      oldUrl: slot.oldUrl,
      newLocalFile: slot.recommendedNewLocalFile,
      newLocalPath: uploaded ? uploaded.localPath || null : null,
      newCloudinaryUrl: uploaded ? uploaded.secureUrl || null : null,
      alt: slot.alt || '',
      order: slot.order,
      line: slot.line || null,
      nearHeading: slot.nearHeading || '',
      inferredRole: slot.inferredRole,
      recommendedTemplate: slot.recommendedTemplate,
    };
  });

  const manifest = {
    version: PLAN_VERSION,
    markdownPath: post.path,
    slug: post.slug,
    lang: post.lang,
    mode: 'replace-existing',
    dateStamp: inventory.dateStamp || makeDateStamp(),
    createdAt: new Date().toISOString(),
    inventoryPath: relativePath(resolveFromCwd(inventoryPath)),
    uploadManifestPath: relativePath(resolveFromCwd(uploadManifestPath)),
    expectedReplacementCount: replaceableSlots.length,
    completedReplacementCount: slots.filter((slot) => slot.newCloudinaryUrl).length,
    status: errors.length ? 'FAIL' : 'PASS',
    errors,
    slots,
  };

  return manifest;
}

module.exports = {
  PLAN_VERSION,
  ROOT,
  OUT_ROOT,
  REPORT_ROOT,
  COVER_SIZE,
  BODY_SIZE,
  IMAGE_FIELDS,
  fileNamesForLang,
  makeDateStamp,
  normalizeSlash,
  ensureDir,
  resolveFromCwd,
  relativePath,
  readJson,
  writeJson,
  parseMarkdown,
  createImageInventory,
  defaultInventoryPath,
  defaultReplacementManifestPath,
  createReplacementManifest,
  makePlan,
  defaultPlanPath,
  defaultRenderManifestPath,
  defaultValidationReportPath,
  generateImages,
  validateImages,
  auditMarkdown,
  cleanText,
  getCategoryPalette,
  fitTextToBox,
};
