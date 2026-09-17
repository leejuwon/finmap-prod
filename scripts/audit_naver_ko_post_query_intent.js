const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const DATE_STAMP = "2026-09-16";
const INPUT_JSON = path.join(ROOT, "reports", `naver-ko-post-search-inventory-${DATE_STAMP}.json`);
const REPORT_MD = path.join(ROOT, "reports", `naver-ko-post-query-intent-${DATE_STAMP}.md`);
const REPORT_JSON = path.join(ROOT, "reports", `naver-ko-post-query-intent-${DATE_STAMP}.json`);
const REPORT_CSV = path.join(ROOT, "reports", `naver-ko-post-query-map-${DATE_STAMP}.csv`);

const QUERY_OVERRIDES = {
  "economicInfo/eu-russia-gas-phaseout-price-channel": {
    primaryQuery: "러시아 가스 중단 유럽 물가 영향",
    secondaryQueries: ["유럽 가스 가격 물가", "러시아 가스 공급 중단 영향", "천연가스 가격 인플레이션", "유럽 에너지 위기 환율", "가스 가격 산업 마진 영향"],
    primaryIntent: "MARKET_IMPACT",
    secondaryIntent: "EXPLANATION",
    queryType: "LONG_TAIL",
    topicFamily: "OIL_ENERGY",
    topicSubtopic: "유럽 가스 공급과 가격 전이",
    notes: "유럽 에너지 가격 shock이 물가와 마진으로 전이되는 문서로 설계한다.",
  },
  "economicInfo/fx-basics": {
    primaryQuery: "환율 뜻",
    secondaryQueries: ["환율이 오르면", "원달러 환율 뜻", "환율 상승 하락 의미", "달러 환율 보는 법", "환율 경제 영향"],
    primaryIntent: "DEFINITION",
    secondaryIntent: "EXPLANATION",
    queryType: "HEAD",
    topicFamily: "FX",
    topicSubtopic: "환율 기초",
    coreDocument: true,
    notes: "FX 계열의 기본 정의 문서다.",
  },
  "economicInfo/geopolitics-oil-fx-dashboard": {
    primaryQuery: "지정학 리스크 유가 환율 영향",
    secondaryQueries: ["지정학 리스크 대시보드", "유가 환율 같이 보는 법", "전쟁 리스크 금융시장", "원유 가격 환율 영향", "지정학 리스크 투자 지표"],
    primaryIntent: "MARKET_IMPACT",
    secondaryIntent: "DATA_INTERPRETATION",
    queryType: "MID_TAIL",
    topicFamily: "GEOPOLITICS",
    topicSubtopic: "지정학 리스크 대시보드 해석",
    coreDocument: true,
    notes: "유가와 환율을 함께 읽는 bridge 문서다.",
  },
  "economicInfo/geopolitics-to-usd-liquidity-fx": {
    primaryQuery: "지정학 리스크 달러 환율",
    secondaryQueries: ["지정학 리스크 달러 강세", "달러 유동성 환율 영향", "안전자산 달러 환율", "위험회피 원달러 환율", "지정학 리스크 외환시장"],
    primaryIntent: "MARKET_IMPACT",
    secondaryIntent: "EXPLANATION",
    queryType: "MID_TAIL",
    topicFamily: "FX",
    topicSubtopic: "위험회피와 달러 유동성",
    notes: "지정학 이벤트가 달러 강세와 원화 약세로 번지는 경로를 맡는다.",
  },
  "economicInfo/gold-geopolitics-real-rates-dollar-uncertainty": {
    primaryQuery: "금 가격 지정학 실질금리 달러",
    secondaryQueries: ["금 가격 실질금리", "금 가격 달러 관계", "지정학 리스크 금 가격", "금 투자 변수", "실질금리 금값 영향"],
    primaryIntent: "EXPLANATION",
    secondaryIntent: "MARKET_IMPACT",
    queryType: "LONG_TAIL",
    topicFamily: "ASSET_ALLOCATION",
    topicSubtopic: "금 가격 요인",
    notes: "금 가격을 단일 뉴스가 아니라 실질금리, 달러, 불확실성의 조합으로 설명한다.",
  },
  "economicInfo/hormuz-risk-oil-insurance-freight-premium": {
    primaryQuery: "중동 원유 운송 리스크",
    secondaryQueries: ["호르무즈 해협 유가", "중동 유가 리스크", "원유 운송 보험료", "해상 운임 유가 영향", "전쟁 보험료 유가", "중동 원유 공급 리스크"],
    primaryIntent: "MARKET_IMPACT",
    secondaryIntent: "EXPLANATION",
    queryType: "MID_TAIL",
    topicFamily: "OIL_ENERGY",
    topicSubtopic: "호르무즈 운송, 보험료, 운임 프리미엄",
    coreDocument: true,
    notes: "중동 원유 운송 리스크의 대표 문서 후보다.",
  },
  "economicInfo/indicator-basics": {
    primaryQuery: "경제지표 보는 법",
    secondaryQueries: ["경제지표 종류", "경제지표 해석", "고용 물가 금리 지표", "경기 선행지표", "경제 뉴스 지표 읽는 법"],
    primaryIntent: "HOW_TO",
    secondaryIntent: "DATA_INTERPRETATION",
    queryType: "MID_TAIL",
    topicFamily: "MACRO_INDICATORS",
    topicSubtopic: "경제지표 입문",
    coreDocument: true,
    notes: "거시 지표 전체의 입문 문서라 범위가 넓다.",
  },
  "economicInfo/inflation-basics": {
    primaryQuery: "인플레이션 뜻",
    secondaryQueries: ["인플레이션 원인", "인플레이션 영향", "물가 상승 뜻", "디플레이션 차이", "인플레이션 금리 관계"],
    primaryIntent: "DEFINITION",
    secondaryIntent: "EXPLANATION",
    queryType: "HEAD",
    topicFamily: "INFLATION",
    topicSubtopic: "인플레이션 기초",
    coreDocument: true,
    notes: "물가상승률 문서와 정의 경계를 분리해야 한다.",
  },
  "economicInfo/inflation-rate-basics": {
    primaryQuery: "물가상승률 뜻",
    secondaryQueries: ["물가상승률 계산", "CPI 물가상승률", "소비자물가지수 뜻", "물가상승률 보는 법", "물가상승률 인플레이션 차이"],
    primaryIntent: "DEFINITION",
    secondaryIntent: "DATA_INTERPRETATION",
    queryType: "MID_TAIL",
    topicFamily: "INFLATION",
    topicSubtopic: "물가상승률과 CPI",
    notes: "인플레이션 자체보다 측정 지표와 읽는 법에 초점을 둔다.",
  },
  "economicInfo/interest-rate-basics": {
    primaryQuery: "금리 뜻",
    secondaryQueries: ["금리 인상 뜻", "기준금리 뜻", "시장금리 뜻", "금리와 채권 가격", "금리 경제 영향"],
    primaryIntent: "DEFINITION",
    secondaryIntent: "EXPLANATION",
    queryType: "HEAD",
    topicFamily: "INTEREST_RATES",
    topicSubtopic: "금리 기초",
    coreDocument: true,
    notes: "금리 계열의 최상위 정의 문서다.",
  },
  "economicInfo/oil-shock-to-usdkrw-korea-transmission": {
    primaryQuery: "유가 상승 원달러 환율 영향",
    secondaryQueries: ["유가 상승 한국 경제영향", "국제유가 원달러 환율", "유가 상승 수입물가", "유가 코스피 영향", "원유 가격 환율 전이"],
    primaryIntent: "MARKET_IMPACT",
    secondaryIntent: "EXPLANATION",
    queryType: "LONG_TAIL",
    topicFamily: "OIL_ENERGY",
    topicSubtopic: "유가 shock의 한국 전이",
    notes: "중동 운송 리스크보다 한국 원화와 수입물가 전이에 가깝다.",
  },
  "economicInfo/policy-rate-cut-market-rates": {
    primaryQuery: "기준금리 인하 시장금리 영향",
    secondaryQueries: ["기준금리 인하 채권금리", "기준금리 시장금리 차이", "금리 인하 대출금리 영향", "한국은행 기준금리 인하 영향", "정책금리 시장 반응"],
    primaryIntent: "EXPLANATION",
    secondaryIntent: "MARKET_IMPACT",
    queryType: "LONG_TAIL",
    topicFamily: "INTEREST_RATES",
    topicSubtopic: "정책금리와 시장금리 전이",
    notes: "금리 정의가 아니라 금리 인하 후 가격 전이를 맡는다.",
  },
  "economicInfo/real-rates-and-breakevens": {
    primaryQuery: "실질금리 기대인플레이션",
    secondaryQueries: ["실질금리 뜻", "기대인플레이션 뜻", "BEI 뜻", "명목금리 실질금리 차이", "실질금리 자산가격 영향"],
    primaryIntent: "EXPLANATION",
    secondaryIntent: "DATA_INTERPRETATION",
    queryType: "MID_TAIL",
    topicFamily: "INTEREST_RATES",
    topicSubtopic: "실질금리와 BEI",
    notes: "금리 기초와 달리 실질금리 분해 문서다.",
  },
  "economicInfo/tariffs-growth-margins-fx-package-shock": {
    primaryQuery: "관세 인상 경제 영향",
    secondaryQueries: ["관세 인상 물가 영향", "관세 환율 영향", "무역분쟁 주식시장 영향", "관세 기업 마진 영향", "관세 성장률 영향"],
    primaryIntent: "MARKET_IMPACT",
    secondaryIntent: "EXPLANATION",
    queryType: "MID_TAIL",
    topicFamily: "GEOPOLITICS",
    topicSubtopic: "관세 shock와 성장, 마진, 환율",
    notes: "관세를 물가와 환율까지 묶은 패키지 shock으로 본다.",
  },
  "economicInfo/war-risk-oil-supply-insurance-shipping": {
    primaryQuery: "전쟁 유가 영향",
    secondaryQueries: ["전쟁 원유 공급 리스크", "전쟁 보험료 운임 유가", "전쟁 리스크 인플레이션", "중동 전쟁 유가", "지정학 리스크 원유 가격"],
    primaryIntent: "MARKET_IMPACT",
    secondaryIntent: "EXPLANATION",
    queryType: "MID_TAIL",
    topicFamily: "GEOPOLITICS",
    topicSubtopic: "전쟁 리스크와 원유 가격 chain",
    coreDocument: true,
    notes: "전쟁과 유가 영향의 넓은 대표 문서 후보다.",
  },
  "economicInfo/war-theme-investing-price-chain-not-winners": {
    primaryQuery: "전쟁 테마주 투자 리스크",
    secondaryQueries: ["방산주 유가주 투자 주의점", "전쟁 뉴스 투자 판단", "테마주 가격 반응", "지정학 리스크 투자 전략", "전쟁 관련주 리스크"],
    primaryIntent: "DECISION_SUPPORT",
    secondaryIntent: "CHECKLIST",
    queryType: "MID_TAIL",
    topicFamily: "GEOPOLITICS",
    topicSubtopic: "전쟁 테마 투자 판단",
    notes: "시장 영향 해설이 아니라 투자 의사결정 위험을 담당한다.",
  },
  "economicInfo/yield-curve-2s10s-3m10y-recession-reading": {
    primaryQuery: "장단기 금리차 경기침체 신호",
    secondaryQueries: ["장단기 금리차 역전", "2년 10년 금리차", "3개월 10년 금리차", "수익률 곡선 경기침체", "미국 국채 금리차 해석"],
    primaryIntent: "DATA_INTERPRETATION",
    secondaryIntent: "MARKET_IMPACT",
    queryType: "DATA_QUERY",
    topicFamily: "INTEREST_RATES",
    topicSubtopic: "수익률 곡선과 recession signal",
    notes: "금리 레벨이 아니라 금리차 해석 문서다.",
  },

  "investingInfo/bond-etf-duration-drives-returns": {
    primaryQuery: "채권 ETF 듀레이션 수익률",
    secondaryQueries: ["채권 ETF 금리 영향", "듀레이션 뜻", "채권 가격 금리 관계", "장기채 ETF 리스크", "채권형 ETF 수익률 요인"],
    primaryIntent: "EXPLANATION",
    secondaryIntent: "DECISION_SUPPORT",
    queryType: "MID_TAIL",
    topicFamily: "ETF",
    topicSubtopic: "채권 ETF와 duration",
    notes: "채권 ETF 성과의 핵심 변수를 duration으로 좁힌다.",
  },
  "investingInfo/cagr-7percent-reality-check": {
    primaryQuery: "연 7% 수익률 현실성",
    secondaryQueries: ["연 7퍼센트 수익률", "장기 투자 수익률 현실", "CAGR 7% 계산", "목표 수익률 현실성", "복리 수익률 기대치"],
    primaryIntent: "SCENARIO_ANALYSIS",
    secondaryIntent: "CALCULATION",
    queryType: "MID_TAIL",
    topicFamily: "CAGR",
    topicSubtopic: "목표 수익률 현실성",
    notes: "CAGR 기초가 아니라 기대수익률 가정 검증 문서다.",
  },
  "investingInfo/dca-consistency-7-fail-patterns": {
    primaryQuery: "적립식 투자 실패 패턴",
    secondaryQueries: ["적립식 투자 꾸준히 하는 법", "DCA 실패 이유", "적립식 투자 중단 원인", "분할매수 원칙", "적립식 투자 체크리스트"],
    primaryIntent: "CHECKLIST",
    secondaryIntent: "HOW_TO",
    queryType: "MID_TAIL",
    topicFamily: "DCA",
    topicSubtopic: "적립식 투자 실행 실패",
    notes: "DCA 선택론이 아니라 실행 지속성 문제를 맡는다.",
  },
  "investingInfo/diagnose-investing-skill-with-cagr": {
    primaryQuery: "CAGR로 투자 성과 평가",
    secondaryQueries: ["투자 성과 평가 방법", "CAGR 계산 투자", "수익률 실력 구분", "벤치마크 비교 수익률", "투자 복기 방법"],
    primaryIntent: "HOW_TO",
    secondaryIntent: "DATA_INTERPRETATION",
    queryType: "MID_TAIL",
    topicFamily: "CAGR",
    topicSubtopic: "투자 성과 진단",
    notes: "CAGR을 성과 평가 도구로 쓰는 문서다.",
  },
  "investingInfo/dxy-dollar-index-basics": {
    primaryQuery: "달러인덱스 뜻",
    secondaryQueries: ["달러인덱스 구성", "DXY 뜻", "달러지수 보는 법", "달러인덱스 상승 의미", "달러인덱스 환율 관계"],
    primaryIntent: "DEFINITION",
    secondaryIntent: "EXPLANATION",
    queryType: "HEAD",
    topicFamily: "DXY",
    topicSubtopic: "달러인덱스 기초",
    coreDocument: true,
    notes: "DXY 계열의 기본 정의 문서다.",
  },
  "investingInfo/dxy-market-impact": {
    primaryQuery: "달러인덱스 주식시장 영향",
    secondaryQueries: ["달러인덱스 상승 주식", "DXY 코스피 영향", "달러 강세 주식시장", "달러인덱스 금리 영향", "달러지수 투자 지표"],
    primaryIntent: "MARKET_IMPACT",
    secondaryIntent: "DATA_INTERPRETATION",
    queryType: "MID_TAIL",
    topicFamily: "DXY",
    topicSubtopic: "DXY와 자산시장 영향",
    notes: "달러인덱스 정의 문서와 영향 문서의 경계를 둔다.",
  },
  "investingInfo/etf-impact-of-tnx": {
    primaryQuery: "미국 10년물 금리 ETF 영향",
    secondaryQueries: ["미국 국채금리 ETF 영향", "10년물 금리 나스닥 ETF", "금리 상승 ETF 수익률", "성장주 ETF 금리 영향", "TNX ETF 투자"],
    primaryIntent: "MARKET_IMPACT",
    secondaryIntent: "DATA_INTERPRETATION",
    queryType: "LONG_TAIL",
    topicFamily: "ETF",
    topicSubtopic: "TNX와 ETF 가격 반응",
    notes: "ETF를 중심에 두고 TNX 영향을 설명한다.",
  },
  "investingInfo/fx-hedge-vs-fx-exposure-korea-3-conditions": {
    primaryQuery: "환헤지 환노출 선택 기준",
    secondaryQueries: ["환헤지 ETF 환노출 ETF 차이", "환헤지 해야 할까", "달러 환노출 투자", "해외 ETF 환헤지 선택", "원화 약세 환헤지"],
    primaryIntent: "DECISION_SUPPORT",
    secondaryIntent: "COMPARISON",
    queryType: "MID_TAIL",
    topicFamily: "FX",
    topicSubtopic: "환헤지와 환노출 선택",
    notes: "환율 정의가 아니라 투자상품 선택 기준을 맡는다.",
  },
  "investingInfo/indicator-marketinfo": {
    primaryQuery: "투자 지표 보는 법",
    secondaryQueries: ["시장지표 체크리스트", "금리 환율 유가 지표", "주식시장 매크로 지표", "시장 정보 해석", "투자 전 확인할 지표"],
    primaryIntent: "HOW_TO",
    secondaryIntent: "DATA_INTERPRETATION",
    queryType: "MID_TAIL",
    topicFamily: "MACRO_INDICATORS",
    topicSubtopic: "투자용 시장지표",
    notes: "경제지표 일반론보다 투자 화면에서 볼 지표에 가깝다.",
  },
  "investingInfo/korea-etf-deep-dive-tnx": {
    primaryQuery: "국내 ETF 미국 10년물 금리 영향",
    secondaryQueries: ["국내 ETF 금리 민감도", "미국 10년물 국내 ETF", "TNX 국내 ETF 영향", "채권금리 ETF 성과", "국내 상장 해외 ETF 금리"],
    primaryIntent: "DATA_INTERPRETATION",
    secondaryIntent: "MARKET_IMPACT",
    queryType: "LONG_TAIL",
    topicFamily: "ETF",
    topicSubtopic: "국내 ETF와 TNX 민감도",
    notes: "국내 상장 ETF 관점으로 좁힌 TNX 문서다.",
  },
  "investingInfo/modern-6040-risk-budget": {
    primaryQuery: "60대40 포트폴리오 리스크 관리",
    secondaryQueries: ["60 40 포트폴리오", "포트폴리오 리스크 예산", "주식 채권 비중 조절", "자산배분 리밸런싱", "금리 상승 60 40 전략"],
    primaryIntent: "DECISION_SUPPORT",
    secondaryIntent: "SCENARIO_ANALYSIS",
    queryType: "MID_TAIL",
    topicFamily: "ASSET_ALLOCATION",
    topicSubtopic: "60/40와 risk budget",
    coreDocument: true,
    notes: "자산배분의 core document 후보로 볼 수 있다.",
  },
  "investingInfo/rates-discount-mortgage-demand-apt-prices": {
    primaryQuery: "금리 아파트 가격 영향",
    secondaryQueries: ["할인율 주택가격", "대출금리 아파트 수요", "금리 인하 부동산 시장", "주담대 금리 매수수요", "금리와 집값 관계"],
    primaryIntent: "MARKET_IMPACT",
    secondaryIntent: "EXPLANATION",
    queryType: "MID_TAIL",
    topicFamily: "REAL_ESTATE_DATA",
    topicSubtopic: "금리와 아파트 가격",
    notes: "투자 카테고리 안의 부동산 시장 영향 문서다.",
  },
  "investingInfo/real-estate-role-in-portfolio-risk-budget": {
    primaryQuery: "부동산 포트폴리오 비중",
    secondaryQueries: ["부동산 자산배분", "포트폴리오 부동산 비중", "주식 채권 부동산 배분", "부동산 리스크 관리", "실물자산 포트폴리오"],
    primaryIntent: "DECISION_SUPPORT",
    secondaryIntent: "ASSET_ALLOCATION",
    queryType: "MID_TAIL",
    topicFamily: "ASSET_ALLOCATION",
    topicSubtopic: "부동산의 포트폴리오 역할",
    notes: "부동산 데이터 해석보다 자산배분 역할에 둔다.",
  },
  "investingInfo/seoul-gyeonggi-incheon-risk-budget-framework": {
    primaryQuery: "수도권 부동산 리스크 관리",
    secondaryQueries: ["서울 경기 인천 집값 비교", "아파트 투자 리스크 예산", "지역별 부동산 위험", "주택 구입 지역 선택", "수도권 아파트 리스크"],
    primaryIntent: "DECISION_SUPPORT",
    secondaryIntent: "SCENARIO_ANALYSIS",
    queryType: "MID_TAIL",
    topicFamily: "REAL_ESTATE_DATA",
    topicSubtopic: "수도권 지역별 risk budget",
    notes: "서울/경기/인천 선택 프레임워크 문서다.",
  },
  "investingInfo/sp500-impact-on-korea-kospi": {
    primaryQuery: "S&P500 코스피 영향",
    secondaryQueries: ["미국 증시 한국 증시 영향", "S&P500 상승 코스피", "글로벌 증시 코스피 연동", "미국 주식시장 한국시장", "코스피 미국 증시 관계"],
    primaryIntent: "MARKET_IMPACT",
    secondaryIntent: "DATA_INTERPRETATION",
    queryType: "MID_TAIL",
    topicFamily: "KOSPI_GLOBAL_LINK",
    topicSubtopic: "S&P500과 코스피 연결",
    coreDocument: true,
    notes: "미국 주식과 코스피 연결의 대표 문서 후보다.",
  },
  "investingInfo/tnx-basics": {
    primaryQuery: "미국 10년물 국채금리 뜻",
    secondaryQueries: ["TNX 뜻", "미국 국채 10년물 금리", "10년물 금리 보는 법", "미국 장기금리 뜻", "국채금리 주식 영향"],
    primaryIntent: "DEFINITION",
    secondaryIntent: "EXPLANATION",
    queryType: "HEAD",
    topicFamily: "TNX",
    topicSubtopic: "미국 10년물 금리 기초",
    coreDocument: true,
    notes: "TNX 계열의 정의 문서다.",
  },
  "investingInfo/us10y-impact-on-korea-and-stock-market": {
    primaryQuery: "미국 10년물 금리 한국 증시 영향",
    secondaryQueries: ["미국 10년물 금리 코스피 영향", "미국 장기금리 한국 증시", "10년물 금리 환율 영향", "미국 국채금리 성장주", "금리 상승 한국 주식"],
    primaryIntent: "MARKET_IMPACT",
    secondaryIntent: "DATA_INTERPRETATION",
    queryType: "LONG_TAIL",
    topicFamily: "TNX",
    topicSubtopic: "TNX와 한국 증시",
    notes: "TNX 정의보다 한국 주식시장 영향에 집중한다.",
  },
  "investingInfo/usd-krw-exchange-rate-and-kospi": {
    primaryQuery: "원달러 환율 코스피 영향",
    secondaryQueries: ["원달러 환율 상승 코스피", "환율 코스피 관계", "달러 강세 한국 주식", "환율 업종 영향", "원화 약세 주식시장"],
    primaryIntent: "MARKET_IMPACT",
    secondaryIntent: "DATA_INTERPRETATION",
    queryType: "MID_TAIL",
    topicFamily: "KOSPI_GLOBAL_LINK",
    topicSubtopic: "환율과 코스피",
    notes: "FX 일반론보다 코스피 영향에 둔다.",
  },
  "investingInfo/usd-krw-weak-won-sector-map-kospi": {
    primaryQuery: "원화 약세 수혜 업종",
    secondaryQueries: ["환율 상승 수혜 업종", "원달러 환율 업종별 영향", "수출주 환율 영향", "환율 방어주", "원화 약세 코스피 업종"],
    primaryIntent: "DATA_INTERPRETATION",
    secondaryIntent: "MARKET_IMPACT",
    queryType: "DATA_QUERY",
    topicFamily: "KOSPI_GLOBAL_LINK",
    topicSubtopic: "원화 약세와 업종 지도",
    notes: "환율-코스피 문서보다 업종 분해가 중심이다.",
  },
  "investingInfo/why-check-cagr-etf": {
    primaryQuery: "ETF 투자 CAGR 확인 이유",
    secondaryQueries: ["ETF 수익률 보는 법", "ETF CAGR 계산", "연평균 수익률 ETF", "장기 ETF 성과 비교", "누적수익률 CAGR 차이"],
    primaryIntent: "EXPLANATION",
    secondaryIntent: "HOW_TO",
    queryType: "MID_TAIL",
    topicFamily: "CAGR",
    topicSubtopic: "ETF 성과와 CAGR",
    notes: "CAGR 정의보다 ETF 성과 측정 목적에 둔다.",
  },
  "investingInfo/wti-impact-on-korea-kospi": {
    primaryQuery: "WTI 유가 코스피 영향",
    secondaryQueries: ["국제유가 한국 증시", "유가 상승 수혜 업종", "원유 가격 한국 경제", "유가 환율 코스피", "WTI 가격 투자 영향"],
    primaryIntent: "MARKET_IMPACT",
    secondaryIntent: "DATA_INTERPRETATION",
    queryType: "MID_TAIL",
    topicFamily: "OIL_ENERGY",
    topicSubtopic: "WTI와 한국 증시",
    notes: "WTI라는 가격 지표와 코스피 연결을 맡는다.",
  },

  "personalFinance/annual-vs-monthly-compound": {
    primaryQuery: "연복리 월복리 차이",
    secondaryQueries: ["연복리 뜻", "월복리 뜻", "복리 계산 주기 차이", "연복리 월복리 비교", "복리 이자 계산 방식"],
    primaryIntent: "COMPARISON",
    secondaryIntent: "EXPLANATION",
    queryType: "MID_TAIL",
    topicFamily: "COMPOUND_INTEREST",
    topicSubtopic: "복리 주기 비교",
    notes: "복리 정의보다 계산 주기 비교에 둔다.",
  },
  "personalFinance/apartment-buying-calculator-guide": {
    primaryQuery: "아파트 구매 계산기 사용법",
    secondaryQueries: ["아파트 구매 대출 계산", "내 연봉으로 살 수 있는 아파트", "주담대 월상환액 계산", "아파트 필요 현금 계산", "집 살 때 계산기"],
    primaryIntent: "HOW_TO",
    secondaryIntent: "CALCULATION",
    queryType: "CALCULATOR_SUPPORT",
    topicFamily: "REAL_ESTATE_BUDGET",
    topicSubtopic: "아파트 구매 계산기",
    coreDocument: true,
    notes: "주택 구입 예산 계산의 tool support 대표 문서다.",
  },
  "personalFinance/apartment-buying-costs-before-purchase": {
    primaryQuery: "아파트 매수 비용",
    secondaryQueries: ["아파트 매수 부대비용", "집 살 때 취득세 중개보수", "아파트 매수 전 확인할 비용", "주택 구입 필요 현금", "아파트 등기 대출 비용"],
    primaryIntent: "CHECKLIST",
    secondaryIntent: "CALCULATION",
    queryType: "MID_TAIL",
    topicFamily: "REAL_ESTATE_BUDGET",
    topicSubtopic: "매수 전 부대비용",
    notes: "대출한도보다 구입 전 비용 checklist가 중심이다.",
  },
  "personalFinance/apartment-transaction-volume-decline-meaning": {
    primaryQuery: "아파트 거래량 감소 의미",
    secondaryQueries: ["아파트 거래량 줄면", "부동산 거래량 감소 해석", "실거래량 집값 관계", "매수세 감소 의미", "아파트 시장 거래량 보는 법"],
    primaryIntent: "DATA_INTERPRETATION",
    secondaryIntent: "MARKET_IMPACT",
    queryType: "DATA_QUERY",
    topicFamily: "REAL_ESTATE_DATA",
    topicSubtopic: "거래량 해석",
    notes: "실거래가가 아니라 거래량 지표의 의미를 맡는다.",
  },
  "personalFinance/apt-dashboard-home-goal-roadmap": {
    primaryQuery: "아파트 시세 대시보드 활용법",
    secondaryQueries: ["아파트 실거래가 대시보드", "내집마련 목표 대시보드", "아파트 가격 지도 보는 법", "지역별 아파트 시세 확인", "주택 구입 목표 설정"],
    primaryIntent: "HOW_TO",
    secondaryIntent: "DECISION_SUPPORT",
    queryType: "DATA_QUERY",
    topicFamily: "REAL_ESTATE_DATA",
    topicSubtopic: "FinMap 아파트 대시보드 활용",
    coreDocument: true,
    notes: "대시보드 활용 중심의 guide다.",
  },
  "personalFinance/cash-100m-200m-300m-apartment-budget": {
    primaryQuery: "현금 1억 2억 3억 아파트 예산",
    secondaryQueries: ["현금 1억 아파트 구매", "현금 2억 집 살 수 있나", "현금 3억 아파트 예산", "보유 현금별 주택 예산", "아파트 구매 자기자본 계산"],
    primaryIntent: "CALCULATION",
    secondaryIntent: "SCENARIO_ANALYSIS",
    queryType: "LONG_TAIL",
    topicFamily: "REAL_ESTATE_BUDGET",
    topicSubtopic: "보유현금별 매수 예산",
    notes: "보유 현금 시나리오가 중심이다.",
  },
  "personalFinance/compound-calculator-guide": {
    primaryQuery: "복리 계산기 사용법",
    secondaryQueries: ["복리 계산기", "복리 이자 계산", "원금 수익률 기간 복리 계산", "복리 계산 공식", "투자 복리 계산"],
    primaryIntent: "HOW_TO",
    secondaryIntent: "CALCULATION",
    queryType: "CALCULATOR_SUPPORT",
    topicFamily: "COMPOUND_INTEREST",
    topicSubtopic: "복리 계산기",
    coreDocument: true,
    notes: "복리 tool support 대표 문서다.",
  },
  "personalFinance/compound-return-3-5-7-10-table": {
    primaryQuery: "복리 수익률 기간별 결과",
    secondaryQueries: ["3% 5% 7% 10% 복리", "복리 수익률 표", "연수익률별 복리 결과", "복리 투자 기간별 금액", "목표수익률 복리 계산"],
    primaryIntent: "CALCULATION",
    secondaryIntent: "SCENARIO_ANALYSIS",
    queryType: "DATA_QUERY",
    topicFamily: "COMPOUND_INTEREST",
    topicSubtopic: "수익률별 복리표",
    notes: "복리 계산법보다 결과표 query에 맞춘다.",
  },
  "personalFinance/dca-fx-volatility-decomposition": {
    primaryQuery: "적립식 투자 환율 변동성 영향",
    secondaryQueries: ["DCA 환율 영향", "해외 ETF 적립식 환율", "환율 변동 분할매수", "달러 투자 적립식 리스크", "적립식 투자 원화 환산"],
    primaryIntent: "EXPLANATION",
    secondaryIntent: "SCENARIO_ANALYSIS",
    queryType: "LONG_TAIL",
    topicFamily: "DCA",
    topicSubtopic: "DCA와 FX 변동성",
    notes: "DCA 일반론보다 환율 decomposition 문서다.",
  },
  "personalFinance/dca-step-up-ruleset": {
    primaryQuery: "적립식 투자 증액 전략",
    secondaryQueries: ["적립식 투자 금액 늘리기", "월 투자금 증액 규칙", "DCA step up 전략", "급여 인상 투자금", "적립식 투자 자동화 규칙"],
    primaryIntent: "HOW_TO",
    secondaryIntent: "DECISION_SUPPORT",
    queryType: "MID_TAIL",
    topicFamily: "DCA",
    topicSubtopic: "적립금 증액 규칙",
    notes: "투자 방식 비교가 아니라 납입액 운영 규칙이다.",
  },
  "personalFinance/dca-vs-lump-sum-when-results-differ": {
    primaryQuery: "적립식 투자 거치식 결과 차이",
    secondaryQueries: ["적립식 거치식 수익률 차이", "DCA 일시금 투자 결과", "분할매수 일시매수 비교", "시장 상황별 적립식 투자", "목돈 투자 적립식 투자 차이"],
    primaryIntent: "COMPARISON",
    secondaryIntent: "SCENARIO_ANALYSIS",
    queryType: "MID_TAIL",
    topicFamily: "DCA",
    topicSubtopic: "DCA와 일시금 결과 차이",
    notes: "왜 결과가 달라지는지에 초점을 둔다.",
  },
  "personalFinance/dca-vs-lumpsum-decision-rules": {
    primaryQuery: "적립식 투자 일시금 투자 선택",
    secondaryQueries: ["DCA vs 일시금 투자", "분할매수 목돈투자 선택", "적립식 투자 거치식 비교", "목돈 투자 언제 해야 하나", "일시금 투자 분할매수 기준"],
    primaryIntent: "DECISION_SUPPORT",
    secondaryIntent: "COMPARISON",
    queryType: "MID_TAIL",
    topicFamily: "DCA",
    topicSubtopic: "DCA vs lump sum decision rules",
    coreDocument: true,
    notes: "DCA와 일시금 선택 query의 대표 문서 후보다.",
  },
  "personalFinance/dsr-40-income-loan-limit-table": {
    primaryQuery: "DSR 40 연봉별 대출한도",
    secondaryQueries: ["연봉별 주담대 한도", "DSR 40 대출 가능액", "소득별 대출한도 표", "연소득 DSR 계산", "주택담보대출 연봉 한도"],
    primaryIntent: "CALCULATION",
    secondaryIntent: "DATA_INTERPRETATION",
    queryType: "DATA_QUERY",
    topicFamily: "DSR_LTV",
    topicSubtopic: "연봉별 DSR 40 한도표",
    coreDocument: true,
    notes: "연봉별 표 query를 담당한다.",
  },
  "personalFinance/dsr-pass-ltv-cash-bottleneck": {
    primaryQuery: "DSR LTV 현금 부족",
    secondaryQueries: ["DSR 통과해도 집 못 사는 이유", "LTV 한도 자기자본 부족", "주담대 한도 현금 부족", "아파트 매수 자금 부족", "DSR LTV 현금 계산"],
    primaryIntent: "DECISION_SUPPORT",
    secondaryIntent: "CALCULATION",
    queryType: "MID_TAIL",
    topicFamily: "DSR_LTV",
    topicSubtopic: "대출한도와 현금 bottleneck",
    notes: "한도 계산 자체보다 병목 진단이 중심이다.",
  },
  "personalFinance/emergency-fund-by-risk": {
    primaryQuery: "비상금 얼마 필요",
    secondaryQueries: ["비상금 적정 금액", "생활비 몇 개월 비상금", "직장인 비상금 기준", "가계 비상자금 계산", "위험별 비상금"],
    primaryIntent: "CALCULATION",
    secondaryIntent: "CHECKLIST",
    queryType: "QUESTION",
    topicFamily: "HOUSEHOLD_FINANCE",
    topicSubtopic: "비상금 기준",
    notes: "개인 재무의 cash buffer query다.",
  },
  "personalFinance/fire-3-numbers-spending-horizon-withdrawal": {
    primaryQuery: "파이어족 은퇴자금 계산",
    secondaryQueries: ["FIRE 은퇴자금 얼마", "은퇴 생활비 계산", "은퇴 기간 인출률", "파이어 목표금액 계산", "은퇴자금 계산기"],
    primaryIntent: "CALCULATION",
    secondaryIntent: "SCENARIO_ANALYSIS",
    queryType: "CALCULATOR_SUPPORT",
    topicFamily: "FIRE",
    topicSubtopic: "FIRE 3 numbers",
    coreDocument: true,
    notes: "FIRE 계열의 자금 계산 대표 문서다.",
  },
  "personalFinance/fire-assumption-errors-7-fixes": {
    primaryQuery: "파이어족 계산 실수",
    secondaryQueries: ["FIRE 계산 오류", "은퇴자금 계산 주의점", "파이어족 가정 점검", "은퇴 계획 실수", "인출률 물가 세금 반영"],
    primaryIntent: "CHECKLIST",
    secondaryIntent: "DECISION_SUPPORT",
    queryType: "MID_TAIL",
    topicFamily: "FIRE",
    topicSubtopic: "FIRE assumptions review",
    notes: "FIRE 계산 후 검증 checklist 문서다.",
  },
  "personalFinance/fire-sequence-risk-first-5-years": {
    primaryQuery: "은퇴 초기 순서위험",
    secondaryQueries: ["sequence of returns risk", "은퇴 직후 하락장", "은퇴자금 순서 리스크", "FIRE 초반 5년 리스크", "인출 시점 수익률 위험"],
    primaryIntent: "EXPLANATION",
    secondaryIntent: "SCENARIO_ANALYSIS",
    queryType: "MID_TAIL",
    topicFamily: "FIRE",
    topicSubtopic: "Sequence risk",
    notes: "FIRE 계산보다 인출 순서 리스크를 맡는다.",
  },
  "personalFinance/fire-spending-buckets-essential-choice-insurance": {
    primaryQuery: "은퇴 생활비 버킷 전략",
    secondaryQueries: ["FIRE 생활비 버킷", "은퇴 필수지출 선택지출", "은퇴 보험료 예산", "은퇴 현금 버퍼", "파이어족 생활비 관리"],
    primaryIntent: "DECISION_SUPPORT",
    secondaryIntent: "CHECKLIST",
    queryType: "MID_TAIL",
    topicFamily: "FIRE",
    topicSubtopic: "은퇴 지출 bucket",
    notes: "인출액보다 지출 구조와 버퍼 설계에 둔다.",
  },
  "personalFinance/first-home-buyer-budget-calculation": {
    primaryQuery: "생애최초 주택 구입 예산",
    secondaryQueries: ["첫 집 마련 예산 계산", "생애최초 아파트 구매 자금", "내집마련 예산 계산", "DSR LTV 주택 구입 예산", "첫 주택 필요 현금"],
    primaryIntent: "CALCULATION",
    secondaryIntent: "DECISION_SUPPORT",
    queryType: "LONG_TAIL",
    topicFamily: "REAL_ESTATE_BUDGET",
    topicSubtopic: "생애최초 구입 예산",
    notes: "첫 주택 구입자 scenario query를 담당한다.",
  },
  "personalFinance/goal-amount-fast-strategy": {
    primaryQuery: "목표 금액 빨리 모으는 법",
    secondaryQueries: ["목표금액 달성 전략", "저축 투자 속도 높이기", "월 저축액 늘리는 법", "목표자산 계산", "목돈 모으기 계획"],
    primaryIntent: "HOW_TO",
    secondaryIntent: "CALCULATION",
    queryType: "MID_TAIL",
    topicFamily: "HOUSEHOLD_FINANCE",
    topicSubtopic: "목표금액 달성 전략",
    notes: "목표금액 계산과 실행 전략 사이의 문서다.",
  },
  "personalFinance/high-rate-debt-vs-invest-threshold-rule": {
    primaryQuery: "고금리 대출 상환 투자 비교",
    secondaryQueries: ["빚 먼저 갚기 투자 먼저", "대출 이자 투자 수익률 비교", "고금리 부채 상환 기준", "부채와 투자 우선순위", "신용대출 상환 투자"],
    primaryIntent: "DECISION_SUPPORT",
    secondaryIntent: "COMPARISON",
    queryType: "MID_TAIL",
    topicFamily: "HOUSEHOLD_FINANCE",
    topicSubtopic: "부채 상환 vs 투자",
    notes: "household finance의 의사결정형 query다.",
  },
  "personalFinance/how-much-monthly-invest-for-100m": {
    primaryQuery: "1억원 만들기 월 투자금",
    secondaryQueries: ["1억 만들려면 매달 얼마", "1억원 목표 월 납입금", "1억 모으기 투자 계산", "목표금액 월 투자금 계산", "DCA 1억 만들기"],
    primaryIntent: "CALCULATION",
    secondaryIntent: "HOW_TO",
    queryType: "CALCULATOR_SUPPORT",
    topicFamily: "DCA",
    topicSubtopic: "1억원 목표 월납입 계산",
    notes: "1억원 목표를 계산기와 연결하는 대표 후보 중 하나다.",
  },
  "personalFinance/how-much-per-month-for-100m": {
    primaryQuery: "1억 모으기 매달 얼마",
    secondaryQueries: ["1억 모으려면 월 얼마", "1억원 저축 기간별 금액", "1억 만들기 월 저축액", "월 얼마 투자하면 1억", "목표 1억 적립식 투자"],
    primaryIntent: "CALCULATION",
    secondaryIntent: "SCENARIO_ANALYSIS",
    queryType: "QUESTION",
    topicFamily: "DCA",
    topicSubtopic: "1억 목표 monthly question",
    notes: "사용자 질문형 표현을 맡지만 1억원 월납입 문서들과 충돌한다.",
  },
  "personalFinance/how-to-read-apartment-transaction-prices": {
    primaryQuery: "아파트 실거래가 보는 법",
    secondaryQueries: ["아파트 실거래가 해석", "실거래가와 호가 차이", "국토부 실거래가 보는 법", "아파트 가격 자료 읽기", "최근 거래가 확인 방법"],
    primaryIntent: "HOW_TO",
    secondaryIntent: "DATA_INTERPRETATION",
    queryType: "DATA_QUERY",
    topicFamily: "REAL_ESTATE_DATA",
    topicSubtopic: "실거래가 읽기",
    notes: "대시보드보다 실거래가 데이터 해석에 둔다.",
  },
  "personalFinance/inflation-household-survival-strategy": {
    primaryQuery: "물가 상승 가계부 관리",
    secondaryQueries: ["인플레이션 생활비 관리", "물가 상승 대응 방법", "가계 지출 줄이는 법", "생활비 예산 재조정", "고물가 저축 전략"],
    primaryIntent: "HOW_TO",
    secondaryIntent: "DECISION_SUPPORT",
    queryType: "MID_TAIL",
    topicFamily: "HOUSEHOLD_FINANCE",
    topicSubtopic: "가계 인플레이션 대응",
    notes: "거시 인플레이션 정의가 아니라 가계 행동으로 분리한다.",
  },
  "personalFinance/interest-rate-1p-loan-limit-impact": {
    primaryQuery: "금리 1%p 대출한도 영향",
    secondaryQueries: ["금리 오르면 대출한도", "주담대 금리 1% 차이", "이자율 상승 월상환액", "DSR 금리 변화 영향", "대출금리 한도 계산"],
    primaryIntent: "CALCULATION",
    secondaryIntent: "SCENARIO_ANALYSIS",
    queryType: "LONG_TAIL",
    topicFamily: "DSR_LTV",
    topicSubtopic: "금리 변화와 대출한도",
    notes: "DSR/LTV 일반론보다 금리 민감도 계산이다.",
  },
  "personalFinance/is-dca-better-in-bear-market": {
    primaryQuery: "하락장 적립식 투자",
    secondaryQueries: ["하락장 분할매수", "적립식 투자 장점 하락장", "DCA 하락장 효과", "베어마켓 적립식 투자", "하락장 투자 방법"],
    primaryIntent: "DECISION_SUPPORT",
    secondaryIntent: "SCENARIO_ANALYSIS",
    queryType: "MID_TAIL",
    topicFamily: "DCA",
    topicSubtopic: "하락장 DCA decision",
    notes: "DCA 선택론 중 시장 국면별 판단을 맡는다.",
  },
  "personalFinance/jeonse-to-home-purchase-cash-needed": {
    primaryQuery: "전세에서 매매 갈아타기 현금",
    secondaryQueries: ["전세보증금 매매 자금", "전세 만기 집 매수 현금", "전세에서 자가 갈아타기", "매매 잔금 필요 현금", "주택 갈아타기 자금 계산"],
    primaryIntent: "CALCULATION",
    secondaryIntent: "DECISION_SUPPORT",
    queryType: "LONG_TAIL",
    topicFamily: "REAL_ESTATE_BUDGET",
    topicSubtopic: "전세에서 매매 전환",
    notes: "전세보증금과 잔금 timing이 중심이다.",
  },
  "personalFinance/large-apartment-complex-households-price-stability": {
    primaryQuery: "대단지 아파트 가격 안정성",
    secondaryQueries: ["대단지 아파트 장점", "세대수 많은 아파트 가격", "아파트 단지 규모 집값", "대단지 거래량 안정성", "대단지 아파트 투자"],
    primaryIntent: "EXPLANATION",
    secondaryIntent: "DATA_INTERPRETATION",
    queryType: "MID_TAIL",
    topicFamily: "REAL_ESTATE_DATA",
    topicSubtopic: "단지 규모와 가격 안정성",
    notes: "개별 예산 계산보다 apartment quality factor다.",
  },
  "personalFinance/ltv-dsr-calculator-guide": {
    primaryQuery: "LTV DSR 계산기 사용법",
    secondaryQueries: ["주택담보대출 DSR 계산기", "주담대 한도 계산", "아파트 담보대출 계산기", "DSR 40 계산", "LTV 계산기"],
    primaryIntent: "HOW_TO",
    secondaryIntent: "CALCULATION",
    queryType: "CALCULATOR_SUPPORT",
    topicFamily: "DSR_LTV",
    topicSubtopic: "LTV/DSR calculator guide",
    coreDocument: true,
    notes: "DSR/LTV tool support 대표 문서다.",
  },
  "personalFinance/monthly-dca-10-year-result": {
    primaryQuery: "월 적립식 투자 10년 결과",
    secondaryQueries: ["매달 투자 10년 후", "월 50만원 적립식 투자 10년", "DCA 10년 수익률", "적립식 투자 장기 결과", "월 투자 복리 결과"],
    primaryIntent: "CALCULATION",
    secondaryIntent: "SCENARIO_ANALYSIS",
    queryType: "LONG_TAIL",
    topicFamily: "DCA",
    topicSubtopic: "10년 월투자 결과",
    notes: "기간 고정형 DCA result query다.",
  },
  "personalFinance/monthly-investment-for-100m-table": {
    primaryQuery: "목표금액별 월 투자금 표",
    secondaryQueries: ["1억 2억 3억 월 투자금", "목표금액 월 납입금 표", "월 투자금 계산표", "투자 목표금액 계산", "적립식 투자 목표금액 표"],
    primaryIntent: "CALCULATION",
    secondaryIntent: "DATA_INTERPRETATION",
    queryType: "DATA_QUERY",
    topicFamily: "DCA",
    topicSubtopic: "목표금액별 월납입 표",
    notes: "1억원 단일 query보다 table/targets query에 둔다.",
  },
  "personalFinance/mortgage-risk-checklist-dsr-variable": {
    primaryQuery: "주담대 위험 체크리스트",
    secondaryQueries: ["변동금리 주담대 위험", "DSR 주담대 리스크", "주택담보대출 점검사항", "대출 상환 위험 확인", "주담대 금리 상승 대비"],
    primaryIntent: "CHECKLIST",
    secondaryIntent: "DECISION_SUPPORT",
    queryType: "MID_TAIL",
    topicFamily: "DSR_LTV",
    topicSubtopic: "주담대 risk checklist",
    notes: "한도 계산 이후 risk review 문서다.",
  },
  "personalFinance/personal-finance-3pillars": {
    primaryQuery: "개인 재무관리 3요소",
    secondaryQueries: ["재무관리 기본 원칙", "가계 재무관리", "저축 투자 보험 관리", "개인 재무 설계 기초", "돈 관리 핵심"],
    primaryIntent: "EXPLANATION",
    secondaryIntent: "CHECKLIST",
    queryType: "MID_TAIL",
    topicFamily: "HOUSEHOLD_FINANCE",
    topicSubtopic: "개인재무 framework",
    coreDocument: true,
    notes: "개인재무의 broad framework라 ownership review가 필요하다.",
  },
  "personalFinance/personal-start-5steps": {
    primaryQuery: "재테크 시작하는 법",
    secondaryQueries: ["사회초년생 재테크 시작", "돈 관리 시작 5단계", "투자 전 재무 준비", "비상금 예산 투자 순서", "재테크 초보 가이드"],
    primaryIntent: "HOW_TO",
    secondaryIntent: "CHECKLIST",
    queryType: "MID_TAIL",
    topicFamily: "HOUSEHOLD_FINANCE",
    topicSubtopic: "재테크 시작 sequence",
    notes: "개인재무 framework와 겹치지만 starter sequence를 맡긴다.",
  },
  "personalFinance/rent-jeonse-buy-cashflow-opportunity-cost": {
    primaryQuery: "월세 전세 매매 비교",
    secondaryQueries: ["월세 전세 매매 뭐가 유리", "전세 매매 기회비용", "주거비 현금흐름 비교", "집 살지 전세 살지", "월세 전세 기회비용"],
    primaryIntent: "COMPARISON",
    secondaryIntent: "DECISION_SUPPORT",
    queryType: "MID_TAIL",
    topicFamily: "REAL_ESTATE_BUDGET",
    topicSubtopic: "주거 선택 cashflow 비교",
    notes: "매수 예산보다 임차/매수 선택 비교가 중심이다.",
  },
  "personalFinance/salary-40m-mortgage-limit": {
    primaryQuery: "연봉 4000만원 주담대 가능액",
    secondaryQueries: ["연봉 4000만원 대출한도", "연봉 4000 DSR 40", "연봉 4000 아파트 예산", "주담대 가능액 계산", "연봉별 주담대 한도"],
    primaryIntent: "CALCULATION",
    secondaryIntent: "SCENARIO_ANALYSIS",
    queryType: "LONG_TAIL",
    topicFamily: "DSR_LTV",
    topicSubtopic: "연봉 4000만원 주담대 scenario",
    notes: "연봉별 표보다 4000만원 단일 scenario query다.",
  },
  "personalFinance/salary-50m-dsr-40-loan-limit": {
    primaryQuery: "연봉 5000만원 DSR 40 대출 가능액",
    secondaryQueries: ["연봉 5000만원 대출한도", "연봉 5000 DSR", "연봉 5000 주담대 가능액", "DSR 40 대출 가능액", "연봉 5000 아파트 예산"],
    primaryIntent: "CALCULATION",
    secondaryIntent: "SCENARIO_ANALYSIS",
    queryType: "LONG_TAIL",
    topicFamily: "DSR_LTV",
    topicSubtopic: "연봉 5000만원 DSR scenario",
    notes: "사용자 예시처럼 exact title보다 자연 검색어를 primary로 둔다.",
  },
  "personalFinance/simple-vs-compound": {
    primaryQuery: "단리 복리 차이",
    secondaryQueries: ["단리 뜻", "복리 뜻", "단리 복리 계산", "단리 복리 비교", "이자 계산 방식 차이"],
    primaryIntent: "COMPARISON",
    secondaryIntent: "DEFINITION",
    queryType: "MID_TAIL",
    topicFamily: "COMPOUND_INTEREST",
    topicSubtopic: "단리 vs 복리",
    notes: "복리 계산기와 달리 개념 비교 문서다.",
  },
  "personalFinance/what-is-cagr": {
    primaryQuery: "CAGR 뜻",
    secondaryQueries: ["연평균 성장률 뜻", "CAGR 계산법", "CAGR 수익률", "누적수익률 CAGR 차이", "투자 CAGR 의미"],
    primaryIntent: "DEFINITION",
    secondaryIntent: "CALCULATION",
    queryType: "HEAD",
    topicFamily: "CAGR",
    topicSubtopic: "CAGR 기초",
    coreDocument: true,
    notes: "CAGR 계열의 definition owner다.",
  },
};

