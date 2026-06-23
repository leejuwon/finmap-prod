# Finmap Post Image Generation Guideline

Date: 2026-06-23

## Purpose

Finmap 포스팅 이미지는 KO/EN Markdown의 주제와 계산 흐름을 읽고, 코드 기반 SVG 텍스트와 카드형 금융 그래픽으로 생성한다. 자유 생성형 이미지 안에 한글/영문 텍스트를 맡기지 않고, 모든 텍스트는 SVG `<text>`로 직접 렌더링한다.

## Channel Strategy

- KO: 네이버 유입 사용자가 검색 결과와 본문에서 바로 이해할 수 있는 표현을 우선한다.
- EN: Google/Bing 영문 롱테일 검색자가 이해할 수 있는 calculator/explainer 표현을 우선한다.
- KO 글과 EN 글은 같은 slug여도 이미지 문구를 단순 번역하지 않는다. Markdown의 `lang`, `title`, `description`, `tags`, heading, table, FAQ를 기준으로 별도 기획한다.

## File Naming

KO:

- `cover.png`
- `img1.png`
- `img2.png`
- `img3.png`

EN:

- `cover-en.png`
- `img1-en.png`
- `img2-en.png`
- `img3-en.png`

## Size

- Cover: `1600x900`
- Body images: `1200x675`
- All images must stay 16:9.

## Safe Area

- 핵심 텍스트, 숫자, 카드, 아이콘은 상하좌우 8~10% 안쪽에 둔다.
- Cloudinary 썸네일/크롭을 고려해 가장자리에는 제목, 핵심 숫자, 단계 라벨을 두지 않는다.
- 현재 스크립트 기준 safe area는 9%다.

## Planning Inputs

`scripts/plan_post_images.js`는 아래를 읽는다.

- frontmatter: `title`, `description`, `seoDescription`, `tags`, `category`, `postCategory`, `lang`, `slug`, `cover`
- body: H2/H3 heading, Markdown table, FAQ question, existing Markdown/HTML images

## Image Roles

- `cover`: 제목, 핵심 키워드, 3개 요약 카드
- `img1`: 본문 주요 heading을 단계형 흐름으로 정리
- `img2`: 표 또는 태그 기반 시나리오/비교 카드
- `img3`: FAQ 또는 판단 기준 기반 체크 이미지

## Modes

### New Image Mode

대상 Markdown에 이미지가 없거나 새 글인 경우 사용한다.

- KO 기본 제안: `cover.png`, `img1.png`, `img2.png`, `img3.png`
- EN 기본 제안: `cover-en.png`, `img1-en.png`, `img2-en.png`, `img3-en.png`
- 실제 본문 구조상 이미지가 4개 필요하지 않으면 줄일 수 있다.

### Existing Image Replacement Mode

대상 Markdown에 이미 Cloudinary URL 또는 로컬 이미지 경로가 있으면 이 모드를 우선한다.

- 기존 이미지 개수와 위치를 기본적으로 보존한다.
- `img1.png`, `img2.png`, `img3.png` 같은 고정 이름이나 고정 개수를 가정하지 않는다.
- frontmatter 이미지 필드, Markdown image, HTML `<img>`를 모두 슬롯으로 추출한다.
- 이미지 추가/삭제는 자동 적용하지 않고 보고서에서만 제안한다.

인벤토리 대상:

- frontmatter: `cover`, `image`, `thumbnail`, `ogImage`, `socialImage`, `heroImage`, `coverImage`, `bannerImage`
- Markdown: `![alt](url)`
- HTML: `<img src="url" alt="...">`
- Cloudinary: `https://res.cloudinary.com/...`
- local: `/images/posts/...`, `public/images/posts/...`

기존 이미지 교체 출력 폴더:

```text
public/images/posts/{slug}/rework-{YYYYMMDD}/
```

기존 이미지 교체 파일명:

```text
slot-001-cover.png
slot-002-body.png
slot-003-flow.png
slot-004-comparison.png
slot-005-chart.png
```

EN 슬롯은 필요한 경우 `slot-001-cover-en.png`처럼 `-en` suffix를 사용한다.

Cloudinary 업로드 폴더:

```text
blog/insight/{slug}/rework-{YYYYMMDD}
```

기존 Cloudinary public_id는 덮어쓰지 않는다. CDN 캐시와 롤백 안전성을 위해 새 rework 폴더에 업로드하고 Markdown URL만 새 secure_url로 교체한다.

## Validation Rules

이미지 생성 후 `scripts/validate_generated_images.js`로 다음을 확인한다.

