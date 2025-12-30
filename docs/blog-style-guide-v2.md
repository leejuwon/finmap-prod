---
slug: "finmap-blog-master-guide-v2"
title: "FinMap 블로그 공식 스타일 가이드 v2 (프리미엄 레이아웃 통합)"
description: "FinMap 블로그 글 작성을 위한 최종 공식 가이드 v2. SEO, 문체, 구조, 고급 레이아웃(Hero, Compare, Callout, ImgRow, CTA)까지 통합한 새로운 표준 버전입니다."
datePublished: "2025-11-29"
dateModified: "2025-11-29"
category: "Guide"
tags: ["블로그가이드", "FinMap", "SEO", "Markdown", "콘텐츠가이드"]
cover: "/images/posts/guide/finmap-style-guide-cover.png"
lang: "ko"
---

# FinMap 블로그 공식 스타일 가이드 v2  
— *CAGR 완전체 버전을 기준으로 확장한 프리미엄 가이드* —

FinMap 블로그의 모든 콘텐츠는 아래 가이드를 **의무 적용**한다.  
이 문서는 v1(기본 마스터 가이드)을 확장하여,  
CAGR 블로그에서 사용한 **고급 구성요소·레이아웃·표·HTML 블록**을  
**공식 표준**으로 채택한다.

---

# 1. 포맷 규칙 (Markdown + HTML 혼합)

모든 글은 `.md` 파일로 작성하며,  
다음 **Front Matter**를 반드시 포함한다.

```yaml
---
slug: "{페이지ID}"
title: "{글 제목}"
description: "{150자 이내 핵심 요약}"
datePublished: "{YYYY-MM-DD}"
dateModified: "{YYYY-MM-DD}"
category: "{경제·투자·재테크 등 카테고리}"
tags: ["태그1", "태그2", ... 최대 10개]
cover: "/images/posts/{slug}/cover.png"
lang: "ko"
---
```

---

# 2. 전체 글 구조 v2 (고급 레이아웃 포함)

블로그 글은 아래 구조를 **권장**하며 다음 요소들은 필수:

- 요약(10문장 버전)
- 한 문단 요약(meta description 유사)
- Hero Layout
- Compare Layout
- Callout Layout
- Img-row 이미지 블록
- 표(최소 1~2개 이상)
- 결론 3줄
- 내부링크 3~4개

## 기본 구조

```md
# {글 제목}

> **요약 (10문장)**  
> - 핵심 문장 10개  
> - 스팸 키워드 반복 금지

> 한 문단 요약

![상단 대표 이미지](경로)

## 1. 서론
- 독자 공감  
- 문제 제시  
- 글에서 무엇을 해결하는지 명확하게

## 2. Hero Layout 섹션
<div class="hero-grid">
  <div class="hero-main">
    <p class="hero-kicker">키커 문장</p>
    <p class="hero-summary">한 문단 요약</p>
  </div>

  <div class="hero-card">
    <h3>핵심 포인트</h3>
    <ul>
      <li>포인트 A</li>
      <li>포인트 B</li>
      <li>포인트 C</li>
    </ul>
  </div>
</div>

## 3. 본문 + 공식
수식은 최대한 텍스트 형태로 표현  
(LaTeX는 Next.js 렌더 시 깨질 수 있음)

## 4. 비교표 + Compare Layout
<div class="compare-grid">
  <div class="compare-card compare-bad">…</div>
  <div class="compare-card compare-good">…</div>
</div>

표 2개는 필수.

## 5. 이미지 블록 (가로 스크롤)
<div class="img-row">
  <figure>…</figure>
  <figure>…</figure>
  <figure>…</figure>
</div>

## 6. 투자 수준별 섹션
- 초보자 버전  
- 전문가 버전  

## 7. 체크리스트  
항목 7개 이상

## 8. 결론(3줄)
- 하나  
- 둘  
- 셋  

## 9. CTA
<div class="tool-cta">…</div>

## 10. 내부링크 (4개 이상)
- …  
- …  
- …

## FAQ
- 3~5개
```

---

# 3. 공식 고급 레이아웃 설명

## 3-1. Hero Layout (필수)

```html
<div class="hero-grid">
  <div class="hero-main">
    <p class="hero-kicker">간단한 키커</p>
    <p class="hero-summary">1~2문단 요약</p>
  </div>

  <div class="hero-card">
    <h3>핵심 포인트</h3>
    <ul>
      <li>포인트A</li>
      <li>포인트B</li>
      <li>포인트C</li>
    </ul>
  </div>
</div>
```

---

## 3-2. Compare Layout (필수)

```html
<div class="compare-grid">
  <div class="compare-card compare-bad">
    <h3>잘못된 방식</h3>
    <ul>
      <li>문제점1</li>
      <li>문제점2</li>
    </ul>
  </div>

  <div class="compare-card compare-good">
    <h3>올바른 방식</h3>
    <ul>
      <li>장점1</li>
      <li>장점2</li>
    </ul>
  </div>
</div>
```

