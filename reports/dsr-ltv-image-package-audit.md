# DSR/LTV Image Package Audit

Date: 2026-06-02

## Scope

DSR/LTV 콘텐츠 클러스터 신규 2개 slug에 대해 KO/EN cover 및 본문 이미지 3장씩 총 16개 PNG를 생성하고, 신규 글 4개에 연결했다.

## Generated Images

All images are 1600x900 PNG files generated locally with `scripts/generate_dsr_ltv_article_images.js`.

### cash-100m-200m-300m-apartment-budget

| File | Intent | In-image text |
| --- | --- | --- |
| `public/images/posts/cash-100m-200m-300m-apartment-budget/cover.png` | KO cover | Cash Budget / DSR / LTV / Safe Range |
| `public/images/posts/cash-100m-200m-300m-apartment-budget/cover-en.png` | EN cover | Cash Budget / DSR / LTV / Safe Range |
| `public/images/posts/cash-100m-200m-300m-apartment-budget/img1.png` | 현금별 구매 가능 가격 비교 | 현금별 예산 / Cash / LTV / Cost |
| `public/images/posts/cash-100m-200m-300m-apartment-budget/img1-en.png` | Cash budget comparison | Cash Budget / Cash / LTV / Costs |
| `public/images/posts/cash-100m-200m-300m-apartment-budget/img2.png` | 안전 탐색 가격대 밴드 | 안전 탐색 밴드 / Safe Range 80-90% |
| `public/images/posts/cash-100m-200m-300m-apartment-budget/img2-en.png` | Safe range band | Safe Range / 80-90% search band |
| `public/images/posts/cash-100m-200m-300m-apartment-budget/img3.png` | 후보 아파트 가능/주의/불가 판정 | 후보 가격 판정 / 가능 / 주의 / 불가 |
| `public/images/posts/cash-100m-200m-300m-apartment-budget/img3-en.png` | Target check status | Target Check / Pass / Caution / Fail |

### dsr-pass-ltv-cash-bottleneck

| File | Intent | In-image text |
| --- | --- | --- |
| `public/images/posts/dsr-pass-ltv-cash-bottleneck/cover.png` | KO cover | DSR vs LTV vs Cash / Bottleneck / Safe Range / Dashboard |
| `public/images/posts/dsr-pass-ltv-cash-bottleneck/cover-en.png` | EN cover | DSR vs LTV vs Cash / Bottleneck / Safe Range / Dashboard |
| `public/images/posts/dsr-pass-ltv-cash-bottleneck/img1.png` | DSR/LTV/현금 3조건 체크 | 3조건 체크 / DSR / LTV / 현금 |
| `public/images/posts/dsr-pass-ltv-cash-bottleneck/img1-en.png` | Three condition checks | Three Checks / DSR / LTV / Cash |
| `public/images/posts/dsr-pass-ltv-cash-bottleneck/img2.png` | 샘플 A-D 비교 | 샘플 A-D / Bottleneck patterns |
| `public/images/posts/dsr-pass-ltv-cash-bottleneck/img2-en.png` | Samples A-D comparison | Samples A-D / Bottleneck patterns |
| `public/images/posts/dsr-pass-ltv-cash-bottleneck/img3.png` | 계산기에서 대시보드로 이어지는 흐름 | 계산 후 확인 / Calculator to Dashboard |
| `public/images/posts/dsr-pass-ltv-cash-bottleneck/img3-en.png` | Calculator to dashboard flow | From Calculator / Calculator to Dashboard |

## Connected Post Files

