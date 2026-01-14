# FinMap Blog Image Tone & Prompt Guide (Categories + Cover/Summary Rules)

> 목적: 블로그 카테고리(재테크/경제정보/투자정보)별 **일관된 이미지 톤**을 고정하고,  
> 앞으로 `category`와 `title`만 주면 **이 문서 기준으로 커버/요약 이미지를 생성**할 수 있도록 규칙과 템플릿을 제공한다.

---

## 0) 사용 방식 (운영 규칙)

### 입력 포맷 (권장)
아래처럼 요청하면, 시스템은 **해당 카테고리 섹션의 규칙 + 템플릿**을 적용해 프롬프트를 만든다.

```yaml
category: 경제정보 | 재테크 | 투자정보
title: "..."               # 글 제목 (한글 가능)
type: cover | img1 | img2 | img3
(optional) topic_keywords: ["", "", ""]   # 3~6개 추천 (없으면 title로부터 추출)
(optional) concept: "..."                 # 요약 이미지에서 다룰 핵심 개념(짧게)
```

### 텍스트 언어 규칙 (중요)
- **Cover(커버)**: 이미지 안 텍스트는 **영어만**, **문장 금지**, **키워드 3~6개**만 표시
  - 예: `EMERGENCY FUND • RISK SCORE • DEBT • DEPENDENTS`
- **Summary(img1~img3)**: 이미지 안 텍스트는 **영어만**
  - 문장 가능하나 **짧게**(권장: 한 문장 6~10 단어 이내, 2줄 이내)
  - 표/라벨/불릿 중심 운영 권장

---

## 1) 공통 브랜드 규칙 (카테고리 상관없이 고정)

### 레이아웃(고정)
- **좌상단**: Category pill (영어 라벨)  
  - Personal Finance / Macro & Economy / Investing
- **좌측 중앙**: Title(또는 Keywords) 영역
- **우측**: 카테고리 톤에 맞는 메인 그래픽(도식/추상 그래프) 1개
- **형태 고정**: Rounded cards (24px radius), soft shadow, grid-aligned

### 타이포(고정)
- 산세리프, 숫자 가독성 좋은 스타일
- 대비 강하게(배경 대비 4.5:1 이상 체감)

### 금지 사항(공통)
- 과도한 장식/복잡한 배경
- 작은 글씨로 긴 문장
- 로고처럼 보이는 타 브랜드(티커/거래소 UI 복제 등)
- 캔들차트/트레이딩 화면 “그대로” 느낌(투자정보에서도 **추상화**)

---

## 2) Cover Image 규칙 (OG/썸네일용)

### 권장 규격
- 1200 × 630 (고정)

### 커버 텍스트 규칙
- 영어만, **키워드 3~6개**, 문장 금지
- Title을 그대로 넣고 싶으면 **짧은 영어 제목(최대 6단어)**로 리라이트
- “FinMap” 워터마크는 선택(너무 크게 금지)

### 커버 구성 템플릿 (고정)
- Category pill: 좌상단
- Keywords line: 중앙 좌측 (굵게)
- Sub keywords (optional): 1줄 (얇게)
- Main visual: 우측 1도식/추상 그래픽

---

## 3) Summary Images 규칙 (img1/img2/img3)

### 권장 규격
- 1600 × 900 (16:9 고정)

### 텍스트 규칙
- 영어만
- 문장 가능하지만 짧게 (권장: 6~10 단어/문장, 2줄 이내)
- 핵심은 **라벨/불릿/표**로 전달

### 3장 세트 역할(고정)
- **img1:** 개념 정의/핵심 원칙 (1도식)
- **img2:** 원인→경로→결과 흐름(체인)
- **img3:** 실전 체크리스트/주의(가드레일)

---

# CATEGORY GUIDES

---

## A) 재테크 (Personal Finance)

### 톤 키워드
Warm • Practical • Habit • Calm • Real-life

### 팔레트/무드
- Background: cream/off-white, soft gradient
- Accent: sage green (stability) + muted coral (warning, optional)
- Texture: subtle paper grain OK (과하지 않게)

### 그래픽 모티프(추천)
Checklist • Calendar • Goal bar • Savings jar • Budget pie (minimal)

### Cover Prompt Template (1200×630)
> 아래 템플릿에서 `[KEYWORDS]`만 바꿔서 사용

