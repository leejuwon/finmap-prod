// scripts/upload-cloudinary.js
// CommonJS version
//
// Default behavior is kept:
//   npm run upload:cloudinary:finmap
//
// Extended examples:
//   npm run upload:cloudinary:finmap -- --dir public/images/posts/monthly-dca-10-year-result --folder blog/insight/monthly-dca-10-year-result --manifest reports/cloudinary-monthly-dca-10-year-result.json
//
//   npm run upload:cloudinary:finmap -- --dir public/images/posts/monthly-dca-10-year-result --folder blog/insight/monthly-dca-10-year-result --manifest reports/cloudinary-monthly-dca-10-year-result.json --include cover.png,img1.png,img2.png,img3.png
//
//   npm run upload:cloudinary:finmap -- --dir public/images/posts/monthly-dca-10-year-result --folder blog/insight/monthly-dca-10-year-result --dry-run

const fs = require('fs');
const path = require('path');
const { uploadImage } = require('../lib/cloudinary');

const DEFAULT_LOCAL_DIR = path.join(__dirname, '..', 'images-to-upload');
const DEFAULT_CLOUDINARY_FOLDER = 'blog/insight';
const ALLOWED_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.svg']);

function normalizeSlash(value) {
  return String(value || '').replace(/\\/g, '/');
}

function resolveFromCwd(inputPath) {
  if (!inputPath) return inputPath;
  return path.isAbsolute(inputPath)
    ? inputPath
    : path.resolve(process.cwd(), inputPath);
}

function toRelativePath(inputPath) {
  return normalizeSlash(path.relative(process.cwd(), inputPath) || '.');
}

function makeTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function defaultManifestPath() {
  return path.join(
    process.cwd(),
    'reports',
    `cloudinary-upload-${makeTimestamp()}.json`
  );
}

function ensureParentDir(filePath) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
}

function printHelp() {
  console.log(`
Finmap Cloudinary uploader

Usage:
  npm run upload:cloudinary:finmap
  npm run upload:cloudinary:finmap -- --dir <local-dir> --folder <cloudinary-folder> --manifest <json-path>
  npm run upload:cloudinary:finmap -- --dir <local-dir> --folder <cloudinary-folder> --include cover.png,img1.png
  npm run upload:cloudinary:finmap -- --dir <local-dir> --folder <cloudinary-folder> --dry-run

Options:
  --dir <local-dir>              Local directory to upload. Default: images-to-upload
  --folder <cloudinary-folder>   Cloudinary folder. Default: blog/insight
  --manifest <json-path>         Manifest JSON output path. Default: reports/cloudinary-upload-{timestamp}.json
  --include <files>              Comma-separated file names to upload
  --dry-run                      Print upload targets without uploading
  --help                         Show this help message
`);
}

function parseArgs(argv) {
  const args = {
    dir: null,
    folder: null,
    manifest: null,
    include: null,
    dryRun: false,
    help: false,
  };

  const readValue = (current, index) => {
    const eqIndex = current.indexOf('=');
    if (eqIndex >= 0) {
      return {
        value: current.slice(eqIndex + 1),
        nextIndex: index,
      };
    }

    const next = argv[index + 1];
    if (!next || next.startsWith('--')) {
      throw new Error(`옵션 값이 없습니다: ${current}`);
    }

    return {
      value: next,
      nextIndex: index + 1,
    };
  };

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

    if (token.startsWith('--dir')) {
      const parsed = readValue(token, i);
      args.dir = parsed.value;
      i = parsed.nextIndex;
      continue;
    }

    if (token.startsWith('--folder')) {
      const parsed = readValue(token, i);
      args.folder = parsed.value;
      i = parsed.nextIndex;
      continue;
    }

    if (token.startsWith('--manifest')) {
      const parsed = readValue(token, i);
      args.manifest = parsed.value;
      i = parsed.nextIndex;
      continue;
    }

    if (token.startsWith('--include')) {
      const parsed = readValue(token, i);
      args.include = parsed.value;
      i = parsed.nextIndex;
      continue;
    }

    throw new Error(`알 수 없는 옵션입니다: ${token}`);
  }

  return args;
}

function parseIncludeList(includeValue) {
  if (!includeValue) return null;

  const files = includeValue
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);

  return files.length > 0 ? files : null;
}

