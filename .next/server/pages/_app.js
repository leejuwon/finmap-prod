(() => {
var exports = {};
exports.id = 888;
exports.ids = [888];
exports.modules = {

/***/ 2253:
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
// EXTERNAL MODULE: external "next/router"
var router_ = __webpack_require__(1853);
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
        key: "home",
        href: "/",
        labelKo: "홈",
        labelEn: "Home"
    },
    {
        key: "economics",
        href: "/category/economics",
        labelKo: "경제기초",
        labelEn: "Economics"
    },
    {
        key: "investing",
        href: "/category/investing",
        labelKo: "재테크",
        labelEn: "Investing"
    },
    {
        key: "tax",
        href: "/category/tax",
        labelKo: "세금",
        labelEn: "Tax"
    },
    {
        key: "compound",
        href: "/tools/compound-interest",
        labelKo: "복리 계산기",
        labelEn: "Compound Calculator"
    },
    {
        key: "goal",
        href: "/tools/goal-simulator",
        labelKo: "목표자산 시뮬레이터",
        labelEn: "Goal Simulator"
    }, 
];
function Header() {
    const router = (0,router_.useRouter)();
    const { 0: lang , 1: setLang  } = (0,external_react_.useState)("ko"); // 'ko' | 'en'
    // 브라우저에서 저장된 언어 불러오기
    (0,external_react_.useEffect)(()=>{
        if (true) return;
        const saved = window.localStorage.getItem("fm_lang");
        if (saved === "ko" || saved === "en") {
            setLang(saved);
        }
    }, []);
    const toggleLang = ()=>{
        const next = lang === "ko" ? "en" : "ko";
        setLang(next);
        if (false) {}
    };
    const isKo = lang === "ko";
    return /*#__PURE__*/ jsx_runtime_.jsx("header", {
        className: "sticky top-0 z-50 backdrop-blur bg-white/80 border-b border-slate-100",
        children: /*#__PURE__*/ jsx_runtime_.jsx("nav", {
            className: "w-full px-3 sm:px-4",
            children: /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                className: "w-full max-w-5xl lg:max-w-6xl mx-auto flex items-center gap-3 py-2 sm:py-3",
                children: [
                    /*#__PURE__*/ jsx_runtime_.jsx((link_default()), {
                        href: "/",
                        passHref: true,
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
                                            className: "block text-sm sm:text-base font-semibold text-slate-900",
                                            children: "FinMap"
                                        }),
                                        /*#__PURE__*/ jsx_runtime_.jsx("span", {
                                            className: "hidden sm:block text-[11px] text-slate-500",
                                            children: isKo ? "금융 기초 \xb7 투자계획 지도" : "Personal finance & investing map"
                                        })
                                    ]
                                })
                            ]
                        })
                    }),
                    /*#__PURE__*/ jsx_runtime_.jsx("div", {
                        className: "header-nav flex items-center gap-1 sm:gap-2 ml-2 sm:ml-6 text-[10px] sm:text-sm",
                        children: navItems.map((item)=>{
                            const active = item.href === "/" ? router.pathname === "/" : router.pathname.startsWith(item.href);
                            const label = isKo ? item.labelKo : item.labelEn;
                            return /*#__PURE__*/ jsx_runtime_.jsx((link_default()), {
                                href: item.href,
                                passHref: true,
                                children: /*#__PURE__*/ jsx_runtime_.jsx("a", {
                                    className: "px-2 sm:px-3 py-1 rounded-full transition-colors " + (active ? "bg-blue-50 text-blue-700 font-medium" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"),
                                    children: label
                                })
                            }, item.key);
                        })
                    }),
                    /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                        className: "ml-auto flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ jsx_runtime_.jsx("span", {
                                className: "header-domain text-[10px] sm:text-xs md:text-sm text-slate-500",
                                children: "finmaphub.com"
                            }),
                            /*#__PURE__*/ jsx_runtime_.jsx("button", {
                                type: "button",
                                onClick: toggleLang,
                                className: "btn-secondary !px-2 !py-1 text-[10px] sm:text-xs",
                                children: isKo ? "EN" : "KO"
                            })
                        ]
                    })
                ]
            })
        })
    });
}

;// CONCATENATED MODULE: ./_components/Footer.js
// _components/Footer.js


function Footer() {
    return /*#__PURE__*/ jsx_runtime_.jsx("footer", {
        className: "border-t mt-10 bg-white",
        children: /*#__PURE__*/ jsx_runtime_.jsx("div", {
            className: "w-full px-4",
            children: /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                className: "w-full max-w-5xl lg:max-w-6xl mx-auto flex flex-wrap gap-4 items-center py-4 text-slate-600",
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
                className: "w-full px-4 py-6",
                children: /*#__PURE__*/ jsx_runtime_.jsx("div", {
                    className: "w-full max-w-5xl lg:max-w-6xl mx-auto",
                    children: children
                })
            }),
            /*#__PURE__*/ jsx_runtime_.jsx(Footer, {})
        ]
    });
}

;// CONCATENATED MODULE: ./pages/_app.js
// pages/_app.js




 // ✅ Layout 추가

function MyApp({ Component , pageProps  }) {
    const router = (0,router_.useRouter)();
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

/***/ 1853:
/***/ ((module) => {

"use strict";
module.exports = require("next/router");

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
var __webpack_exports__ = __webpack_require__.X(0, [676,664], () => (__webpack_exec__(2253)));
module.exports = __webpack_exports__;

})();