```
FinMap blog cover image, category: Personal Finance.
Warm minimal infographic style. Cream/off-white background with soft gradient and subtle paper grain.
Rounded card UI elements (24px radius), soft shadow, grid layout.
Top-left small pill label: "Personal Finance".
Center-left: big keywords line (English only, no sentences): [KEYWORDS].
Optional small sub-keywords line (English only): [SUBKEYWORDS].
Right side: clean vector icons representing money habits (checklist + calendar + savings jar), modern, not cartoon.
High contrast, mobile readable. 1200x630.
```

### Summary Prompt Templates (1600×900)

#### img1 (Definition / Principle)
```
FinMap inline summary image (img1), Personal Finance tone.
Warm cream background, soft gradient, subtle grain.
Title top (English): [TITLE_SHORT].
Center: one rounded card with a simple 3-part rule diagram:
Goal → Rule → Habit (3 nodes, icons + labels).
Keep labels short and English only.
Whitespace, mobile-first. 1600x900.
```

#### img2 (Flow / Chain)
```
FinMap inline summary image (img2), Personal Finance tone.
Off-white + warm gray + sage accent.
Left-to-right flow with 4 rounded cards and thin arrows:
[STEP1] → [STEP2] → [STEP3] → [STEP4].
Each card: one icon + 1–3 English words.
No clutter. 1600x900.
```

#### img3 (Checklist / Mistakes)
```
FinMap inline summary image (img3), Personal Finance tone.
Cream background, subtle grain.
Title top (English): [TITLE_SHORT].
Main: checklist card with 5 rows (icon + short English line).
Optional split: Do vs Don't (subtle green vs muted coral accent).
No long sentences. 1600x900.
```

---

## B) 경제정보 (Macro & Economy)

### 톤 키워드
Clean • Structured • Textbook • Explainable • Trust

### 팔레트/무드
- Background: white/light gray (노이즈 최소)
- Accent: navy/blue (신뢰)
- Style: flat infographic, crisp lines

### 그래픽 모티프(추천)
Axes • Nodes & arrows • 2x2 drivers grid • Comparison table

### Cover Prompt Template (1200×630)
```
FinMap blog cover image, category: Macro & Economy.
Clean textbook-style infographic. White/light-gray background, crisp navy/blue accents.
Top-left pill label: "Macro & Economy".
Center-left: big keywords line (English only, no sentences): [KEYWORDS].
Optional small sub-keywords line: [SUBKEYWORDS].
Right side: one clear diagram (simple chain or drivers grid) using thin lines and arrows.
Flat vector, minimal. High contrast. 1200x630.
```

### Summary Prompt Templates (1600×900)

#### img1 (Concept / One Diagram)
```
FinMap inline summary image (img1), Macro & Economy.
White background, navy/blue accent.
Title top (English): [TITLE_SHORT].
Center: single diagram with 3 nodes connected by arrows: A → B → C.
Each node: rounded rectangle + icon + short label.
Tiny caption under diagram (English, <= 8 words).
Minimalist, grid-aligned. 1600x900.
```

#### img2 (4 Drivers / Decomposition)
```
FinMap inline summary image (img2), Macro & Economy.
White/light-gray background.
Title top (English): [TITLE_SHORT].
2x2 grid of four rounded cards (subtle shadow).
Each card: icon + short label + tiny sublabel (English).
Use navy/blue to highlight key terms.
No long text. 1600x900.
```

#### img3 (Policy vs Market / Comparison Table)
```
FinMap inline summary image (img3), Macro & Economy.
White background, navy/blue accent.
Title top (English): [TITLE_SHORT].
Main: two-column comparison table card, 4 rows.
Headers: [LEFT_HEADER] vs [RIGHT_HEADER].
Each row: icon + short label (English).
Clean dividers, no heavy borders. 1600x900.
```

---

## C) 투자정보 (Investing)

### 톤 키워드
Premium • Dynamic • Risk-aware • Modern • Minimal

### 팔레트/무드
- Background: deep navy/charcoal, subtle gradient + fine grain
- Accent: neon lime OR neon orange (하나만 메인으로)
- Style: glass-like cards, soft glow (과하지 않게)

### 그래픽 모티프(추천)
Price wave • Risk band • Probability curve • Risk-reward plane (abstract)

