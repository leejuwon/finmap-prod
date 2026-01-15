# FinMap Writing Guide — 경제정보 (Premium Template)

> 성격: **메커니즘 설명 + 오해 교정 + 데이터 해석**  
> 독자 목표: 뉴스/지표를 보고도 흔들리지 않게 “해석 프레임”을 갖는다.

---

## 1) 경제정보 글의 ‘승부 포인트’

- 독자는 ‘전망’보다 **해석 능력**을 원한다.
- 단일 원인으로 설명하지 말고, **전이 경로(Transmission)**를 보여준다.
- “지표가 움직이면 무엇이 바뀌는지”를 **표로 정리**해준다.

---

## 지역 기준 기본값(한/영 운영)

- **한글(ko)**: 한국 독자 기준(통화=KRW, 예시 지수=KOSPI/KOSDAQ 등)
- **영문(en)**: 한국 특정 주제가 아니라면 미국/글로벌 독자 기준(통화=USD, 예시 지수=S&P 500/Nasdaq 등)
- **한국 특정 주제(원달러, 코스피 등)**는 영어에서도 한국 맥락을 유지하되 첫 등장에 짧게 설명을 붙인다.

## 2) 추천 글 구조(경제정보는 ‘원인→경로→결과’)

1) 도입: 흔한 오해/불안 1개 + 손해 1줄 + 얻는 것 3개  
2) 핵심 요약(불릿 5~7개)  
3) 변수 3개 정의(측정/의미/한계)  
4) 전이 경로(메커니즘) + 이미지/표  
5) 지표 읽는 법(시나리오 표)  
6) 오해 교정(5개 내외)  
7) 한국 맥락 오버레이(USD/KRW, TNX, 수출/물가)  
8) 내 상황 적용(체크리스트) + CTA  
9) 이어 읽기(내부 링크 4~6개)  
10) FAQ(6~10개)

---

## 3) 소제목(H2) 예시(영역명 금지)

- ## 한 장 요약: 지표가 경제에 들어오는 길
- ## 변수 3개만 잡으면 뉴스가 단순해진다
- ## 표로 끝내는 해석: 변화 → 의미 → 흔한 반응
- ## 오해 교정: 사람들이 뉴스에서 놓치는 것
- ## 한국 오버레이: 해외 변수가 국내로 들어오는 지점
- ## 실전 체크리스트: 오늘 뉴스, 이렇게 읽자
- ## 이 지표와 함께 보면 퍼즐이 맞춰진다

---

## 4) 경제정보용 표 템플릿

### 표1) 지표 변화 해석표
| 변화 | 경제적으로 흔한 의미 | 시장이 자주 하는 반응 | 반례/주의 |
|---|---|---|---|

### 표2) “좋은 뉴스/나쁜 뉴스”가 뒤집히는 이유
| 뉴스 | 직관적 해석 | 실제로는 왜 반대로 움직일까? |
|---|---|---|

---

## 5) 이미지 구성 추천(경제정보는 ‘경로/지도’가 핵심)

- cover: “하나의 체인(원인→결과)”을 크게
- img1: 전이 경로 인포그래픽(원인→물가→금리→자산가격)
- img2: 한국 맥락 오버레이(USD/KRW, TNX)
- img3: “오해 교정 카드(3가지)” 요약
- 필요 시 img4: “발표 이벤트 → 시장 민감도” 캘린더/타임라인

### 이미지 마크업(예시)
```html
<figure>
  <img src="/images/posts/{slug}/img1.png" alt="전이 경로: 원인에서 자산가격까지" />
  <figcaption>지표는 ‘숫자’가 아니라 ‘경로’다</figcaption>
</figure>
```

---

## 6) 경제정보 글 금지 패턴(프리미엄 품질 체크)

- 단일 원인으로 모든 것을 설명
- 정의/기간/예외 없이 데이터 해석
- “항상/무조건” 같은 표현
- ‘예측’만 하고 ‘읽는 법’이 없음

---

## 7) 이미지 프롬프트 예시

- cover prompt:
  - “premium macro economics editorial cover, one causal chain diagram, clean typography space, modern infographic, high contrast for mobile readability”
- img1 prompt:
  - “macro transmission mechanism infographic: shock → inflation → policy expectations → bond yields → equities, clean arrows, minimal design”
- img2 prompt:
  - “Korea overlay infographic: US 10Y yield and USD/KRW influence local yields and equity flows, simple map-like layout”