function isAllowedImageFile(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  return ALLOWED_EXTENSIONS.has(ext);
}

function buildManifest({ localDir, cloudinaryFolder, manifestPath, dryRun }) {
  return {
    localDir: toRelativePath(localDir),
    localDirAbsolute: normalizeSlash(localDir),
    cloudinaryFolder,
    manifestPath: toRelativePath(manifestPath),
    uploadedAt: new Date().toISOString(),
    dryRun: Boolean(dryRun),
    candidateCount: 0,
    successCount: 0,
    failCount: 0,
    skippedCount: 0,
    images: [],
    skipped: [],
    errors: [],
  };
}

function hasCloudinaryEnv() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

function writeManifest(manifestPath, manifest) {
  ensureParentDir(manifestPath);
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`🧾 Manifest written: ${toRelativePath(manifestPath)}`);
}

function collectFiles(localDir, includeFiles, manifest) {
  if (!fs.existsSync(localDir)) {
    manifest.errors.push({
      type: 'LOCAL_DIR_NOT_FOUND',
      message: `폴더가 없습니다: ${toRelativePath(localDir)}`,
      localDir: toRelativePath(localDir),
    });
    return [];
  }

  const stat = fs.statSync(localDir);
  if (!stat.isDirectory()) {
    manifest.errors.push({
      type: 'LOCAL_DIR_NOT_DIRECTORY',
      message: `업로드 경로가 폴더가 아닙니다: ${toRelativePath(localDir)}`,
      localDir: toRelativePath(localDir),
    });
    return [];
  }

  if (includeFiles && includeFiles.length > 0) {
    const selected = [];

    for (const fileName of includeFiles) {
      const fullPath = path.join(localDir, fileName);

      if (!fs.existsSync(fullPath)) {
        manifest.failCount += 1;
        manifest.errors.push({
          type: 'INCLUDED_FILE_NOT_FOUND',
          fileName,
          message: `include 대상 파일이 없습니다: ${fileName}`,
        });
        continue;
      }

      const fileStat = fs.statSync(fullPath);

      if (!fileStat.isFile()) {
        manifest.failCount += 1;
        manifest.errors.push({
          type: 'INCLUDED_PATH_NOT_FILE',
          fileName,
          message: `include 대상이 파일이 아닙니다: ${fileName}`,
        });
        continue;
      }

      if (!isAllowedImageFile(fileName)) {
        manifest.failCount += 1;
        manifest.errors.push({
          type: 'UNSUPPORTED_EXTENSION',
          fileName,
          message: `지원하지 않는 확장자입니다: ${fileName}`,
        });
        continue;
      }

      selected.push(fileName);
    }

    return selected;
  }

  const entries = fs.readdirSync(localDir);
  const selected = [];

  for (const entry of entries) {
    const fullPath = path.join(localDir, entry);
    const fileStat = fs.statSync(fullPath);

    if (!fileStat.isFile()) {
      manifest.skippedCount += 1;
      manifest.skipped.push({
        fileName: entry,
        reason: 'NOT_FILE',
      });
      continue;
    }

    if (entry.startsWith('.')) {
      manifest.skippedCount += 1;
      manifest.skipped.push({
        fileName: entry,
        reason: 'HIDDEN_FILE',
      });
      continue;
    }

    if (!isAllowedImageFile(entry)) {
      manifest.skippedCount += 1;
      manifest.skipped.push({
        fileName: entry,
        reason: 'UNSUPPORTED_EXTENSION',
      });
      continue;
    }

    selected.push(entry);
  }

  return selected.sort((a, b) => a.localeCompare(b));
}

async function uploadOne({ localDir, cloudinaryFolder, fileName, dryRun }) {
  const fullPath = path.join(localDir, fileName);

  if (dryRun) {
    return {
      fileName,
      localPath: toRelativePath(fullPath),
      status: 'dry-run',
      secureUrl: null,
      publicId: null,
      width: null,
      height: null,
      bytes: fs.statSync(fullPath).size,
    };
  }

  const result = await uploadImage(fullPath, {
    folder: cloudinaryFolder,
  });

  if (!result || !result.secure_url) {
    throw new Error(`Cloudinary secure_url이 응답에 없습니다: ${fileName}`);
  }

  return {
    fileName,
    localPath: toRelativePath(fullPath),
    status: 'uploaded',
    secureUrl: result.secure_url,
    publicId: result.public_id || null,
    width: result.width || null,
    height: result.height || null,
    bytes: result.bytes || fs.statSync(fullPath).size,
    format: result.format || path.extname(fileName).replace('.', '').toLowerCase(),
  };
}

