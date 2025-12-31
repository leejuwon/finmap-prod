# 📘 FinMap 블로그 마스터 스타일 가이드
_finmaphub.com 공식 블로그 문서 템플릿_

본 문서는 FinMap 블로그 글을 작성하기 위한 **최종 통합 규칙**이다.  
SEO·가독성·Adsense 적합성·모바일 친화성을 기준으로 작성하며  
모든 블로그 글은 이 스타일 가이드를 **강제 준수**한다.

---

## 1. 기본 포맷 (Markdown 규칙)

모든 블로그 글은 `.md` 형식으로 작성한다.  
글 시작 부분에는 아래 **Front Matter** 블록을 반드시 포함한다:

\`\`\`yaml
---
slug: "{화면ID}"
title: "{글 제목}"
description: "{150자 이내 요약문}"
datePublished: "{YYYY-MM-DD}"
dateModified: "{YYYY-MM-DD}"
category: "{경제정보·재테크·투자정보 등}"
tags: ["키워드1", "키워드2", "키워드3"..최대10개]
tool: ["goal","comp","cagr","fire","dca"..등 등록되어있는 계산기]
cover: "{이미지경로}"
lang: "{ko·en 기본은 ko}"
---
\`\`\`

Front Matter 뒤에는 아래와 같은 H1 → 서론 → H2/H3 구조로 이어진다.

---

## 2. 전체 글 구조 템플릿

\`\`\`md
# {글 제목}

> **요약 (10문장 정리)**

> 한 문단 요약 (Meta description과 유사)

![상단이미지 내용](이미지 경로)

## 1. 서론
- 문제 제시
- 사용자 공감
- 글에서 다룰 핵심 정리

## 2. 본문 섹션 1

![본문이미지 내용](이미지 경로)

### 핵심 포인트 1
- 설명
- 예시 포함

### 핵심 포인트 2
- 추가 설명
- 계산식/도표 가능

## 3. 본문 섹션 2
### 비교 또는 실제 사례
- 표·비교·예시 중심 설명

## 4. 실전 활용
### 사용법 / 팁 / 실수 방지

## 5. 결론
- 3줄 요약
- 관련 글 내부링크

![하단이미지 내용](이미지 경로)

## FAQ (선택)
- Q1 / A1 형식 2~4개
\`\`\`

---

## 3. 문체 규칙
- 독자: **투자 초중급자**
- 문체: “입니다/합니다”의 정중한 설명형
- 문장은 짧게(1문단 2~4줄)
- 금융 용어는 반드시 예시 포함
- 광고성 문장 금지 (Adsense 정책)
- AI 티 나는 전형적인 문장 금지  
  예: “이 글에서는 ~~을 알아보겠습니다”

---

## 4. SEO 규칙
- **첫 100자 안에 주요 키워드 포함**
- H2/H3에 롱테일 키워드 자연스럽게 포함
- 스팸성 반복 금지
- 표/리스트 활용하여 정보 구조화
- 이미지 alt 태그 필수

예시 이미지 템플릿:

\`\`\`md
![title 관련](./img/title관련.png "title관련 개념 이미지")
\`\`\`

---

## 5. CTA(내부링크) 규칙

카테고리 내부 관련 글 1–2개 자연스럽게 연결.

---

## 6. JSON-LD Article 스키마 (필수)

\`\`\`html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "{글 제목}",
  "description": "{한 문단 요약}",
  "datePublished": "{YYYY-MM-DD}",
  "author": {
    "@type": "Person",
    "name": "FinMap"
  },
  "publisher": {
    "@type": "Organization",
    "name": "FinMap"
  }
}
</script>
\`\`\`

---

## 7. 금지사항
- 출처 없는 통계 사용 금지
- 과도한 키워드 반복 금지
- 자극적·과장된 문장 금지
- 금융상품 추천처럼 보일 수 있는 문장 금지
- AI 전형 표현 금지
- ChatGPT가 자주 사용하는 (👉📌🔥✅⚡️) 같은 이미지 금지.
  색상을 바꿔서 사용은 가능 대신 👉📌🔥⚡️ 이 4개는 절대 사용 금지
  그 외 자주 사용 안하는 이모티콘은 사용 가능함.

---

## 8. 자주 쓰는 문장 패턴 예시
- “많은 사회초년생이 고민하는 부분은 ○○입니다.”
- “직접 계산해보면 차이가 명확해집니다.”
- “예를 들어 이런 상황을 생각해볼 수 있습니다.”
- “결론부터 말하면 ○○이 핵심입니다.”

---

## 9. 목적

본 문서는 FinMap 블로그의  
**통일된 톤·구조·SEO 최적화·Adsense 준수**를 보장하기 위한 기준이다.  
모든 신규 블로그 글은 반드시 본 가이드를 기반으로 작성한다.

## 영어로 작성 시 주의사항
원화는 달러로 변경해야하고. 예를 들어 30만 원 → $240/month 형태로 변환해야한다. 
영어로 바꿨을 때는 대상이 한국이 아니기 때문에 원화는 모두 달러단위로 변경해야한다. 
KRW 관련된 것도 다 Dollar로. 
영어로 만드는 모든 포스팅에 적용된다.
예외 발생 시에는 블로그 작성 시 '영어로 작성 시 원화로 작성한다'와 같은 문구를 제시한다.
그런 경우 영어 작성 시에도 원화를 기준으로 작성한다.

예)
₩1,000,000 → 약 $800
₩300,000 → 약 $240
₩200,000 → 약 $160
₩500,000 → 약 $400
₩20,000,000 → 약 $16,000

(특별 규칙: 원화가 억단위인 글을 포스팅하는 경우 (1억,3억 만들기 같은) 아래와 같이 표시한다.)
₩100,000,000(1억) → $100,000 
₩300,000,000(1억) → $300,000 

환산은 1 USD ≈ 1,250 KRW 기준으로 반올림 처리

# 10. 고급 레이아웃 컴포넌트 가이드

FinMap 블로그 포스트는 아래의 고급 레이아웃 컴포넌트를 선택적으로 사용할 수 있다.  
모든 컴포넌트는 `globals.css` 또는 Tailwind 확장 컴포넌트로 정의되어 있어야 한다.

## 10-1. 상단 Hero 레이아웃

**용도:** 글의 핵심 요약 + 주요 포인트를 카드 형태로 강조  
**클래스:** `.hero-grid`, `.hero-main`, `.hero-card`

\`\`\`html
<div class="hero-grid">
  <div class="hero-main">
    <p class="hero-kicker">장기 투자 성과, 무엇으로 봐야 할까?</p>
    <p class="hero-summary">
      많은 투자자가 ETF·펀드를 고를 때 최근 수익률만 보고 판단하지만,
      장기 성과를 정확하게 평가하려면 CAGR(연평균 복리 수익률)을 함께
      확인해야 합니다.
    </p>
  </div>

  <div class="hero-card">
    <h3>CAGR 체크 핵심 요약</h3>
    <ul>
      <li>총 수익률보다 <strong>장기 성장률</strong>이 더 중요</li>
      <li>변동성이 클수록 <strong>총 수익률 vs CAGR 차이↑</strong></li>
      <li>ETF 비교 시 <strong>3·5년 CAGR</strong> 확인</li>
    </ul>
  </div>
</div>
\`\`\`

## 10-2. 비교 카드 레이아웃

**용도:** “총 수익률 vs CAGR”처럼 두 가지 개념을 나란히 비교
**클래스:** `.compare-grid`, `.compare-card`, `.compare-bad`, `.compare-good`

\`\`\`html
<div class="compare-grid">
  <div class="compare-card compare-bad">
    <h3>총 수익률만 볼 때</h3>
    <ul>
      <li>중간 손실과 변동성이 숨겨짐</li>
      <li>레버리지 ETF는 왜곡이 더 큼</li>
    </ul>
  </div>

  <div class="compare-card compare-good">
    <h3>CAGR까지 함께 볼 때</h3>
    <ul>
      <li>연평균 성장 속도 파악 가능</li>
      <li>장기 성과의 질을 비교 가능</li>
    </ul>
  </div>
</div>
\`\`\`

## 10-3. 콜아웃 박스 (핵심 인사이트)

**용도:**  강조하고 싶은 한두 문장을 눈에 띄게 표시
**클래스:** `.callout-tip`

\`\`\`html
<div class="callout-tip">
  <strong>핵심 인사이트:</strong>
  레버리지 ETF의 화려한 단기 수익률보다 3·5년 CAGR이
  얼마나 나오는지 확인하는 습관이 장기 성과를 좌우합니다.
</div>
\`\`\`

## 10-4. 가로 스크롤 이미지 행

**용도:**  3~4개의 관련 이미지를 좌우 스크롤로 배치
**클래스:** `.img-row`

\`\`\`html
<div class="img-row">
  <figure>
    <img src="/images/posts/what-is-cagr/example1.png" alt="손실 회복 곡선" />
    <figcaption>손실 후 회복 과정</figcaption>
  </figure>

  <figure>
    <img src="/images/posts/what-is-cagr/example2.png" alt="CAGR 계산표" />
    <figcaption>연도별 수익률과 CAGR 계산</figcaption>
  </figure>

  <figure>
    <img src="/images/posts/what-is-cagr/example3.png" alt="장기 시장 성장" />
    <figcaption>장기 시장 성장률 비교</figcaption>
  </figure>
</div>
\`\`\`

## 10-5. FinMap 계산기 CTA 섹션

**용도:**  글 맨 하단에서 관련 계산기·도구로 자연스럽게 연결
**클래스:** `.tool-cta`, `.tool-cta-btn`

\`\`\`html
<div class="tool-cta">
  <h3>직접 CAGR을 계산해보고 싶다면?</h3>
  <p>
    투자 중인 ETF·펀드의 과거 수익률을 입력해서
    연평균 복리 수익률을 바로 확인해 보세요.
  </p>

  <a class="tool-cta-btn" href="/tools/cagr-calculator">
    FinMap CAGR 계산기 열기
  </a>
</div>
\`\`\`