| File | Cover frontmatter | Body img1-img3 |
| --- | --- | --- |
| `content/posts/personalFinance/ko/cash-100m-200m-300m-apartment-budget.md` | `/images/posts/cash-100m-200m-300m-apartment-budget/cover.png` | Inserted after purchase budget, safer search range, and target price decision sections |
| `content/posts/personalFinance/en/cash-100m-200m-300m-apartment-budget.md` | `/images/posts/cash-100m-200m-300m-apartment-budget/cover-en.png` | Inserted after purchase budget, safer search range, and target price decision sections |
| `content/posts/personalFinance/ko/dsr-pass-ltv-cash-bottleneck.md` | `/images/posts/dsr-pass-ltv-cash-bottleneck/cover.png` | Inserted after candidate checks, samples A-D, and checklist/dashboard flow sections |
| `content/posts/personalFinance/en/dsr-pass-ltv-cash-bottleneck.md` | `/images/posts/dsr-pass-ltv-cash-bottleneck/cover-en.png` | Inserted after candidate checks, samples A-D, and dashboard flow sections |

## Alt Text

| File | Image | Alt text |
| --- | --- | --- |
| KO cash | img1 | 보유현금 1억 2억 3억원별 아파트 구매 가능 금액과 DSR LTV 병목 비교 |
| KO cash | img2 | DSR LTV 계산 결과의 안전 탐색 가격대를 부동산 실거래 대시보드에서 확인하는 밴드 |
| KO cash | img3 | 후보 아파트 가격을 DSR LTV 현금 조건으로 가능 주의 불가 판정하는 예시 |
| EN cash | img1 | Cash KRW 100M 200M and 300M apartment budget comparison under DSR LTV and transaction cost assumptions |
| EN cash | img2 | Safe search range band for a Korean apartment budget after DSR and LTV calculation |
| EN cash | img3 | Target apartment check showing pass caution and fail status under DSR LTV and cash conditions |
| KO bottleneck | img1 | DSR LTV 현금 세 조건을 따로 확인하는 아파트 구매 가능 금액 체크 구조 |
| KO bottleneck | img2 | DSR LTV 계산기 샘플 A부터 D까지 병목 패턴과 후보 집값 판정 비교 |
| KO bottleneck | img3 | DSR LTV 계산기에서 안전 탐색 가격대를 확인한 뒤 부동산 실거래 대시보드로 이동하는 흐름 |
| EN bottleneck | img1 | Three separate Korean apartment affordability checks for DSR LTV and cash bottlenecks |
| EN bottleneck | img2 | FinMap DSR LTV calculator samples A through D comparing bottleneck patterns and target status |
| EN bottleneck | img3 | Workflow from DSR LTV calculator inputs to safe range and real estate dashboard transaction checks |

## Validation

| Check | Result |
| --- | --- |
| `node --check scripts/generate_dsr_ltv_article_images.js` | PASS |
| `node scripts/generate_dsr_ltv_article_images.js` | PASS: generated 16 PNG files |
| Image metadata check | PASS: all 16 files are PNG, 1600x900 |
| Frontmatter/markdown image path check | PASS: 4 covers and 12 body images exist |
| Markdown/frontmatter parsing | PASS through `gray-matter` validation |
| `npm.cmd run build` | PASS: Next build completed, 203 static pages generated, `next-sitemap` completed |

## Sitemap Note

`npm.cmd run build` ran `postbuild` and regenerated `public/sitemap-0.xml`. For this image package task, there were no new URL additions caused by image linking. The target article URLs remain present; observed sitemap differences are generated `lastmod` timestamp churn plus previously introduced content-cluster URL entries.

## Cloudinary URL Replacement

Date: 2026-06-02

Local image files were kept under `public/images/posts/...`. Only markdown `cover` frontmatter and body `<img src>` values were replaced with Cloudinary URLs.

### Updated Posts

| File | Cover replaced | Body img1-img3 replaced |
| --- | --- | --- |
| `content/posts/personalFinance/ko/cash-100m-200m-300m-apartment-budget.md` | Yes | Yes |
| `content/posts/personalFinance/en/cash-100m-200m-300m-apartment-budget.md` | Yes | Yes |
| `content/posts/personalFinance/ko/dsr-pass-ltv-cash-bottleneck.md` | Yes | Yes |
| `content/posts/personalFinance/en/dsr-pass-ltv-cash-bottleneck.md` | Yes | Yes |

### Mapping

