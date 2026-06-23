# Finmap Post Image Workflow Prompt

Use this workflow when the user asks to generate/update images for a specific Finmap Markdown post.

## Required Inputs

- Target Markdown path, for example `content/posts/personalFinance/ko/example.md`
- Optional date stamp for replacement work, for example `20260623`
- Optional Cloudinary target folder. Default:
  - New mode: `blog/insight/{slug}`
  - Replacement mode: `blog/insight/{slug}/rework-{YYYYMMDD}`

## Workflow

1. Read `docs/finmap-post-image-guideline.md`.
2. Inspect the target Markdown frontmatter and body.
3. Run image planning. Default `auto` mode creates an inventory first. If existing image slots are found, it switches to replacement mode and uses slot-based file names.

```bash
node scripts/plan_post_images.js <markdown-path> --mode auto --date YYYYMMDD
```

4. Review both generated files:

- `reports/post-image-inventory-{slug}.json`
- `reports/post-image-plan-{slug}-{lang}.json`

5. If `mode` is `replace-existing`, confirm:

- current image slot count
- `oldUrl`
- source: `frontmatter`, `markdown-body`, `html-img`
- `fieldName` for frontmatter slots
- `nearHeading`
- `recommendedNewLocalFile`
- no image addition/deletion is being applied automatically

6. Generate SVG-based PNG images.

New mode:

```bash
node scripts/generate_post_images.js <markdown-path> --mode new
```

Replacement mode:

```bash
node scripts/generate_post_images.js <markdown-path> --mode replace-existing --date YYYYMMDD
```

Replacement mode outputs to:

```text
public/images/posts/{slug}/rework-{YYYYMMDD}/
```

7. Validate generated images:

```bash
node scripts/validate_generated_images.js <markdown-path> --plan reports/post-image-plan-{slug}-{lang}.json
```

8. If validation fails, inspect `reports/post-image-validation-{slug}-{lang}.json`, adjust the plan or renderer with the smallest safe change, then regenerate and revalidate.
9. Upload only after validation passes and Cloudinary credentials are available.

KO new:

```bash
npm run upload:cloudinary:finmap -- --dir public/images/posts/{slug} --folder blog/insight/{slug} --manifest reports/cloudinary-{slug}-ko.json --include cover.png,img1.png,img2.png,img3.png
```

EN new:

```bash
npm run upload:cloudinary:finmap -- --dir public/images/posts/{slug} --folder blog/insight/{slug} --manifest reports/cloudinary-{slug}-en.json --include cover-en.png,img1-en.png,img2-en.png,img3-en.png
```

Replacement mode:

```bash
npm run upload:cloudinary:finmap -- --dir public/images/posts/{slug}/rework-{YYYYMMDD} --folder blog/insight/{slug}/rework-{YYYYMMDD} --manifest reports/cloudinary-{slug}-rework-{YYYYMMDD}.json
```

10. If only checking targets, use `--dry-run`. Do not apply dry-run manifests to Markdown.
11. New mode: apply secure URLs to Markdown only with a successful non-dry-run upload manifest:

```bash
node scripts/apply_post_image_cloudinary_urls.js <markdown-path> reports/cloudinary-{slug}-{ko|en}.json
```

12. Replacement mode: create a replacement manifest from inventory + Cloudinary upload manifest:

```bash
node scripts/create_post_image_replacement_manifest.js <markdown-path> reports/post-image-inventory-{slug}.json reports/cloudinary-{slug}-rework-{YYYYMMDD}.json
```

13. Replacement mode: apply by exact `oldUrl -> newCloudinaryUrl` mapping:

```bash
node scripts/apply_post_image_cloudinary_urls.js <markdown-path> reports/post-image-replacement-{slug}-{YYYYMMDD}.json
```

This preserves existing image count, order, and alt text by default.

14. Audit the post image state:

```bash
node scripts/audit_post_images.js <markdown-path>
```

15. Run `npm run build` when reasonable.
16. Restore build-generated sitemap files if they are not part of the task.
17. Write a report with image inventory, generated files, validation status, upload manifest status, replacement mapping, Markdown apply changes, old URL leftovers, and remaining manual checks.

## Safety Rules

- Do not upload when Cloudinary credentials are missing.
- Do not hard-code Cloudinary credentials.
- Do not change canonical/hreflang/robots/sitemap/SeoHead.
- Do not rewrite post content except image URL/alt changes needed for the task.
- Do not apply a manifest with missing `secureUrl`, `dryRun: true`, `failCount > 0`, or unexpected `successCount`.
- Existing-image replacement must use the inventory and replacement manifest. Do not infer slots from `img1.png`, `img2.png`, or fixed counts.
- Existing Cloudinary public IDs should not be overwritten. Use a new `rework-{YYYYMMDD}` folder and replace Markdown URLs.

## Short User Prompt For Next Runs

`Finmap 이미지 워크플로 문서(docs/codex-prompts/finmap-post-image-workflow.md)를 따라 <markdown-path>의 현재 이미지 슬롯을 먼저 inventory로 분석하고, 기존 이미지 개수/위치를 보존해 rework 이미지를 생성·검증한 뒤 Cloudinary replacement manifest 기준으로 Markdown에 반영해줘. SEO 구조는 수정하지 마.`

