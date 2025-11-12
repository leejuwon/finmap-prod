"use strict";
(() => {
var exports = {};
exports.id = 888;
exports.ids = [888];
exports.modules = {

/***/ 2253:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ MyApp)
});

// EXTERNAL MODULE: external "react/jsx-runtime"
var jsx_runtime_ = __webpack_require__(997);
// EXTERNAL MODULE: ./node_modules/next/link.js
var next_link = __webpack_require__(1664);
var link_default = /*#__PURE__*/__webpack_require__.n(next_link);
;// CONCATENATED MODULE: ./_components/Header.js


function Header() {
    return /*#__PURE__*/ jsx_runtime_.jsx("header", {
        className: "sticky top-0 z-50 backdrop-blur bg-white/80 border-b",
        children: /*#__PURE__*/ (0,jsx_runtime_.jsxs)("nav", {
            className: "container flex gap-4 items-center py-3",
            children: [
                /*#__PURE__*/ jsx_runtime_.jsx((link_default()), {
                    href: "/",
                    className: "font-extrabold tracking-tight",
                    children: "FinMap"
                }),
                /*#__PURE__*/ jsx_runtime_.jsx((link_default()), {
                    href: "/category/economics",
                    className: "px-2 py-1 rounded-lg hover:bg-indigo-50",
                    children: "경제기초"
                }),
                /*#__PURE__*/ jsx_runtime_.jsx((link_default()), {
                    href: "/category/investing",
                    className: "px-2 py-1 rounded-lg hover:bg-indigo-50",
                    children: "투자개념"
                }),
                /*#__PURE__*/ jsx_runtime_.jsx((link_default()), {
                    href: "/category/tax",
                    className: "px-2 py-1 rounded-lg hover:bg-indigo-50",
                    children: "세금"
                }),
                /*#__PURE__*/ jsx_runtime_.jsx((link_default()), {
                    href: "/tools/compound-interest",
                    className: "px-2 py-1 rounded-lg hover:bg-indigo-50",
                    children: "복리 계산기"
                }),
                /*#__PURE__*/ jsx_runtime_.jsx("span", {
                    className: "ml-auto text-sm text-slate-500",
                    children: "finmaphub.com"
                })
            ]
        })
    });
}

;// CONCATENATED MODULE: ./_components/Footer.js


function Footer() {
    return /*#__PURE__*/ jsx_runtime_.jsx("footer", {
        className: "border-t mt-10 bg-white",
        children: /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
            className: "container flex flex-wrap gap-4 items-center py-4 text-slate-600",
            children: [
                /*#__PURE__*/ jsx_runtime_.jsx((link_default()), {
                    href: "/about",
                    children: "About"
                }),
                /*#__PURE__*/ jsx_runtime_.jsx((link_default()), {
                    href: "/contact",
                    children: "Contact"
                }),
                /*#__PURE__*/ jsx_runtime_.jsx((link_default()), {
                    href: "/privacy",
                    children: "Privacy"
                }),
                /*#__PURE__*/ jsx_runtime_.jsx((link_default()), {
                    href: "/terms",
                    children: "TOS"
                }),
                /*#__PURE__*/ jsx_runtime_.jsx((link_default()), {
                    href: "/disclaimer",
                    children: "면책"
                }),
                /*#__PURE__*/ (0,jsx_runtime_.jsxs)("span", {
                    className: "ml-auto text-sm",
                    children: [
                        "\xa9 ",
                        new Date().getFullYear(),
                        " FinMap"
                    ]
                })
            ]
        })
    });
}

;// CONCATENATED MODULE: ./_components/Layout.js



function Layout({ children  }) {
    return /*#__PURE__*/ (0,jsx_runtime_.jsxs)(jsx_runtime_.Fragment, {
        children: [
            /*#__PURE__*/ jsx_runtime_.jsx(Header, {}),
            /*#__PURE__*/ jsx_runtime_.jsx("main", {
                className: "container py-6",
                children: children
            }),
            /*#__PURE__*/ jsx_runtime_.jsx(Footer, {})
        ]
    });
}

;// CONCATENATED MODULE: ./pages/_app.js



function MyApp({ Component , pageProps  }) {
    return /*#__PURE__*/ jsx_runtime_.jsx(Layout, {
        children: /*#__PURE__*/ jsx_runtime_.jsx(Component, {
            ...pageProps
        })
    });
}


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

/***/ 6689:
/***/ ((module) => {

module.exports = require("react");

/***/ }),

/***/ 997:
/***/ ((module) => {

module.exports = require("react/jsx-runtime");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, [676,664], () => (__webpack_exec__(2253)));
module.exports = __webpack_exports__;

})();