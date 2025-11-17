(() => {
var exports = {};
exports.id = 888;
exports.ids = [888];
exports.modules = {

/***/ 1412:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ _app)
});

// EXTERNAL MODULE: external "react/jsx-runtime"
var jsx_runtime_ = __webpack_require__(997);
// EXTERNAL MODULE: external "react"
var external_react_ = __webpack_require__(6689);
;// CONCATENATED MODULE: external "next/router"
const router_namespaceObject = require("next/router");
// EXTERNAL MODULE: ./node_modules/next/script.js
var script = __webpack_require__(4298);
var script_default = /*#__PURE__*/__webpack_require__.n(script);
// EXTERNAL MODULE: ./node_modules/next/link.js
var next_link = __webpack_require__(1664);
var link_default = /*#__PURE__*/__webpack_require__.n(next_link);
;// CONCATENATED MODULE: ./_components/Header.js
// _components/Header.js



const navItems = [
    {
        href: "/",
        label: "홈"
    },
    {
        href: "/category/economics",
        label: "경제기초"
    },
    {
        href: "/category/investing",
        label: "투자개념"
    },
    {
        href: "/category/tax",
        label: "세금"
    },
    {
        href: "/tools/compound-interest",
        label: "복리 계산기"
    }, 
];
function Header() {
    const router = (0,router_namespaceObject.useRouter)();
    return /*#__PURE__*/ jsx_runtime_.jsx("header", {
        className: "sticky top-0 z-50 backdrop-blur bg-white/80 border-b border-slate-100",
        children: /*#__PURE__*/ (0,jsx_runtime_.jsxs)("nav", {
            className: "container flex items-center gap-4 py-3",
            children: [
                /*#__PURE__*/ jsx_runtime_.jsx((link_default()), {
                    href: "/",
                    passHref: true,
                    legacyBehavior: true,
                    children: /*#__PURE__*/ (0,jsx_runtime_.jsxs)("a", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ jsx_runtime_.jsx("img", {
                                src: "/logo-finmap.svg",
                                alt: "FinMap 로고",
                                className: "h-8 w-auto"
                            }),
                            /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                                className: "leading-tight",
                                children: [
                                    /*#__PURE__*/ jsx_runtime_.jsx("span", {
                                        className: "block text-base font-semibold text-slate-900",
                                        children: "FinMap"
                                    }),
                                    /*#__PURE__*/ jsx_runtime_.jsx("span", {
                                        className: "block text-[11px] text-slate-500 whitespace-nowrap",
                                        children: "금융 기초 \xb7 투자계획 지도"
                                    })
                                ]
                            })
                        ]
                    })
                }),
                /*#__PURE__*/ jsx_runtime_.jsx("div", {
                    className: "flex items-center gap-2 ml-6 text-sm",
                    children: navItems.map((item)=>{
                        const active = item.href === "/" ? router.pathname === "/" : router.pathname.startsWith(item.href);
                        return /*#__PURE__*/ jsx_runtime_.jsx((link_default()), {
                            href: item.href,
                            passHref: true,
                            legacyBehavior: true,
                            children: /*#__PURE__*/ jsx_runtime_.jsx("a", {
                                className: "px-3 py-1 rounded-full transition-colors whitespace-nowrap " + (active ? "bg-blue-50 text-blue-700 font-medium" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"),
                                children: item.label
                            })
                        }, item.href);
                    })
                }),
                /*#__PURE__*/ jsx_runtime_.jsx("span", {
                    className: "ml-auto text-xs md:text-sm text-slate-500 whitespace-nowrap",
                    children: "finmaphub.com"
                })
            ]
        })
    });
}

;// CONCATENATED MODULE: ./_components/Footer.js
// _components/Footer.js