- 파일 존재 여부
- width/height
- 16:9 비율
- safe area 침범 여부
- 텍스트 누락 또는 truncation 여부
- 텍스트 overflow
- 텍스트와 도형의 부모 박스 이탈 여부
- 텍스트 간 겹침
- 단계형 이미지의 step box 수와 connector 수
- 비교형 이미지의 panel 수
- 같은 행의 step center y 편차
- 인접 box 간 최소 간격
- KO 주요 라벨 2줄 초과 여부
- EN 긴 단어 overflow 여부

허용 기준:

- 같은 행의 step center y 편차: `<= 8px`
- 인접 box 간 최소 간격: `>= 24px`
- 16:9 ratio 오차: `< 0.002`
- 텍스트는 부모 box 안쪽 10px 여백 안에 들어와야 한다.

## Failure Policy

- 검증 실패 시 report JSON에 실패 사유를 남긴다.
- 현재 공통 렌더러는 줄바꿈과 font-size 축소를 자동 적용한다.
- 그래도 truncation, overflow, overlap이 남으면 FAIL 처리한다.
- FAIL인 경우 Cloudinary 업로드와 Markdown 반영을 하지 않는다.

## Cloudinary Upload

기본 명령은 유지한다.

```bash
npm run upload:cloudinary:finmap
```

확장 옵션:

```bash
npm run upload:cloudinary:finmap -- --dir public/images/posts/{slug} --folder blog/insight/{slug} --manifest reports/cloudinary-{slug}.json --include cover.png,img1.png,img2.png,img3.png
```

지원 옵션:

- `--dir <local-dir>`
- `--folder <cloudinary-folder>`
- `--manifest <output-json-path>`
- `--include <comma-separated-files>`
- `--dry-run`

업로드 대상 확장자:

- `png`
- `jpg`
- `jpeg`
- `webp`
- `svg`

숨김 파일, 디렉터리, 기타 파일은 제외한다. `--include` 지정 파일이 누락되면 실패한다.

## Manifest Contract

Cloudinary manifest는 다음 필드를 포함해야 한다.

- `localDir`
- `cloudinaryFolder`
- `uploadedAt`
- `dryRun`
- `candidateCount`
- `successCount`
- `failCount`
- `images[].fileName`
- `images[].localPath`
- `images[].secureUrl`
- `errors`

Markdown 반영은 `dryRun: false`, `failCount: 0`, `successCount: expectedFiles.length`, 모든 expected image의 `secureUrl` 존재 조건을 만족할 때만 진행한다.

## Replacement Manifest Contract

기존 이미지 교체 모드에서는 upload manifest와 inventory를 결합해 replacement manifest를 만든다.

```bash
node scripts/create_post_image_replacement_manifest.js <markdown-path> reports/post-image-inventory-{slug}.json reports/cloudinary-{slug}-rework-{YYYYMMDD}.json
```

replacement manifest는 각 슬롯마다 아래 매핑을 포함한다.

- `slotId`
- `source`
- `fieldName`
- `oldUrl`
- `newLocalFile`
- `newCloudinaryUrl`
- `alt`
- `line`
- `nearHeading`

`dryRun: true`, `failCount > 0`, `secureUrl` 누락, 업로드 성공 수 불일치가 있으면 replacement manifest는 FAIL이 되고 Markdown 반영을 중단한다.

## Markdown Apply Rules

`scripts/apply_post_image_cloudinary_urls.js`는 다음만 최소 수정한다.

- frontmatter의 `cover`, `image`, `thumbnail`, `ogImage` 중 기존 구조에 맞는 필드
- 본문 Markdown image URL
- 본문 HTML `<img src="">`

기존 alt는 최대한 유지한다. 비어 있거나 너무 짧으면 글 제목과 파일 역할을 조합해 보완한다.

기존 이미지 교체 모드에서는 replacement manifest의 슬롯을 기준으로만 반영한다.

- frontmatter: 해당 `fieldName` 값만 `oldUrl -> newCloudinaryUrl`로 교체
- Markdown image: 기존 alt와 위치를 유지하고 URL만 교체
- HTML img: `src`만 교체하고 alt는 유지
- 동일한 `oldUrl`이 여러 번 등장해도 슬롯 순서대로 처리
- `secureUrl`이 없는 슬롯이 있으면 전체 자동 반영 중단

## Do Not Change

- canonical
- hreflang
- robots
- sitemap policy
- SeoHead
- slug
- route
- 본문 대규모 재작성
