# Finmap 부동산 대시보드 신규 글 이미지 패키지 감사 리포트

작성일: 2026-06-03

## 1. 작업 요약

부동산 대시보드 신규 콘텐츠 3개 slug의 KO/EN 포스트에 대해 SVG 템플릿 기반 PNG 이미지 패키지를 생성했습니다. 최초에는 각 포스트의 frontmatter `cover`와 본문 `img1~img3` 참조를 로컬 PNG 경로로 연결했고, 이후 최종 원고 참조는 Cloudinary URL로 교체했습니다.

AI 이미지 렌더링은 사용하지 않았고, `scripts/generate_real_estate_image_package.js`에서 SVG를 구성한 뒤 `sharp`로 1600x900 PNG로 변환했습니다.

로컬 PNG 24개와 생성 스크립트는 삭제하지 않고 보존했습니다. 현재 워크트리에서 확인된 Cloudinary 업로드용 로컬 PNG 사본은 `images-to-upload/`에 24개입니다.

## 2. 생성 스크립트

생성 스크립트:

- `scripts/generate_real_estate_image_package.js`

생성 방식:

- SVG 템플릿 렌더링
- `sharp(Buffer.from(svg)).resize(1600, 900).png(...)`
- 밝은 배경, 네이비/블루/그린 포인트
- 카드, 막대, 게이지, 비교 패널, 체크리스트 등 대시보드 인포그래픽 요소 사용
- 커버는 영어 keyword-only
- 본문 이미지는 짧은 display title + keyword line 1줄 중심
- 워터마크, 로고, 저작권 문구 제거

## 3. 생성 PNG 목록

총 24개 PNG가 생성되었습니다.

### `how-to-read-apartment-transaction-prices`

- `public/images/posts/how-to-read-apartment-transaction-prices/cover.png`
- `public/images/posts/how-to-read-apartment-transaction-prices/img1.png`
- `public/images/posts/how-to-read-apartment-transaction-prices/img2.png`
- `public/images/posts/how-to-read-apartment-transaction-prices/img3.png`
- `public/images/posts/how-to-read-apartment-transaction-prices/cover-en.png`
- `public/images/posts/how-to-read-apartment-transaction-prices/img1-en.png`
- `public/images/posts/how-to-read-apartment-transaction-prices/img2-en.png`
- `public/images/posts/how-to-read-apartment-transaction-prices/img3-en.png`

### `apartment-transaction-volume-decline-meaning`

- `public/images/posts/apartment-transaction-volume-decline-meaning/cover.png`
- `public/images/posts/apartment-transaction-volume-decline-meaning/img1.png`
- `public/images/posts/apartment-transaction-volume-decline-meaning/img2.png`
- `public/images/posts/apartment-transaction-volume-decline-meaning/img3.png`
- `public/images/posts/apartment-transaction-volume-decline-meaning/cover-en.png`
- `public/images/posts/apartment-transaction-volume-decline-meaning/img1-en.png`
- `public/images/posts/apartment-transaction-volume-decline-meaning/img2-en.png`
- `public/images/posts/apartment-transaction-volume-decline-meaning/img3-en.png`

### `large-apartment-complex-households-price-stability`

- `public/images/posts/large-apartment-complex-households-price-stability/cover.png`
- `public/images/posts/large-apartment-complex-households-price-stability/img1.png`
- `public/images/posts/large-apartment-complex-households-price-stability/img2.png`
- `public/images/posts/large-apartment-complex-households-price-stability/img3.png`
- `public/images/posts/large-apartment-complex-households-price-stability/cover-en.png`
- `public/images/posts/large-apartment-complex-households-price-stability/img1-en.png`
- `public/images/posts/large-apartment-complex-households-price-stability/img2-en.png`
- `public/images/posts/large-apartment-complex-households-price-stability/img3-en.png`

## 4. 이미지 의도