const MANUAL_CONFLICTS = [
  ["economicInfo/hormuz-risk-oil-insurance-freight-premium", "economicInfo/war-risk-oil-supply-insurance-shipping", "중동/전쟁 유가 리스크", "PRIMARY_SECONDARY", "HIGH"],
  ["economicInfo/inflation-basics", "economicInfo/inflation-rate-basics", "인플레이션과 물가상승률 기초", "PRIMARY_SECONDARY", "HIGH"],
  ["economicInfo/indicator-basics", "investingInfo/indicator-marketinfo", "경제지표/투자지표 보는 법", "PRIMARY_PRIMARY", "MEDIUM"],
  ["economicInfo/interest-rate-basics", "economicInfo/policy-rate-cut-market-rates", "금리와 기준금리 영향", "PRIMARY_SECONDARY", "MEDIUM"],
  ["economicInfo/interest-rate-basics", "investingInfo/tnx-basics", "금리 뜻과 국채금리 뜻", "SECONDARY_SECONDARY", "MEDIUM"],
  ["investingInfo/tnx-basics", "investingInfo/us10y-impact-on-korea-and-stock-market", "미국 10년물 금리", "PRIMARY_SECONDARY", "HIGH"],
  ["investingInfo/etf-impact-of-tnx", "investingInfo/korea-etf-deep-dive-tnx", "TNX와 ETF 영향", "PRIMARY_PRIMARY", "HIGH"],
  ["investingInfo/dxy-dollar-index-basics", "investingInfo/dxy-market-impact", "달러인덱스 정의와 영향", "PRIMARY_SECONDARY", "MEDIUM"],
  ["investingInfo/usd-krw-exchange-rate-and-kospi", "investingInfo/usd-krw-weak-won-sector-map-kospi", "원달러 환율과 코스피/업종", "PRIMARY_SECONDARY", "HIGH"],
  ["investingInfo/dca-consistency-7-fail-patterns", "personalFinance/dca-step-up-ruleset", "적립식 투자 실행 규칙", "SECONDARY_SECONDARY", "MEDIUM"],
  ["personalFinance/dca-vs-lumpsum-decision-rules", "personalFinance/dca-vs-lump-sum-when-results-differ", "DCA vs 일시금", "PRIMARY_PRIMARY", "HIGH"],
  ["personalFinance/how-much-monthly-invest-for-100m", "personalFinance/how-much-per-month-for-100m", "1억원 목표 월 투자금", "PRIMARY_PRIMARY", "HIGH"],
  ["personalFinance/how-much-monthly-invest-for-100m", "personalFinance/monthly-investment-for-100m-table", "목표금액 월 투자금 계산", "PRIMARY_SECONDARY", "HIGH"],
  ["personalFinance/how-much-per-month-for-100m", "personalFinance/monthly-investment-for-100m-table", "1억/목표금액 월 납입표", "PRIMARY_SECONDARY", "HIGH"],
  ["personalFinance/compound-calculator-guide", "personalFinance/compound-return-3-5-7-10-table", "복리 계산과 복리 결과표", "PRIMARY_SECONDARY", "MEDIUM"],
  ["personalFinance/compound-calculator-guide", "personalFinance/simple-vs-compound", "복리 뜻과 계산기", "SECONDARY_SECONDARY", "MEDIUM"],
  ["personalFinance/annual-vs-monthly-compound", "personalFinance/simple-vs-compound", "복리 방식 비교", "SECONDARY_SECONDARY", "MEDIUM"],
  ["personalFinance/ltv-dsr-calculator-guide", "personalFinance/dsr-40-income-loan-limit-table", "DSR 계산기와 연봉별 한도표", "PRIMARY_SECONDARY", "MEDIUM"],
  ["personalFinance/dsr-40-income-loan-limit-table", "personalFinance/salary-40m-mortgage-limit", "연봉별 주담대 한도와 4000만원 scenario", "PRIMARY_SECONDARY", "HIGH"],
  ["personalFinance/dsr-40-income-loan-limit-table", "personalFinance/salary-50m-dsr-40-loan-limit", "연봉별 주담대 한도와 5000만원 scenario", "PRIMARY_SECONDARY", "HIGH"],
  ["personalFinance/apartment-buying-calculator-guide", "personalFinance/first-home-buyer-budget-calculation", "주택 구입 예산 계산", "PRIMARY_SECONDARY", "MEDIUM"],
  ["personalFinance/apartment-buying-calculator-guide", "personalFinance/cash-100m-200m-300m-apartment-budget", "보유현금별 아파트 예산", "PRIMARY_SECONDARY", "MEDIUM"],
  ["personalFinance/first-home-buyer-budget-calculation", "personalFinance/jeonse-to-home-purchase-cash-needed", "주택 구입 필요 현금", "SECONDARY_SECONDARY", "MEDIUM"],
  ["personalFinance/personal-finance-3pillars", "personalFinance/personal-start-5steps", "개인재무 입문", "PRIMARY_SECONDARY", "HIGH"],
  ["personalFinance/fire-3-numbers-spending-horizon-withdrawal", "personalFinance/fire-assumption-errors-7-fixes", "FIRE 은퇴자금 계산과 가정 점검", "PRIMARY_SECONDARY", "MEDIUM"],
];

