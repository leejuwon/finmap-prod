# FinMap Image Prompt Guide (Unified v3.2.1 — Minimal Inputs, KR Title Only, Inline Text Default)

목표: 입력은 최소(`category + lang + type + title (+alt/+tags)`)로 유지하면서,
- **문장(긴 문구) 배제**
- **도식만 봐도 이해**
- **KR 오타 리스크 최소화**
를 우선한다.

---

## 0) 사용자가 보내는 입력(최소)

- category: 재테크 | 경제정보 | 투자정보
- lang: kr | en
- type: cover | img
- title: 블로그 제목(참고용)
- alt: 이미지에 담을 핵심(권장: 키워드/짧은 구)
- tags: ["..."] (선택)

※ 입력 예시(권장 형식)
category: 재테크
lang: kr
type: cover
title: ...
alt: ...
tags: [...]

---

## 1) 가장 중요한 텍스트 정책(하드 제약)

### 1-1) 공통(kr/en 모두)
- **문장/문단 금지** (긴 캡션 금지)
- 텍스트는 **적게, 크게**
- **작은 하단 캡션 금지**(오타/가독성 문제 원인 1순위)
- 텍스트는 반드시 **단색 카드(라운드 박스) 위**에만 배치
- 아이콘/도식 1개로 의미가 전달되게 구성(텍스트로 설명하지 않기)

### 1-2) KR 모드(핵심 변경)
**lang: kr 인 경우**
- **제목(Title 영역)만 한글 허용**
- 그 외 모든 텍스트(카테고리 pill, 칩/라벨/축/표/체크리스트)는 **영어 키워드만**
- 제목은 한글 “문장”이 아니라 **짧은 제목(2~5어절)**로 압축해 표시  
  (오타가 나면 사용자가 “제목 바꿔줘”로 재요청)

권장 KR 제목 스타일(짧게):
- 예: `DCA 월 납입 규칙`
- 예: `월 납입 운영법`
- 예: `적립식 운영 규칙`

### 1-3) EN 모드
**lang: en 인 경우**
- 모든 텍스트 영어(키워드/짧은 구), 문장 금지 원칙 동일

---

## 2) 출력 규격(고정)

- cover: **1200 × 630**
- img: **1600 × 900 (16:9)**

---

## 3) 브랜드 레이아웃(고정)

- Top-left: Category pill (항상 영어)
  - 재테크 → Personal Finance
  - 경제정보 → Macro & Economy
  - 투자정보 → Investing
- Left: Title block
  - lang=kr: **한글 제목 1~2줄(짧게)**
  - lang=en: 영어 제목/키워드 1~2줄
- Right: **메인 도식 1개**
- Style: rounded cards(24px radius), soft shadow, grid-aligned, 모바일 가독성 최우선

---

## 4) 타입 규칙

### 4-1) cover (OG/썸네일)
- 텍스트 구성:
  - (필수) Category pill(영어)
  - (필수) Title block(kr이면 한글 짧은 제목)
  - (선택) 영어 키워드 3~5개(불릿/칩/점 구분)
- 도식: “핵심을 한 장에” (아이콘+간단 도식 1개)

#### KR cover 안정 패턴(추천): "한글 제목 1줄 + 4 Action Cards(EN)"
lang: kr에서 오타/깨짐을 최소화하려면, **제목만 한글**, 나머지는 **영어 키워드 라벨**로 고정한다.

- **허용 한글(1곳만)**: Title block (1줄, 짧게)
  - 예: `DCA·월 납입액 운영 규칙`
- **나머지 텍스트는 전부 영어만**: 카드 라벨/칩/축/표/미니설명 전부 금지
- **하단(특히 좌하단) 텍스트 금지 + 여백 유지**: 모델이 “자동 캡션”을 만들지 못하게 빈 공간으로 둔다
- 구성(권장):
  - Top-left pill: `Personal Finance`
  - Big title(한글 1줄)
  - Right/center: **4개의 라운드 카드** + 아이콘 + 영어 라벨(1~2단어)
    - `Step-Up` / `Step-Down` / `Pause/Resume` / `Cashflow Buffer`

> 이 패턴은 “규칙/운영/상태(증액·감액·중단·재개)” 주제에서 가장 안정적으로 동작한다.

