"use strict";
(() => {
var exports = {};
exports.id = 405;
exports.ids = [405,0];
exports.modules = {

/***/ 3678:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Home),
/* harmony export */   "getStaticProps": () => (/* binding */ getStaticProps)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(997);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(1664);
/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_link__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(6689);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _components_SeoHead__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(8814);
/* harmony import */ var _lib_posts__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(8904);
/* harmony import */ var _lib_lang__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(6915);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_lib_posts__WEBPACK_IMPORTED_MODULE_4__]);
_lib_posts__WEBPACK_IMPORTED_MODULE_4__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];
// pages/index.js






/* ✅ 카테고리 이름 → slug 매핑 (frontmatter 기준) */ const CATEGORY_SLUG_KO = {
    "경제정보": "economicInfo",
    "재테크": "personalFinance",
    "투자정보": "investingInfo"
};
const CATEGORY_SLUG_EN = {
    "economic info": "economicInfo",
    "personal finance": "personalFinance",
    "investing info": "investingInfo"
};
/* ✅ 포스트에서 categorySlug 계산 */ function getCategorySlugFromPost(p) {
    const lang = p.lang || "ko";
    const category = p.category || "";
    if (lang === "ko") {
        return CATEGORY_SLUG_KO[category] || "economicInfo";
    }
    const key = category.toLowerCase();
    return CATEGORY_SLUG_EN[key] || key || "economicInfo";
}
const TEXT = {
    ko: {
        seoTitle: "홈",
        seoDesc: "FinMap 블로그 \xb7 금융 기초 \xb7 재테크 \xb7 투자 \xb7 계산기",
        heroTitleLine1: "당신의 돈 흐름을",
        heroTitleLine2: "지도처럼 한 눈에",
        heroSub: "경제 기초 개념부터 투자 아이디어, 세금 이슈, 복리 계산기까지. 초중급 투자자가 헷갈려 하는 포인트만 골라 정리합니다.",
        btnTool: "복리 계산기 바로가기",
        btnEconomics: "경제 기초부터 차근차근",
        stat1Title: "경제 기초",
        stat1Value: "입문자용",
        stat2Title: "투자 개념",
        stat2Value: "실전 연결",
        stat3Title: "세금",
        stat3Value: "헷갈림 정리",
        stat4Title: "복리 계산",
        stat4Value: "숫자로 확인",
        latestHeading: "최신 글",
        moreHeading: "더 알아보기",
        moreSub: "경제정보 \xb7 재테크 \xb7 투자정보 카테고리별로 정리되어 있습니다."
    },
    en: {
        seoTitle: "Home",
        seoDesc: "FinMap blog \xb7 economics basic \xb7 investing info \xb7 personal finance \xb7 compound interest calculators",
        heroTitleLine1: "See your money flows",
        heroTitleLine2: "like a map at a glance",
        heroSub: "From basic economic concepts to investment ideas, tax topics, and compound interest tools. We focus on the exact points beginner and intermediate investors find confusing.",
        btnTool: "Open compound interest calculator",
        btnEconomics: "Start from economic basics",
        stat1Title: "Economic basics",
        stat1Value: "For beginners",
        stat2Title: "Investment concepts",
        stat2Value: "Linked to practice",
        stat3Title: "Taxes",
        stat3Value: "Clearing confusion",
        stat4Title: "Compound interest",
        stat4Value: "See it in numbers",
        latestHeading: "Latest posts",
        moreHeading: "More to explore",
        moreSub: "Articles are organized by categories such as economic info, personal finance, and investing."
    }
};
function Home({ posts  }) {
    // 🔥 전역 언어 시스템과 동기화되는 상태
    const { 0: lang , 1: setLang  } = (0,react__WEBPACK_IMPORTED_MODULE_2__.useState)("ko");
    // ✅ 헤더와 동일하게: fm_lang 쿠키 + fm_lang_change 이벤트 수신
    (0,react__WEBPACK_IMPORTED_MODULE_2__.useEffect)(()=>{
        if (true) return;
        // 최초 진입 시 쿠키 기준 언어
        const initial = (0,_lib_lang__WEBPACK_IMPORTED_MODULE_5__/* .getInitialLang */ .X)();
        setLang(initial);
        // 헤더에서 setLang() 호출 시 발생하는 이벤트 구독
        const handler = (e)=>{
            setLang(e.detail || "ko");
        };
        window.addEventListener("fm_lang_change", handler);
        return ()=>window.removeEventListener("fm_lang_change", handler);
    }, []);
    const t = TEXT[lang] || TEXT.ko;
    // 언어별 포스트 필터링 (lang 필드가 없으면 ko로 간주)
    const filtered = posts.filter((p)=>{
        if (!p.lang) return lang === "ko";
        return p.lang === lang;
    });
    const latest = filtered.slice(0, 3);
    const more = filtered.slice(3, 9);
    const seoUrl = lang === "en" ? "/?lang=en" : "/";
    return /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, {
        children: [
            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_components_SeoHead__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .Z, {
                title: t.seoTitle,
                desc: t.seoDesc,
                url: seoUrl
            }),
            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("section", {
                className: "mt-6 mb-8",
                children: /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                    className: "card flex flex-col md:flex-row gap-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white",
                    children: [
                        /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                            className: "flex-1",
                            children: [
                                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("p", {
                                    className: "text-xs uppercase tracking-[0.2em] text-blue-300 mb-2",
                                    children: "PERSONAL FINANCE \xb7 INVESTING"
                                }),
                                /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("h1", {
                                    className: "text-2xl md:text-3xl lg:text-4xl font-semibold leading-tight mb-3",
                                    children: [
                                        t.heroTitleLine1,
                                        /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("br", {
                                            className: "hidden sm:block"
                                        }),
                                        /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("span", {
                                            className: "text-blue-300",
                                            children: t.heroTitleLine2
                                        }),
                                        ", FinMap"
                                    ]
                                }),
                                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("p", {
                                    className: "text-sm md:text-base text-slate-200 mb-4",
                                    children: t.heroSub
                                }),
                                /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                    className: "flex flex-wrap gap-3",
                                    children: [
                                        /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx((next_link__WEBPACK_IMPORTED_MODULE_1___default()), {
                                            href: "/tools/compound-interest",
                                            className: "btn-primary bg-blue-500 hover:bg-blue-600",
                                            children: t.btnTool
                                        }),
                                        /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx((next_link__WEBPACK_IMPORTED_MODULE_1___default()), {
                                            href: "/category/economicInfo",
                                            className: "btn-secondary border-slate-500 text-slate-100 hover:bg-slate-800",
                                            children: t.btnEconomics
                                        })
                                    ]
                                })
                            ]
                        }),
                        /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                            className: "flex-1 flex items-center justify-center",
                            children: /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                className: "grid grid-cols-2 gap-3 w-full max-w-xs",
                                children: [
                                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                        className: "stat bg-slate-900/60 border border-slate-700",
                                        children: [
                                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("p", {
                                                className: "stat-title text-slate-300",
                                                children: t.stat1Title
                                            }),
                                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("p", {
                                                className: "stat-value text-blue-300",
                                                children: t.stat1Value
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                        className: "stat bg-slate-900/60 border border-slate-700",
                                        children: [
                                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("p", {
                                                className: "stat-title text-slate-300",
                                                children: t.stat2Title
                                            }),
                                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("p", {
                                                className: "stat-value text-emerald-300",
                                                children: t.stat2Value
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                        className: "stat bg-slate-900/60 border border-slate-700",
                                        children: [
                                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("p", {
                                                className: "stat-title text-slate-300",
                                                children: t.stat3Title
                                            }),
                                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("p", {
                                                className: "stat-value text-amber-300",
                                                children: t.stat3Value
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                        className: "stat bg-slate-900/60 border border-slate-700",
                                        children: [
                                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("p", {
                                                className: "stat-title text-slate-300",
                                                children: t.stat4Title
                                            }),
                                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("p", {
                                                className: "stat-value text-fuchsia-300",
                                                children: t.stat4Value
                                            })
                                        ]
                                    })
                                ]
                            })
                        })
                    ]
                })
            }),
            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("section", {
                className: "mt-4",
                children: [
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("h2", {
                        className: "text-xl font-semibold mb-3",
                        children: t.latestHeading
                    }),
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                        className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
                        children: latest.map((p)=>{
                            const categorySlug = getCategorySlugFromPost(p);
                            const postLang = p.lang || "ko";
                            return /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("article", {
                                className: "card hover:shadow-md transition-shadow",
                                children: [
                                    p.cover && /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("img", {
                                        src: p.cover,
                                        alt: p.title,
                                        className: "card-thumb"
                                    }),
                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("span", {
                                        className: "badge",
                                        children: p.category
                                    }),
                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("h3", {
                                        className: "mt-2 text-lg font-semibold",
                                        children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx((next_link__WEBPACK_IMPORTED_MODULE_1___default()), {
                                            href: `/posts/${categorySlug}/${postLang}/${p.slug}`,
                                            children: p.title
                                        })
                                    }),
                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("p", {
                                        className: "text-xs text-slate-500 mt-1",
                                        children: p.datePublished
                                    })
                                ]
                            }, `${postLang}-${p.slug}`);
                        })
                    })
                ]
            }),
            more.length > 0 && /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("section", {
                className: "mt-10 mb-12",
                children: [
                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                        className: "flex items-center justify-between mb-3",
                        children: [
                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("h2", {
                                className: "text-lg font-semibold",
                                children: t.moreHeading
                            }),
                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("span", {
                                className: "text-xs text-slate-500",
                                children: t.moreSub
                            })
                        ]
                    }),
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                        className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
                        children: more.map((p)=>{
                            const categorySlug = getCategorySlugFromPost(p);
                            const postLang = p.lang || "ko";
                            return /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("article", {
                                className: "card hover:shadow-md transition-shadow",
                                children: [
                                    p.cover && /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("img", {
                                        src: p.cover,
                                        alt: p.title,
                                        className: "card-thumb"
                                    }),
                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("span", {
                                        className: "badge",
                                        children: p.category
                                    }),
                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("h3", {
                                        className: "mt-2 text-base font-semibold",
                                        children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx((next_link__WEBPACK_IMPORTED_MODULE_1___default()), {
                                            href: `/posts/${categorySlug}/${postLang}/${p.slug}`,
                                            children: p.title
                                        })
                                    }),
                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("p", {
                                        className: "text-xs text-slate-500 mt-1",
                                        children: p.datePublished
                                    })
                                ]
                            }, `${postLang}-${p.slug}`);
                        })
                    })
                ]
            })
        ]
    });
}
async function getStaticProps() {
    const posts = (0,_lib_posts__WEBPACK_IMPORTED_MODULE_4__/* .getAllPostsAllLangs */ .zC)(); // ✅ ko + en 전부
    return {
        props: {
            posts
        }
    };
}

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ }),