const MANUAL_UNCLEAR = {
  "economicInfo/indicator-basics": ["TOO_BROAD", "OVERLAPS_OTHER_POST"],
  "economicInfo/geopolitics-oil-fx-dashboard": ["MULTIPLE_INTENTS"],
  "economicInfo/geopolitics-to-usd-liquidity-fx": ["OVERLAPS_OTHER_POST"],
  "economicInfo/war-theme-investing-price-chain-not-winners": ["EDITORIAL_TITLE"],
  "investingInfo/indicator-marketinfo": ["TOO_BROAD", "OVERLAPS_OTHER_POST"],
  "investingInfo/modern-6040-risk-budget": ["WEAK_SEARCH_PHRASE"],
  "investingInfo/real-estate-role-in-portfolio-risk-budget": ["MULTIPLE_INTENTS"],
  "investingInfo/seoul-gyeonggi-incheon-risk-budget-framework": ["WEAK_SEARCH_PHRASE"],
  "personalFinance/goal-amount-fast-strategy": ["TOO_BROAD"],
  "personalFinance/how-much-monthly-invest-for-100m": ["OVERLAPS_OTHER_POST"],
  "personalFinance/how-much-per-month-for-100m": ["OVERLAPS_OTHER_POST"],
  "personalFinance/monthly-investment-for-100m-table": ["OVERLAPS_OTHER_POST"],
  "personalFinance/personal-finance-3pillars": ["TOO_BROAD", "OVERLAPS_OTHER_POST"],
  "personalFinance/personal-start-5steps": ["TOO_BROAD", "OVERLAPS_OTHER_POST"],
};

