# FinMap Blog Image Tone & Prompt Guide (v2 — Hard Constraints)

> 목적: 블로그 카테고리(재테크/경제정보/투자정보)별 **일관된 이미지 톤**을 고정하고,  
> 앞으로 `category`와 `title`만 주면 **이 문서 기준으로 커버/요약 이미지를 생성**할 수 있도록 **강제 규칙(하드 제약)** + 템플릿을 제공한다.

---

## 0) 운영 방식 (권장 입력 포맷)

```yaml
category: 재테크 | 경제정보 | 투자정보
type: cover | img1 | img2 | img3
title: "한글 가능 (참고용)"
(optional)alt: "type이 img1, img2, img3...에 해당하는 경우에만 이미지 생성시 참조"
(optional)figcaption: 'type이 img1, img2, img3...에 해당하는 경우에만 이미지 생성시 참조'
# cover는 아래를 강력 권장 (텍스트 통제 핵심)
keywords_en: ["", "", ""]   # 3~6개, 영어 대문자 권장. 없으면 title에서 추출.
# summary는 아래 중 택1
text_en_title: "..."        # 영어만, 짧게
text_en_sub: "..."          # 영어만, 6~10 단어 이내 권장
(optional) concept: "..."   # 참고용(이미지에 넣지 않음)
(optional) steps_en: ["A","B","C","D"]  # img2 흐름용
(optional) table_en:         # img3 비교표/체크리스트용
  headers: ["LEFT","RIGHT"]
  rows: [["...","..."],["...","..."],["...","..."],["...","..."]]

```

---

## 1) 텍스트/언어 하드 제약 (가장 중요)

### ✅ 전 카테고리 공통: 이미지 내부 텍스트 정책
- **ENGLISH ONLY.**
- **NO KOREAN.**
- **NO lorem ipsum / no gibberish / no filler text.**
- **NO paragraphs.** (장문 금지)
- **폰트는 크게, 텍스트는 적게.**

### ✅ Cover(커버) 텍스트 정책
- **문장 금지**
- **키워드 3~6개만**
- 권장 표기: `KEYWORD • KEYWORD • KEYWORD`
- (선택) **짧은 영어 타이틀(≤ 6 words)** 1줄만 허용

### ✅ Summary(img1~img3) 텍스트 정책
- 영어만
- 문장 가능하나 **짧게**: 6~10 단어/문장, 2줄 이내 권장
- 핵심은 **라벨/불릿/표**로 전달

---

## 2) 공통 브랜드 레이아웃 (고정)

- **Top-left:** Category pill (영어 라벨)
  - Personal Finance / Macro & Economy / Investing
- **Left:** Title or Keywords block (영어)
- **Right:** 메인 그래픽 1개 (도식/추상 그래프)
- **Shape:** Rounded cards (24px radius), soft shadow, grid-aligned
- **Avoid:** 과도한 장식, 복잡 배경, 트레이딩 UI 복제, 작은 글씨로 장문

---

## 3) 톤 분리 하드 제약 (카테고리끼리 “절대 비슷해지지 않게”)

### A) 재테크(Personal Finance) — Warm
- Background: **cream/off-white** + soft gradient + subtle grain OK
- Accent: **sage green** (main) + muted coral (optional)
- Icons: checklist, calendar, jar, goal bar (minimal)
- **금지:** 다크 배경, 네온 글로우, 금융 거래 UI 느낌

### B) 경제정보(Macro & Economy) — Bright / Textbook
- Background: **BRIGHT white/light-gray only**
- Accent: **navy/blue only** (no neon)
- Style: **flat vector infographic**, crisp lines, minimal elements
- **필수:** **No dark/black background. No glow. No cinematic lighting.**
- Icons: axes, nodes & arrows, 2x2 drivers grid, comparison table
- **금지:** 투자정보처럼 유리(Glass)/네온/다크 프리미엄 톤

### C) 투자정보(Investing) — Dark / Premium
- Background: **deep navy/charcoal** + subtle gradient + fine grain
- Accent: **ONE neon accent only** (lime OR orange) — 과사용 금지
- Style: glass-like cards, soft glow (minimal)
- Graphics: price wave, risk band, probability curve (abstract)
- **금지:** 경제정보처럼 화이트 교과서 톤

---

## 4) 출력 규격 (고정)

- **Cover:** 1200×630
- **Summary:** 1600×900 (16:9)

---

# CATEGORY PROMPT TEMPLATES (v2)