| slug | image | intent |
| --- | --- | --- |
| `how-to-read-apartment-transaction-prices` | cover | `REAL ESTATE DATA / MEDIAN · AVERAGE / UNIT PRICE / VOLUME` 키워드 중심 커버 |
| `how-to-read-apartment-transaction-prices` | img1 | 평균가, 중앙값, 평단가, 거래량을 한 세트로 읽는 구조 |
| `how-to-read-apartment-transaction-prices` | img2 | 고가 1건이 평균을 흔들 수 있다는 median vs average 시각화 |
| `how-to-read-apartment-transaction-prices` | img3 | 지역 → 기간 → 평형 → 가격 → 거래량 순서 시각화 |
| `apartment-transaction-volume-decline-meaning` | cover | `TRANSACTION VOLUME / LIQUIDITY / SAMPLE SIZE / PRICE SIGNAL` 키워드 중심 커버 |
| `apartment-transaction-volume-decline-meaning` | img1 | 줄어드는 거래량과 유동성 게이지 |
| `apartment-transaction-volume-decline-meaning` | img2 | 표본수 부족이 평균/중앙값을 왜곡할 수 있다는 경고 카드 |
| `apartment-transaction-volume-decline-meaning` | img3 | MoM, YoY, 3~6개월 비교 프레임 |
| `large-apartment-complex-households-price-stability` | cover | `HOUSEHOLDS / LARGE COMPLEX / VOLUME / UNIT PRICE` 키워드 중심 커버 |
| `large-apartment-complex-households-price-stability` | img1 | 세대수와 거래 표본/비교 가능성 |
| `large-apartment-complex-households-price-stability` | img2 | 대단지 내부 평형·동·층 차이 분리 |
| `large-apartment-complex-households-price-stability` | img3 | 세대수 + 거래량 + 평단가 + 가격분포 체크리스트 |

## 5. 포스트 삽입 위치

### `content/posts/personalFinance/ko/how-to-read-apartment-transaction-prices.md`

- `cover`: `https://res.cloudinary.com/dwonflmnn/image/upload/v1780496410/blog/insight/how_cover.png`
- `img1`: 한눈에 보는 요약 뒤, 용어/지표 설명 표 앞
- `img2`: 평균가와 중앙값 차이 설명 뒤
- `img3`: 대시보드에서 확인하는 순서 앞

### `content/posts/personalFinance/en/how-to-read-apartment-transaction-prices.md`

- `cover`: `https://res.cloudinary.com/dwonflmnn/image/upload/v1780496409/blog/insight/how_cover-en.png`
- `img1`: Quick Summary 뒤, Terms And Metrics 앞
- `img2`: Median vs Average 설명 뒤
- `img3`: Dashboard Reading Order 앞

### `content/posts/personalFinance/ko/apartment-transaction-volume-decline-meaning.md`

- `cover`: `https://res.cloudinary.com/dwonflmnn/image/upload/v1780496403/blog/insight/apt_cover.png`
- `img1`: 한눈에 보는 요약 뒤, 용어/지표 설명 표 앞
- `img2`: 표본수 감소 해석 설명 뒤
- `img3`: 전월/전년동월 비교 설명 뒤

### `content/posts/personalFinance/en/apartment-transaction-volume-decline-meaning.md`

- `cover`: `https://res.cloudinary.com/dwonflmnn/image/upload/v1780496402/blog/insight/apt_cover-en.png`
- `img1`: Quick Summary 뒤, Terms And Metrics 앞
- `img2`: small sample 설명 뒤
- `img3`: Month-Over-Month vs. Year-Over-Year 설명 뒤

### `content/posts/personalFinance/ko/large-apartment-complex-households-price-stability.md`

- `cover`: `https://res.cloudinary.com/dwonflmnn/image/upload/v1780496418/blog/insight/large_cover.png`
- `img1`: 한눈에 보는 요약 뒤, 용어/지표 설명 표 앞
- `img2`: 대단지의 착시 설명 뒤
- `img3`: 대단지와 소규모 단지 비교 체크리스트 앞

### `content/posts/personalFinance/en/large-apartment-complex-households-price-stability.md`

