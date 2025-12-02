"use strict";
exports.id = 559;
exports.ids = [559];
exports.modules = {

/***/ 9559:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (/* binding */ ToolCta)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(997);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(1664);
/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_link__WEBPACK_IMPORTED_MODULE_1__);
// _components/ToolCta.js


function ToolCta({ lang ="ko" , type ="compound"  }) {
    const isKo = lang === "ko";
    // 🔧 type별 설정 모음
    const CONFIGS = {
        compound: {
            // ✅ 복리 계산기 (기본)
            titleKo: "복리 효과, 직접 숫자로 확인해보세요",
            titleEn: "See the power of compound interest in numbers",
            descKo: "원금, 기간, 수익률, 세금을 바꿔보면서 장기 투자 결과를 시뮬레이션할 수 있습니다.",
            descEn: "Change principal, period, return and tax to simulate your long-term investment outcome.",
            href: "/tools/compound-interest",
            btnKo: "복리 계산기 열기",
            btnEn: "Open compound calculator",
            badgeKo: "FinMap 도구 \xb7 복리",
            badgeEn: "FinMap tools \xb7 Compound"
        },
        goal: {
            // ✅ 목표 자산 도달 시뮬레이터
            titleKo: "목표 자산까지 매달 얼마가 필요한지 계산해보세요",
            titleEn: "Find how much you need to invest per month to reach your goal",
            descKo: "목표 금액, 기간, 예상 수익률을 입력하면 필요한 월 투자금을 역산해줍니다.",
            descEn: "Enter your target amount, time horizon, and expected return to get the required monthly investment.",
            href: "/tools/goal-simulator",
            btnKo: "목표 자산 시뮬레이터 열기",
            btnEn: "Open goal simulator",
            badgeKo: "FinMap 도구 \xb7 목표 자산",
            badgeEn: "FinMap tools \xb7 Goal amount"
        },
        cagr: {
            // ✅ CAGR 계산기
            titleKo: "CAGR로 내 투자 성과를 한 줄 숫자로 확인하세요",
            titleEn: "Summarize your investment performance with CAGR",
            descKo: "초기 자산, 최종 자산, 투자 기간으로 연평균 복리 수익률(CAGR)을 계산하고 세금\xb7수수료 효과를 함께 볼 수 있습니다.",
            descEn: "Calculate compound annual growth rate (CAGR) from initial and final values and see the impact of tax and fees.",
            href: "/tools/cagr-calculator",
            btnKo: "CAGR 계산기 열기",
            btnEn: "Open CAGR calculator",
            badgeKo: "FinMap 도구 \xb7 투자 수익률",
            badgeEn: "FinMap tools \xb7 Investment return"
        },
        dca: {
            // ✅ DCA 시뮬레이터
            titleKo: "ETF\xb7주식 자동 적립식 투자, 시뮬레이션으로 미리 보세요",
            titleEn: "Simulate your ETF/stock DCA plan in advance",
            descKo: "초기 자산, 월 적립금, 연 수익률, 세율\xb7수수료\xb7적립금 증가율을 넣고 장기 자산 성장을 살펴볼 수 있습니다.",
            descEn: "Plan your long-term DCA (dollar-cost averaging) with initial value, monthly contribution, return, tax, fees and contribution increase.",
            href: "/tools/dca-calculator",
            btnKo: "DCA 시뮬레이터 열기",
            btnEn: "Open DCA simulator",
            badgeKo: "FinMap 도구 \xb7 적립식 투자",
            badgeEn: "FinMap tools \xb7 DCA investing"
        },
        fire: {
            // ✅ FIRE(은퇴자금) 계산기
            titleKo: "FIRE로 언제 경제적 자유가 가능한지 점검해보세요",
            titleEn: "See when you can reach FIRE",
            descKo: "현재 자산, 연 지출, 예상 수익률, 적립 기간, 출금률(4% rule)로 FIRE 목표자산과 은퇴 후 자산 유지 기간, 파산 리스크를 시뮬레이션합니다.",
            descEn: "Simulate your FIRE target, retirement asset longevity, and risk of ruin based on your assets, annual spending, expected return, accumulation period, and withdrawal rate (4% rule).",
            href: "/tools/fire-calculator",
            btnKo: "FIRE 계산기 열기",
            btnEn: "Open FIRE calculator",
            badgeKo: "FinMap 도구 \xb7 은퇴\xb7FIRE",
            badgeEn: "FinMap tools \xb7 FIRE & Retirement"
        }
    };
    // 지원하지 않는 type이 들어오면 compound로 폴백
    const config = CONFIGS[type] || CONFIGS.compound;
    const href = {
        pathname: config.href,
        query: {
            lang
        }
    };
    return /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("section", {
        className: "rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 sm:px-6 sm:py-6 flex flex-col sm:flex-row gap-4 sm:items-center shadow-sm",
        children: [
            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                className: "flex-1",
                children: [
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("p", {
                        className: "text-[11px] font-semibold tracking-[0.16em] text-slate-500 uppercase mb-1",
                        children: isKo ? config.badgeKo : config.badgeEn
                    }),
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("h2", {
                        className: "text-base sm:text-lg font-semibold text-slate-900 mb-1",
                        children: isKo ? config.titleKo : config.titleEn
                    }),
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("p", {
                        className: "text-xs sm:text-sm text-slate-600",
                        children: isKo ? config.descKo : config.descEn
                    })
                ]
            }),
            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                className: "flex-shrink-0",
                children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx((next_link__WEBPACK_IMPORTED_MODULE_1___default()), {
                    href: href,
                    children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("a", {
                        className: "inline-flex items-center px-4 py-2 rounded-full bg-blue-600 text-white text-xs sm:text-sm font-medium hover:bg-blue-700 transition-colors",
                        children: isKo ? config.btnKo : config.btnEn
                    })
                })
            })
        ]
    });
}


/***/ })

};
;