const STOPWORDS = new Set([
  "그리고",
  "하지만",
  "위한",
  "있는",
  "없는",
  "하는",
  "하면",
  "때문",
  "계산기",
  "사용법",
  "가이드",
  "방법",
  "영향",
  "의미",
  "기준",
  "전략",
  "비교",
  "체크",
]);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function rel(filePath) {
  return path.relative(ROOT, filePath).replace(/\\/g, "/");
}

function normalize(value) {
  return String(value || "")
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .trim();
}

function stripMarkdown(value) {
  return normalize(
    String(value || "")
      .replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, " $1 ")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, " $1 ")
      .replace(/<[^>]+>/g, " ")
      .replace(/[#>*_`~|:-]/g, " ")
      .replace(/\s+/g, " ")
  );
}

function readMarkdownText(post) {
  const filePath = path.join(ROOT, post.filePath);
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const content = raw.replace(/^---[\s\S]*?---/, "");
    return stripMarkdown(content);
  } catch {
    return "";
  }
}

function tokens(value) {
  return Array.from(
    new Set(
      normalize(value)
        .toLowerCase()
        .split(/[^\p{L}\p{N}%+]+/u)
        .map((token) => token.trim())
        .filter((token) => token.length >= 2 && !STOPWORDS.has(token))
    )
  );
}

