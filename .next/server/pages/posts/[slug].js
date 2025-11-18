"use strict";
(() => {
var exports = {};
exports.id = 922;
exports.ids = [922];
exports.modules = {

/***/ 3248:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (/* binding */ AdInArticle)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(997);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6689);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);


function AdInArticle({ client ="ca-pub-1869932115288976" , slot  }) {
    const ref = (0,react__WEBPACK_IMPORTED_MODULE_1__.useRef)(null);
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{
        try {
            if (window.adsbygoogle && ref.current) {
                (adsbygoogle = window.adsbygoogle || []).push({});
            }
        } catch (e) {}
    }, []);
    return /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("ins", {
        ref: ref,
        className: "adsbygoogle",
        style: {
            display: "block",
            textAlign: "center",
            minHeight: "120px"
        },
        "data-ad-client": client,
        "data-ad-slot": slot,
        "data-ad-format": "fluid",
        "data-ad-layout": "in-article",
        "data-full-width-responsive": "true"
    });
}


/***/ }),

/***/ 1137:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (/* binding */ AdResponsive)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(997);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6689);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
// _components/AdResponsive.js


function AdResponsive({ client ="ca-pub-1869932115288976" , slot , align ="center"  }) {
    const ref = (0,react__WEBPACK_IMPORTED_MODULE_1__.useRef)(null);
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{
        try {
            if (window.adsbygoogle && ref.current) {
                (adsbygoogle = window.adsbygoogle || []).push({});
            }
        } catch (e) {}
    }, []);
    return /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
        style: {
            textAlign: align
        },
        children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("ins", {
            ref: ref,
            className: "adsbygoogle",
            style: {
                display: "block"
            },
            "data-ad-client": client,
            "data-ad-slot": slot,
            "data-ad-format": "auto",
            "data-full-width-responsive": "true"
        })
    });
}


/***/ }),

/***/ 280:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "g": () => (/* binding */ AD_CLIENT),
/* harmony export */   "x": () => (/* binding */ AD_SLOTS)
/* harmony export */ });
// config/adSlots.js
// AdSense 광고 단위를 한 곳에서 관리하기 위한 설정 파일
// 승인 전이면 slot ID는 빈 문자열("")로 두고, 승인 후 실제 ID만 넣으면 됨.
const AD_CLIENT = "ca-pub-1869932115288976"; // 너 계정 ID
const AD_SLOTS = {
    inArticle1: "",
    inArticle2: "",
    responsiveTop: "",
    responsiveBottom: "",
    sidebar: ""
};


/***/ }),

