# Finmap Post Image Cloudinary Replace - dsr-40-income-loan-limit-table

Date: 20260623

## Summary

- Markdown: `content/posts/personalFinance/ko/dsr-40-income-loan-limit-table.md`
- Mode: `replace-existing`
- Replacement slots: 1
- Apply status: PASS
- Dry run: no
- Inventory: `reports/post-image-inventory-dsr-40-income-loan-limit-table.json`
- Plan: `reports/post-image-plan-dsr-40-income-loan-limit-table-ko.json`
- Validation: `reports/post-image-validation-dsr-40-income-loan-limit-table-ko.json` PASS
- Cloudinary manifest: `reports/cloudinary-dsr-40-income-loan-limit-table-rework-20260623.json`
- Replacement manifest: `reports/post-image-replacement-dsr-40-income-loan-limit-table-20260623.json`
- Apply report: `reports/post-image-url-apply-dsr-40-income-loan-limit-table-20260623.json`
- Audit: `reports/post-image-audit-dsr-40-income-loan-limit-table-ko.md`

## Generated Images

| File | Size | Local Path | Validation |
| --- | --- | --- | --- |
| `slot-001-cover.png` | 1600x900 | `public/images/posts/dsr-40-income-loan-limit-table/rework-20260623/slot-001-cover.png` | PASS |

Layout manifest: `public/images/posts/dsr-40-income-loan-limit-table/rework-20260623/image-layout-manifest.json`

## Cloudinary Upload

- Upload folder: `blog/insight/dsr-40-income-loan-limit-table/rework-20260623`
- Result: PASS, `successCount=1`, `failCount=0`
- Note: the first sandboxed upload attempt failed, then the approved network retry succeeded.

| File | Cloudinary secureUrl |
| --- | --- |
| `slot-001-cover.png` | `https://res.cloudinary.com/dwonflmnn/image/upload/v1782180062/blog/insight/dsr-40-income-loan-limit-table/rework-20260623/slot-001-cover.png` |

## Existing Image Slots

| Slot | Source | Field | Old URL | Role | New local file |
| --- | --- | --- | --- | --- | --- |
| frontmatter-cover | frontmatter | cover | `https://res.cloudinary.com/dwonflmnn/image/upload/v1780291760/blog/insight/dsr_cover.png` | cover | `slot-001-cover.png` |

## oldUrl -> newUrl

| Slot | New Cloudinary URL |
| --- | --- |
| frontmatter-cover | `https://res.cloudinary.com/dwonflmnn/image/upload/v1782180062/blog/insight/dsr-40-income-loan-limit-table/rework-20260623/slot-001-cover.png` |

## Markdown Changes

| Type | Slot | Line | Before | After |
| --- | --- | ---: | --- | --- |
| frontmatter | frontmatter-cover | 14 | `https://res.cloudinary.com/dwonflmnn/image/upload/v1780291760/blog/insight/dsr_cover.png` | `https://res.cloudinary.com/dwonflmnn/image/upload/v1782180062/blog/insight/dsr-40-income-loan-limit-table/rework-20260623/slot-001-cover.png` |

## Verification

- Remaining old URLs: none
- Missing new URLs: none
- Duplicate new URLs: none
- Audit result: frontmatter Cloudinary references 1, body image count 0, local post image references 0
- Expected local file exists: yes

## Build Result

- Command: `npm.cmd run build`
- Result: PASS
- Static pages generated: 209/209
- Postbuild sitemap files were regenerated and restored because sitemap changes were outside this image replacement task.

## Manual Review Suggestions

- 이미지 추가/삭제는 자동 적용하지 않았다.
- alt 문구는 기존 값을 보존했다. 비어 있거나 부정확한 alt는 별도 검토한다.
- Cloudinary 기존 public_id는 덮어쓰지 않고 rework 폴더의 새 URL을 사용한다.
- 본문 이미지가 없는 글이라 이번 작업은 frontmatter `cover` 1개만 교체했다.
- canonical/hreflang/robots/sitemap/SeoHead 정책은 수정하지 않았다.
