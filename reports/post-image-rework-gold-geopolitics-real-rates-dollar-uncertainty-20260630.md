# Finmap 포스팅 이미지 교체 보고서

- 작업일: 2026-06-30
- 대상: `content/posts/economicInfo/ko/gold-geopolitics-real-rates-dollar-uncertainty.md`
- 모드: 기존 Cloudinary 이미지 교체 (`replace-existing`)
- 카테고리: `economicInfo` / 경제
- 최종 판정: PASS

## 이미지 슬롯 인벤토리

- 기존 이미지 슬롯: 4개
- 기존 고유 URL: 3개
- 교체 슬롯: 4개
- 구성: frontmatter `cover` 1개, 본문 HTML `<img>` 3개
- 참고: 기존 cover URL 하나가 frontmatter와 첫 본문 이미지에 중복 사용되어, 슬롯 기준으로 서로 다른 새 이미지에 매핑했다.
- 이미지 추가/삭제: 없음

| 순서 | 슬롯 | 위치 | 역할 | 새 파일 |
| --- | --- | --- | --- | --- |
| 1 | `frontmatter-cover` | frontmatter `cover` (12행) | cover | `slot-001-cover.png` |
| 2 | `html-001` | 본문 HTML 이미지 (52행) | hero/cover | `slot-002-cover.png` |
| 3 | `html-002` | 본문 HTML 이미지 (88행) | chart/comparison | `slot-003-chart.png` |
| 4 | `html-003` | 본문 HTML 이미지 (192행) | body-explanation/flow | `slot-004-body.png` |

## 생성 이미지와 디자인

출력 디렉터리: `public/images/posts/gold-geopolitics-real-rates-dollar-uncertainty/rework-20260630`

| 파일 | 크기 | 컨셉 |
| --- | --- | --- |
| `slot-001-cover.png` | 1600x900 | 금 가격을 좌우하는 실질금리·달러·불확실성 |
| `slot-002-cover.png` | 1600x900 | 금 강세를 만드는 세 변수의 조합 |
| `slot-003-chart.png` | 1200x675 | 실질금리 하락에서 금 수요 강화로 이어지는 비교 구조 |
| `slot-004-body.png` | 1200x675 | 국제 금과 원/달러를 분리해 보는 원화 금 해석 흐름 |

적용 palette는 `economic-macro`다. deep navy(`#111827`), slate blue(`#1f2a44`), cool gray 카드와 blue/teal/yellow 지표 accent를 사용해 경제·거시지표 톤을 반영했다.

## 텍스트 및 레이아웃 검증

- 코드 기반 SVG 렌더링으로 텍스트를 배치하고 PNG로 생성했다.
- 4개 파일 모두 존재하며 16:9 비율이다.
- safe area, 텍스트 누락/overflow, 한글 1글자 orphan, 단어 내부 분리, maxLines, 최소 폰트 크기 검사를 모두 통과했다.
- 텍스트와 도형 겹침, 패널 정렬, 박스 간격, 흐름 행 정렬에서 오류나 경고가 없다.
- 자동 검증: PASS, errors 0, warnings 0
- 시각 검토: PASS

## Cloudinary 업로드

- 폴더: `blog/insight/gold-geopolitics-real-rates-dollar-uncertainty/rework-20260630`
- 후보 4개, 성공 4개, 실패 0개, dry run 아님

| 파일 | secureUrl |
| --- | --- |
| `slot-001-cover.png` | `https://res.cloudinary.com/dwonflmnn/image/upload/v1782799684/blog/insight/gold-geopolitics-real-rates-dollar-uncertainty/rework-20260630/slot-001-cover.png` |
| `slot-002-cover.png` | `https://res.cloudinary.com/dwonflmnn/image/upload/v1782799684/blog/insight/gold-geopolitics-real-rates-dollar-uncertainty/rework-20260630/slot-002-cover.png` |
| `slot-003-chart.png` | `https://res.cloudinary.com/dwonflmnn/image/upload/v1782799685/blog/insight/gold-geopolitics-real-rates-dollar-uncertainty/rework-20260630/slot-003-chart.png` |
| `slot-004-body.png` | `https://res.cloudinary.com/dwonflmnn/image/upload/v1782799686/blog/insight/gold-geopolitics-real-rates-dollar-uncertainty/rework-20260630/slot-004-body.png` |

기존 Cloudinary 자산은 삭제하지 않았다.

## URL 교체 결과

| 슬롯 | oldUrl | newUrl |
| --- | --- | --- |
| frontmatter cover | `https://res.cloudinary.com/dwonflmnn/image/upload/v1770345894/blog/insight/gold-geopolitics-kr-cover.png` | `https://res.cloudinary.com/dwonflmnn/image/upload/v1782799684/blog/insight/gold-geopolitics-real-rates-dollar-uncertainty/rework-20260630/slot-001-cover.png` |
| 본문 hero | `https://res.cloudinary.com/dwonflmnn/image/upload/v1770345894/blog/insight/gold-geopolitics-kr-cover.png` | `https://res.cloudinary.com/dwonflmnn/image/upload/v1782799684/blog/insight/gold-geopolitics-real-rates-dollar-uncertainty/rework-20260630/slot-002-cover.png` |
| 본문 chart | `https://res.cloudinary.com/dwonflmnn/image/upload/v1770345895/blog/insight/gold-geopolitics-kr-img1.png` | `https://res.cloudinary.com/dwonflmnn/image/upload/v1782799685/blog/insight/gold-geopolitics-real-rates-dollar-uncertainty/rework-20260630/slot-003-chart.png` |
| 본문 flow | `https://res.cloudinary.com/dwonflmnn/image/upload/v1770345896/blog/insight/gold-geopolitics-kr-img2.png` | `https://res.cloudinary.com/dwonflmnn/image/upload/v1782799686/blog/insight/gold-geopolitics-real-rates-dollar-uncertainty/rework-20260630/slot-004-body.png` |

- Markdown 이미지 alt와 figcaption은 유지했다.
- 기존 Article JSON-LD의 `image` 배열은 URL 3개만 교체했고 항목 수와 구조는 유지했다.
- 새 JSON-LD는 추가하지 않았다.
- oldUrl 잔존: 0건
- newUrl 누락: 0건
- apply 결과: PASS, 변경 4개
- apply 보고서의 `duplicateNewUrls` 3건은 frontmatter/본문 대표 이미지를 기존 Article JSON-LD가 재참조한 의도된 결과다.

## 감사 및 빌드

- `node scripts/validate_generated_images.js ... --plan ...`: PASS
- `node scripts/audit_post_images.js ... --plan ...`: expected file 4/4 존재, Cloudinary 참조 4개, 로컬 참조 0개
- `npm.cmd run build`: PASS, static pages 214/214
- postbuild sitemap: KO 106 URLs, EN 98 URLs
- build가 다시 생성한 `public/en/sitemap.xml`, `public/sitemap-0.xml`, `public/sitemap-en.xml`은 작업 범위 밖이므로 복원했다.
- `git diff --check`: PASS. PowerShell 작업 트리의 LF→CRLF 안내 경고만 있으며 whitespace 오류는 없다.

## 범위 및 수동 검토

- canonical, hreflang, robots, sitemap 정책, SeoHead와 본문 SEO 구조는 수정하지 않았다.
- 슬롯 수와 위치를 유지했으며 이미지 추가/삭제 제안은 없다.
- 배포 후 실제 글에서 Cloudinary 이미지 로딩, 모바일 축소 시 텍스트 가독성, CDN 캐시 반영을 한 번 확인하는 것이 좋다.