| Local path | Cloudinary URL |
| --- | --- |
| `/images/posts/cash-100m-200m-300m-apartment-budget/cover.png` | `https://res.cloudinary.com/dwonflmnn/image/upload/v1780362430/blog/insight/cash_cover.png` |
| `/images/posts/cash-100m-200m-300m-apartment-budget/img1.png` | `https://res.cloudinary.com/dwonflmnn/image/upload/v1780362433/blog/insight/cash_img1.png` |
| `/images/posts/cash-100m-200m-300m-apartment-budget/img2.png` | `https://res.cloudinary.com/dwonflmnn/image/upload/v1780362435/blog/insight/cash_img2.png` |
| `/images/posts/cash-100m-200m-300m-apartment-budget/img3.png` | `https://res.cloudinary.com/dwonflmnn/image/upload/v1780362437/blog/insight/cash_img3.png` |
| `/images/posts/cash-100m-200m-300m-apartment-budget/cover-en.png` | `https://res.cloudinary.com/dwonflmnn/image/upload/v1780362429/blog/insight/cash_cover-en.png` |
| `/images/posts/cash-100m-200m-300m-apartment-budget/img1-en.png` | `https://res.cloudinary.com/dwonflmnn/image/upload/v1780362432/blog/insight/cash_img1-en.png` |
| `/images/posts/cash-100m-200m-300m-apartment-budget/img2-en.png` | `https://res.cloudinary.com/dwonflmnn/image/upload/v1780362435/blog/insight/cash_img2-en.png` |
| `/images/posts/cash-100m-200m-300m-apartment-budget/img3-en.png` | `https://res.cloudinary.com/dwonflmnn/image/upload/v1780362436/blog/insight/cash_img3-en.png` |
| `/images/posts/dsr-pass-ltv-cash-bottleneck/cover.png` | `https://res.cloudinary.com/dwonflmnn/image/upload/v1780362440/blog/insight/dsr_cover.png` |
| `/images/posts/dsr-pass-ltv-cash-bottleneck/img1.png` | `https://res.cloudinary.com/dwonflmnn/image/upload/v1780362444/blog/insight/dsr_img1.png` |
| `/images/posts/dsr-pass-ltv-cash-bottleneck/img2.png` | `https://res.cloudinary.com/dwonflmnn/image/upload/v1780362446/blog/insight/dsr_img2.png` |
| `/images/posts/dsr-pass-ltv-cash-bottleneck/img3.png` | `https://res.cloudinary.com/dwonflmnn/image/upload/v1780362449/blog/insight/dsr_img3.png` |
| `/images/posts/dsr-pass-ltv-cash-bottleneck/cover-en.png` | `https://res.cloudinary.com/dwonflmnn/image/upload/v1780362439/blog/insight/dsr_cover-en.png` |
| `/images/posts/dsr-pass-ltv-cash-bottleneck/img1-en.png` | `https://res.cloudinary.com/dwonflmnn/image/upload/v1780362442/blog/insight/dsr_img1-en.png` |
| `/images/posts/dsr-pass-ltv-cash-bottleneck/img2-en.png` | `https://res.cloudinary.com/dwonflmnn/image/upload/v1780362445/blog/insight/dsr_img2-en.png` |
| `/images/posts/dsr-pass-ltv-cash-bottleneck/img3-en.png` | `https://res.cloudinary.com/dwonflmnn/image/upload/v1780362447/blog/insight/dsr_img3-en.png` |

### Replacement Validation

| Check | Result |
| --- | --- |
| Local cash image path remains in target markdown | PASS: none found |
| Local bottleneck image path remains in target markdown | PASS: none found |
| Frontmatter cover uses Cloudinary URL | PASS: 4/4 |
| Body image `src` uses Cloudinary URL | PASS: 12/12 |
| Alt text and figcaption preserved | PASS: 12 images with non-empty existing alt text and 12 figcaptions unchanged in place |
| Markdown/frontmatter parsing | PASS through `gray-matter` validation |
| `npm.cmd run build` | PASS: Next build completed, 203 static pages generated, `next-sitemap` completed |