- `cover`: `https://res.cloudinary.com/dwonflmnn/image/upload/v1780496417/blog/insight/large_cover-en.png`
- `img1`: Quick Summary 뒤, Terms And Metrics 앞
- `img2`: The Illusion Inside Large Complexes 설명 뒤
- `img3`: Checklist: Large vs. Smaller Complexes 앞

## 6. 검증 결과

### PNG 수 확인

명령:

```bash
node scripts\generate_real_estate_image_package.js
rg --files -uu images-to-upload
```

결과:

- 생성 스크립트는 24개 PNG를 만들도록 유지됨
- 현재 Cloudinary 업로드용 로컬 PNG 사본 24개는 `images-to-upload/`에서 확인됨
- 최종 포스트 본문과 frontmatter는 로컬 PNG가 아니라 Cloudinary URL을 참조함

### PNG 크기 확인

명령:

```bash
node scripts\generate_real_estate_image_package.js
```

결과:

- `Generated 24 PNG files`
- 모든 파일이 `1600x900`으로 출력됨

### 포스트 cover/frontmatter 확인

명령:

```bash
rg -n "^cover:" content/posts/personalFinance/ko/how-to-read-apartment-transaction-prices.md content/posts/personalFinance/en/how-to-read-apartment-transaction-prices.md content/posts/personalFinance/ko/apartment-transaction-volume-decline-meaning.md content/posts/personalFinance/en/apartment-transaction-volume-decline-meaning.md content/posts/personalFinance/ko/large-apartment-complex-households-price-stability.md content/posts/personalFinance/en/large-apartment-complex-households-price-stability.md
```

결과:

- 6개 포스트 모두 Cloudinary `cover` URL로 변경됨

### 본문 이미지 삽입 확인

명령:

```bash
rg -n "res.cloudinary.com/dwonflmnn/image/upload/v17804964" content/posts/personalFinance/...
```

결과:

- 6개 포스트 모두 본문에 Cloudinary `img1`, `img2`, `img3` 삽입 확인
- KO 포스트는 `*_img1.png`, `*_img2.png`, `*_img3.png`
- EN 포스트는 `*_img1-en.png`, `*_img2-en.png`, `*_img3-en.png`

### 시각 확인

대표 확인 파일:

- `images-to-upload/how_img1.png`
- `images-to-upload/apt_cover.png`

확인 내용:

- 1600x900 비율 정상
- 밝은 배경, 네이비/블루/그린 포인트 정상
- 한국어 텍스트 정상 렌더링
- 커버는 영어 keyword-only
- 워터마크/로고/저작권 문구 없음

### build 결과

명령:

```bash
npm.cmd run build
```

결과:

- 성공
- `next build --webpack` 컴파일 성공
- 정적 페이지 생성 성공: `209/209`
- `postbuild`의 `next-sitemap` 생성 성공

### git diff --check 결과

명령:

```bash
git diff --check
```

결과:

- exit code 0
- whitespace error 없음
- 경고: `public/sitemap-0.xml`, `public/sitemap.xml`의 LF가 Git 처리 시 CRLF로 바뀔 수 있다는 line-ending 경고 출력

## 7. sitemap 영향

이미 신규 포스트 URL 6개는 sitemap에 포함되어 있습니다.

확인된 URL:

- `https://www.finmaphub.com/posts/personalFinance/apartment-transaction-volume-decline-meaning`
- `https://www.finmaphub.com/posts/personalFinance/how-to-read-apartment-transaction-prices`
- `https://www.finmaphub.com/posts/personalFinance/large-apartment-complex-households-price-stability`
- `https://www.finmaphub.com/en/posts/personalFinance/apartment-transaction-volume-decline-meaning`
- `https://www.finmaphub.com/en/posts/personalFinance/how-to-read-apartment-transaction-prices`
- `https://www.finmaphub.com/en/posts/personalFinance/large-apartment-complex-households-price-stability`

`npm.cmd run build` 실행으로 `postbuild`의 `next-sitemap`이 다시 실행되어 `public/sitemap-0.xml`은 수정 상태입니다. 이번 Cloudinary 이미지 URL 교체는 sitemap URL 구조에 직접 영향을 주지 않았고, 확인된 sitemap 변경은 신규 포스트 URL 반영 및 build 시점의 `lastmod` 재생성 영향입니다.

