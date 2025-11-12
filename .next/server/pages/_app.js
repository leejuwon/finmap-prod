(() => {
var exports = {};
exports.id = 888;
exports.ids = [888];
exports.modules = {

/***/ 2226:
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
;// CONCATENATED MODULE: ./pages/_app.js
// pages/_app.js





function MyApp({ Component , pageProps  }) {
    const router = (0,router_namespaceObject.useRouter)();
    const GA_ID = "G-HYS82YP0CH";
    // 라우팅될 때마다 page_view 전송
    (0,external_react_.useEffect)(()=>{
        if (!GA_ID) return;
        const handleRouteChange = (url)=>{
            // gtag.js 로드 후 전송
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
            /*#__PURE__*/ jsx_runtime_.jsx(Component, {
                ...pageProps
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

/***/ 2796:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/head-manager-context.js");

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
var __webpack_exports__ = __webpack_require__.X(0, [699], () => (__webpack_exec__(2226)));
module.exports = __webpack_exports__;

})();