### 4-2) img (본문용)
img는 번호(img1/img2/…)를 쓰지 않는다. 대신 아래 중 하나를 자동 선택:

(A) 원리 도식 1개: 3노드(원인→경로→결과) / 2x2 / 간단 그래프  
(B) 흐름도 1개: 4단계(Income→Split→Auto→Execute)  
(C) 체크리스트 1개: 5줄(Trigger/Rule/Limit/Exception/Review)

자동 선택 로직:
- alt에 “흐름/루틴/단계/프로세스/자동화/통장” 느낌이면 → (B)
- alt에 “주의/실수/체크/가드레일/조건/트리거” 느낌이면 → (C)
- 그 외 → (A)

※ lang=kr이어도 (B)(C)의 라벨은 영어로만.

---

## 5) 카테고리 톤(절대 섞이지 않게)

### 재테크(Personal Finance) — Warm / Practical
- Background: cream/off-white + soft gradient (+ subtle grain OK)
- Accent: sage green(main) + muted coral(optional)
- Motifs: checklist, calendar, goal bar, budget pie (minimal)
- 금지: 다크/네온/마켓 UI 복제

### 경제정보(Macro & Economy) — Bright / Textbook
- Background: bright white/light-gray ONLY
- Accent: navy/blue ONLY (네온/글로우 금지)
- Style: flat infographic, crisp lines

### 투자정보(Investing) — Dark / Premium
- Background: deep navy/charcoal + subtle gradient + fine grain
- Accent: neon 1색만(lime OR orange) 절제
- Style: glass-like cards, soft glow minimal

---

## 6) 키워드 생성(assistant가 자동 처리)

우선순위: tags > alt > title

- cover(키워드): 3~5개
- img(라벨): 3~5개
- 문장 금지. 키워드/짧은 구만.

KR 모드의 “영어 키워드 예시”(DCA 글이라면):
- DCA
- MONTHLY RULES
- STEP-UP
- STEP-DOWN
- PAUSE / RESUME
- CASHFLOW
- BUFFER

(도움말) KR 키워드/개념 → EN 라벨 매핑(자주 쓰는 것)
- 증액 / 스텝업 → Step-Up
- 감액 / 스텝다운 → Step-Down
- 중단·재개 → Pause/Resume
- 비상금 / 완충 → Cashflow Buffer

---

## 7) 운영 방식(오타 대응)

- KR 모드에서 오타가 나면:
  - **제목을 더 짧게/다른 단어로 바꿔서 재요청**한다(권장)
  - 예: `월 납입 규칙` → `월 납입 운영법`
- 라벨/칩은 영어라서 오타 가능성이 훨씬 낮다.
- fix_text는 “보조”로만 사용(완전 보장은 불가).  
  대신 KR은 “제목 교체”가 기본 해결책.

---

## 8) 요청 샘플(이대로 보내면 됨)

### (A) KR cover (제목만 한글, 나머지 영어)
category: 재테크
lang: kr
type: cover
title: DCA의 핵심은 '월 납입액 설계'다: 증액(스텝업)·감액·일시중단 조건을 운영규칙으로 만드는 법
alt: 월 납입액 운영 규칙(증액/감액/중단/재개)
tags: ["DCA","적립식","월 납입액","스텝업","중단/재개","현금흐름","비상금"]

### (B) KR img (흐름도 자동 선택 유도)
category: 재테크
lang: kr
type: img
title: ...
alt: 통장 분리로 납입액 자동화(Income→Split→Auto→Invest)
tags: ["DCA","cashflow","buffer","automation"]

### (C) EN cover
category: 재테크
lang: en
type: cover
title: The core of DCA is monthly contribution rules
alt: Step-up / step-down / pause / resume rules
tags: ["DCA","monthly contribution","step-up","pause/resume","cashflow","buffer"]

---

## 9) 품질 체크
- [ ] 문장/문단 없음
- [ ] 작은 캡션 없음
- [ ] lang=kr이면 “제목만 한글”, 나머지 텍스트 영어
- [ ] 도식 1개로 의미가 전달됨
- [ ] 카테고리 톤이 섞이지 않음
