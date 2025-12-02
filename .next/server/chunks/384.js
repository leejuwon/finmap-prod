"use strict";
exports.id = 384;
exports.ids = [384];
exports.modules = {

/***/ 5384:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "JsonLd": () => (/* binding */ JsonLd),
  "default": () => (/* binding */ GoalSimulatorPage)
});

// EXTERNAL MODULE: external "react/jsx-runtime"
var jsx_runtime_ = __webpack_require__(997);
// EXTERNAL MODULE: external "react"
var external_react_ = __webpack_require__(6689);
// EXTERNAL MODULE: ./_components/SeoHead.js
var SeoHead = __webpack_require__(8814);
;// CONCATENATED MODULE: ./_components/GoalForm.js
// _components/GoalForm.js


const dict = {
    ko: {
        title: "목표 자산 시뮬레이터",
        currentWon: "현재 자산(만원)",
        currentUsd: "현재 자산(USD)",
        monthlyWon: "월 적립금(만원)",
        monthlyUsd: "월 적립금(USD)",
        rate: "연 수익률(%)",
        years: "투자 기간(년)",
        targetWon: "목표 자산(만원)",
        targetUsd: "목표 자산(USD)",
        calc: "시뮬레이션 실행",
        currency: "통화",
        compounding: "복리 주기",
        compoundingMonthly: "월복리",
        compoundingYearly: "연복리",
        // 🔥 추가 라벨
        taxRateLabel: "세율(이자소득세, %)",
        feeRateLabel: "연 수수료율(연 %, 보수/수수료)"
    },
    en: {
        title: "Goal Asset Simulator",
        currentWon: "Current Assets (\xd710k KRW)",
        currentUsd: "Current Assets (USD)",
        monthlyWon: "Monthly Contribution (\xd710k KRW)",
        monthlyUsd: "Monthly Contribution (USD)",
        rate: "Annual Return (%)",
        years: "Years",
        targetWon: "Target Assets (\xd710k KRW)",
        targetUsd: "Target Assets (USD)",
        calc: "Run Simulation",
        currency: "Currency",
        compounding: "Compounding",
        compoundingMonthly: "Monthly",
        compoundingYearly: "Yearly",
        // 🔥 추가 라벨
        taxRateLabel: "Tax rate on interest (%)",
        feeRateLabel: "Annual fee rate (%)"
    }
};
function GoalForm({ onSubmit , locale ="ko" , currency ="KRW" , onCurrencyChange  }) {
    // locale 안전 정규화 (ko / en만 사용)
    const safeLocale = String(locale).startsWith("en") ? "en" : "ko";
    const { 0: form , 1: setForm  } = (0,external_react_.useState)({
        current: 2000,
        monthly: 50,
        annualRate: 7,
        years: 15,
        target: 10000,
        compounding: "monthly",
        // 🔥 세율/수수료율 기본값
        taxRatePercent: 15.4,
        feeRatePercent: 0.5
    });
    const t = (0,external_react_.useMemo)(()=>dict[safeLocale] || dict.ko, [
        safeLocale
    ]);
    const numberLocale = safeLocale === "ko" ? "ko-KR" : "en-US";
    const handleMoneyChange = (e)=>{
        const { name , value  } = e.target;
        const raw = String(value).replace(/[^\d]/g, "");
        const num = raw ? Number(raw) : 0;
        setForm((prev)=>({
                ...prev,
                [name]: num
            }));
    };
    const handleChange = (e)=>{
        const { name , value  } = e.target;
        setForm((prev)=>({
                ...prev,
                [name]: value
            }));
    };
    const disabled = (0,external_react_.useMemo)(()=>form.years <= 0, [
        form.years
    ]);
    const handleSubmit = ()=>{
        onSubmit({
            ...form,
            currency
        });
    };
    const currentLabel = currency === "KRW" ? t.currentWon : t.currentUsd;
    const monthlyLabel = currency === "KRW" ? t.monthlyWon : t.monthlyUsd;
    const targetLabel = currency === "KRW" ? t.targetWon : t.targetUsd;
    const fmt = (n)=>{
        const v = Number(n) || 0;
        return v.toLocaleString(numberLocale);
    };
    return /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
        className: "grid gap-4",
        children: [
            /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                className: "grid gap-3 md:grid-cols-4",
                children: [
                    /*#__PURE__*/ (0,jsx_runtime_.jsxs)("label", {
                        className: "grid gap-1",
                        children: [
                            /*#__PURE__*/ jsx_runtime_.jsx("span", {
                                className: "text-sm",
                                children: currentLabel
                            }),
                            /*#__PURE__*/ jsx_runtime_.jsx("input", {
                                name: "current",
                                type: "text",
                                inputMode: "numeric",
                                className: "input",
                                value: fmt(form.current),
                                onChange: handleMoneyChange
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0,jsx_runtime_.jsxs)("label", {
                        className: "grid gap-1",
                        children: [
                            /*#__PURE__*/ jsx_runtime_.jsx("span", {
                                className: "text-sm",
                                children: monthlyLabel
                            }),
                            /*#__PURE__*/ jsx_runtime_.jsx("input", {
                                name: "monthly",
                                type: "text",
                                inputMode: "numeric",
                                className: "input",
                                value: fmt(form.monthly),
                                onChange: handleMoneyChange
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0,jsx_runtime_.jsxs)("label", {
                        className: "grid gap-1",
                        children: [
                            /*#__PURE__*/ jsx_runtime_.jsx("span", {
                                className: "text-sm",
                                children: t.rate
                            }),
                            /*#__PURE__*/ jsx_runtime_.jsx("input", {
                                name: "annualRate",
                                type: "number",
                                inputMode: "decimal",
                                className: "input",
                                value: form.annualRate,
                                onChange: handleChange,
                                min: "0",
                                step: "0.1"
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0,jsx_runtime_.jsxs)("label", {
                        className: "grid gap-1",
                        children: [
                            /*#__PURE__*/ jsx_runtime_.jsx("span", {
                                className: "text-sm",
                                children: t.years
                            }),
                            /*#__PURE__*/ jsx_runtime_.jsx("input", {
                                name: "years",
                                type: "number",
                                inputMode: "numeric",
                                className: "input",
                                value: form.years,
                                onChange: handleChange,
                                min: "1",
                                step: "1"
                            })
                        ]
                    })
                ]
            }),
            /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                className: "grid gap-3 md:grid-cols-4",
                children: [
                    /*#__PURE__*/ (0,jsx_runtime_.jsxs)("label", {
                        className: "grid gap-1",
                        children: [
                            /*#__PURE__*/ jsx_runtime_.jsx("span", {
                                className: "text-sm",
                                children: targetLabel
                            }),
                            /*#__PURE__*/ jsx_runtime_.jsx("input", {
                                name: "target",
                                type: "text",
                                inputMode: "numeric",
                                className: "input",
                                value: fmt(form.target),
                                onChange: handleMoneyChange
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0,jsx_runtime_.jsxs)("label", {
                        className: "grid gap-1",
                        children: [
                            /*#__PURE__*/ jsx_runtime_.jsx("span", {
                                className: "text-sm",
                                children: t.compounding
                            }),
                            /*#__PURE__*/ (0,jsx_runtime_.jsxs)("select", {
                                name: "compounding",
                                className: "select",
                                value: form.compounding,
                                onChange: handleChange,
                                children: [
                                    /*#__PURE__*/ jsx_runtime_.jsx("option", {
                                        value: "monthly",
                                        children: t.compoundingMonthly
                                    }),
                                    /*#__PURE__*/ jsx_runtime_.jsx("option", {
                                        value: "yearly",
                                        children: t.compoundingYearly
                                    })
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0,jsx_runtime_.jsxs)("label", {
                        className: "grid gap-1",
                        children: [
                            /*#__PURE__*/ jsx_runtime_.jsx("span", {
                                className: "text-sm",
                                children: t.taxRateLabel
                            }),
                            /*#__PURE__*/ jsx_runtime_.jsx("input", {
                                name: "taxRatePercent",
                                type: "number",
                                inputMode: "decimal",
                                className: "input",
                                value: form.taxRatePercent,
                                onChange: handleChange,
                                min: "0",
                                step: "0.1"
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0,jsx_runtime_.jsxs)("label", {
                        className: "grid gap-1",
                        children: [
                            /*#__PURE__*/ jsx_runtime_.jsx("span", {
                                className: "text-sm",
                                children: t.feeRateLabel
                            }),
                            /*#__PURE__*/ jsx_runtime_.jsx("input", {
                                name: "feeRatePercent",
                                type: "number",
                                inputMode: "decimal",
                                className: "input",
                                value: form.feeRatePercent,
                                onChange: handleChange,
                                min: "0",
                                step: "0.1"
                            })
                        ]
                    })
                ]
            }),
            /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                className: "flex flex-wrap gap-3 justify-between items-center",
                children: [
                    /*#__PURE__*/ (0,jsx_runtime_.jsxs)("label", {
                        className: "grid gap-1",
                        children: [
                            /*#__PURE__*/ jsx_runtime_.jsx("span", {
                                className: "text-sm",
                                children: t.currency
                            }),
                            /*#__PURE__*/ (0,jsx_runtime_.jsxs)("select", {
                                className: "select",
                                value: currency,
                                onChange: (e)=>{
                                    const next = e.target.value;
                                    if (onCurrencyChange) onCurrencyChange(next);
                                },
                                children: [
                                    /*#__PURE__*/ jsx_runtime_.jsx("option", {
                                        value: "KRW",
                                        children: "KRW ₩"
                                    }),
                                    /*#__PURE__*/ jsx_runtime_.jsx("option", {
                                        value: "USD",
                                        children: "USD $"
                                    })
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ jsx_runtime_.jsx("button", {
                        type: "button",
                        className: "btn-primary ml-auto",
                        onClick: handleSubmit,
                        disabled: disabled,
                        children: t.calc
                    })
                ]
            })
        ]
    });
}

;// CONCATENATED MODULE: ./_components/GoalChart.js
// _components/GoalChart.js


function formatMoneyShort(value, currency = "KRW", locale = "ko-KR") {
    const v = Number(value) || 0;
    const isKo = locale.toLowerCase().startsWith("ko");
    const cur = currency || "KRW";
    if (cur === "KRW") {
        const abs = Math.abs(v);
        let divisor = 1;
        let suffix = isKo ? "원" : "KRW";
        if (abs >= 100000000) {
            divisor = 100000000;
            suffix = isKo ? "억" : "\xd7100M";
        } else if (abs >= 10000) {
            divisor = 10000;
            suffix = isKo ? "만" : "\xd710k";
        }
        const scaled = v / divisor;
        const scaledAbs = Math.abs(scaled);
        const hasFraction = Math.round(scaledAbs * 10) % 10 !== 0;
        const fractionDigits = hasFraction ? 1 : 0;
        const numStr = scaled.toLocaleString(locale, {
            minimumFractionDigits: fractionDigits,
            maximumFractionDigits: fractionDigits
        });
        return `${numStr}${suffix}`;
    }
    return new Intl.NumberFormat(locale, {
        maximumFractionDigits: 1
    }).format(v);
}
function GoalChart({ data =[] , locale ="ko-KR" , currency ="KRW" , target =0 ,  }) {
    if (!data.length) {
        return /*#__PURE__*/ jsx_runtime_.jsx("div", {
            className: "text-sm text-slate-500",
            children: locale.toLowerCase().startsWith("ko") ? "데이터가 없습니다." : "No data."
        });
    }
    const values = [
        ...data.map((d)=>Number(d.invested) || 0),
        ...data.map((d)=>Number(d.valueNet) || 0),
        target || 0, 
    ];
    const maxVal = Math.max(...values, 1);
    const minVal = 0;
    const n = data.length;
    const xForIndex = (i)=>n === 1 ? 50 : 5 + i / (n - 1) * 90; // 5~95%
    const yForValue = (v)=>{
        const ratio = (v - minVal) / (maxVal - minVal || 1);
        return 80 - ratio * 50; // y: 30~80 사이
    };
    const investedPoints = data.map((d, i)=>{
        const x = xForIndex(i);
        const y = yForValue(Number(d.invested) || 0);
        return `${x},${y}`;
    }).join(" ");
    const netPoints = data.map((d, i)=>{
        const x = xForIndex(i);
        const y = yForValue(Number(d.valueNet) || 0);
        return `${x},${y}`;
    }).join(" ");
    // 목표선 (수평 라인)
    const targetY = target > 0 ? yForValue(target) : null;
    // Y축 눈금 4개
    const ticks = [
        0,
        0.33,
        0.66,
        1
    ].map((r)=>minVal + (maxVal - minVal) * r);
    const isKo = locale.toLowerCase().startsWith("ko");
    return /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
        className: "w-full",
        children: [
            /*#__PURE__*/ (0,jsx_runtime_.jsxs)("svg", {
                viewBox: "0 0 100 90",
                className: "w-full",
                style: {
                    height: "min(420px, 60vw)",
                    maxHeight: "420px",
                    minHeight: "260px"
                },
                children: [
                    /*#__PURE__*/ jsx_runtime_.jsx("rect", {
                        x: "0",
                        y: "0",
                        width: "100",
                        height: "90",
                        fill: "white"
                    }),
                    ticks.map((t, idx)=>{
                        const y = yForValue(t);
                        return /*#__PURE__*/ (0,jsx_runtime_.jsxs)("g", {
                            children: [
                                /*#__PURE__*/ jsx_runtime_.jsx("line", {
                                    x1: "5",
                                    y1: y,
                                    x2: "95",
                                    y2: y,
                                    stroke: "#e5e7eb",
                                    strokeWidth: "0.3"
                                }),
                                /*#__PURE__*/ jsx_runtime_.jsx("text", {
                                    x: "2",
                                    y: y + 1.5,
                                    fontSize: "3",
                                    fill: "#9ca3af",
                                    textAnchor: "start",
                                    children: formatMoneyShort(t, currency, locale)
                                })
                            ]
                        }, idx);
                    }),
                    /*#__PURE__*/ jsx_runtime_.jsx("line", {
                        x1: "5",
                        y1: "80",
                        x2: "95",
                        y2: "80",
                        stroke: "#9ca3af",
                        strokeWidth: "0.5"
                    }),
                    targetY !== null && /*#__PURE__*/ jsx_runtime_.jsx("line", {
                        x1: "5",
                        y1: targetY,
                        x2: "95",
                        y2: targetY,
                        stroke: "#f59e0b" // amber-500
                        ,
                        strokeWidth: "0.8",
                        strokeDasharray: "2.5 2"
                    }),
                    /*#__PURE__*/ jsx_runtime_.jsx("polyline", {
                        fill: "none",
                        stroke: "#2563eb" // blue-600
                        ,
                        strokeWidth: "1.2",
                        points: investedPoints
                    }),
                    /*#__PURE__*/ jsx_runtime_.jsx("polyline", {
                        fill: "none",
                        stroke: "#10b981" // emerald-500
                        ,
                        strokeWidth: "1.4",
                        points: netPoints
                    }),
                    data.map((d, i)=>{
                        const x = xForIndex(i);
                        const y = yForValue(Number(d.valueNet) || 0);
                        return /*#__PURE__*/ jsx_runtime_.jsx("circle", {
                            cx: x,
                            cy: y,
                            r: "1.4",
                            fill: "#10b981",
                            stroke: "white",
                            strokeWidth: "0.4"
                        }, i);
                    }),
                    data.map((d, i)=>{
                        const x = xForIndex(i);
                        return /*#__PURE__*/ jsx_runtime_.jsx("text", {
                            x: x,
                            y: "86",
                            fontSize: "3",
                            fill: "#6b7280",
                            textAnchor: "middle",
                            children: d.year
                        }, i);
                    })
                ]
            }),
            /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                className: "mt-2 flex flex-wrap gap-3 text-xs text-slate-600",
                children: [
                    /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                        className: "flex items-center gap-1",
                        children: [
                            /*#__PURE__*/ jsx_runtime_.jsx("span", {
                                className: "inline-block w-3 h-[3px] rounded-full",
                                style: {
                                    backgroundColor: "#2563eb"
                                }
                            }),
                            /*#__PURE__*/ jsx_runtime_.jsx("span", {
                                children: isKo ? "누적 투자금" : "Total invested"
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                        className: "flex items-center gap-1",
                        children: [
                            /*#__PURE__*/ jsx_runtime_.jsx("span", {
                                className: "inline-block w-3 h-[3px] rounded-full",
                                style: {
                                    backgroundColor: "#10b981"
                                }
                            }),
                            /*#__PURE__*/ jsx_runtime_.jsx("span", {
                                children: isKo ? "세후 자산" : "Net assets"
                            })
                        ]
                    }),
                    target > 0 && /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                        className: "flex items-center gap-1",
                        children: [
                            /*#__PURE__*/ jsx_runtime_.jsx("span", {
                                className: "inline-block w-3 h-[3px] rounded-full border border-amber-500 border-dashed",
                                style: {
                                    borderColor: "#f59e0b"
                                }
                            }),
                            /*#__PURE__*/ jsx_runtime_.jsx("span", {
                                children: isKo ? "목표 자산" : "Target assets"
                            })
                        ]
                    })
                ]
            })
        ]
    });
}

;// CONCATENATED MODULE: ./_components/GoalYearTable.js
// _components/GoalYearTable.js


function formatMoneyAuto(value, currency = "KRW", locale = "ko-KR") {
    const v = Number(value) || 0;
    const isKo = locale.toLowerCase().startsWith("ko");
    const cur = currency || "KRW";
    // ---- KRW 처리 ----
    if (cur === "KRW") {
        const abs = Math.abs(v);
        let divisor = 1;
        let suffix = isKo ? "원" : "KRW";
        // ① 억 단위 (>= 100,000,000)
        if (abs >= 100000000) {
            divisor = 100000000;
            suffix = isKo ? "억원" : "\xd7100M KRW";
        } else if (abs >= 10000) {
            divisor = 10000;
            suffix = isKo ? "만원" : "\xd710k KRW";
        }
        const scaled = v / divisor;
        // 👉 억 단위는 무조건 소수점 2자리
        if (abs >= 100000000) {
            const numStr = scaled.toLocaleString(locale, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
            return `${numStr}${suffix}`;
        }
        // 👉 만원 단위는 기존 규칙(필요할 때만 소수점 1자리)
        if (abs >= 10000) {
            const scaledAbs = Math.abs(scaled);
            const hasFraction = Math.round(scaledAbs * 10) % 10 !== 0;
            const fractionDigits = hasFraction ? 1 : 0;
            const numStr1 = scaled.toLocaleString(locale, {
                minimumFractionDigits: fractionDigits,
                maximumFractionDigits: fractionDigits
            });
            return `${numStr1}${suffix}`;
        }
        // 👉 원 단위
        return `${scaled.toLocaleString(locale)}${suffix}`;
    }
    // ---- 외화 처리 ----
    const isValidCurrency = typeof cur === "string" && /^[A-Z]{3}$/.test(cur);
    if (!isValidCurrency) {
        return new Intl.NumberFormat(locale).format(v);
    }
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: cur,
        maximumFractionDigits: 2
    }).format(v);
}
function GoalYearTable({ rows =[] , locale ="ko-KR" , currency ="KRW" , target =0 ,  }) {
    var ref;
    const isKo = locale.toLowerCase().startsWith("ko");
    const tableTitle = (0,external_react_.useMemo)(()=>isKo ? "연간 요약 테이블 (목표 자산 경로)" : "Yearly Summary (goal path)", [
        isKo
    ]);
    const unitText = isKo ? "단위: 원 / 만원 / 억원 자동" : "Unit: auto (KRW / 10k / 100M)";
    if (!rows.length) {
        return /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
            className: "card fm-year-table",
            children: [
                /*#__PURE__*/ jsx_runtime_.jsx("div", {
                    className: "flex items-center gap-3 mb-2",
                    children: /*#__PURE__*/ jsx_runtime_.jsx("h2", {
                        className: "text-xl font-semibold",
                        children: tableTitle
                    })
                }),
                /*#__PURE__*/ jsx_runtime_.jsx("p", {
                    className: "text-sm text-slate-500",
                    children: isKo ? "데이터가 없습니다." : "No data."
                })
            ]
        });
    }
    const stats = rows.map((r)=>{
        const year = r.year;
        const invested = Number(r.invested) || 0;
        const valueNet = Number(r.valueNet) || 0;
        const valueGross = Number(r.valueGross) || 0;
        const gainNet = valueNet - invested;
        const returnRate = invested > 0 ? valueNet / invested * 100 : 0;
        const targetProgress = target > 0 ? Math.min(valueNet / target * 100, 9999) : 0;
        return {
            year,
            invested,
            valueNet,
            valueGross,
            gainNet,
            returnRate,
            targetProgress
        };
    });
    // ▶ 목표를 처음 달성하는 연도 찾기
    const firstGoalYear = target > 0 ? ((ref = stats.find((s)=>s.valueNet >= target)) === null || ref === void 0 ? void 0 : ref.year) ?? null : null;
    return /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
        className: "card fm-year-table",
        children: [
            /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                className: "flex items-center gap-3 mb-2",
                children: [
                    /*#__PURE__*/ jsx_runtime_.jsx("h2", {
                        className: "text-xl font-semibold",
                        children: tableTitle
                    }),
                    /*#__PURE__*/ jsx_runtime_.jsx("span", {
                        className: "text-xs text-slate-500",
                        children: unitText
                    })
                ]
            }),
            /*#__PURE__*/ jsx_runtime_.jsx("div", {
                className: "overflow-x-auto mt-4",
                children: /*#__PURE__*/ (0,jsx_runtime_.jsxs)("table", {
                    className: "min-w-full border-t",
                    children: [
                        /*#__PURE__*/ jsx_runtime_.jsx("thead", {
                            className: "bg-slate-50",
                            children: /*#__PURE__*/ (0,jsx_runtime_.jsxs)("tr", {
                                children: [
                                    /*#__PURE__*/ jsx_runtime_.jsx("th", {
                                        className: "px-2 py-1 text-left",
                                        children: isKo ? "연도" : "Year"
                                    }),
                                    /*#__PURE__*/ jsx_runtime_.jsx("th", {
                                        className: "px-2 py-1 text-right",
                                        children: isKo ? "누적 투자금" : "Invested"
                                    }),
                                    /*#__PURE__*/ jsx_runtime_.jsx("th", {
                                        className: "px-2 py-1 text-right",
                                        children: isKo ? "세후 자산" : "Net assets"
                                    }),
                                    /*#__PURE__*/ jsx_runtime_.jsx("th", {
                                        className: "px-2 py-1 text-right",
                                        children: isKo ? "세전 자산" : "Gross assets"
                                    }),
                                    /*#__PURE__*/ jsx_runtime_.jsx("th", {
                                        className: "px-2 py-1 text-right",
                                        children: isKo ? "세후 수익" : "Net gain"
                                    }),
                                    /*#__PURE__*/ jsx_runtime_.jsx("th", {
                                        className: "px-2 py-1 text-right",
                                        children: isKo ? "누적 수익률" : "Total return"
                                    }),
                                    /*#__PURE__*/ jsx_runtime_.jsx("th", {
                                        className: "px-2 py-1 text-right",
                                        children: isKo ? "목표 달성률" : "Goal progress"
                                    })
                                ]
                            })
                        }),
                        /*#__PURE__*/ jsx_runtime_.jsx("tbody", {
                            children: stats.map((s)=>{
                                const isGoalYear = firstGoalYear !== null && s.year === firstGoalYear;
                                return /*#__PURE__*/ (0,jsx_runtime_.jsxs)("tr", {
                                    className: "border-t " + (isGoalYear ? "bg-blue-50" : ""),
                                    children: [
                                        /*#__PURE__*/ (0,jsx_runtime_.jsxs)("td", {
                                            className: "px-2 py-1 text-left",
                                            children: [
                                                s.year,
                                                isGoalYear && /*#__PURE__*/ jsx_runtime_.jsx("span", {
                                                    className: "ml-1 text-[10px] text-blue-600 font-medium",
                                                    children: isKo ? "(목표 달성)" : "(Goal reached)"
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ jsx_runtime_.jsx("td", {
                                            className: "px-2 py-1 text-right",
                                            children: formatMoneyAuto(s.invested, currency, locale)
                                        }),
                                        /*#__PURE__*/ jsx_runtime_.jsx("td", {
                                            className: "px-2 py-1 text-right",
                                            children: formatMoneyAuto(s.valueNet, currency, locale)
                                        }),
                                        /*#__PURE__*/ jsx_runtime_.jsx("td", {
                                            className: "px-2 py-1 text-right",
                                            children: formatMoneyAuto(s.valueGross, currency, locale)
                                        }),
                                        /*#__PURE__*/ jsx_runtime_.jsx("td", {
                                            className: "px-2 py-1 text-right",
                                            children: formatMoneyAuto(s.gainNet, currency, locale)
                                        }),
                                        /*#__PURE__*/ (0,jsx_runtime_.jsxs)("td", {
                                            className: "px-2 py-1 text-right",
                                            children: [
                                                s.returnRate.toFixed(2),
                                                "%"
                                            ]
                                        }),
                                        /*#__PURE__*/ (0,jsx_runtime_.jsxs)("td", {
                                            className: "px-2 py-1 text-right",
                                            children: [
                                                s.targetProgress.toFixed(1),
                                                "%"
                                            ]
                                        })
                                    ]
                                }, s.year);
                            })
                        })
                    ]
                })
            })
        ]
    });
}

// EXTERNAL MODULE: ./lib/compound.js
var compound = __webpack_require__(2842);
// EXTERNAL MODULE: ./lib/lang.js
var lib_lang = __webpack_require__(6915);
;// CONCATENATED MODULE: ./pages/tools/goal-simulator.js
// pages/tools/goal-simulator.js








// ===== JSON-LD 출력용 공통 컴포넌트 =====
function JsonLd({ data  }) {
    return /*#__PURE__*/ jsx_runtime_.jsx("script", {
        type: "application/ld+json",
        dangerouslySetInnerHTML: {
            __html: JSON.stringify(data)
        }
    });
}
// ===== 시뮬레이터 계산 로직 =====
function simulateGoalPath({ current , monthly , annualRate , years , compounding ="monthly" , // 🔥 복리 계산기와 동일하게 세율/수수료율 퍼센트로 받기
taxRatePercent =15.4 , feeRatePercent =0.5  }) {
    const months = Math.max(1, Math.floor(years * 12));
    const rYear = (Number(annualRate) || 0) / 100;
    // 🔥 퍼센트 → 소수로 변환 + 0 미만 방지
    const taxRate = Math.max(0, (Number(taxRatePercent) || 0) / 100);
    const feeRate = Math.max(0, (Number(feeRatePercent) || 0) / 100);
    // 세금/수수료 감안한 "순 연수익률" 근사
    let netYear = rYear;
    netYear *= 1 - taxRate;
    netYear -= feeRate;
    if (netYear < -0.99) netYear = -0.99;
    const grossMonth = compounding === "yearly" ? Math.pow(1 + rYear, 1 / 12) - 1 : rYear / 12;
    const netMonth = compounding === "yearly" ? Math.pow(1 + netYear, 1 / 12) - 1 : netYear / 12;
    let invested = Number(current) || 0;
    let valueGross = invested;
    let valueNet = invested;
    const rows = [];
    for(let m = 1; m <= months; m++){
        invested += monthly;
        valueGross = (valueGross + monthly) * (1 + grossMonth);
        valueNet = (valueNet + monthly) * (1 + netMonth);
        if (m % 12 === 0 || m === months) {
            const year = Math.round(m / 12);
            rows.push({
                year,
                invested,
                valueGross,
                valueNet
            });
        }
    }
    return rows;
}
// ===== Page Component =====
function GoalSimulatorPage() {
    const { 0: lang , 1: setLang  } = (0,external_react_.useState)("ko");
    const locale = lang === "ko" ? "ko" : "en";
    // 통화는 언어에 따라 자동 초기화
    const { 0: currency , 1: setCurrency  } = (0,external_react_.useState)(locale === "ko" ? "KRW" : "USD");
    const { 0: result , 1: setResult  } = (0,external_react_.useState)(null);
    const { 0: target , 1: setTarget  } = (0,external_react_.useState)(0);
    const loc = locale === "ko" ? "ko-KR" : "en-US";
    // ===== 언어 초기 로딩 + Header.js 이벤트 수신 =====
    (0,external_react_.useEffect)(()=>{
        if (true) return;
        const initial = (0,lib_lang/* getInitialLang */.X)();
        setLang(initial);
        setCurrency(initial === "ko" ? "KRW" : "USD");
        const handler = (e)=>{
            const next = e.detail || "ko";
            setLang(next);
            setCurrency(next === "ko" ? "KRW" : "USD");
        };
        window.addEventListener("fm_lang_change", handler);
        return ()=>window.removeEventListener("fm_lang_change", handler);
    }, []);
    // ===== 텍스트 리소스 =====
    const t = (0,external_react_.useMemo)(()=>({
            title: locale === "ko" ? "목표 자산 시뮬레이터" : "Goal Asset Simulator",
            desc: locale === "ko" ? "현재 자산\xb7월 적립금\xb7수익률\xb7기간\xb7세금\xb7수수료를 바탕으로 목표 자산까지의 자산 성장 경로를 시뮬레이션해 보세요." : "Simulate your asset growth toward a target amount based on your current assets, monthly savings, expected return, time horizon, tax and fee settings.",
            chartTitle: locale === "ko" ? "목표 자산까지 자산 경로" : "Path to target assets",
            fv: locale === "ko" ? "마지막 해 세후 자산" : "Final net assets",
            contrib: locale === "ko" ? "누적 투자금" : "Total invested",
            interest: locale === "ko" ? "세후 수익" : "Net gain",
            // 🔹 상단 설명 섹션
            introTitle: locale === "ko" ? "목표 자산 시뮬레이터로 무엇을 할 수 있나요?" : "What can this goal simulator do?",
            introLead: locale === "ko" ? "“언제까지 얼마를 모으고 싶은지” 목표를 세우고, 지금 자산\xb7적립액\xb7수익률을 기준으로 경로를 그려볼 수 있습니다." : "Set a target amount and deadline, then see how your current assets, monthly savings and expected return could get you there.",
            introBullet1: locale === "ko" ? "현재 자산 + 매달 적립금 + 예상 수익률\xb7기간을 기반으로 자산 성장 경로를 연도별로 시뮬레이션합니다." : "Simulate your asset path year by year based on current assets, monthly contributions, expected return and time horizon.",
            introBullet2: locale === "ko" ? "세금\xb7수수료를 적용했을 때와 적용하지 않았을 때의 차이를 세전/세후 자산으로 비교할 수 있습니다." : "Compare gross vs net results to see how taxes and fees affect your path.",
            introBullet3: locale === "ko" ? "목표 자산 대비 부족/초과 정도를 차트와 표로 확인하며, 적립액이나 기간을 조정해 보는 데 활용할 수 있습니다." : "Use the chart and table to see whether you fall short or overshoot your goal and experiment with monthly amount or years.",
            // 🔹 FAQ 섹션 제목
            faqTitle: locale === "ko" ? "목표 자산 시뮬레이터 자주 묻는 질문(FAQ)" : "Goal asset simulator FAQ"
        }), [
        locale
    ]);
    const summaryFmt = (v)=>(0,compound/* numberFmt */.i6)(loc, currency, v || 0);
    // ===== FAQ 데이터 (UI + JSON-LD 공용) =====
    const faqItems = (0,external_react_.useMemo)(()=>locale === "ko" ? [
            {
                q: "입력 금액은 어떤 단위로 넣어야 하나요?",
                a: "통화가 원화(KRW)일 때는 만원 단위로 입력합니다. 예를 들어 3,000만원은 3000으로 적습니다. 통화를 USD로 변경하면 실제 달러 금액 그대로 입력하면 됩니다."
            },
            {
                q: "목표 자산 금액은 세전 기준인가요, 세후 기준인가요?",
                a: "이 시뮬레이터에서 목표 자산은 “세후 자산 기준”으로 보는 것을 추천합니다. 세금과 수수료 옵션을 켜고, 필요하다면 세율\xb7수수료율(%)을 조정한 뒤 세후 기준 자산 경로를 보는 것이 직관적입니다."
            },
            {
                q: "세금\xb7수수료 옵션은 어떻게 적용되나요?",
                a: "세금 적용을 켜면 기본값으로 이자소득세 15.4%를, 수수료 적용을 켜면 기본값으로 연 0.5% 수준의 보수/수수료를 사용합니다. 세율\xb7수수료율 입력창에서 0%~원하는 값으로 직접 조정할 수 있습니다. 실제 금융상품의 세율\xb7수수료와는 다를 수 있으니 참고용으로만 사용하세요."
            },
            {
                q: "목표 자산이 너무 크거나 기간이 너무 짧으면 어떻게 보나요?",
                a: "예상 수익률 대비 목표가 지나치게 크거나 기간이 매우 짧다면 그래프 상에서 목표선을 크게 밑돌 수 있습니다. 이때는 “월 적립금 증가”, “투자 기간 연장”, “수익률 상향(현실 범위 내)” 같은 조합을 조정해가며 현실적인 계획을 찾아보는 용도로 활용하세요."
            },
            {
                q: "실제 투자 결과와 시뮬레이션 결과가 다른 이유는 무엇인가요?",
                a: "시뮬레이션은 일정한 연 수익률과 매달 동일한 적립금, 단순한 세금\xb7수수료 모델을 가정합니다. 실제 투자는 시장 변동성, 환율, 세법 변화, 상품 구조 등에 따라 달라지므로, 계획을 세우는 참고 도구로만 활용하는 것이 좋습니다."
            }, 
        ] : [
            {
                q: "What unit should I use for the input amounts?",
                a: "If the currency is KRW, use units of 10,000 KRW. For example, 30M KRW should be entered as 3000. If you switch to USD, enter your actual dollar amounts."
            },
            {
                q: "Is the target amount before or after tax?",
                a: "We recommend thinking of your target as an “after-tax” number. When tax and fee options are enabled (and tax/fee rates are set), the simulator computes net values, so it is more intuitive to set your goal based on net assets."
            },
            {
                q: "How are tax and fees applied in the simulation?",
                a: "With tax enabled, we use a default 15.4% interest tax; with fees enabled, we use a default 0.5% annual cost. You can override both percentages in the form. These are simplified assumptions and may not match real products exactly."
            },
            {
                q: "What if my target is very high or too aggressive?",
                a: "If your target is too ambitious for the chosen annual return and time horizon, the net asset line may stay far below the target line. In that case, try adjusting your monthly contribution, extending the horizon, or slightly increasing the assumed return (within realistic bounds)."
            },
            {
                q: "Why might real investment results differ from this simulator?",
                a: "The simulator assumes a constant return, fixed monthly contributions, and simplified tax/fee rules. Real-world returns fluctuate, and tax regulations and product structures can change, so regard this tool as a planning aid rather than a prediction."
            }, 
        ], [
        locale
    ]);
    // ===== FAQ JSON-LD (FAQPage) =====
    const faqJsonLd = (0,external_react_.useMemo)(()=>({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqItems.map((item)=>({
                    "@type": "Question",
                    name: item.q,
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: item.a
                    }
                }))
        }), [
        faqItems
    ]);
    // ===== Form Submit =====
    const onSubmit = (form)=>{
        // 통화 기준 스케일링 (만원 vs 원 / USD 그대로)
        const scale = currency === "KRW" ? 10000 : 1;
        const current = (Number(form.current) || 0) * scale;
        const monthly = (Number(form.monthly) || 0) * scale;
        const r = Number(form.annualRate) || 0;
        const y = Number(form.years) || 0;
        const targetValue = (Number(form.target) || 0) * scale;
        // 🔥 사용자가 입력한 세율/수수료율 (%)
        const taxRatePercent = form.taxRatePercent !== undefined && form.taxRatePercent !== null && form.taxRatePercent !== "" ? Number(form.taxRatePercent) : 0; //15.4;
        const feeRatePercent = form.feeRatePercent !== undefined && form.feeRatePercent !== null && form.feeRatePercent !== "" ? Number(form.feeRatePercent) : 0; //0.5;
        const rows = simulateGoalPath({
            current,
            monthly,
            annualRate: r,
            years: y,
            compounding: form.compounding,
            taxRatePercent,
            feeRatePercent
        });
        setTarget(targetValue);
        setResult(rows);
    };
    const hasResult = !!(result && result.length);
    const last = hasResult ? result[result.length - 1] : null;
    const finalNet = last ? last.valueNet : 0;
    const finalInvested = last ? last.invested : 0;
    const finalGain = finalNet - finalInvested;
    return /*#__PURE__*/ (0,jsx_runtime_.jsxs)(jsx_runtime_.Fragment, {
        children: [
            /*#__PURE__*/ jsx_runtime_.jsx(SeoHead/* default */.Z, {
                title: t.title,
                desc: t.desc,
                url: "/tools/goal-simulator",
                image: "/og/goal-simulator.jpg"
            }),
            /*#__PURE__*/ jsx_runtime_.jsx(JsonLd, {
                data: faqJsonLd
            }),
            /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                className: "py-6 grid gap-6 fm-mobile-full",
                children: [
                    /*#__PURE__*/ jsx_runtime_.jsx("div", {
                        className: "flex items-center gap-3",
                        children: /*#__PURE__*/ jsx_runtime_.jsx("h1", {
                            className: "text-xl sm:text-2xl font-bold",
                            children: t.title
                        })
                    }),
                    /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                        className: "card",
                        children: [
                            /*#__PURE__*/ jsx_runtime_.jsx("h2", {
                                className: "text-lg font-semibold mb-2",
                                children: t.introTitle
                            }),
                            /*#__PURE__*/ jsx_runtime_.jsx("p", {
                                className: "text-sm text-slate-600 mb-2",
                                children: t.introLead
                            }),
                            /*#__PURE__*/ (0,jsx_runtime_.jsxs)("ul", {
                                className: "list-disc pl-5 text-sm text-slate-600 space-y-1",
                                children: [
                                    /*#__PURE__*/ jsx_runtime_.jsx("li", {
                                        children: t.introBullet1
                                    }),
                                    /*#__PURE__*/ jsx_runtime_.jsx("li", {
                                        children: t.introBullet2
                                    }),
                                    /*#__PURE__*/ jsx_runtime_.jsx("li", {
                                        children: t.introBullet3
                                    })
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ jsx_runtime_.jsx("div", {
                        className: "card",
                        children: /*#__PURE__*/ jsx_runtime_.jsx(GoalForm, {
                            onSubmit: onSubmit,
                            locale: locale,
                            currency: currency,
                            onCurrencyChange: setCurrency
                        })
                    }),
                    hasResult && /*#__PURE__*/ (0,jsx_runtime_.jsxs)(jsx_runtime_.Fragment, {
                        children: [
                            /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                                className: "grid gap-4 sm:grid-cols-3",
                                children: [
                                    /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                                        className: "stat",
                                        children: [
                                            /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                                className: "stat-title",
                                                children: t.fv
                                            }),
                                            /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                                className: "stat-value",
                                                children: summaryFmt(finalNet)
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                                        className: "stat",
                                        children: [
                                            /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                                className: "stat-title",
                                                children: t.contrib
                                            }),
                                            /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                                className: "stat-value",
                                                children: summaryFmt(finalInvested)
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                                        className: "stat",
                                        children: [
                                            /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                                className: "stat-title",
                                                children: t.interest
                                            }),
                                            /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                                className: "stat-value",
                                                children: summaryFmt(finalGain)
                                            })
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                                className: "card",
                                children: [
                                    /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                                        className: "flex items-center gap-3 mb-2",
                                        children: [
                                            /*#__PURE__*/ jsx_runtime_.jsx("h2", {
                                                className: "text-lg font-semibold",
                                                children: t.chartTitle
                                            }),
                                            /*#__PURE__*/ jsx_runtime_.jsx("span", {
                                                className: "text-xs text-slate-500",
                                                children: locale.startsWith("ko") ? "단위: 원 / 만원 / 억원 자동" : "Unit: auto (KRW / 10k / 100M)"
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ jsx_runtime_.jsx(GoalChart, {
                                        data: result,
                                        locale: loc,
                                        currency: currency,
                                        target: target
                                    })
                                ]
                            }),
                            /*#__PURE__*/ jsx_runtime_.jsx(GoalYearTable, {
                                rows: result,
                                locale: loc,
                                currency: currency,
                                target: target
                            }),
                            /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                                className: "card w-full",
                                children: [
                                    /*#__PURE__*/ jsx_runtime_.jsx("h2", {
                                        className: "text-lg font-semibold mb-3",
                                        children: t.faqTitle
                                    }),
                                    /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                        className: "space-y-3",
                                        children: faqItems.map((item, idx)=>/*#__PURE__*/ (0,jsx_runtime_.jsxs)("details", {
                                                className: "border border-slate-200 rounded-lg p-3 bg-slate-50",
                                                open: idx === 0,
                                                children: [
                                                    /*#__PURE__*/ jsx_runtime_.jsx("summary", {
                                                        className: "cursor-pointer font-medium text-sm",
                                                        children: item.q
                                                    }),
                                                    /*#__PURE__*/ jsx_runtime_.jsx("p", {
                                                        className: "mt-2 text-sm text-slate-700 whitespace-pre-line",
                                                        children: item.a
                                                    })
                                                ]
                                            }, idx))
                                    })
                                ]
                            })
                        ]
                    })
                ]
            })
        ]
    });
}


/***/ })

};
;