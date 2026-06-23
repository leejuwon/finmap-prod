#!/usr/bin/env node

const {
  createReplacementManifest,
  defaultReplacementManifestPath,
  resolveFromCwd,
  relativePath,
  writeJson,
} = require('./lib/post_image_system');

function printUsage() {
  console.log('Usage: node scripts/create_post_image_replacement_manifest.js <markdown-path> <inventory.json> <cloudinary-upload-manifest.json> [--out reports/post-image-replacement-slug-YYYYMMDD.json]');
}

function parseArgs(argv) {
  const args = { markdownPath: null, inventoryPath: null, uploadManifestPath: null, out: null, help: false };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--help' || token === '-h') {
      args.help = true;
      continue;
    }
    if (token === '--out') {
      args.out = argv[i + 1];
      i += 1;
      continue;
    }
    if (token.startsWith('--out=')) {
      args.out = token.slice('--out='.length);
      continue;
    }
    if (!args.markdownPath) {
      args.markdownPath = token;
      continue;
    }
    if (!args.inventoryPath) {
      args.inventoryPath = token;
      continue;
    }
    if (!args.uploadManifestPath) {
      args.uploadManifestPath = token;
      continue;
    }
    throw new Error(`Unknown argument: ${token}`);
  }
  return args;
}

function run() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.markdownPath || !args.inventoryPath || !args.uploadManifestPath) {
    printUsage();
    process.exit(args.help ? 0 : 1);
  }
  const manifest = createReplacementManifest({
    markdownPath: args.markdownPath,
    inventoryPath: args.inventoryPath,
    uploadManifestPath: args.uploadManifestPath,
  });
  const outPath = args.out ? resolveFromCwd(args.out) : defaultReplacementManifestPath(manifest);
  writeJson(outPath, manifest);
  console.log(`Replacement manifest: ${relativePath(outPath)}`);
  console.log(`Status: ${manifest.status}`);
  if (manifest.errors.length) {
    for (const error of manifest.errors) console.error(`- ${error}`);
    process.exit(1);
  }
}

try {
  run();
} catch (err) {
  console.error(`create_post_image_replacement_manifest failed: ${err.stack || err.message || err}`);
  process.exit(1);
}
