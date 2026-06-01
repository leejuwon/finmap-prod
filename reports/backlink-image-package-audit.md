# Finmap Backlink Image Package Audit

## Scope

- Target posts:
  - `compound-return-3-5-7-10-table`
  - `monthly-investment-for-100m-table`
  - `dsr-40-income-loan-limit-table`
  - `interest-rate-1p-loan-limit-impact`
- Generated 32 PNG files: 4 images per locale per post.
- Size: 1600x900 PNG.
- Method: deterministic SVG infographic rendering with `sharp`, saved as local public assets.
- Style: clean fintech editorial infographic, bright background, navy/blue/green accents.
- Cover images use English keywords only, including Korean post covers.
- No logo, watermark, fake stock mark, long title text, dense table, or long body copy is rendered in the images.

## Generation Script

- Script: `scripts/generate_backlink_article_images.js`
- Output root: `public/images/posts/{slug}/`
- Validation command:
  - `node scripts\generate_backlink_article_images.js`
  - PNG metadata spot check confirmed all generated assets are `1600x900 png`.

## Post Wiring

- Each post frontmatter `cover` now points to its new local PNG cover.
- Each post body now includes `img1`, `img2`, and `img3` near the matching section:
  - `img1`: core table or core comparison
  - `img2`: supporting comparison or interpretation point
  - `img3`: practical meaning, caution, or stress-test summary

## Image Plan and Output Files