## 8. Cloudinary URL 반영

### 반영 대상 포스트

- `content/posts/personalFinance/ko/how-to-read-apartment-transaction-prices.md`
- `content/posts/personalFinance/en/how-to-read-apartment-transaction-prices.md`
- `content/posts/personalFinance/ko/apartment-transaction-volume-decline-meaning.md`
- `content/posts/personalFinance/en/apartment-transaction-volume-decline-meaning.md`
- `content/posts/personalFinance/ko/large-apartment-complex-households-price-stability.md`
- `content/posts/personalFinance/en/large-apartment-complex-households-price-stability.md`

### URL 매핑 요약

Cloudinary 공통 경로:

- `https://res.cloudinary.com/dwonflmnn/image/upload/`

| slug | KO assets | EN assets |
| --- | --- | --- |
| `how-to-read-apartment-transaction-prices` | `v1780496410/blog/insight/how_cover.png`, `v1780496412/blog/insight/how_img1.png`, `v1780496414/blog/insight/how_img2.png`, `v1780496416/blog/insight/how_img3.png` | `v1780496409/blog/insight/how_cover-en.png`, `v1780496411/blog/insight/how_img1-en.png`, `v1780496413/blog/insight/how_img2-en.png`, `v1780496415/blog/insight/how_img3-en.png` |
| `apartment-transaction-volume-decline-meaning` | `v1780496403/blog/insight/apt_cover.png`, `v1780496405/blog/insight/apt_img1.png`, `v1780496407/blog/insight/apt_img2.png`, `v1780496409/blog/insight/apt_img3.png` | `v1780496402/blog/insight/apt_cover-en.png`, `v1780496404/blog/insight/apt_img1-en.png`, `v1780496406/blog/insight/apt_img2-en.png`, `v1780496408/blog/insight/apt_img3-en.png` |
| `large-apartment-complex-households-price-stability` | `v1780496418/blog/insight/large_cover.png`, `v1780496419/blog/insight/large_img1.png`, `v1780496422/blog/insight/large_img2.png`, `v1780496424/blog/insight/large_img3.png` | `v1780496417/blog/insight/large_cover-en.png`, `v1780496419/blog/insight/large_img1-en.png`, `v1780496420/blog/insight/large_img2-en.png`, `v1780496423/blog/insight/large_img3-en.png` |

### 반영 검증

명령:

```bash
rg -n "^cover:|res.cloudinary.com/dwonflmnn/image/upload/v17804964|/images/posts/(how-to-read-apartment-transaction-prices|apartment-transaction-volume-decline-meaning|large-apartment-complex-households-price-stability)/" content/posts/personalFinance/ko/how-to-read-apartment-transaction-prices.md content/posts/personalFinance/en/how-to-read-apartment-transaction-prices.md content/posts/personalFinance/ko/apartment-transaction-volume-decline-meaning.md content/posts/personalFinance/en/apartment-transaction-volume-decline-meaning.md content/posts/personalFinance/ko/large-apartment-complex-households-price-stability.md content/posts/personalFinance/en/large-apartment-complex-households-price-stability.md
```

결과:

- 6개 포스트의 `cover`와 본문 이미지 18개가 모두 Cloudinary URL로 확인됨
- 대상 slug의 로컬 `/images/posts/{slug}/...` 참조는 남아 있지 않음
- 로컬 PNG 24개(`images-to-upload/`)와 `scripts/generate_real_estate_image_package.js`는 삭제하지 않음

## 9. 최종 검증

### build

명령:

```bash
npm.cmd run build
```

결과:

- 성공
- `next build --webpack` 컴파일 성공
- 정적 페이지 생성 성공: `209/209`
- `postbuild`의 `next-sitemap` 생성 성공

### git diff --check

명령:

```bash
git diff --check
```

결과:

- exit code 0
- whitespace error 없음
- 경고: `public/sitemap-0.xml`, `public/sitemap.xml`의 LF가 Git 처리 시 CRLF로 바뀔 수 있다는 line-ending 경고 출력
