# Finmap Post Image Generation System Report

Date: 2026-06-23

## Summary

Finmap KO/EN Markdown 포스팅을 분석해 금융 카드형 이미지를 기획, SVG 기반 PNG로 생성, 구조 검증, Cloudinary manifest 생성, Markdown secure_url 반영, 사후 audit까지 반복 실행할 수 있는 시스템을 구축했다.

이번 작업은 개별 포스트 본문 이미지 반영 작업이 아니라 재사용 가능한 파이프라인 구축이다. 실제 Cloudinary 업로드와 Markdown URL 반영은 수행하지 않았다.

## Created / Modified Files

| File | Status | Purpose |
| --- | --- | --- |
| `docs/finmap-post-image-guideline.md` | created | KO/EN 이미지 전략, 파일명, safe area, 검증 기준, Cloudinary/Markdown 반영 기준 문서 |
| `docs/codex-prompts/finmap-post-image-workflow.md` | created | 다음 개별 Markdown 이미지 작업 때 읽고 실행할 반복 workflow 문서 |
| `scripts/lib/post_image_system.js` | created | Markdown 분석, JSON 기획안 생성, SVG/PNG 렌더링, layout manifest, 검증, audit 공통 헬퍼 |
| `scripts/plan_post_images.js` | created | Markdown을 분석해 `reports/post-image-plan-{slug}-{lang}.json` 생성 |
| `scripts/generate_post_images.js` | created | plan 기준으로 `public/images/posts/{slug}`에 PNG 4종과 layout manifest 생성 |
| `scripts/validate_generated_images.js` | created | 파일 존재, 크기, 16:9, safe area, text overflow/overlap, step/panel 수 검증 |
| `scripts/audit_post_images.js` | created | Markdown의 frontmatter/body 이미지와 local expected files 감사 |
| `scripts/apply_post_image_cloudinary_urls.js` | created | Cloudinary manifest의 secure_url을 frontmatter/body 이미지 URL에 최소 반영 |
| `scripts/create_post_image_replacement_manifest.js` | created | 기존 이미지 슬롯 inventory와 Cloudinary upload manifest를 결합해 `oldUrl -> newCloudinaryUrl` replacement manifest 생성 |
| `scripts/upload-cloudinary.js` | modified | 기존 기본 실행 유지, 인증 환경변수 사전 점검, include 실패 count, dry-run manifest count 보강 |
| `reports/finmap-post-image-generation-report.md` | created | 구현/검증 결과 보고서 |

## upload-cloudinary.js Changes

- 기존 기본 실행 방식 `npm run upload:cloudinary:finmap`은 유지했다.
- 기존 확장 옵션 `--dir`, `--folder`, `--manifest`, `--include`, `--dry-run` 구조는 유지했다.
- non-dry-run 업로드 전에 `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` 존재 여부를 확인한다.
- 인증 환경변수가 없으면 Cloudinary 업로드를 시도하지 않고 manifest에 `CLOUDINARY_ENV_MISSING` 오류를 남긴다.
- `--include` 지정 파일 누락/비파일/미지원 확장자 케이스는 `failCount`에 반영한다.
- `--dry-run`에서도 candidate 이미지가 정상 확인되면 `successCount`를 증가시켜 manifest 검토가 쉽도록 했다. 단, `secureUrl`은 `null`이므로 Markdown 반영 스크립트는 dry-run manifest를 거부한다.

## Workflow Documents

- 기준 문서: `docs/finmap-post-image-guideline.md`
- 반복 작업용 문서: `docs/codex-prompts/finmap-post-image-workflow.md`

다음 개별 작업에서는 workflow 문서를 먼저 읽고, 대상 Markdown만 지정하면 된다.

## Existing Cloudinary Replacement Mode

2026-06-23 보완으로 기존 이미지 교체 모드를 추가했다.

- 대상 Markdown의 현재 이미지 슬롯을 먼저 `reports/post-image-inventory-{slug}.json`으로 추출한다.
- frontmatter 이미지 필드(`cover`, `image`, `thumbnail`, `ogImage`, `socialImage`, `heroImage`, `coverImage`, `bannerImage`), Markdown image, HTML `<img>`를 모두 슬롯으로 기록한다.
- 기존 이미지 개수와 위치를 보존한다.
- 고정 `img1.png`, `img2.png`, `img3.png` 이름 또는 4장 고정 개수를 가정하지 않는다.
- 기존 이미지가 있으면 출력 폴더는 `public/images/posts/{slug}/rework-{YYYYMMDD}`를 사용한다.
- Cloudinary 업로드 폴더는 `blog/insight/{slug}/rework-{YYYYMMDD}`를 사용한다.
- 기존 Cloudinary public_id는 덮어쓰지 않는다.
- Markdown 반영은 replacement manifest의 `oldUrl -> newCloudinaryUrl` 매핑으로만 수행한다.
- frontmatter는 해당 `fieldName` 값만 교체하고, 본문 Markdown/HTML 이미지는 기존 위치와 alt를 보존한다.

