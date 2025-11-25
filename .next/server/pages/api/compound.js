"use strict";
(() => {
var exports = {};
exports.id = 640;
exports.ids = [640];
exports.modules = {

/***/ 4379:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ handler)
});

;// CONCATENATED MODULE: ./lib/compound.js
// lib/compound.js
// =========================
// 복리 월적립 계산 (세금/수수료 포함)
// =========================
function calcCompound({ principal =0 , monthly =0 , annualRate =0 , years =1 , months , compounding ="monthly" , taxMode ="apply" , feeMode ="apply" , // 🔥 새로 추가: 세율/수수료율(%) – 기본값은 한국 기준
taxRatePercent =15.4 , feeRatePercent =0.5 , baseYear =new Date().getFullYear() ,  }) {
    const totalMonths = months != null ? Math.max(1, Math.floor(Number(months) || 1)) : Math.max(1, Math.floor((Number(years) || 0) * 12));
    const mRate = (Number(annualRate) || 0) / 100 / 12;
    // 🔥 세율/수수료율(% → 소수) + 모드에 따른 0 처리
    let taxRate = taxRatePercent != null ? Number(taxRatePercent) : 15.4;
    let feeRate = feeRatePercent != null ? Number(feeRatePercent) : 0.5;
    taxRate = Math.max(0, taxRate) / 100; // 15.4 → 0.154
    feeRate = Math.max(0, feeRate) / 100; // 0.5  → 0.005
    if (taxMode === "none") taxRate = 0;
    if (feeMode === "none") feeRate = 0;
    const applyTax = taxRate > 0;
    const applyFee = feeRate > 0;
    let balanceGross = Number(principal) || 0;
    let balanceNet = Number(principal) || 0;
    // 매입 수수료: 초기 투자금에 대해 한 번
    const initialBuyFee = applyFee ? balanceNet * feeRate : 0;
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
        // 1) 월 적립금 투입 + 매입 수수료
        const contrib = Number(monthly) || 0;
        if (contrib > 0) {
            balanceGross += contrib;
            balanceNet += contrib;
            totalContributionRaw += contrib;
            let buyFeeMonth = 0;
            if (applyFee) {
                buyFeeMonth = contrib * feeRate;
                balanceNet -= buyFeeMonth;
                cumulativeFee += buyFeeMonth;
            }
            totalContribution += contrib - buyFeeMonth;
            contributionYear += contrib - buyFeeMonth;
            feeYear += buyFeeMonth;
        }
        // 2) 이자 계산 (복리, 월 이율)
        const interestGross = balanceGross * mRate;
        const taxMonth = applyTax ? interestGross * taxRate : 0;
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
            const sellFee = balanceNet * feeRate;
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
        taxRatePercent,
        feeRatePercent,
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
    const isValidCurrency = typeof currency === "string" && /^[A-Z]{3}$/.test(currency);
    if (!isValidCurrency) {
        return new Intl.NumberFormat(locale || "ko-KR").format(num);
    }
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
 *   - apply: 이자에 taxRatePercent% 세금
 * - feeMode: 'apply' | 'none'
 *   - apply: 매입 + 환매에 feeRatePercent% 적용 (각각 50%씩이 아니라,
 *            단순히 "총 연 수수료율"로 보고 buy/sell에 나눠 쓰는 구조로 확장 가능)
 */ function calcSimpleLump({ principal =0 , annualRate =0 , years =1 , taxMode ="apply" , feeMode ="apply" , // 🔥 새로 추가: 세율/수수료율(%) – 기본값은 한국 기준
taxRatePercent =15.4 , feeRatePercent =0.5 , baseYear =new Date().getFullYear() ,  }) {
    const P = Number(principal) || 0;
    const r = (Number(annualRate) || 0) / 100;
    const Y = Math.max(1, Math.floor(Number(years) || 1));
    // 🔥 세율/수수료율 처리
    let taxRate = taxRatePercent != null ? Number(taxRatePercent) : 15.4;
    let feeRate = feeRatePercent != null ? Number(feeRatePercent) : 0.5;
    taxRate = Math.max(0, taxRate) / 100;
    feeRate = Math.max(0, feeRate) / 100;
    if (taxMode === "none") taxRate = 0;
    if (feeMode === "none") feeRate = 0;
    const applyTax = taxRate > 0;
    const applyFee = feeRate > 0;
    let cumulativeInterestGross = 0;
    let cumulativeInterestNet = 0;
    let cumulativeTax = 0;
    let cumulativeFee = 0;
    const rows = [];
    // 매입 수수료: 처음 한 번
    const buyFee = applyFee ? P * feeRate : 0;
    let openingGross = P;
    let openingNet = P - buyFee;
    cumulativeFee += buyFee;
    for(let y = 1; y <= Y; y++){
        const interestYearGross = P * r;
        const taxYear = applyTax ? interestYearGross * taxRate : 0;
        const interestYearNet = interestYearGross - taxYear;
        const closingGross = openingGross + interestYearGross;
        let closingNet = openingNet + interestYearNet;
        let feeYear = 0;
        if (applyFee && y === Y) {
            feeYear = closingNet * feeRate;
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
        taxMode,
        feeMode,
        taxRatePercent,
        feeRatePercent,
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

;// CONCATENATED MODULE: ./pages/api/compound.js
// pages/api/compound.js

function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", [
            "POST"
        ]);
        return res.status(405).json({
            error: "Method Not Allowed"
        });
    }
    try {
        const { principal , monthly , annualRate , years , months , compounding , taxOption , feeOption , locale , currency ,  } = req.body || {};
        // -----------------------------
        // 1) 기본 파라미터 숫자 변환
        // -----------------------------
        const p = Number(principal) || 0;
        const m = Number(monthly) || 0;
        const r = Number(annualRate) || 0;
        const y = years != null ? Number(years) : undefined;
        const mo = months != null ? Number(months) : undefined;
        // -----------------------------
        // 2) 유효성 검증 (기존 로직 유지)
        // -----------------------------
        if (p < 0 || p > 1000000000) {
            return res.status(400).json({
                error: "INVALID_PRINCIPAL"
            });
        }
        if (m < 0 || m > 5000000) {
            return res.status(400).json({
                error: "INVALID_MONTHLY"
            });
        }
        if (r < 0 || r > 40) {
            return res.status(400).json({
                error: "INVALID_RATE"
            });
        }
        if (y != null && (y <= 0 || y > 50) || mo != null && (mo <= 0 || mo > 600)) {
            return res.status(400).json({
                error: "INVALID_TERM"
            });
        }
        // --------------------------------------
        // 3) 실제 계산 – calcCompound 사용
        //    (calcCompoundAdvanced 대체)
        // --------------------------------------
        const result = calcCompound({
            principal: p,
            monthly: m,
            annualRate: r,
            years: y,
            months: mo,
            compounding,
            taxOption,
            feeOption,
            baseYear: new Date().getFullYear()
        });
        // --------------------------------------
        // 4) 서버 로그 (KPI 집계용) – 안전하게 접근
        // --------------------------------------
        const yearsTotal = (result === null || result === void 0 ? void 0 : result.yearsTotal) ?? (y != null ? y : mo != null ? mo / 12 : undefined);
        const monthsTotal = (result === null || result === void 0 ? void 0 : result.monthsTotal) ?? (mo != null ? mo : y != null ? y * 12 : undefined);
        const fvNet = (result === null || result === void 0 ? void 0 : result.futureValueNet) ?? (result === null || result === void 0 ? void 0 : result.netFutureValue) ?? (result === null || result === void 0 ? void 0 : result.futureValue) ?? null;
        console.log("[compound:compute]", {
            ts: new Date().toISOString(),
            principal: p,
            monthly: m,
            annualRate: r,
            years: yearsTotal,
            months: monthsTotal,
            compounding: (result === null || result === void 0 ? void 0 : result.compounding) || compounding || "monthly",
            locale: locale || "unknown",
            currency: currency || "unknown",
            fvNet
        });
        // 기존과 동일하게 ok/result 형태로 응답
        return res.status(200).json({
            ok: true,
            result
        });
    } catch (e) {
        console.error("[compound:error]", e);
        return res.status(500).json({
            error: "INTERNAL_ERROR"
        });
    }
}


/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__(4379));
module.exports = __webpack_exports__;

})();