/***/ 8076:
/***/ ((module) => {

module.exports = require("gray-matter");

/***/ }),

/***/ 3280:
/***/ ((module) => {

module.exports = require("next/dist/shared/lib/app-router-context.js");

/***/ }),

/***/ 2796:
/***/ ((module) => {

module.exports = require("next/dist/shared/lib/head-manager-context.js");

/***/ }),

/***/ 4014:
/***/ ((module) => {

module.exports = require("next/dist/shared/lib/i18n/normalize-locale-path.js");

/***/ }),

/***/ 8524:
/***/ ((module) => {

module.exports = require("next/dist/shared/lib/is-plain-object.js");

/***/ }),

/***/ 8020:
/***/ ((module) => {

module.exports = require("next/dist/shared/lib/mitt.js");

/***/ }),

/***/ 4406:
/***/ ((module) => {

module.exports = require("next/dist/shared/lib/page-path/denormalize-page-path.js");

/***/ }),

/***/ 4964:
/***/ ((module) => {

module.exports = require("next/dist/shared/lib/router-context.js");

/***/ }),

/***/ 1751:
/***/ ((module) => {

module.exports = require("next/dist/shared/lib/router/utils/add-path-prefix.js");

/***/ }),

/***/ 6220:
/***/ ((module) => {

module.exports = require("next/dist/shared/lib/router/utils/compare-states.js");

/***/ }),