> 아래 템플릿은 “그대로” 사용하되, 변수만 바꾼다.  
> **중요:** 템플릿 안의 하드 제약 문장을 절대 삭제하지 않는다.

---

## A) 재테크 (Personal Finance)

### Cover (1200×630)
```
FinMap blog cover image, category: Personal Finance.
Warm minimal infographic. Cream/off-white background with soft gradient and subtle paper grain.
Rounded card UI (24px radius), soft shadow, grid aligned.
Top-left pill label: "Personal Finance".

TEXT POLICY: English only. No Korean. No lorem ipsum. No paragraphs.
COVER TEXT: keywords only (3–6). No sentences.

Center-left big keywords line: [KEYWORDS_EN].
Optional small sub-keywords (keywords only): [SUBKEYWORDS_EN].

Right side: clean minimal icons (checklist, calendar, savings jar, goal bar), modern, not cartoon.
High contrast, mobile readable. 1200x630.
```

### img1 (Definition / Principle) — 1600×900
```
FinMap inline summary image (img1), category: Personal Finance.
Warm cream background, soft gradient, subtle grain.
TEXT POLICY: English only. No Korean. No lorem ipsum. No paragraphs.

Title top (English): [TEXT_EN_TITLE].
Center: one rounded card with a simple 3-node diagram:
Goal → Rule → Habit (icons + short labels).
Subline (English, <= 10 words): [TEXT_EN_SUB].
Whitespace, mobile-first. 1600x900.
```

### img2 (Flow / Chain) — 1600×900
```
FinMap inline summary image (img2), category: Personal Finance.
Off-white + warm gray + sage accent.
TEXT POLICY: English only. No Korean. No lorem ipsum. No paragraphs.

Title top: [TEXT_EN_TITLE].
Left-to-right flow with 4 rounded cards and thin arrows:
[STEP1] → [STEP2] → [STEP3] → [STEP4].
Each card: icon + 1–3 English words. 1600x900.
```

### img3 (Checklist) — 1600×900
```
FinMap inline summary image (img3), category: Personal Finance.
Cream background, subtle grain.
TEXT POLICY: English only. No Korean. No lorem ipsum. No paragraphs.

Title top: [TEXT_EN_TITLE].
Main: checklist card with 5 rows (icon + short English line).
Optional Do vs Don't split (green vs muted coral).
Keep lines short. 1600x900.
```

---

## B) 경제정보 (Macro & Economy)

### Cover (1200×630)
```
FinMap blog cover image, category: Macro & Economy.
STYLE: clean textbook infographic, flat vector, crisp lines.
BACKGROUND POLICY: bright white/light-gray ONLY. No dark/black. No glow. No neon.
ACCENT POLICY: navy/blue ONLY.

TEXT POLICY: English only. No Korean. No lorem ipsum. No paragraphs.
COVER TEXT: keywords only (3–6). No sentences.

Top-left pill label: "Macro & Economy".
Center-left big keywords line: [KEYWORDS_EN].
Optional small sub-keywords (keywords only): [SUBKEYWORDS_EN].

Right side: ONE clear diagram only (choose one):
(1) 3-node chain A → B → C, or
(2) 2x2 drivers grid, or
(3) compact comparison table.
Minimal elements, lots of whitespace. 1200x630.
```

### img1 (Concept / One Diagram) — 1600×900
```
FinMap inline summary image (img1), category: Macro & Economy.
STYLE: flat vector infographic, crisp navy/blue lines.
BACKGROUND POLICY: bright white/light-gray ONLY. No dark/black. No glow. No neon.
TEXT POLICY: English only. No Korean. No lorem ipsum. No paragraphs.

Title top: [TEXT_EN_TITLE].
Center: single 3-node diagram with arrows: A → B → C (icons + short labels).
Caption (English, <= 8 words): [TEXT_EN_SUB].
Grid-aligned, minimal, whitespace. 1600x900.
```

### img2 (4 Drivers) — 1600×900
```
FinMap inline summary image (img2), category: Macro & Economy.
BACKGROUND POLICY: bright white/light-gray ONLY. No dark/black. No glow. No neon.
ACCENT: navy/blue.
TEXT POLICY: English only. No Korean. No lorem ipsum. No paragraphs.

Title top: [TEXT_EN_TITLE].
2x2 grid of four rounded cards (subtle shadow).
Each card: icon + short label + tiny sublabel (English).
No long text. 1600x900.
```