async function run() {
  let args;

  try {
    args = parseArgs(process.argv.slice(2));
  } catch (err) {
    console.error(`❌ ${err.message || err}`);
    printHelp();
    process.exit(1);
  }

  if (args.help) {
    printHelp();
    return;
  }

  const localDir = args.dir ? resolveFromCwd(args.dir) : DEFAULT_LOCAL_DIR;
  const cloudinaryFolder = args.folder || DEFAULT_CLOUDINARY_FOLDER;
  const manifestPath = args.manifest
    ? resolveFromCwd(args.manifest)
    : defaultManifestPath();

  const includeFiles = parseIncludeList(args.include);

  const manifest = buildManifest({
    localDir,
    cloudinaryFolder,
    manifestPath,
    dryRun: args.dryRun,
  });

  console.log('=== Finmap Cloudinary Upload ===');
  console.log(`Local dir: ${manifest.localDir}`);
  console.log(`Cloudinary folder: ${cloudinaryFolder}`);
  console.log(`Manifest: ${manifest.manifestPath}`);
  console.log(`Dry run: ${args.dryRun ? 'YES' : 'NO'}`);

  if (includeFiles) {
    console.log(`Include: ${includeFiles.join(', ')}`);
  }

  const files = collectFiles(localDir, includeFiles, manifest);
  manifest.candidateCount = files.length;

  if (manifest.errors.length > 0) {
    console.error('❌ 업로드 전 검증 실패');
    for (const error of manifest.errors) {
      console.error(`- ${error.message}`);
    }
    writeManifest(manifestPath, manifest);
    process.exit(1);
  }

  if (files.length === 0) {
    console.log(`⚠️ 업로드할 이미지 파일이 없습니다. (${manifest.localDir})`);
    writeManifest(manifestPath, manifest);
    return;
  }

  if (!args.dryRun && !hasCloudinaryEnv()) {
    manifest.errors.push({
      type: 'CLOUDINARY_ENV_MISSING',
      message: 'Cloudinary 인증 환경변수가 없습니다. CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET를 설정하거나 --dry-run으로 확인하세요.',
    });
    manifest.failCount = Math.max(manifest.failCount, files.length);
    console.error('❌ Cloudinary 인증 환경변수가 없습니다. 업로드를 시도하지 않습니다.');
    writeManifest(manifestPath, manifest);
    process.exit(1);
  }

  for (const fileName of files) {
    try {
      if (args.dryRun) {
        console.log(`DRY-RUN: ${fileName}`);
      } else {
        console.log(`Uploading: ${fileName} ...`);
      }

      const uploaded = await uploadOne({
        localDir,
        cloudinaryFolder,
        fileName,
        dryRun: args.dryRun,
      });

      manifest.images.push(uploaded);

      if (args.dryRun) {
        console.log(`🧪 ${fileName} → dry-run`);
        manifest.successCount += 1;
      } else {
        manifest.successCount += 1;
        console.log(`✅ ${fileName} → ${uploaded.secureUrl}`);
      }
    } catch (err) {
      manifest.failCount += 1;
      const message = err && err.message ? err.message : String(err);

      manifest.errors.push({
        type: 'UPLOAD_FAILED',
        fileName,
        localPath: toRelativePath(path.join(localDir, fileName)),
        message,
      });

      console.error(`❌ 업로드 실패: ${fileName}`);
      console.error(message);
    }
  }

  writeManifest(manifestPath, manifest);

  if (manifest.failCount > 0 || manifest.errors.length > 0) {
    console.error(`❌ 업로드 실패 항목이 있습니다. failCount=${manifest.failCount}`);
    process.exit(1);
  }

  if (args.dryRun) {
    console.log(`=== Dry run done. candidates=${manifest.candidateCount} ===`);
    return;
  }

  console.log(`=== Done. uploaded=${manifest.successCount} ===`);
}

run().catch((err) => {
  console.error('❌ Unexpected error');
  console.error(err && err.stack ? err.stack : err);
  process.exit(1);
});