## Sample Validation

샘플 대상:

`content/posts/personalFinance/ko/how-much-monthly-invest-for-100m.md`

실행 결과:

| Step | Command | Result |
| --- | --- | --- |
| Plan | `node scripts\plan_post_images.js content\posts\personalFinance\ko\how-much-monthly-invest-for-100m.md` | PASS, KO plan generated |
| Generate | `node scripts\generate_post_images.js content\posts\personalFinance\ko\how-much-monthly-invest-for-100m.md` | PASS, 4 PNG files generated in default output dir |
| Validate | `node scripts\validate_generated_images.js content\posts\personalFinance\ko\how-much-monthly-invest-for-100m.md` | PASS |
| Upload dry-run | `npm.cmd run upload:cloudinary:finmap -- --dir public/images/posts/how-much-monthly-invest-for-100m --folder blog/insight/how-much-monthly-invest-for-100m --manifest reports/cloudinary-how-much-monthly-invest-for-100m-dry-run.json --include cover.png,img1.png,img2.png,img3.png --dry-run` | PASS, candidate 4 |
| Apply dry-run manifest | `node scripts\apply_post_image_cloudinary_urls.js content\posts\personalFinance\ko\how-much-monthly-invest-for-100m.md reports\cloudinary-how-much-monthly-invest-for-100m-dry-run.json --dry-run --report reports\post-image-url-apply-how-much-monthly-invest-for-100m-dry-run.json` | Expected FAIL: dry-run manifest and missing secureUrl rejected |
| Audit | `node scripts\audit_post_images.js content\posts\personalFinance\ko\how-much-monthly-invest-for-100m.md` | PASS, audit report generated during test |

검증 중 생성한 샘플 PNG와 임시 plan/validation/audit/upload manifest는 최종 변경 범위에서 제외하기 위해 정리했다.

## Replacement Mode Sample Validation

샘플 대상:

`content/posts/personalFinance/ko/how-much-monthly-invest-for-100m.md`

기존 이미지 슬롯 분석 결과:

- `frontmatter-cover`: `cover`
- `body-001`: body cover image
- `body-002`: chart role
- `body-003`: comparison role
- `body-004`: flow role

실행 결과:

| Step | Command | Result |
| --- | --- | --- |
| Inventory + plan | `node scripts\plan_post_images.js content\posts\personalFinance\ko\how-much-monthly-invest-for-100m.md --date 20260623` | PASS, mode `replace-existing`, 5 slots |
| Generate rework images | `node scripts\generate_post_images.js content\posts\personalFinance\ko\how-much-monthly-invest-for-100m.md --date 20260623` | PASS, 5 PNG files generated in `rework-20260623` |
| Validate | `node scripts\validate_generated_images.js content\posts\personalFinance\ko\how-much-monthly-invest-for-100m.md --date 20260623` | PASS |
| Upload dry-run | `npm.cmd run upload:cloudinary:finmap -- --dir public/images/posts/how-much-monthly-invest-for-100m/rework-20260623 --folder blog/insight/how-much-monthly-invest-for-100m/rework-20260623 --manifest reports/cloudinary-how-much-monthly-invest-for-100m-rework-20260623-dry-run.json --include slot-001-cover.png,slot-002-cover.png,slot-003-chart.png,slot-004-comparison.png,slot-005-flow.png --dry-run` | PASS, candidate 5 |
| Replacement manifest from dry-run | `node scripts\create_post_image_replacement_manifest.js ...dry-run.json` | Expected FAIL: dry-run and missing secureUrl rejected |
| Replacement manifest fake success | `node scripts\create_post_image_replacement_manifest.js ...fake-success.json` | PASS, mapping complete |
| Apply replacement fake success | `node scripts\apply_post_image_cloudinary_urls.js ...fake-success.json --dry-run` | PASS, 5 changes planned, Markdown not modified |

검증 중 생성한 rework PNG와 임시 manifest/report는 최종 변경 범위에서 제외하기 위해 정리 대상이다.

## Build / Static Checks