/***/ 299:
/***/ ((module) => {

module.exports = require("next/dist/shared/lib/router/utils/format-next-pathname-info.js");

/***/ }),

/***/ 3938:
/***/ ((module) => {

module.exports = require("next/dist/shared/lib/router/utils/format-url.js");

/***/ }),

/***/ 9565:
/***/ ((module) => {

module.exports = require("next/dist/shared/lib/router/utils/get-asset-path-from-route.js");

/***/ }),

/***/ 5789:
/***/ ((module) => {

module.exports = require("next/dist/shared/lib/router/utils/get-next-pathname-info.js");

/***/ }),

/***/ 1897:
/***/ ((module) => {

module.exports = require("next/dist/shared/lib/router/utils/is-bot.js");

/***/ }),

/***/ 1428:
/***/ ((module) => {

module.exports = require("next/dist/shared/lib/router/utils/is-dynamic.js");

/***/ }),

/***/ 8854:
/***/ ((module) => {

module.exports = require("next/dist/shared/lib/router/utils/parse-path.js");

/***/ }),

/***/ 1292:
/***/ ((module) => {

module.exports = require("next/dist/shared/lib/router/utils/parse-relative-url.js");

/***/ }),

/***/ 4567:
/***/ ((module) => {

module.exports = require("next/dist/shared/lib/router/utils/path-has-prefix.js");

/***/ }),

/***/ 979:
/***/ ((module) => {

module.exports = require("next/dist/shared/lib/router/utils/querystring.js");

/***/ }),

/***/ 3297:
/***/ ((module) => {

module.exports = require("next/dist/shared/lib/router/utils/remove-trailing-slash.js");

/***/ }),

/***/ 6052:
/***/ ((module) => {

module.exports = require("next/dist/shared/lib/router/utils/resolve-rewrites.js");

/***/ }),

/***/ 4226:
/***/ ((module) => {

module.exports = require("next/dist/shared/lib/router/utils/route-matcher.js");

/***/ }),

/***/ 5052:
/***/ ((module) => {

module.exports = require("next/dist/shared/lib/router/utils/route-regex.js");

/***/ }),

/***/ 9232:
/***/ ((module) => {

module.exports = require("next/dist/shared/lib/utils.js");

/***/ }),

/***/ 968:
/***/ ((module) => {

module.exports = require("next/head");

/***/ }),

/***/ 6689:
/***/ ((module) => {

module.exports = require("react");

/***/ }),

/***/ 997:
/***/ ((module) => {

module.exports = require("react/jsx-runtime");

/***/ }),

/***/ 8974:
/***/ ((module) => {

module.exports = import("marked");;

/***/ }),

/***/ 7147:
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ 1017:
/***/ ((module) => {

module.exports = require("path");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, [676,664,814,630], () => (__webpack_exec__(3678)));
module.exports = __webpack_exports__;

})();