/***/ 1663:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "JsonLd": () => (/* binding */ JsonLd),
/* harmony export */   "default": () => (/* binding */ PostPage),
/* harmony export */   "getStaticPaths": () => (/* binding */ getStaticPaths),
/* harmony export */   "getStaticProps": () => (/* binding */ getStaticProps)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(997);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _components_SeoHead__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(8814);
/* harmony import */ var _components_AdResponsive__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(1137);
/* harmony import */ var _components_AdInArticle__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(3248);
/* harmony import */ var _config_adSlots__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(280);
/* harmony import */ var _lib_posts__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(8904);
/* harmony import */ var html_react_parser__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(2905);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_lib_posts__WEBPACK_IMPORTED_MODULE_5__, html_react_parser__WEBPACK_IMPORTED_MODULE_6__]);
([_lib_posts__WEBPACK_IMPORTED_MODULE_5__, html_react_parser__WEBPACK_IMPORTED_MODULE_6__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);
// pages/posts/[slug].js







function JsonLd({ data  }) {
    return /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("script", {
        type: "application/ld+json",
        dangerouslySetInnerHTML: {
            __html: JSON.stringify(data)
        }
    });
}
function PostPage({ post  }) {
    const jsonld = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        datePublished: post.datePublished,
        dateModified: post.dateModified || post.datePublished,
        author: {
            "@type": "Organization",
            name: "FinMap"
        }
    };
    // 🔥 인-아티클 광고를 H2 기준으로 2번 삽입하는 로직
    let h2Index = 0;
    const contentWithInArticleAds = (0,html_react_parser__WEBPACK_IMPORTED_MODULE_6__["default"])(post.contentHtml, {
        replace (domNode) {
            // 태그 타입(h2)만 처리
            if (domNode.type === "tag" && domNode.name === "h2") {
                h2Index += 1;
                const children = (0,html_react_parser__WEBPACK_IMPORTED_MODULE_6__.domToReact)(domNode.children);
                // 2번째 h2 뒤에 인-아티클 광고 1 삽입
                if (h2Index === 2) {
                    return /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, {
                        children: [
                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("h2", {
                                children: children
                            }),
                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                                className: "my-6",
                                children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_components_AdInArticle__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .Z, {
                                    client: _config_adSlots__WEBPACK_IMPORTED_MODULE_4__/* .AD_CLIENT */ .g,
                                    slot: _config_adSlots__WEBPACK_IMPORTED_MODULE_4__/* .AD_SLOTS.inArticle1 */ .x.inArticle1
                                })
                            })
                        ]
                    });
                }
                // 4번째 h2 뒤에 인-아티클 광고 2 삽입
                if (h2Index === 4) {
                    return /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, {
                        children: [
                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("h2", {
                                children: children
                            }),
                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                                className: "my-6",
                                children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_components_AdInArticle__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .Z, {
                                    client: _config_adSlots__WEBPACK_IMPORTED_MODULE_4__/* .AD_CLIENT */ .g,
                                    slot: _config_adSlots__WEBPACK_IMPORTED_MODULE_4__/* .AD_SLOTS.inArticle2 */ .x.inArticle2
                                })
                            })
                        ]
                    });
                }
                // 나머지 h2는 그대로 렌더링
                return /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("h2", {
                    children: children
                });
            }
            // 나머지는 기본 동작 (그대로 렌더)
            return undefined;
        }
    });
    return /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, {
        children: [
            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_components_SeoHead__WEBPACK_IMPORTED_MODULE_1__/* ["default"] */ .Z, {
                title: post.title,
                desc: post.description,
                url: `/posts/${post.slug}`,
                image: post.cover
            }),
            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(JsonLd, {
                data: jsonld
            }),
            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("article", {
                className: "prose prose-slate lg:prose-lg max-w-none bg-white border rounded-2xl shadow-card p-6",
                children: [
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("h1", {
                        children: post.title
                    }),
                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("p", {
                        className: "text-sm text-slate-500",
                        children: [
                            post.category,
                            " \xb7 ",
                            post.datePublished,
                            post.dateModified && post.dateModified !== post.datePublished ? ` · 수정: ${post.dateModified}` : ""
                        ]
                    }),
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                        className: "my-4",
                        children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_components_AdResponsive__WEBPACK_IMPORTED_MODULE_2__/* ["default"] */ .Z, {
                            client: _config_adSlots__WEBPACK_IMPORTED_MODULE_4__/* .AD_CLIENT */ .g,
                            slot: _config_adSlots__WEBPACK_IMPORTED_MODULE_4__/* .AD_SLOTS.responsiveTop */ .x.responsiveTop,
                            align: "center"
                        })
                    }),
                    post.cover && /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("img", {
                        src: post.cover,
                        alt: post.title,
                        className: "w-full h-auto rounded-xl mt-4 mb-6"
                    }),
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                        className: "post-body",
                        children: contentWithInArticleAds
                    }),
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                        className: "mt-8",
                        children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_components_AdResponsive__WEBPACK_IMPORTED_MODULE_2__/* ["default"] */ .Z, {
                            client: _config_adSlots__WEBPACK_IMPORTED_MODULE_4__/* .AD_CLIENT */ .g,
                            slot: _config_adSlots__WEBPACK_IMPORTED_MODULE_4__/* .AD_SLOTS.responsiveBottom */ .x.responsiveBottom,
                            align: "center"
                        })
                    })
                ]
            })
        ]
    });
}
async function getStaticPaths() {
    const posts = (0,_lib_posts__WEBPACK_IMPORTED_MODULE_5__/* .getAllPosts */ .Bd)(); // [{slug: '...'}]
    return {
        paths: posts.map((p)=>({
                params: {
                    slug: p.slug
                }
            })),
        fallback: false
    };
}
async function getStaticProps({ params  }) {
    const post = (0,_lib_posts__WEBPACK_IMPORTED_MODULE_5__/* .getPostBySlug */ .zQ)(params.slug);
    return {
        props: {
            post
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

/***/ 2905:
/***/ ((module) => {

module.exports = import("html-react-parser");;

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
var __webpack_exports__ = __webpack_require__.X(0, [814,904], () => (__webpack_exec__(1663)));
module.exports = __webpack_exports__;

})();