### img3 (Comparison Table) — 1600×900
```
FinMap inline summary image (img3), category: Macro & Economy.
BACKGROUND POLICY: bright white/light-gray ONLY. No dark/black. No glow. No neon.
ACCENT: navy/blue.
TEXT POLICY: English only. No Korean. No lorem ipsum. No paragraphs.

Title top: [TEXT_EN_TITLE].
Main: two-column comparison table card, 4 rows.
Headers: [LEFT_HEADER] vs [RIGHT_HEADER].
Each row: icon + short label (English). Clean dividers. 1600x900.
```

---

## C) 투자정보 (Investing)

### Cover (1200×630)
```
FinMap blog cover image, category: Investing.
STYLE: dark premium market mood.
BACKGROUND: deep navy/charcoal with subtle gradient + fine grain.
ACCENT: ONE neon accent only (lime OR orange), used sparingly.

TEXT POLICY: English only. No Korean. No lorem ipsum. No paragraphs.
COVER TEXT: keywords only (3–6). No sentences.

Top-left pill label: "Investing".
Center-left big keywords line: [KEYWORDS_EN].
Optional small sub-keywords: [SUBKEYWORDS_EN].

Right side: abstract market graphic only (price wave + risk band or probability curve),
NOT a trading UI. Glass-like cards, soft glow minimal. 1200x630.
```

### img1 (Risk/Return Frame) — 1600×900
```
FinMap inline summary image (img1), category: Investing.
Dark navy background, subtle grain. ONE neon accent.
TEXT POLICY: English only. No Korean. No lorem ipsum. No paragraphs.

Title top: [TEXT_EN_TITLE].
Center: simple risk-reward plane or scale with 2–3 labeled points.
Subline (English, <= 10 words): [TEXT_EN_SUB].
Minimal labels, glass-style legend. 1600x900.
```

### img2 (Strategy Flow) — 1600×900
```
FinMap inline summary image (img2), category: Investing.
Dark gradient background, subtle grain. ONE neon accent line.
TEXT POLICY: English only. No Korean. No lorem ipsum. No paragraphs.

Title top: [TEXT_EN_TITLE].
Left-to-right flow with 4 glass cards:
[STEP1] → [STEP2] → [STEP3] → [STEP4].
Footer note (English, <= 6 words): [FOOTER_NOTE].
Clean, minimal. 1600x900.
```

### img3 (Risk Guardrails) — 1600×900
```
FinMap inline summary image (img3), category: Investing.
Dark navy background, subtle grain. ONE neon accent.
TEXT POLICY: English only. No Korean. No lorem ipsum. No paragraphs.

Title top: [TEXT_EN_TITLE].
Main: "Risk Guardrails" card with 5 rows.
Each row: icon + short English line + tiny numeric placeholder (optional).
No paragraphs. 1600x900.
```

---

## 5) 키워드 생성 규칙 (title → keywords_en)

1) 제목에서 핵심 명사 3~6개 추출  
2) 영어로 치환  
3) 프레임 단어 1~2개 추가(권장): CHECKLIST / FRAMEWORK / RULE / THRESHOLD / SCORE  
4) 표기 통일: `KEYWORD • KEYWORD • KEYWORD` (대문자 권장)

예시:
- `HIGH RATES • DEBT VS INVEST • AFTER-TAX RATE • THRESHOLD RULE • CASHFLOW RISK`
- `INFLATION • POLICY RATE • BOND YIELDS • TERM PREMIUM`
- `RISK CONTROL • POSITION SIZE • DRAWDOWN • REBALANCE`

---

## 6) 품질 검수 체크리스트

- [ ] 이미지 안 텍스트가 **영어만**인가? (한글 0%)
- [ ] 의미 없는 더미 텍스트가 없는가?
- [ ] Cover는 **문장 없이 키워드 3~6개만** 있는가?
- [ ] 경제정보는 **밝은 배경 + 네이비/블루 + 플랫**인가? (다크/네온/글로우 금지)
- [ ] 투자정보는 **다크 + 네온 1색 + 추상 그래프**인가?
- [ ] 재테크는 **웜톤 + 습관 아이콘**인가?
- [ ] 모바일에서 읽히는 크기인가?
- [ ] 도식이 1개로 명확한가?

---

## 7) 유지보수 메모
- 새 아이콘/팔레트 추가는 “그래픽 모티프/팔레트” 항목만 확장
- 템플릿 본문(하드 제약)은 가급적 고정(일관성 유지)
