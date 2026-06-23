#!/usr/bin/env node

const { auditMarkdown } = require('./lib/post_image_system');

function printUsage() {
  console.log('Usage: node scripts/audit_post_images.js <markdown-path> [--plan <plan-json>]');
}

function run() {
  const markdownPath = process.argv[2];
  if (!markdownPath || markdownPath === '--help' || markdownPath === '-h') {
    printUsage();
    process.exit(markdownPath ? 0 : 1);
  }
  const planIndex = process.argv.indexOf('--plan');
  const planPath = planIndex >= 0 ? process.argv[planIndex + 1] : null;
  if (planIndex >= 0 && !planPath) {
    throw new Error('--plan requires a plan JSON path.');
  }
  const result = auditMarkdown(markdownPath, { planPath });
  console.log(`Audit report: ${result.reportPath}`);
  console.log(`Expected files: ${result.plan.expectedFiles.join(', ')}`);
}

try {
  run();
} catch (err) {
  console.error(`audit_post_images failed: ${err.message || err}`);
  process.exit(1);
}