function tokenCoverage(query, text) {
  const q = tokens(query);
  if (!q.length) return 0;
  const haystack = normalize(text).toLowerCase();
  const hits = q.filter((token) => haystack.includes(token)).length;
  return hits / q.length;
}

function grade(score) {
  if (score >= 0.67) return "HIGH";
  if (score >= 0.34) return "MEDIUM";
  return "LOW";
}

function uniq(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function confidenceFor(post, override, evidence) {
  const unclear = MANUAL_UNCLEAR[post.id] || [];
  if (unclear.includes("CONTENT_QUERY_MISMATCH")) return "LOW";
  if (evidence.titleAlignment === "HIGH" && evidence.bodyCoverage !== "LOW" && evidence.descriptionAlignment !== "LOW") return "HIGH";
  if (evidence.titleAlignment === "HIGH" && evidence.bodyCoverage === "HIGH") return "HIGH";
  if (evidence.bodyCoverage === "HIGH" && evidence.searchIntentFit === "HIGH") return "MEDIUM";
  if (evidence.titleAlignment === "MEDIUM" || evidence.descriptionAlignment === "MEDIUM" || evidence.bodyCoverage === "MEDIUM") return "MEDIUM";
  return "LOW";
}

function queryTypeSpecificity(queryType, primaryQuery) {
  if (queryType === "HEAD") return "BROAD";
  if (queryType === "LONG_TAIL" || queryType === "CALCULATOR_SUPPORT" || queryType === "DATA_QUERY") return "SPECIFIC";
  return tokens(primaryQuery).length >= 4 ? "SPECIFIC" : "MODERATE";
}

function exactTitleDependencyRisk(post, override, evidence) {
  const query = normalize(override.primaryQuery);
  const title = normalize(post.title);
  const frontLoaded = title.startsWith(query) || title.split(/[|:：]/)[0].includes(query);
  if (frontLoaded && query.length <= 26 && evidence.bodyCoverage !== "LOW") return "LOW";
  if (evidence.titleAlignment === "LOW" || (MANUAL_UNCLEAR[post.id] || []).includes("EDITORIAL_TITLE")) return "HIGH";
  if (frontLoaded || evidence.titleAlignment === "HIGH") return "MEDIUM";
  return "MEDIUM";
}

function tagAnalysis(post, override) {
  const tags = post.tags || [];
  const tagText = tags.join(" ");
  const primaryScore = tokenCoverage(override.primaryQuery, tagText);
  const secondaryScores = override.secondaryQueries.map((query) => tokenCoverage(query, tagText));
  const secondaryScore = secondaryScores.length ? Math.max(...secondaryScores) : 0;
  const supportingPrimary = tags.filter((tag) => tokenCoverage(override.primaryQuery, tag) > 0);
  const supportingSecondary = tags.filter((tag) => override.secondaryQueries.some((query) => tokenCoverage(query, tag) > 0));
  const broadTags = tags.filter((tag) => tokens(tag).length <= 1 || /투자|경제|금리|환율|부동산|대출|유가|ETF|DCA|CAGR|DSR|LTV/i.test(tag));
  const missingConcepts = tokens(override.primaryQuery).filter((token) => !normalize(tagText).toLowerCase().includes(token));
  let support = "TAG_WEAKLY_SUPPORTS_QUERY";
  if (primaryScore >= 0.5 || (primaryScore >= 0.34 && secondaryScore >= 0.34)) support = "TAG_SUPPORTS_QUERY";
  else if (primaryScore >= 0.2 || secondaryScore >= 0.25 || supportingPrimary.length || supportingSecondary.length) support = "TAG_PARTIALLY_SUPPORTS_QUERY";
  return {
    tagQuerySupport: support,
    primaryTokenCoverage: Number(primaryScore.toFixed(2)),
    secondaryTokenCoverage: Number(secondaryScore.toFixed(2)),
    tagsSupportingPrimaryQuery: supportingPrimary.slice(0, 8),
    tagsSupportingSecondaryQuery: supportingSecondary.slice(0, 8),
    irrelevantOrBroadTags: broadTags.slice(0, 8),
    queryConceptMissingFromTags: missingConcepts.slice(0, 8),
  };
}

function jaccard(a, b) {
  const aa = new Set(a);
  const bb = new Set(b);
  if (!aa.size && !bb.size) return 0;
  let hits = 0;
  for (const item of aa) if (bb.has(item)) hits += 1;
  return hits / (aa.size + bb.size - hits);
}

function similarity(a, b) {
  const primaryOverlap = jaccard(tokens(a.primaryQuery), tokens(b.primaryQuery));
  const secondaryOverlap = Math.max(
    0,
    ...a.secondaryQueries.map((aq) => Math.max(...b.secondaryQueries.map((bq) => jaccard(tokens(aq), tokens(bq)))))
  );
  const crossA = Math.max(...b.secondaryQueries.map((query) => jaccard(tokens(a.primaryQuery), tokens(query))), 0);
  const crossB = Math.max(...a.secondaryQueries.map((query) => jaccard(tokens(b.primaryQuery), tokens(query))), 0);
  return { primaryOverlap, secondaryOverlap, crossOverlap: Math.max(crossA, crossB) };
}

function conflictType(sim) {
  if (sim.primaryOverlap >= 0.45) return "PRIMARY_PRIMARY";
  if (sim.crossOverlap >= 0.45) return "PRIMARY_SECONDARY";
  return "SECONDARY_SECONDARY";
}

function conflictSeverity(sim, sameFamily) {
  if (sim.primaryOverlap >= 0.5 || sim.crossOverlap >= 0.55) return "HIGH";
  if (sameFamily && (sim.primaryOverlap >= 0.25 || sim.crossOverlap >= 0.34 || sim.secondaryOverlap >= 0.45)) return "MEDIUM";
  return "LOW";
}

function csvEscape(value) {
  const s = Array.isArray(value) ? value.join("; ") : String(value == null ? "" : value);
  return `"${s.replace(/"/g, '""')}"`;
}

function mdEscape(value) {
  return String(value == null ? "" : value)
    .replace(/\|/g, "\\|")
    .replace(/\r?\n/g, "<br>")
    .trim();
}

function truncate(value, max = 72) {
  const s = normalize(value);
  return s.length > max ? `${s.slice(0, max - 1)}...` : s;
}

function countBy(items, keyFn) {
  const out = {};
  for (const item of items) {
    const key = keyFn(item);
    out[key] = (out[key] || 0) + 1;
  }
  return out;
}

function buildQueryMap(posts) {
  return posts.map((post) => {
    const override = QUERY_OVERRIDES[post.id];
    if (!override) throw new Error(`Missing query override for ${post.id}`);
    const bodyText = readMarkdownText(post);
    const h2Text = (post.structure?.h2s || []).join(" ");
    const titleScore = tokenCoverage(override.primaryQuery, post.title);
    const descriptionScore = tokenCoverage(override.primaryQuery, post.description);
    const h2BodyScore = Math.max(tokenCoverage(override.primaryQuery, h2Text), tokenCoverage(override.primaryQuery, bodyText));
    const intentScore = h2BodyScore >= 0.34 || descriptionScore >= 0.34 ? 1 : titleScore >= 0.34 ? 0.67 : 0.33;
    const evidence = {
      rationale: override.notes,
      titleAlignment: grade(titleScore),
      titleAlignmentScore: Number(titleScore.toFixed(2)),
      descriptionAlignment: grade(descriptionScore),
      descriptionAlignmentScore: Number(descriptionScore.toFixed(2)),
      h2BodyCoverage: grade(h2BodyScore),
      h2BodyCoverageScore: Number(h2BodyScore.toFixed(2)),
      bodyCoverage: grade(h2BodyScore),
      searchIntentFit: grade(intentScore),
      specificity: queryTypeSpecificity(override.queryType, override.primaryQuery),
      ownershipConfidence: "MEDIUM",
    };
    const primaryQueryConfidence = confidenceFor(post, override, evidence);
    evidence.ownershipConfidence = primaryQueryConfidence;
    const tag = tagAnalysis(post, override);
    const risk = exactTitleDependencyRisk(post, override, evidence);
    const unclearReasons = uniq([...(MANUAL_UNCLEAR[post.id] || [])]);
    if (primaryQueryConfidence === "LOW") unclearReasons.push("WEAK_SEARCH_PHRASE");
    if (risk === "HIGH" && !unclearReasons.includes("EDITORIAL_TITLE")) unclearReasons.push("TITLE_DEPENDENCY");

    return {
      category: post.categorySlug,
      slug: post.slug,
      id: post.id,
      url: post.url,
      title: post.title,
      primaryQuery: override.primaryQuery,
      primaryQueryConfidence,
      secondaryQueries: override.secondaryQueries,
      primaryIntent: override.primaryIntent,
      secondaryIntent: override.secondaryIntent,
      queryType: override.queryType,
      topicFamily: override.topicFamily,
      topicSubtopic: override.topicSubtopic,
      titleQueryAlignment: evidence.titleAlignment,
      exactTitleDependencyRisk: risk,
      tagQuerySupport: tag.tagQuerySupport,
      possibleCompetingPosts: [],
      notes: override.notes,
      primaryQueryEvidence: evidence,
      tagAnalysis: tag,
      unclearQueryOwnership: unclearReasons.length
        ? {
            flag: "UNCLEAR_QUERY_OWNERSHIP",
            reasons: unclearReasons,
          }
        : null,
      coreDocumentCandidate: Boolean(override.coreDocument),
    };
  });
}

function buildConflicts(queryMap) {
  const byId = new Map(queryMap.map((item) => [item.id, item]));
  const conflicts = [];
  const seen = new Set();
  for (const [aId, bId, topic, type, severity] of MANUAL_CONFLICTS) {
    const a = byId.get(aId);
    const b = byId.get(bId);
    if (!a || !b) continue;
    const key = [aId, bId].sort().join("::");
    seen.add(key);
    conflicts.push({
      postA: aId,
      postB: bId,
      overlappingQueryOrTopic: topic,
      conflictType: type,
      similarityReason: "Manual review candidate from overlapping query ownership and shared topic family.",
      reviewSeverity: severity,
    });
  }

  for (let i = 0; i < queryMap.length; i += 1) {
    for (let j = i + 1; j < queryMap.length; j += 1) {
      const a = queryMap[i];
      const b = queryMap[j];
      const sim = similarity(a, b);
      const sameFamily = a.topicFamily === b.topicFamily;
      const severity = conflictSeverity(sim, sameFamily);
      if (severity === "LOW") continue;
      const key = [a.id, b.id].sort().join("::");
      if (seen.has(key)) continue;
      seen.add(key);
      conflicts.push({
        postA: a.id,
        postB: b.id,
        overlappingQueryOrTopic: sameFamily ? a.topicFamily : "query token overlap",
        conflictType: conflictType(sim),
        similarityReason: `primary ${sim.primaryOverlap.toFixed(2)}, primary-secondary ${sim.crossOverlap.toFixed(2)}, secondary ${sim.secondaryOverlap.toFixed(2)}`,
        reviewSeverity: severity,
      });
    }
  }

  for (const conflict of conflicts) {
    const a = byId.get(conflict.postA);
    const b = byId.get(conflict.postB);
    if (a) a.possibleCompetingPosts.push(`${conflict.postB} (${conflict.reviewSeverity})`);
    if (b) b.possibleCompetingPosts.push(`${conflict.postA} (${conflict.reviewSeverity})`);
  }

  return conflicts.sort((a, b) => {
    const rank = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return rank[a.reviewSeverity] - rank[b.reviewSeverity] || a.postA.localeCompare(b.postA) || a.postB.localeCompare(b.postB);
  });
}

function buildTopicFamilies(queryMap, conflicts) {
  const byFamily = new Map();
  for (const item of queryMap) {
    if (!byFamily.has(item.topicFamily)) byFamily.set(item.topicFamily, []);
    byFamily.get(item.topicFamily).push(item);
  }
  return Array.from(byFamily.entries())
    .map(([topicFamily, items]) => {
      const familyConflicts = conflicts.filter((conflict) => {
        const ids = new Set(items.map((item) => item.id));
        return ids.has(conflict.postA) || ids.has(conflict.postB);
      });
      const strongest = items
        .slice()
        .sort((a, b) => {
          const confRank = { HIGH: 3, MEDIUM: 2, LOW: 1 };
          const aScore = (a.coreDocumentCandidate ? 4 : 0) + confRank[a.primaryQueryConfidence] + (a.titleQueryAlignment === "HIGH" ? 1 : 0);
          const bScore = (b.coreDocumentCandidate ? 4 : 0) + confRank[b.primaryQueryConfidence] + (b.titleQueryAlignment === "HIGH" ? 1 : 0);
          return bScore - aScore || a.id.localeCompare(b.id);
        })
        .slice(0, 3);
      const weak = items.filter((item) => item.unclearQueryOwnership || item.primaryQueryConfidence === "LOW");
      const hasCore = items.some((item) => item.coreDocumentCandidate);
      const gapFlags = [];
      if (items.length >= 4 && !hasCore) gapFlags.push("TOPIC_CORE_DOCUMENT_GAP");
      if (items.length >= 5) gapFlags.push("TOPIC_HUB_CANDIDATE");
      return {
        topicFamily,
        postCount: items.length,
        representativePrimaryQueries: strongest.map((item) => item.primaryQuery),
        majorSecondaryQueries: uniq(items.flatMap((item) => item.secondaryQueries).slice(0, 12)).slice(0, 8),
        ownershipConflictCandidateCount: familyConflicts.length,
        strongestPostCandidates: strongest.map((item) => item.id),
        weakOrUnclearOwnershipPosts: weak.map((item) => item.id),
        coverageGapFlags: gapFlags,
      };
    })
    .sort((a, b) => b.postCount - a.postCount || a.topicFamily.localeCompare(b.topicFamily));
}

function buildCoverageGaps(topicFamilies) {
  return topicFamilies
    .filter((family) => family.coverageGapFlags.length)
    .map((family) => ({
      topicFamily: family.topicFamily,
      flags: family.coverageGapFlags,
      reason:
        family.coverageGapFlags.includes("TOPIC_CORE_DOCUMENT_GAP")
          ? "여러 하위 문서가 있지만 대표 core document 후보가 명확하지 않다."
          : "하위 문서가 많아 향후 hub/overview 후보 검토 가치가 있다.",
    }));
}

function buildCaseStudy(queryMap, conflicts) {
  const hormuz = queryMap.find((item) => item.id === "economicInfo/hormuz-risk-oil-insurance-freight-premium");
  const warRisk = queryMap.find((item) => item.id === "economicInfo/war-risk-oil-supply-insurance-shipping");
  return {
    title: "Middle East Oil Transport Risk",
    primaryOwnerCandidate: hormuz?.id,
    primaryOwnerQuery: "중동 원유 운송 리스크",
    recommendedOwnershipBoundary: {
      [hormuz?.id || "hormuz"]: [
        "중동 원유 운송 리스크",
        "호르무즈 해협 유가",
        "원유 운송 보험료",
        "해상 운임 유가 영향",
        "운송 차질과 risk premium",
      ],
      [warRisk?.id || "war-risk"]: [
        "전쟁 유가 영향",
        "전쟁 원유 공급 리스크",
        "전쟁 보험료 운임 유가",
        "지정학 리스크 원유 가격",
        "전쟁 리스크 인플레이션",
      ],
    },
    assessment:
      "두 문서는 분리 가능하다. hormuz 문서는 특정 chokepoint와 운송/보험/운임 프리미엄을 소유하고, war-risk 문서는 전쟁이라는 더 넓은 shock이 원유 공급과 물가로 번지는 chain을 소유하는 편이 자연스럽다.",
    conflictCandidate: conflicts.find(
      (item) =>
        item.postA === "economicInfo/hormuz-risk-oil-insurance-freight-premium" &&
        item.postB === "economicInfo/war-risk-oil-supply-insurance-shipping"
    ),
    titleQueryAlignment: hormuz?.titleQueryAlignment,
    tagQuerySupport: hormuz?.tagQuerySupport,
    relatedOrCompetingPosts: hormuz?.possibleCompetingPosts || [],
  };
}

function buildSummary(queryMap, conflicts, topicFamilies, coverageGaps) {
  const confidenceCounts = countBy(queryMap, (item) => item.primaryQueryConfidence);
  const tagSupportDistribution = countBy(queryMap, (item) => item.tagQuerySupport);
  const unclear = queryMap.filter((item) => item.unclearQueryOwnership);
  return {
    finalVerdict: unclear.length || conflicts.length || coverageGaps.length ? "QUERY_INTENT_MAP_COMPLETE_WITH_REVIEW_ITEMS" : "QUERY_INTENT_MAP_COMPLETE",
    postsAnalyzed: queryMap.length,
    primaryQueriesAssigned: queryMap.filter((item) => item.primaryQuery).length,
    highConfidence: confidenceCounts.HIGH || 0,
    mediumConfidence: confidenceCounts.MEDIUM || 0,
    lowConfidence: confidenceCounts.LOW || 0,
    unclearOwnership: unclear.length,
    ownershipConflictCandidates: conflicts.length,
    highSeverityOwnershipConflictCandidates: conflicts.filter((item) => item.reviewSeverity === "HIGH").length,
    topicFamilies: topicFamilies.length,
    topicHubCandidates: coverageGaps.filter((item) => item.flags.includes("TOPIC_HUB_CANDIDATE")).length,
    tagSupportDistribution,
  };
}

function writeCsv(queryMap) {
  const headers = [
    "category",
    "slug",
    "url",
    "title",
    "primaryQuery",
    "primaryQueryConfidence",
    "secondaryQueries",
    "primaryIntent",
    "secondaryIntent",
    "queryType",
    "topicFamily",
    "topicSubtopic",
    "titleQueryAlignment",
    "exactTitleDependencyRisk",
    "tagQuerySupport",
    "possibleCompetingPosts",
    "notes",
  ];
  const lines = [headers.join(",")];
  for (const item of queryMap) {
    lines.push(headers.map((header) => csvEscape(item[header])).join(","));
  }
  fs.writeFileSync(REPORT_CSV, `${lines.join("\n")}\n`, "utf8");
}

function buildReport(output) {
  const { summary, queryMap, ownershipConflictCandidates, topicFamilies, coverageGaps, caseStudy } = output;
  const lines = [];
  lines.push("# FinMap KO Post Naver Search Query Intent Map");
  lines.push("");
  lines.push(`Generated: ${output.generatedAt}`);
  lines.push("");
  lines.push("## Final Verdict");
  lines.push("");
  lines.push(`Final Verdict: ${summary.finalVerdict}`);
  lines.push("");
  lines.push("This is an audit/design-only Step 2 output. No post content, frontmatter, tags, headings, internal links, schema, sitemap, canonical, hreflang, page component, or runtime code was changed.");
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- posts analyzed: ${summary.postsAnalyzed}`);
  lines.push(`- primary queries assigned: ${summary.primaryQueriesAssigned}`);
  lines.push(`- HIGH confidence: ${summary.highConfidence}`);
  lines.push(`- MEDIUM confidence: ${summary.mediumConfidence}`);
  lines.push(`- LOW confidence: ${summary.lowConfidence}`);
  lines.push(`- unclear ownership: ${summary.unclearOwnership}`);
  lines.push(`- ownership conflict candidates: ${summary.ownershipConflictCandidates}`);
  lines.push(`- high-severity ownership conflict candidates: ${summary.highSeverityOwnershipConflictCandidates}`);
  lines.push(`- topic families: ${summary.topicFamilies}`);
  lines.push(`- topic hub candidates: ${summary.topicHubCandidates}`);
  lines.push(`- tag support distribution: ${Object.entries(summary.tagSupportDistribution).map(([k, v]) => `${k}:${v}`).join(", ")}`);
  lines.push("");
  lines.push("## A. QUERY OWNERSHIP OVERVIEW");
  lines.push("");
  lines.push("- Primary query는 exact title phrase가 아니라, 문서가 실제로 소유할 수 있는 자연 검색어 기준으로 설계했다.");
  lines.push("- Search volume, Naver ranking, 노출량은 추정하지 않았다.");
  lines.push("- `possibleCompetingPosts`는 최종 cannibalization 판단이 아니라 Step 3 검토 후보로만 본다.");
  lines.push("");
  lines.push("### High-confidence Primary Query Examples");
  lines.push("");
  for (const item of queryMap.filter((row) => row.primaryQueryConfidence === "HIGH").slice(0, 14)) {
    lines.push(`- ${item.id}: ${item.primaryQuery}`);
  }
  lines.push("");
  lines.push("## B. TOPIC FAMILY MAP");
  lines.push("");
  lines.push("| Topic Family | Posts | Representative Primary Queries | Conflict Candidates | Strongest Post Candidates | Weak/Unclear Posts | Gap Flags |");
  lines.push("|---|---:|---|---:|---|---|---|");
  for (const family of topicFamilies) {
    lines.push(
      [
        family.topicFamily,
        family.postCount,
        family.representativePrimaryQueries.join("; "),
        family.ownershipConflictCandidateCount,
        family.strongestPostCandidates.join("; "),
        family.weakOrUnclearOwnershipPosts.join("; ") || "-",
        family.coverageGapFlags.join("; ") || "-",
      ]
        .map(mdEscape)
        .join(" | ")
        .replace(/^/, "| ")
        .replace(/$/, " |")
    );
  }
  lines.push("");
  lines.push("## C. PRIMARY QUERY MAP");
  lines.push("");
  lines.push("| Category | URL | Primary Query | Confidence | Intent | Type | Topic Family | Title Alignment | Exact-title Risk | Tag Support | Competing Candidates |");
  lines.push("|---|---|---|---|---|---|---|---|---|---|---|");
  for (const item of queryMap) {
    lines.push(
      [
        item.category,
        item.url,
        item.primaryQuery,
        item.primaryQueryConfidence,
        `${item.primaryIntent}${item.secondaryIntent ? ` / ${item.secondaryIntent}` : ""}`,
        item.queryType,
        `${item.topicFamily} / ${item.topicSubtopic}`,
        item.titleQueryAlignment,
        item.exactTitleDependencyRisk,
        item.tagQuerySupport,
        item.possibleCompetingPosts.slice(0, 4).join("; ") || "-",
      ]
        .map(mdEscape)
        .join(" | ")
        .replace(/^/, "| ")
        .replace(/$/, " |")
    );
  }
  lines.push("");
  lines.push("## D. QUERY OWNERSHIP CONFLICT CANDIDATES");
  lines.push("");
  lines.push("| Severity | Type | Post A | Post B | Overlap | Reason |");
  lines.push("|---|---|---|---|---|---|");
  for (const item of ownershipConflictCandidates.slice(0, 60)) {
    lines.push(
      [
        item.reviewSeverity,
        item.conflictType,
        item.postA,
        item.postB,
        item.overlappingQueryOrTopic,
        item.similarityReason,
      ]
        .map(mdEscape)
        .join(" | ")
        .replace(/^/, "| ")
        .replace(/$/, " |")
    );
  }
  lines.push("");
  lines.push("## E. UNCLEAR QUERY OWNERSHIP");
  lines.push("");
  lines.push("| Post | Primary Query | Reasons | Notes |");
  lines.push("|---|---|---|---|");
  for (const item of queryMap.filter((row) => row.unclearQueryOwnership)) {
    lines.push(`| ${mdEscape(item.id)} | ${mdEscape(item.primaryQuery)} | ${mdEscape(item.unclearQueryOwnership.reasons.join(", "))} | ${mdEscape(item.notes)} |`);
  }
  lines.push("");
  lines.push("## F. TAG VS QUERY ANALYSIS");
  lines.push("");
  lines.push(`- TAG_SUPPORTS_QUERY: ${summary.tagSupportDistribution.TAG_SUPPORTS_QUERY || 0}`);
  lines.push(`- TAG_PARTIALLY_SUPPORTS_QUERY: ${summary.tagSupportDistribution.TAG_PARTIALLY_SUPPORTS_QUERY || 0}`);
  lines.push(`- TAG_WEAKLY_SUPPORTS_QUERY: ${summary.tagSupportDistribution.TAG_WEAKLY_SUPPORTS_QUERY || 0}`);
  lines.push("");
  lines.push("| Post | Tag Support | Tags Supporting Primary | Missing Query Concepts | Broad/Generic Tags |");
  lines.push("|---|---|---|---|---|");
  for (const item of queryMap.filter((row) => row.tagQuerySupport !== "TAG_SUPPORTS_QUERY").slice(0, 40)) {
    lines.push(
      [
        item.id,
        item.tagQuerySupport,
        item.tagAnalysis.tagsSupportingPrimaryQuery.join("; ") || "-",
        item.tagAnalysis.queryConceptMissingFromTags.join("; ") || "-",
        item.tagAnalysis.irrelevantOrBroadTags.join("; ") || "-",
      ]
        .map(mdEscape)
        .join(" | ")
        .replace(/^/, "| ")
        .replace(/$/, " |")
    );
  }
  lines.push("");
  lines.push("## G. TOPIC COVERAGE GAPS");
  lines.push("");
  if (!coverageGaps.length) {
    lines.push("- No topic coverage gap candidates detected.");
  } else {
    for (const item of coverageGaps) {
      lines.push(`- ${item.topicFamily}: ${item.flags.join(", ")} - ${item.reason}`);
    }
  }
  lines.push("");
  lines.push("## H. CASE STUDY: Middle East Oil Transport Risk");
  lines.push("");
  lines.push(`- Primary owner candidate for "중동 원유 운송 리스크": ${caseStudy.primaryOwnerCandidate}`);
  lines.push(`- Recommended primary owner query: ${caseStudy.primaryOwnerQuery}`);
  lines.push(`- Assessment: ${caseStudy.assessment}`);
  lines.push(`- ${caseStudy.primaryOwnerCandidate} should own: ${caseStudy.recommendedOwnershipBoundary[caseStudy.primaryOwnerCandidate].join("; ")}`);
  lines.push("- economicInfo/war-risk-oil-supply-insurance-shipping should own: 전쟁 유가 영향; 전쟁 원유 공급 리스크; 전쟁 보험료 운임 유가; 지정학 리스크 원유 가격; 전쟁 리스크 인플레이션");
  lines.push(`- Title-query alignment: ${caseStudy.titleQueryAlignment}`);
  lines.push(`- Tag-query alignment: ${caseStudy.tagQuerySupport}`);
  lines.push(`- Related/competing FinMap posts: ${caseStudy.relatedOrCompetingPosts.join("; ") || "-"}`);
  lines.push("- Current separation assessment: YES, 분리 가능하지만 Step 3에서 내부링크 anchor와 query boundary를 확인해야 한다.");
  lines.push("");
  lines.push("## I. DATA QUALITY / LIMITATIONS");
  lines.push("");
  lines.push("- This audit used Step 1 inventory JSON plus repository markdown only.");
  lines.push("- No Naver Search, Naver Search Advisor, GSC, keyword volume, click, impression, or ranking data was used.");
  lines.push("- Confidence means content-query fit inside FinMap source, not expected ranking difficulty or traffic.");
  lines.push("- Ownership conflicts are review candidates only. No merge, redirect, delete, rewrite, priority, or scoring decision is made in Step 2.");
  lines.push("- Tag-query matching is lexical. Some existing tag text appears inconsistent in the source/report encoding, so tag support should be treated as a first-pass baseline.");
  lines.push("");
  lines.push("## Generated Files");
  lines.push("");
  lines.push(`- \`${rel(REPORT_MD)}\``);
  lines.push(`- \`${rel(REPORT_JSON)}\``);
  lines.push(`- \`${rel(REPORT_CSV)}\``);
  lines.push("");
  lines.push("## Step 3 Readiness");
  lines.push("");
  lines.push("Step 3 Cannibalization / Query Ownership Audit readiness: YES");
  lines.push("");
  return `${lines.join("\n")}\n`;
}

