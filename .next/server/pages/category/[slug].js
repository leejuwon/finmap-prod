"use strict";
(() => {
var exports = {};
exports.id = 24;
exports.ids = [24,0];
exports.modules = {

/***/ 8785:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ CategoryPage),
/* harmony export */   "getStaticPaths": () => (/* binding */ getStaticPaths),
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
// pages/category/[slug].js






const CATEGORY_LABELS_KO = {
    economicInfo: "경제",
    personalFinance: "재테크",
    investingInfo: "투자정보"
};
const CATEGORY_LABELS_EN = {
    economicInfo: "Economic Info",
    personalFinance: "Personal Finance",
    investingInfo: "Investing Info"
};
function CategoryPage({ slug , postsKo , postsEn  }) {
    const { 0: lang , 1: setLang  } = (0,react__WEBPACK_IMPORTED_MODULE_2__.useState)("ko");
    const isKo = lang === "ko";
    // ✅ 헤더와 동일하게 fm_lang 기준으로 언어 동기화
    (0,react__WEBPACK_IMPORTED_MODULE_2__.useEffect)(()=>{
        if (true) return;
        const initial = (0,_lib_lang__WEBPACK_IMPORTED_MODULE_5__/* .getInitialLang */ .X)();
        setLang(initial);
        const handler = (e)=>{
            const next = (e === null || e === void 0 ? void 0 : e.detail) === "en" ? "en" : "ko";
            setLang(next);
        };
        window.addEventListener("fm_lang_change", handler);
        return ()=>window.removeEventListener("fm_lang_change", handler);
    }, []);
    const LABELS = isKo ? CATEGORY_LABELS_KO : CATEGORY_LABELS_EN;
    const title = LABELS[slug] || slug;
    // ✅ en에 글이 있으면 en, 없으면 ko로 폴백
    const posts = !isKo && postsEn && postsEn.length > 0 ? postsEn : postsKo;
    const urlPath = `/category/${slug}`;
    return /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, {
        children: [
            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_components_SeoHead__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .Z, {
                title: isKo ? `${title} 카테고리` : `${title} category`,
                desc: isKo ? `${title} 글 모음` : `Posts related to ${title}`,
                url: urlPath
            }),
            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("h1", {
                className: "text-2xl font-bold mb-4",
                children: title
            }),
            posts.length === 0 ? /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("p", {
                className: "text-slate-500",
                children: isKo ? "아직 이 카테고리의 글이 없습니다." : "No posts in this category yet."
            }) : /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("ul", {
                className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
                children: posts.map((p)=>/*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("li", {
                        className: "card",
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
                                    href: `/posts/${slug}/${isKo ? "ko" : "en"}/${p.slug}`,
                                    children: p.title
                                })
                            }),
                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("p", {
                                className: "text-sm text-slate-500 mt-1",
                                children: p.datePublished
                            })
                        ]
                    }, p.slug))
            })
        ]
    });
}
// 🔹 카테고리 슬러그 3개만 정적으로 생성
async function getStaticPaths() {
    const slugs = [
        "economicInfo",
        "personalFinance",
        "investingInfo"
    ];
    const paths = slugs.map((slug)=>({
            params: {
                slug
            }
        }));
    return {
        paths,
        fallback: false
    };
}
// 🔹 빌드 시 KO/EN 둘 다 읽어서 props로 넘겨줌
async function getStaticProps({ params  }) {
    const { slug  } = params;
    // 언어별 전체 글 리스트
    const allKo = (0,_lib_posts__WEBPACK_IMPORTED_MODULE_4__/* .getAllPosts */ .Bd)("ko");
    const allEn = (0,_lib_posts__WEBPACK_IMPORTED_MODULE_4__/* .getAllPosts */ .Bd)("en");
    // 카테고리 매핑 (KO)
    const mapKo = {
        "경제정보": "economicInfo",
        "재테크": "personalFinance",
        "투자정보": "investingInfo"
    };
    // 카테고리 매핑 (EN - 소문자 기준)
    const mapEn = {
        "economic info": "economicInfo",
        "personal finance": "personalFinance",
        "investing info": "investingInfo"
    };
    const postsKo = allKo.filter((p)=>{
        const pSlug = mapKo[p.category] || (p.category || "").toLowerCase();
        return pSlug === slug;
    });
    const postsEn = allEn.filter((p)=>{
        const key = (p.category || "").toLowerCase();
        const mapped = mapEn[key] || key;
        return mapped === slug;
    });
    return {
        props: {
            slug,
            postsKo,
            postsEn
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
var __webpack_require__ = require("../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, [676,664,814,630], () => (__webpack_exec__(8785)));
module.exports = __webpack_exports__;

})();