function Footer() {
    return /*#__PURE__*/ jsx_runtime_.jsx("footer", {
        className: "border-t mt-10 bg-white",
        children: /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
            className: "max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-600",
            children: [
                /*#__PURE__*/ jsx_runtime_.jsx((link_default()), {
                    href: "/about",
                    passHref: true,
                    children: /*#__PURE__*/ jsx_runtime_.jsx("a", {
                        className: "hover:text-slate-800",
                        children: "About"
                    })
                }),
                /*#__PURE__*/ jsx_runtime_.jsx((link_default()), {
                    href: "/contact",
                    passHref: true,
                    children: /*#__PURE__*/ jsx_runtime_.jsx("a", {
                        className: "hover:text-slate-800",
                        children: "Contact"
                    })
                }),
                /*#__PURE__*/ jsx_runtime_.jsx((link_default()), {
                    href: "/privacy",
                    passHref: true,
                    children: /*#__PURE__*/ jsx_runtime_.jsx("a", {
                        className: "hover:text-slate-800",
                        children: "Privacy"
                    })
                }),
                /*#__PURE__*/ jsx_runtime_.jsx((link_default()), {
                    href: "/terms",
                    passHref: true,
                    children: /*#__PURE__*/ jsx_runtime_.jsx("a", {
                        className: "hover:text-slate-800",
                        children: "TOS"
                    })
                }),
                /*#__PURE__*/ jsx_runtime_.jsx((link_default()), {
                    href: "/disclaimer",
                    passHref: true,
                    children: /*#__PURE__*/ jsx_runtime_.jsx("a", {
                        className: "hover:text-slate-800",
                        children: "면책"
                    })
                }),
                /*#__PURE__*/ (0,jsx_runtime_.jsxs)("span", {
                    className: "ml-auto text-[11px] sm:text-sm text-slate-500",
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
// _components/Layout.js



function Layout({ children  }) {
    return /*#__PURE__*/ (0,jsx_runtime_.jsxs)(jsx_runtime_.Fragment, {
        children: [
            /*#__PURE__*/ jsx_runtime_.jsx(Header, {}),
            /*#__PURE__*/ jsx_runtime_.jsx("main", {
                className: "container max-w-5xl w-full px-4 py-6 mx-auto fm-mobile-full",
                children: children
            }),
            /*#__PURE__*/ jsx_runtime_.jsx(Footer, {})
        ]
    });
}

;// CONCATENATED MODULE: ./pages/_app.js
// pages/_app.js




 // ✅ Layout 추가

function MyApp({ Component , pageProps  }) {
    const router = (0,router_namespaceObject.useRouter)();
    const GA_ID = "G-HYS82YP0CH";
    const ADS_CLIENT = "ca-pub-1869932115288976"; // 새 계정의 클라이언트 ID
    // 라우팅될 때마다 page_view 전송
    (0,external_react_.useEffect)(()=>{
        if (!GA_ID) return;
        const handleRouteChange = (url)=>{
            window.gtag && window.gtag("config", GA_ID, {
                page_path: url
            });
        };
        router.events.on("routeChangeComplete", handleRouteChange);
        return ()=>router.events.off("routeChangeComplete", handleRouteChange);
    }, [
        router.events,
        GA_ID
    ]);
    return /*#__PURE__*/ (0,jsx_runtime_.jsxs)(jsx_runtime_.Fragment, {
        children: [
            GA_ID && /*#__PURE__*/ (0,jsx_runtime_.jsxs)(jsx_runtime_.Fragment, {
                children: [
                    /*#__PURE__*/ jsx_runtime_.jsx((script_default()), {
                        src: `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`,
                        strategy: "afterInteractive"
                    }),
                    /*#__PURE__*/ jsx_runtime_.jsx((script_default()), {
                        id: "gtag-init",
                        strategy: "afterInteractive",
                        children: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}', { send_page_view: true });
            `
                    })
                ]
            }),
            /*#__PURE__*/ jsx_runtime_.jsx((script_default()), {
                id: "adsbygoogle-loader",
                strategy: "afterInteractive",
                src: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADS_CLIENT}`,
                crossOrigin: "anonymous"
            }),
            /*#__PURE__*/ jsx_runtime_.jsx((script_default()), {
                id: "adsbygoogle-auto",
                strategy: "afterInteractive",
                children: `(adsbygoogle = window.adsbygoogle || []).push({});`
            }),
            /*#__PURE__*/ jsx_runtime_.jsx(Layout, {
                children: /*#__PURE__*/ jsx_runtime_.jsx(Component, {
                    ...pageProps
                })
            })
        ]
    });
}
/* harmony default export */ const _app = (MyApp);


/***/ }),

/***/ 4298:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(699)


/***/ }),

/***/ 3280:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/app-router-context.js");

/***/ }),

/***/ 2796:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/head-manager-context.js");

/***/ }),

/***/ 4014:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/i18n/normalize-locale-path.js");

/***/ }),

/***/ 8524:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/is-plain-object.js");

/***/ }),

/***/ 8020:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/mitt.js");

/***/ }),

/***/ 4406:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/page-path/denormalize-page-path.js");

/***/ }),

/***/ 4964:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router-context.js");

/***/ }),

/***/ 1751:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/add-path-prefix.js");

/***/ }),

/***/ 6220:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/compare-states.js");

/***/ }),

/***/ 299:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/format-next-pathname-info.js");

/***/ }),

/***/ 3938:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/format-url.js");

/***/ }),

/***/ 9565:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/get-asset-path-from-route.js");

/***/ }),

/***/ 5789:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/get-next-pathname-info.js");

/***/ }),

/***/ 1897:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/is-bot.js");

/***/ }),

/***/ 1428:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/is-dynamic.js");

/***/ }),

/***/ 8854:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/parse-path.js");

/***/ }),

/***/ 1292:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/parse-relative-url.js");

/***/ }),

/***/ 4567:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/path-has-prefix.js");

/***/ }),

/***/ 979:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/querystring.js");

/***/ }),

/***/ 3297:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/remove-trailing-slash.js");

/***/ }),

/***/ 6052:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/resolve-rewrites.js");

/***/ }),

/***/ 4226:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/route-matcher.js");

/***/ }),

/***/ 5052:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/route-regex.js");

/***/ }),

/***/ 9232:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/utils.js");

/***/ }),

/***/ 6689:
/***/ ((module) => {

"use strict";
module.exports = require("react");

/***/ }),

/***/ 997:
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-runtime");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, [676,664], () => (__webpack_exec__(1412)));
module.exports = __webpack_exports__;

})();