| Slug | Locale | File | Rendered Text | Intent | Main Visual Elements |
| --- | --- | --- | --- | --- | --- |
| `compound-return-3-5-7-10-table` | ko | `public/images/posts/compound-return-3-5-7-10-table/cover.png` | `Compound Growth` / `3% · 5% · 7% · 10%` | Cover: 전체 복리 비교 주제 | Line chart, metric cards, 30Y gap panel |
| `compound-return-3-5-7-10-table` | ko | `public/images/posts/compound-return-3-5-7-10-table/img1.png` | `복리 격차` / `1,000만원 · 10/20/30년` | 초기 1,000만원 일시 투자 핵심 표 | 3/5/7/10% bar chart, 30년 metric panel |
| `compound-return-3-5-7-10-table` | ko | `public/images/posts/compound-return-3-5-7-10-table/img2.png` | `월 적립 비교` / `30만원 · 3/5/7/10%` | 월 30만원 적립 비교 | Return-rate bar chart, 원금/월 납입 cards |
| `compound-return-3-5-7-10-table` | ko | `public/images/posts/compound-return-3-5-7-10-table/img3.png` | `기간의 힘` / `2%p 차이 · 장기 효과` | 기간과 수익률의 상호작용 | Rising line chart, caution cards |
| `compound-return-3-5-7-10-table` | en | `public/images/posts/compound-return-3-5-7-10-table/cover-en.png` | `Compound Growth` / `3% · 5% · 7% · 10%` | Cover: overall compound comparison | Line chart, metric cards, 30Y gap panel |
| `compound-return-3-5-7-10-table` | en | `public/images/posts/compound-return-3-5-7-10-table/img1-en.png` | `Lump Sum` / `KRW 10M · 10/20/30Y` | Core lump-sum table visual | 3/5/7/10% bar chart, 30Y metric panel |
| `compound-return-3-5-7-10-table` | en | `public/images/posts/compound-return-3-5-7-10-table/img2-en.png` | `Monthly Plan` / `KRW 300K · 3/5/7/10%` | Monthly contribution comparison | Bar chart, principal/contribution cards |
| `compound-return-3-5-7-10-table` | en | `public/images/posts/compound-return-3-5-7-10-table/img3-en.png` | `Time Effect` / `2pp gap · long horizon` | Long-horizon interpretation | Line chart, scenario/caution cards |
| `monthly-investment-for-100m-table` | ko | `public/images/posts/monthly-investment-for-100m-table/cover.png` | `KRW 100M Goal` / `Monthly Investment · 5Y 10Y 15Y 20Y` | Cover: 1억원 목표 월 투자금 | Declining line chart, target/rates cards |
| `monthly-investment-for-100m-table` | ko | `public/images/posts/monthly-investment-for-100m-table/img1.png` | `월 투자금` / `1억원 목표 · 기간별` | 핵심 월 투자금 표 | 5/10/15/20년 bar chart, goal panel |
| `monthly-investment-for-100m-table` | ko | `public/images/posts/monthly-investment-for-100m-table/img2.png` | `기간 효과` / `5년 vs 20년` | 기간이 길수록 부담이 줄어드는 해석 | Downward line chart, burden reduction cards |
| `monthly-investment-for-100m-table` | ko | `public/images/posts/monthly-investment-for-100m-table/img3.png` | `가정 민감도` / `수익률 · 초기자산` | 수익률/초기자산 민감도 | Flow cards, cash/chart icons |
| `monthly-investment-for-100m-table` | en | `public/images/posts/monthly-investment-for-100m-table/cover-en.png` | `KRW 100M Goal` / `Monthly Investment · 5Y 10Y 15Y 20Y` | Cover: KRW 100M monthly target | Declining line chart, target/rates cards |
| `monthly-investment-for-100m-table` | en | `public/images/posts/monthly-investment-for-100m-table/img1-en.png` | `Monthly Amount` / `KRW 100M target · timeline` | Core monthly contribution table | Timeline bar chart, target panel |
| `monthly-investment-for-100m-table` | en | `public/images/posts/monthly-investment-for-100m-table/img2-en.png` | `Timeline Effect` / `5Y vs 20Y` | Longer timeline interpretation | Downward line chart, consistency cards |
| `monthly-investment-for-100m-table` | en | `public/images/posts/monthly-investment-for-100m-table/img3-en.png` | `Assumption Risk` / `Return · starting assets` | Return and initial asset sensitivity | Flow cards, cash/chart icons |
| `dsr-40-income-loan-limit-table` | ko | `public/images/posts/dsr-40-income-loan-limit-table/cover.png` | `DSR 40%` / `Income · Loan Capacity` | Cover: DSR 40% 연봉별 한도 | Loan-capacity line chart, DSR/rate cards |
| `dsr-40-income-loan-limit-table` | ko | `public/images/posts/dsr-40-income-loan-limit-table/img1.png` | `연봉별 한도` / `DSR 40% · 금리 4%` | 연봉별 대출 가능액 핵심 표 | Income bar chart, 4%/30년 cards |
| `dsr-40-income-loan-limit-table` | ko | `public/images/posts/dsr-40-income-loan-limit-table/img2.png` | `상환 여력` / `월 상환액 · 30년` | 월 상환 가능액 계산 구조 | Income → DSR → payment → loan flow |
| `dsr-40-income-loan-limit-table` | ko | `public/images/posts/dsr-40-income-loan-limit-table/img3.png` | `심사 주의` / `기존부채 · LTV` | 실제 심사 차이와 주의사항 | Income/debt/LTV/cash flow cards |
| `dsr-40-income-loan-limit-table` | en | `public/images/posts/dsr-40-income-loan-limit-table/cover-en.png` | `DSR 40%` / `Income · Loan Capacity` | Cover: DSR 40% capacity table | Loan-capacity line chart, DSR/rate cards |
| `dsr-40-income-loan-limit-table` | en | `public/images/posts/dsr-40-income-loan-limit-table/img1-en.png` | `Income Capacity` / `DSR 40% · 4% rate` | Core income capacity table | Income bar chart, 30Y/rate cards |
| `dsr-40-income-loan-limit-table` | en | `public/images/posts/dsr-40-income-loan-limit-table/img2-en.png` | `Payment Room` / `Monthly payment · 30Y` | DSR payment-capacity structure | Income → DSR → payment → loan flow |
| `dsr-40-income-loan-limit-table` | en | `public/images/posts/dsr-40-income-loan-limit-table/img3-en.png` | `Underwriting Check` / `Existing debt · LTV` | Real underwriting caveat | Income/debt/LTV/cash flow cards |
| `interest-rate-1p-loan-limit-impact` | ko | `public/images/posts/interest-rate-1p-loan-limit-impact/cover.png` | `Rate Shock` / `+1pp · Loan Capacity` | Cover: 금리 1%p와 대출 가능액 | Declining loan-capacity line, DSR cards |
| `interest-rate-1p-loan-limit-impact` | ko | `public/images/posts/interest-rate-1p-loan-limit-impact/img1.png` | `금리별 한도` / `3%~6% · DSR 40%` | 금리별 대출 가능액 핵심 표 | 3/4/5/6% bar chart, drop panel |
| `interest-rate-1p-loan-limit-impact` | ko | `public/images/posts/interest-rate-1p-loan-limit-impact/img2.png` | `3억원 상환액` / `월 부담 · 금리 차이` | 같은 3억원 대출의 월 상환액 비교 | Monthly payment bar chart, cash-flow cards |
| `interest-rate-1p-loan-limit-impact` | ko | `public/images/posts/interest-rate-1p-loan-limit-impact/img3.png` | `스트레스 테스트` / `+1%p · 현금흐름` | 실전 금리 스트레스 해석 | Base rate → shock → payment → buffer flow |
| `interest-rate-1p-loan-limit-impact` | en | `public/images/posts/interest-rate-1p-loan-limit-impact/cover-en.png` | `Rate Shock` / `+1pp · Loan Capacity` | Cover: rate shock and borrowing capacity | Declining loan-capacity line, DSR cards |
| `interest-rate-1p-loan-limit-impact` | en | `public/images/posts/interest-rate-1p-loan-limit-impact/img1-en.png` | `Rate Capacity` / `3%~6% · DSR 40%` | Core rate-capacity table | 3/4/5/6% bar chart, drop panel |
| `interest-rate-1p-loan-limit-impact` | en | `public/images/posts/interest-rate-1p-loan-limit-impact/img2-en.png` | `Same Loan` / `KRW 300M · monthly payment` | Same-principal monthly payment comparison | Monthly payment bar chart, cash-flow cards |
| `interest-rate-1p-loan-limit-impact` | en | `public/images/posts/interest-rate-1p-loan-limit-impact/img3-en.png` | `Stress Test` / `+1pp · cash flow` | Practical rate shock interpretation | Base rate → shock → payment → buffer flow |

## File Validation

- All files are PNG.
- All files are 1600x900.
- All cover and body image paths are referenced from the matching post files.
- Referenced image paths in the 8 post files were checked against `public/images/posts/...`; no missing local PNG was found.
- Total generated PNG count: 32.
- Local render spot checks:
  - `compound-return-3-5-7-10-table/img2.png`
  - `interest-rate-1p-loan-limit-impact/cover-en.png`
- `npm.cmd run build` passed after wiring the new cover and body images.
- `git diff --check` passed with CRLF conversion warnings only for sitemap files.

## Notes

- Covers are keyword-first and do not render long article titles.
- Korean covers intentionally use English keyword text only.
- Korean `img1~img3` use short Korean display titles and one short keyword line.
- English `img1~img3` use short English display titles and one short keyword line.
- Images are local assets intended for Cloudinary upload later if needed.
