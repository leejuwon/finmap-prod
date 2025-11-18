"use strict";
exports.id = 842;
exports.ids = [842];
exports.modules = {

/***/ 2842:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Yk": () => (/* binding */ calcCompound),
/* harmony export */   "i6": () => (/* binding */ numberFmt),
/* harmony export */   "sR": () => (/* binding */ calcSimpleLump)
/* harmony export */ });
/* unused harmony exports UNIT_OPTIONS, getUnitOptions, pickUnit, formatScaledAmount */
// lib/compound.js
// =========================
// 복리 월적립 계산 (세금/수수료 포함)
// =========================
function calcCompound({ principal =0 , monthly =0 , annualRate =0 , years =1 , months , compounding ="monthly" , taxMode ="apply" , feeMode ="apply" , baseYear =new Date().getFullYear() ,  }) {
    const totalMonths = months != null ? Math.max(1, Math.floor(Number(months) || 1)) : Math.max(1, Math.floor((Number(years) || 0) * 12));
    const mRate = (Number(annualRate) || 0) / 100 / 12;
    const applyTax = taxMode !== "none";
    const applyFee = feeMode !== "none";
    const TAX_RATE = 0.154;
    const FEE_RATE = 0.0025; // 0.25%
    let balanceGross = Number(principal) || 0;
    let balanceNet = Number(principal) || 0;
    // 매입 수수료: 초기 투자금에 대해 한 번
    const initialBuyFee = applyFee ? balanceNet * FEE_RATE : 0;
    balanceNet -= initialBuyFee;
    let totalContribution = balanceNet; // 수수료 차감 후 순투입
    let totalContributionRaw = Number(principal) || 0;
    let cumulativeInterestGross = 0;
    let cumulativeInterestNet = 0;
    let cumulativeTax = 0;
    let cumulativeFee = initialBuyFee;
    const series = [];
    // 연간 집계를 위한 변수
    let yearSummary = [];
    let currentYear = 1;
    let openingGrossYear = balanceGross;
    let openingNetYear = balanceNet;
    let contributionYear = 0;
    let interestYearGross = 0;
    let interestYearNet = 0;
    let taxYear = 0;
    let feeYear = initialBuyFee; // 첫해에 매입 수수료 포함
    for(let month = 1; month <= totalMonths; month++){
        const isFirstMonth = month === 1;
        // 1) 월 적립금 투입 + 매입 수수료
        const contrib = Number(monthly) || 0;
        if (contrib > 0) {
            balanceGross += contrib;
            balanceNet += contrib;
            totalContributionRaw += contrib;
            let buyFeeMonth = 0;
            if (applyFee) {
                buyFeeMonth = contrib * FEE_RATE;
                balanceNet -= buyFeeMonth;
                cumulativeFee += buyFeeMonth;
            }
            totalContribution += contrib - buyFeeMonth;
            contributionYear += contrib - buyFeeMonth;
            feeYear += buyFeeMonth;
        }
        // 2) 이자 계산 (복리, 월 이율)
        const interestGross = balanceGross * mRate;
        const taxMonth = applyTax ? interestGross * TAX_RATE : 0;
        const interestNet = interestGross - taxMonth;
        balanceGross += interestGross;
        balanceNet += interestNet;
        cumulativeInterestGross += interestGross;
        cumulativeInterestNet += interestNet;
        cumulativeTax += taxMonth;
        interestYearGross += interestGross;
        interestYearNet += interestNet;
        taxYear += taxMonth;
        // 3) 월별 시계열 저장 (차트용)
        series.push({
            month,
            balanceGross,
            balanceNet,
            contributionMonth: contrib,
            totalContribution: totalContribution,
            totalContributionRaw,
            cumulativeInterestGross,
            cumulativeInterestNet,
            cumulativeTax,
            cumulativeFee
        });
        // 4) 연말 or 마지막 달이면 연간 요약 저장
        const isYearEnd = month % 12 === 0 || month === totalMonths;
        if (isYearEnd) {
            const closingGrossYear = balanceGross;
            const closingNetYear = balanceNet;
            yearSummary.push({
                year: currentYear,
                openingBalanceGross: openingGrossYear,
                openingBalanceNet: openingNetYear,
                contributionYear,
                closingBalanceGross: closingGrossYear,
                closingBalanceNet: closingNetYear,
                interestYearGross,
                interestYearNet,
                taxYear,
                feeYear,
                cumulativeInterestGross,
                cumulativeInterestNet,
                cumulativeTax,
                cumulativeFee,
                calendarYear: baseYear + (currentYear - 1)
            });
            // 다음 해를 위해 초기화
            currentYear += 1;
            openingGrossYear = closingGrossYear;
            openingNetYear = closingNetYear;
            contributionYear = 0;
            interestYearGross = 0;
            interestYearNet = 0;
            taxYear = 0;
            feeYear = 0;
        }
    }
    // 5) 환매 수수료 (마지막에 한 번)
    if (applyFee) {
        const lastIndex = yearSummary.length - 1;
        if (lastIndex >= 0) {
            const sellFee = balanceNet * FEE_RATE;
            balanceNet -= sellFee;
            cumulativeFee += sellFee;
            const lastYear = yearSummary[lastIndex];
            lastYear.closingBalanceNet = balanceNet;
            lastYear.feeYear += sellFee;
            lastYear.cumulativeFee = cumulativeFee;
        }
    }
    const yearsTotal = Math.ceil(totalMonths / 12);
    return {
        principal: Number(principal) || 0,
        monthly: Number(monthly) || 0,
        annualRate: Number(annualRate) || 0,
        yearsTotal,
        monthsTotal: totalMonths,
        compounding,
        taxMode,
        feeMode,
        baseYear,
        totalContribution: totalContributionRaw,
        totalContributionNet: totalContribution,
        futureValueGross: balanceGross,
        futureValueNet: balanceNet,
        totalInterestGross: cumulativeInterestGross,
        totalInterestNet: cumulativeInterestNet,
        totalTax: cumulativeTax,
        totalFee: cumulativeFee,
        totalTaxFee: cumulativeTax + cumulativeFee,
        series,
        yearSummary
    };
}
// =========================
// 단순 통화 포맷 (상단 요약 카드용)
// =========================
function numberFmt(locale, currency, n) {
    const num = Number(n) || 0;
    // 통화 코드가 3자리 영문(A-Z)인지 검사 (예: KRW, USD)
    const isValidCurrency = typeof currency === "string" && /^[A-Z]{3}$/.test(currency);
    // 통화 코드가 없거나 잘못된 경우 → 그냥 숫자 포맷만
    if (!isValidCurrency) {
        return new Intl.NumberFormat(locale || "ko-KR").format(num);
    }
    // 정상적인 통화 코드일 때만 currency 스타일 사용
    return new Intl.NumberFormat(locale || "ko-KR", {
        style: "currency",
        currency,
        maximumFractionDigits: 0
    }).format(num);
}
// =========================
// 금액 단위 옵션 (표시용)
// =========================
const UNIT_OPTIONS = {
    KRW: [
        {
            id: "KRW-1",
            divisor: 1,
            labelKo: "원 단위",
            labelEn: "KRW (1)",
            unitTextKo: "원",
            unitTextEn: "KRW"
        },
        {
            id: "KRW-1k",
            divisor: 1000,
            labelKo: "천원 단위",
            labelEn: "KRW 1,000",
            unitTextKo: "천원",
            unitTextEn: "thousand KRW"
        },
        {
            id: "KRW-10m",
            divisor: 10000000,
            labelKo: "천만 원 단위",
            labelEn: "KRW 10,000,000",
            unitTextKo: "천만 원",
            unitTextEn: "ten-million KRW",
            default: true
        },
        {
            id: "KRW-100m",
            divisor: 100000000,
            labelKo: "억 단위",
            labelEn: "KRW 100,000,000",
            unitTextKo: "억",
            unitTextEn: "hundred-million KRW"
        }, 
    ],
    USD: [
        {
            id: "USD-1",
            divisor: 1,
            labelKo: "1달러 단위",
            labelEn: "1 USD",
            unitTextKo: "1 USD",
            unitTextEn: "1 USD"
        },
        {
            id: "USD-1k",
            divisor: 1000,
            labelKo: "1,000달러 단위",
            labelEn: "1,000 USD",
            unitTextKo: "1,000 USD",
            unitTextEn: "1,000 USD"
        },
        {
            id: "USD-10k",
            divisor: 10000,
            labelKo: "10,000달러 단위",
            labelEn: "10,000 USD",
            unitTextKo: "10,000 USD",
            unitTextEn: "10,000 USD",
            default: true
        }, 
    ]
};
function getUnitOptions(currency = "KRW", locale = "ko-KR") {
    const list = UNIT_OPTIONS[currency] || UNIT_OPTIONS.KRW;
    const isKo = locale.toLowerCase().startsWith("ko");
    return list.map((u)=>({
            id: u.id,
            divisor: u.divisor,
            label: isKo ? u.labelKo : u.labelEn,
            unitText: isKo ? u.unitTextKo || u.labelKo : u.unitTextEn || u.labelEn,
            default: !!u.default
        }));
}
function pickUnit(options, unitId) {
    if (!options || !options.length) return null;
    return options.find((o)=>o.id === unitId) || options.find((o)=>o.default) || options[0];
}
// 숫자 → 선택한 단위로 스케일 + 포맷
// - divisor 1(원/1달러)일 때는 소수점 없음
// - 그 외(천만 원, 1만달러 등)일 때는 소수점 2자리
function formatScaledAmount(value, unit, locale = "ko-KR") {
    const divisor = (unit === null || unit === void 0 ? void 0 : unit.divisor) ?? 1;
    const v = (Number(value) || 0) / divisor;
    const isBaseUnit = divisor === 1;
    return new Intl.NumberFormat(locale, {
        minimumFractionDigits: isBaseUnit ? 0 : 2,
        maximumFractionDigits: isBaseUnit ? 0 : 2
    }).format(v);
}
// =========================
// 단리 거치식 계산 (일시불, Simple Interest)
// =========================
/**
 * 단리 거치식:
 * - principal: 총 투자금 (일시불)
 * - annualRate: 연 이율 (%)
 * - years: 투자 기간(년)
 * - taxMode: 'apply' | 'none'
 *   - apply: 이자에 15.4% 세금
 * - feeMode: 'apply' | 'none'
 *   - apply: 매입 0.25% + 환매 0.25% (총 0.5%)
 */ function calcSimpleLump({ principal =0 , annualRate =0 , years =1 , taxMode ="apply" , feeMode ="apply" , baseYear =new Date().getFullYear() ,  }) {
    const P = Number(principal) || 0; // 최초 일시불 원금
    const r = (Number(annualRate) || 0) / 100; // 연 이율
    const Y = Math.max(1, Math.floor(Number(years) || 1));
    const applyTax = taxMode !== "none";
    const applyFee = feeMode !== "none";
    const TAX_RATE = 0.154;
    const FEE_RATE = 0.0025; // 0.25%
    let cumulativeInterestGross = 0;
    let cumulativeInterestNet = 0;
    let cumulativeTax = 0;
    let cumulativeFee = 0;
    const rows = [];
    // 매입 수수료: 처음 한 번
    const buyFee = applyFee ? P * FEE_RATE : 0;
    let openingGross = P; // 단리라서 gross 기준 원금은 항상 P
    let openingNet = P - buyFee; // 수수료 차감된 순자산
    cumulativeFee += buyFee;
    for(let y = 1; y <= Y; y++){
        // 🔹 단리 핵심: 매년 이자는 "항상 P * r"
        const interestYearGross = P * r;
        const taxYear = applyTax ? interestYearGross * TAX_RATE : 0;
        const interestYearNet = interestYearGross - taxYear;
        // 올해 말 잔액 (세전/세후) – 단리라 매년 일정 금액만큼 직선으로 증가
        const closingGross = openingGross + interestYearGross;
        let closingNet = openingNet + interestYearNet;
        // 마지막 해에만 환매 수수료
        let feeYear = 0;
        if (applyFee && y === Y) {
            feeYear = closingNet * FEE_RATE;
            closingNet -= feeYear;
        }
        cumulativeInterestGross += interestYearGross;
        cumulativeInterestNet += interestYearNet;
        cumulativeTax += taxYear;
        cumulativeFee += feeYear;
        rows.push({
            year: y,
            openingBalanceGross: openingGross,
            openingBalanceNet: openingNet,
            contributionYear: 0,
            closingBalanceGross: closingGross,
            closingBalanceNet: closingNet,
            interestYearGross,
            interestYearNet,
            taxYear,
            feeYear,
            cumulativeInterestGross,
            cumulativeInterestNet,
            cumulativeTax,
            cumulativeFee,
            calendarYear: baseYear + (y - 1)
        });
        // 다음 해의 "기초잔액" 세전/세후
        openingGross = closingGross;
        openingNet = closingNet;
    }
    const last = rows[rows.length - 1];
    return {
        principal: P,
        monthly: 0,
        annualRate,
        yearsTotal: Y,
        monthsTotal: Y * 12,
        compounding: "simple_lump",
        totalContribution: P,
        futureValueGross: last.closingBalanceGross,
        futureValueNet: last.closingBalanceNet,
        totalInterestGross: cumulativeInterestGross,
        totalInterestNet: cumulativeInterestNet,
        totalTax: cumulativeTax,
        totalFee: cumulativeFee,
        yearSummary: rows
    };
}


/***/ })

};
;