| Command | Result |
| --- | --- |
| `node --check scripts\lib\post_image_system.js` | PASS |
| `node --check scripts\plan_post_images.js` | PASS |
| `node --check scripts\generate_post_images.js` | PASS |
| `node --check scripts\validate_generated_images.js` | PASS |
| `node --check scripts\audit_post_images.js` | PASS |
| `node --check scripts\apply_post_image_cloudinary_urls.js` | PASS |
| `node --check scripts\create_post_image_replacement_manifest.js` | PASS |
| `node --check scripts\upload-cloudinary.js` | PASS |
| `npm.cmd run build` | PASS |

`npm run upload:cloudinary:finmap`은 PowerShell execution policy 때문에 `npm.ps1` 실행이 막혔다. Windows에서는 `npm.cmd run upload:cloudinary:finmap` 형식으로 검증했다.

## Sample Commands

KO:

```bash
node scripts/plan_post_images.js content/posts/personalFinance/ko/example.md
node scripts/generate_post_images.js content/posts/personalFinance/ko/example.md
node scripts/validate_generated_images.js content/posts/personalFinance/ko/example.md
npm run upload:cloudinary:finmap -- --dir public/images/posts/{slug} --folder blog/insight/{slug} --manifest reports/cloudinary-{slug}-ko.json --include cover.png,img1.png,img2.png,img3.png
node scripts/apply_post_image_cloudinary_urls.js content/posts/personalFinance/ko/example.md reports/cloudinary-{slug}-ko.json
node scripts/audit_post_images.js content/posts/personalFinance/ko/example.md
```

EN:

```bash
node scripts/plan_post_images.js content/posts/personalFinance/en/example.md
node scripts/generate_post_images.js content/posts/personalFinance/en/example.md
node scripts/validate_generated_images.js content/posts/personalFinance/en/example.md
npm run upload:cloudinary:finmap -- --dir public/images/posts/{slug} --folder blog/insight/{slug} --manifest reports/cloudinary-{slug}-en.json --include cover-en.png,img1-en.png,img2-en.png,img3-en.png
node scripts/apply_post_image_cloudinary_urls.js content/posts/personalFinance/en/example.md reports/cloudinary-{slug}-en.json
node scripts/audit_post_images.js content/posts/personalFinance/en/example.md
```

Windows PowerShell에서는 `npm.cmd run ...` 사용을 권장한다.

Existing image replacement:

```bash
node scripts/plan_post_images.js content/posts/personalFinance/ko/example.md --mode auto --date 20260623
node scripts/generate_post_images.js content/posts/personalFinance/ko/example.md --mode replace-existing --date 20260623
node scripts/validate_generated_images.js content/posts/personalFinance/ko/example.md --plan reports/post-image-plan-{slug}-ko.json
npm run upload:cloudinary:finmap -- --dir public/images/posts/{slug}/rework-20260623 --folder blog/insight/{slug}/rework-20260623 --manifest reports/cloudinary-{slug}-rework-20260623.json
node scripts/create_post_image_replacement_manifest.js content/posts/personalFinance/ko/example.md reports/post-image-inventory-{slug}.json reports/cloudinary-{slug}-rework-20260623.json
node scripts/apply_post_image_cloudinary_urls.js content/posts/personalFinance/ko/example.md reports/post-image-replacement-{slug}-20260623.json
```

## Limits / Remaining Notes

- 현재 이미지 생성은 코드 기반 카드형 SVG/PNG 템플릿이다. 사진형/일러스트형 AI 이미지는 생성하지 않는다.
- 텍스트 검증은 OCR이 아니라 렌더러가 남기는 layout manifest의 bbox 기준이다.
- Markdown 반영은 manifest가 성공한 non-dry-run일 때만 동작한다. dry-run manifest는 의도적으로 거부한다.
- 기존 이미지 교체 모드는 `oldUrl` exact match와 슬롯 순서 기준으로 치환한다. 따라서 기존 Cloudinary URL이 `cover`, `img1`, `img2`, `img3` 같은 역할명을 포함하지 않아도 replacement manifest가 있으면 반영 가능하다.
- 샘플 생성 때 `public/images/posts` 쓰기는 샌드박스에서 거부되어 권한 상승으로 검증했다. 일반 로컬 작업에서는 프로젝트 폴더 쓰기 권한이 필요하다.
- build/postbuild로 생성된 sitemap 파일은 검증 후 복원했다.

## Short Request For Future Post Image Work

`docs/codex-prompts/finmap-post-image-workflow.md를 따라 <markdown-path>의 포스팅 이미지를 생성, 검증, Cloudinary 업로드 manifest 확인 후 Markdown에 반영해줘. SEO 구조(canonical/hreflang/robots/sitemap/SeoHead)는 수정하지 마.`
