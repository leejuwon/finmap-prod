# Finmap Post Image Cloudinary Replace - gold-geopolitics-real-rates-dollar-uncertainty

Date: 20260630

## Summary

- Markdown: `content/posts/economicInfo/ko/gold-geopolitics-real-rates-dollar-uncertainty.md`
- Mode: `replace-existing`
- Replacement slots: 4
- Apply status: PASS
- Dry run: no

## Existing Image Slots

| Slot | Source | Field | Old URL | Role | New local file |
| --- | --- | --- | --- | --- | --- |
| frontmatter-cover | frontmatter | cover | `https://res.cloudinary.com/dwonflmnn/image/upload/v1770345894/blog/insight/gold-geopolitics-kr-cover.png` | cover | `slot-001-cover.png` |
| html-001 | html-img | - | `https://res.cloudinary.com/dwonflmnn/image/upload/v1770345894/blog/insight/gold-geopolitics-kr-cover.png` | cover | `slot-002-cover.png` |
| html-002 | html-img | - | `https://res.cloudinary.com/dwonflmnn/image/upload/v1770345895/blog/insight/gold-geopolitics-kr-img1.png` | chart | `slot-003-chart.png` |
| html-003 | html-img | - | `https://res.cloudinary.com/dwonflmnn/image/upload/v1770345896/blog/insight/gold-geopolitics-kr-img2.png` | body-explanation | `slot-004-body.png` |

## oldUrl -> newUrl

| Slot | New Cloudinary URL |
| --- | --- |
| frontmatter-cover | `https://res.cloudinary.com/dwonflmnn/image/upload/v1782799684/blog/insight/gold-geopolitics-real-rates-dollar-uncertainty/rework-20260630/slot-001-cover.png` |
| html-001 | `https://res.cloudinary.com/dwonflmnn/image/upload/v1782799684/blog/insight/gold-geopolitics-real-rates-dollar-uncertainty/rework-20260630/slot-002-cover.png` |
| html-002 | `https://res.cloudinary.com/dwonflmnn/image/upload/v1782799685/blog/insight/gold-geopolitics-real-rates-dollar-uncertainty/rework-20260630/slot-003-chart.png` |
| html-003 | `https://res.cloudinary.com/dwonflmnn/image/upload/v1782799686/blog/insight/gold-geopolitics-real-rates-dollar-uncertainty/rework-20260630/slot-004-body.png` |

## Markdown Changes

| Type | Slot | Line | Before | After |
| --- | --- | ---: | --- | --- |
| frontmatter | frontmatter-cover | 12 | `https://res.cloudinary.com/dwonflmnn/image/upload/v1770345894/blog/insight/gold-geopolitics-kr-cover.png` | `https://res.cloudinary.com/dwonflmnn/image/upload/v1782799684/blog/insight/gold-geopolitics-real-rates-dollar-uncertainty/rework-20260630/slot-001-cover.png` |
| html-img | html-001 | 52 | `https://res.cloudinary.com/dwonflmnn/image/upload/v1770345894/blog/insight/gold-geopolitics-kr-cover.png` | `https://res.cloudinary.com/dwonflmnn/image/upload/v1782799684/blog/insight/gold-geopolitics-real-rates-dollar-uncertainty/rework-20260630/slot-002-cover.png` |
| html-img | html-002 | 88 | `https://res.cloudinary.com/dwonflmnn/image/upload/v1770345895/blog/insight/gold-geopolitics-kr-img1.png` | `https://res.cloudinary.com/dwonflmnn/image/upload/v1782799685/blog/insight/gold-geopolitics-real-rates-dollar-uncertainty/rework-20260630/slot-003-chart.png` |
| html-img | html-003 | 192 | `https://res.cloudinary.com/dwonflmnn/image/upload/v1770345896/blog/insight/gold-geopolitics-kr-img2.png` | `https://res.cloudinary.com/dwonflmnn/image/upload/v1782799686/blog/insight/gold-geopolitics-real-rates-dollar-uncertainty/rework-20260630/slot-004-body.png` |

## Verification

- Remaining old URLs: none
- Missing new URLs: none
- Duplicate new URLs: `https://res.cloudinary.com/dwonflmnn/image/upload/v1782799684/blog/insight/gold-geopolitics-real-rates-dollar-uncertainty/rework-20260630/slot-001-cover.png`, `https://res.cloudinary.com/dwonflmnn/image/upload/v1782799685/blog/insight/gold-geopolitics-real-rates-dollar-uncertainty/rework-20260630/slot-003-chart.png`, `https://res.cloudinary.com/dwonflmnn/image/upload/v1782799686/blog/insight/gold-geopolitics-real-rates-dollar-uncertainty/rework-20260630/slot-004-body.png`

## Build Result

- Not run by this apply script. Run `npm.cmd run build` after actual Markdown replacement.

## Manual Review Suggestions

- 이미지 추가/삭제는 자동 적용하지 않았다.
- alt 문구는 기존 값을 보존했다. 비어 있거나 부정확한 alt는 별도 검토한다.
- Cloudinary 기존 public_id는 덮어쓰지 않고 rework 폴더의 새 URL을 사용한다.

