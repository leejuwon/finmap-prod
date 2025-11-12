"use strict";
(() => {
var exports = {};
exports.id = 922;
exports.ids = [922];
exports.modules = {

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
/* harmony import */ var _lib_posts__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(8904);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_lib_posts__WEBPACK_IMPORTED_MODULE_2__]);
_lib_posts__WEBPACK_IMPORTED_MODULE_2__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];
// pages/posts/[slug].js


// import JsonLd from '../../_components/JsonLd';
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
                className: "prose prose-slate lg:prose-lg bg-white border rounded-2xl shadow-card p-6",
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
                        dangerouslySetInnerHTML: {
                            __html: post.contentHtml
                        }
                    })
                ]
            })
        ]
    });
}
async function getStaticPaths() {
    const posts = (0,_lib_posts__WEBPACK_IMPORTED_MODULE_2__/* .getAllPosts */ .Bd)(); // [{slug: '...'}]
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
    const post = (0,_lib_posts__WEBPACK_IMPORTED_MODULE_2__/* .getPostBySlug */ .zQ)(params.slug);
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
var __webpack_exports__ = __webpack_require__.X(0, [814,904], () => (__webpack_exec__(1663)));
module.exports = __webpack_exports__;

})();