---

## 3-3. Callout Layout

```html
<div class="callout-tip">
  <strong>핵심 인사이트:</strong>
  메시지를 명확하게 1~2문장으로 작성
</div>
```

---

## 3-4. Img-row (가로 스크롤 이미지 3~4개)

```html
<div class="img-row">
  <figure>
    <img src="/images/posts/{slug}/img1.png" alt="설명1" />
    <figcaption>설명 텍스트</figcaption>
  </figure>
  <figure>
    <img src="/images/posts/{slug}/img2.png" alt="설명2" />
    <figcaption>설명 텍스트</figcaption>
  </figure>
  <figure>
    <img src="/images/posts/{slug}/img3.png" alt="설명3" />
    <figcaption>설명 텍스트</figcaption>
  </figure>
</div>
```
이미지의 경우 한글/영어 버전의 블로그 글에 동일하게 적용할 것이기 때문에
1순위. 표현할 수 있으면 이모티콘으로 글귀 대체.
2순위. 꼭 표현해야 하는 글귀가 있다면 영어로 이미지에 삽입

---

## 3-5. CTA 구성

```html
<div class="tool-cta">
  <h3>FinMap 도구 안내 문구</h3>
  <p>짧은 소개 1문단</p>
  <a class="tool-cta-btn" href="/tools/{tool}">
    버튼명
  </a>
</div>
```

---

# 4. 표 구성 가이드 (필수 2개 이상)

CAGR 블로그에서 사용한 2종 표는 공식 채택:

| 표 종류 | 용도 | 규칙 |
|--------|------|--------|
| 총 수익률 vs CAGR 비교표 | 개념 설명용 | 4~5열 구성 |
| ETF 3년·5년 CAGR 비교표 | 실전 분석용 | 최소 5행 이상 |

표는 모두 Markdown 표 형식 사용  
`<table>` HTML 지양 (모바일 폭 깨짐 방지)

---

# 5. 문체 규칙 (업데이트 버전)

- 대상: 투자 **초중급자**  
- 말투: “합니다·됩니다”의 부드러운 전문 설명형  
- 한 문단 길이: **2~4줄**  
- 과장 금지 (Adsense 정책)  
- AI 전형 표현 금지  
  - “이 글에서는~ 알아보겠습니다” X  
  - “따라서 여러분은~” X

## 사용 가능한 패턴
- “많은 투자자가 ○○에서 실수합니다.”  
- “예를 들어 다음과 같은 상황을 생각해볼 수 있습니다.”  
- “장기적으로 보면 ○○가 더 큰 차이를 만듭니다.”

---

# 6. SEO 규칙 (확장 버전)

### 필수
- 첫 100자 안에 핵심 키워드 포함  
- H2/H3에 롱테일 키워드 자연스럽게 배치  
- 이미지 alt 필수  
- 표 1~2개 이상  
- 고급 레이아웃 사용 (Hero·Compare·Img-row 최소 1개)

### 금지
- “반드시 사야 한다” 류의 표현  
- 특정 ETF·종목 추천으로 보이는 문구  
- 키워드 과도 반복  
- 자극적 제목

---

# 7. 내부링크 규칙

### 4개 이상 필수 (v2 기준)
- 복리 개념  
- 단리 vs 복리  
- 장기 투자 전략  
- ETF 고르는 법  
- 상황에 따라 CAGR 계산기 도구 페이지 연결
- 프로젝트 파일로 올라가 있는 페이지로 연결
- 각 파일은 /posts/postCategory/slug로 링크 연결하면 됨.
- 영어 링크인 경우 /en/posts/postCategory/slug로 링크 연결하면 됨

---

# 8. JSON-LD Article 스키마 (필수)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "{글 제목}",
  "description": "{한 문단 요약}",
  "datePublished": "{YYYY-MM-DD}",
  "dateModified": "{YYYY-MM-DD}",
  "author": { "@type": "Person", "name": "FinMap" },
  "publisher": { "@type": "Organization", "name": "FinMap" }
}
</script>
```

---

# 9. 영문 작성 시 규칙

- KRW → USD 변환  
  - ₩1,000,000 ≈ $800  
  - ₩300,000 ≈ $240  
- 억 단위는 다음처럼 표기  
  - ₩100,000,000(1억) → $100,000  
- 영어 버전도 Hero / Compare / Callout / Img-row 동일하게 사용

---

# 10. 최종 목적

FinMap 블로그의  
- **통일된 톤 체계**  
- **고급 레이아웃 기반 통일된 UI/UX**  
- **SEO·가독성·Adsense 기준 충족**  
을 보장하는 **공식 스타일 가이드 v2**입니다.

이 문서는 새로운 블로그 글의 **기본 템플릿이자 표준 명세서**로 활용됩니다.

---

# ✔ End of Document
