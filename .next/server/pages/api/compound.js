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
// 핵심 복리 계산 엔진
// - 월 단위 계산
// - 세금(이자소득세 15.4%), 수수료(매입/환매 각 0.25%) 옵션
// - 연간 요약(yearSummary)까지 생성
// =========================
function calcCompound({ principal =0 , monthly =0 , annualRate =0 , years =1 , compounding ="monthly" , taxMode ="on" , feeMode ="on"  }) {
    const months = Math.max(0, Math.floor(years * 12));
    const apr = annualRate > 0 ? annualRate / 100 : 0;
    // 복리 주기 → 월 이율
    const monthlyRate = compounding === "yearly" ? Math.pow(1 + apr, 1 / 12) - 1 // 연복리를 월로 환산
     : apr / 12; // 기본: 월복리
    const taxRate = taxMode === "on" ? 0.154 : 0;
    const feeRate = feeMode === "on" ? 0.0025 : 0;
    const series = [];
    const yearSummary = [];
    let balanceGross = principal; // 세전 잔고
    let balanceNet = principal; // 세후 잔고
    let totalContribution = principal;
    let totalInterestGross = 0;
    let totalInterestNet = 0;
    let taxTotal = 0;
    let feeTotal = 0;
    // 연간 집계용 변수
    let year = 1;
    let yearOpeningGross = principal;
    let yearOpeningNet = principal;
    let yearContrib = 0;
    let yearInterestGross = 0;
    let yearInterestNet = 0;
    let yearTax = 0;
    let yearFee = 0;
    let cumulativeInterestGross = 0;
    let cumulativeInterestNet = 0;
    let cumulativeTax = 0;
    let cumulativeFee = 0;
    for(let month = 1; month <= months; month++){
        // 1) 월 적립금 납입 + 매입 수수료
        if (monthly > 0) {
            const buyFee = monthly * feeRate;
            balanceGross += monthly;
            balanceNet += monthly - buyFee;
            totalContribution += monthly;
            yearContrib += monthly;
            feeTotal += buyFee;
            yearFee += buyFee;
            cumulativeFee += buyFee;
        }
        // 2) 이자 계산 (세전)
        const interestGross = balanceGross * monthlyRate;
        const tax = interestGross * taxRate;
        const interestNet = interestGross - tax;
        balanceGross += interestGross;
        balanceNet += interestNet;
        totalInterestGross += interestGross;
        totalInterestNet += interestNet;
        taxTotal += tax;
        yearInterestGross += interestGross;
        yearInterestNet += interestNet;
        yearTax += tax;
        cumulativeInterestGross += interestGross;
        cumulativeInterestNet += interestNet;
        cumulativeTax += tax;
        // 3) 마지막 달: 환매 수수료
        if (month === months && feeRate > 0) {
            const sellFee = balanceNet * feeRate;
            balanceNet -= sellFee;
            feeTotal += sellFee;
            yearFee += sellFee;
            cumulativeFee += sellFee;
        }
        // 월별 시계열 저장
        series.push({
            month,
            balanceGross,
            balanceNet,
            interestGross,
            interestNet,
            tax
        });
        // 4) 연말(12,24,... or 마지막 달)마다 연간 요약 행 생성
        const isYearEnd = month % 12 === 0 || month === months;
        if (isYearEnd) {
            yearSummary.push({
                year,
                openingBalanceGross: yearOpeningGross,
                openingBalanceNet: yearOpeningNet,
                contributionYear: yearContrib,
                closingBalanceGross: balanceGross,
                closingBalanceNet: balanceNet,
                interestYearGross: yearInterestGross,
                interestYearNet: yearInterestNet,
                taxYear: yearTax,
                feeYear: yearFee,
                cumulativeInterestGross,
                cumulativeInterestNet,
                cumulativeTax,
                cumulativeFee
            });
            year += 1;
            yearOpeningGross = balanceGross;
            yearOpeningNet = balanceNet;
            yearContrib = 0;
            yearInterestGross = 0;
            yearInterestNet = 0;
            yearTax = 0;
            yearFee = 0;
        }
    }
    return {
        months,
        monthlyRate,
        futureValueGross: balanceGross,
        futureValueNet: balanceNet,
        totalContribution,
        totalInterestGross,
        totalInterestNet,
        taxTotal,
        feeTotal,
        series,
        yearSummary
    };
}
// =========================
// 단순 통화 포맷 (상단 요약 카드용)
// =========================
function numberFmt(locale, currency, n) {
    if (!currency) {
        return new Intl.NumberFormat(locale).format(n);
    }
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        maximumFractionDigits: 0
    }).format(n);
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