"use strict";
exports.id = 904;
exports.ids = [904];
exports.modules = {

/***/ 8904:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Bd": () => (/* binding */ getAllPosts),
/* harmony export */   "zQ": () => (/* binding */ getPostBySlug)
/* harmony export */ });
/* unused harmony exports getAllSlugs, getPostsByCategory */
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(7147);
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(1017);
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var gray_matter__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(8076);
/* harmony import */ var gray_matter__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(gray_matter__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var marked__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(8974);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([marked__WEBPACK_IMPORTED_MODULE_3__]);
marked__WEBPACK_IMPORTED_MODULE_3__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];




const postsDir = path__WEBPACK_IMPORTED_MODULE_1___default().join(process.cwd(), "content", "posts");
function getAllSlugs() {
    if (!fs__WEBPACK_IMPORTED_MODULE_0___default().existsSync(postsDir)) return [];
    return fs__WEBPACK_IMPORTED_MODULE_0___default().readdirSync(postsDir).filter((f)=>f.endsWith(".md")).map((f)=>f.replace(/\.md$/, ""));
}
function getPostBySlug(slug) {
    const fullPath = path__WEBPACK_IMPORTED_MODULE_1___default().join(postsDir, `${slug}.md`);
    const file = fs__WEBPACK_IMPORTED_MODULE_0___default().readFileSync(fullPath, "utf-8");
    const { data , content  } = gray_matter__WEBPACK_IMPORTED_MODULE_2___default()(file);
    const html = marked__WEBPACK_IMPORTED_MODULE_3__.marked.parse(content || "");
    return {
        slug,
        ...data,
        contentHtml: html
    };
}
function getAllPosts() {
    const slugs = getAllSlugs();
    const posts = slugs.map((s)=>getPostBySlug(s));
    // 최신순 정렬 (datePublished 기준)
    return posts.sort((a, b)=>{
        return new Date(b.datePublished || 0) - new Date(a.datePublished || 0);
    });
}
function getPostsByCategory(category) {
    return getAllPosts().filter((p)=>(p.category || "").toLowerCase() === category.toLowerCase());
}

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ })

};
;