### Cover Prompt Template (1200×630)
```
FinMap blog cover image, category: Investing.
Dark premium market mood. Deep navy/charcoal background with subtle gradient and fine grain.
Top-left pill label: "Investing".
Center-left: big keywords line (English only, no sentences): [KEYWORDS].
Optional sub-keywords (English): [SUBKEYWORDS].
Right side: abstract market graphic (smooth price wave + risk band or probability curve),
NOT a literal trading UI.
Use one neon accent sparingly. Rounded glass cards, soft glow. 1200x630.
```

### Summary Prompt Templates (1600×900)

#### img1 (Risk/Return Frame)
```
FinMap inline summary image (img1), Investing.
Dark navy background, subtle grain.
Title top (English): [TITLE_SHORT].
Center: simple risk-reward plane or scale diagram with 2–3 labeled points.
Thin lines, minimal labels, one neon accent curve.
Glass-style legend card. 1600x900.
```

#### img2 (Strategy Flow)
```
FinMap inline summary image (img2), Investing.
Dark gradient background, subtle grain.
Title top (English): [TITLE_SHORT].
Left-to-right flow with 4 glassy rounded cards connected by thin neon line:
[STEP1] → [STEP2] → [STEP3] → [STEP4].
Each card: icon + 1–3 English words.
Small footer note (English, <= 6 words): [FOOTER_NOTE].
Clean modern. 1600x900.
```

#### img3 (Risk Guardrails)
```
FinMap inline summary image (img3), Investing.
Dark navy background, subtle grain.
Title top (English): [TITLE_SHORT].
Main: "Risk Guardrails" card with 5 rows.
Each row: constraint icon + short English line + tiny numeric placeholder if relevant.
One neon accent for highlights. No paragraphs. 1600x900.
```

---

# 4) 키워드 생성 규칙 (title → cover keywords)

> Cover는 문장 금지이므로, 한글 title을 아래 규칙으로 **영어 키워드 3~6개**로 변환한다.

### 추천 절차
1. 제목에서 핵심 명사 3~6개 추출 (예: 비상금, 리스크, 직장, 가족, 대출)
2. 영어로 치환 (예: emergency fund, risk score, job stability, dependents, debt)
3. 표기 형식 통일: `KEYWORD • KEYWORD • KEYWORD`
4. 가능하면 1~2개는 액션/프레임 키워드 포함: `CHECKLIST`, `FRAMEWORK`, `SCORECARD`

### 키워드 표기 예시
- `EMERGENCY FUND • RISK SCORE • DEBT • DEPENDENTS • INCOME STABILITY`
- `INFLATION • POLICY RATE • BOND YIELDS • TERM PREMIUM`
- `RISK CONTROL • POSITION SIZE • DRAWDOWN • REBALANCE`

---

# 5) 예시 (요청 → 생성 적용)

### 예시 1) 커버
```yaml
category: 경제정보
title: "비상금은 ‘몇 개월’이 아니라 ‘리스크’로 정한다: 직장·가족·대출 기준표로 끝내기"
type: cover
```
- 적용 섹션: Macro & Economy cover template
- 생성 키워드 예:
  - `EMERGENCY FUND • RISK SCORE • DEBT • DEPENDENTS • INCOME STABILITY`
- 커버 텍스트는 영어 키워드만, 문장 없음

### 예시 2) 요약 img2
```yaml
category: 재테크
title: "DCA는 수익률 핵이 아니라 지속성 게임이다"
type: img2
```
- 적용 섹션: Personal Finance img2 template
- Step 예:
  - `Income → Rules → Auto-Invest → Consistency`

---

# 6) 체크리스트 (출력물 검수)

- [ ] 카테고리 pill은 영어 라벨인가?
- [ ] Cover는 영어 키워드 3~6개만(문장 없음)인가?
- [ ] Summary는 영어만 사용했는가?
- [ ] 글자가 모바일에서 읽힐 정도로 큰가?
- [ ] 도식은 1개(또는 2x2/표 등)로 명확한가?
- [ ] 색/라운드/그림자/그리드가 FinMap 톤으로 일관적인가?

---

## 7) 유지보수 메모
- 카테고리 팔레트/아이콘을 추가하고 싶으면, 각 섹션의 “그래픽 모티프” 리스트에만 확장
- 템플릿 문장 자체는 가급적 고정(일관성 유지)