function main() {
  if (!fs.existsSync(INPUT_JSON)) {
    throw new Error(`Missing Step 1 inventory JSON: ${rel(INPUT_JSON)}`);
  }
  const inventory = readJson(INPUT_JSON);
  const posts = inventory.posts || [];
  const queryMap = buildQueryMap(posts);
  const conflicts = buildConflicts(queryMap);
  const topicFamilies = buildTopicFamilies(queryMap, conflicts);
  const coverageGaps = buildCoverageGaps(topicFamilies);
  const caseStudy = buildCaseStudy(queryMap, conflicts);
  const summary = buildSummary(queryMap, conflicts, topicFamilies, coverageGaps);

  const output = {
    generatedAt: new Date().toISOString(),
    scope: {
      language: "ko",
      auditOnly: true,
      source: "step1_inventory_json_plus_repository_markdown",
      networkUsed: false,
      noContentChanges: true,
    },
    summary,
    queryMap,
    topicFamilies,
    ownershipConflictCandidates: conflicts,
    unclearQueryOwnership: queryMap.filter((item) => item.unclearQueryOwnership),
    tagVsQueryDistribution: summary.tagSupportDistribution,
    coverageGaps,
    caseStudy,
    limitations: [
      "No Naver Search, Search Advisor, GSC, keyword volume, click, impression, or ranking data was used.",
      "Confidence is based on repository content-query fit only.",
      "Ownership conflict candidates are not final cannibalization decisions.",
      "No priority tier is assigned in this step.",
    ],
  };

  ensureDir(REPORT_JSON);
  fs.writeFileSync(REPORT_JSON, JSON.stringify(output, null, 2), "utf8");
  writeCsv(queryMap);
  fs.writeFileSync(REPORT_MD, buildReport(output), "utf8");

  console.log("PASS audit_naver_ko_post_query_intent");
  console.log(`- KO posts analyzed: ${summary.postsAnalyzed}`);
  console.log(`- Primary queries assigned: ${summary.primaryQueriesAssigned}`);
  console.log(`- Report: ${rel(REPORT_MD)}`);
  console.log(`- JSON: ${rel(REPORT_JSON)}`);
  console.log(`- CSV: ${rel(REPORT_CSV)}`);
  console.log(`- Final Verdict: ${summary.finalVerdict}`);
}

main();
