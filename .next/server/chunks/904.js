"use strict";
exports.id = 904;
exports.ids = [904];
exports.modules = {

/***/ 8904:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Bd": () => (/* binding */ getAllPosts),
/* harmony export */   "m": () => (/* binding */ getAllSlugs),
/* harmony export */   "zQ": () => (/* binding */ getPostBySlug)
/* harmony export */ });
/* unused harmony export getPostsByCategory */
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(7147);
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(1017);
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var gray_matter__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(8076);
/* harmony import */ var gray_matter__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(gray_matter__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var marked__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(8974);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([marked__WEBPACK_IMPORTED_MODULE_3__]);
marked__WEBPACK_IMPORTED_MODULE_3__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];
// lib/posts.js




// 언어별 폴더
function getPostsDir(lang = "ko") {
    return path__WEBPACK_IMPORTED_MODULE_1___default().join(process.cwd(), "content", "posts", lang);
}
// 커버 URL 정규화
function normalizeCover(rawCover) {
    if (!rawCover) return null;
    let c = String(rawCover).trim();
    if (!c) return null;
    if (c.startsWith("http://") || c.startsWith("https://")) return c;
    if (c.startsWith("/public/")) c = c.replace(/^\/public/, "");
    if (!c.startsWith("/")) c = "/" + c;
    return c;
}
// 언어별 slugs 가져오기
function getAllSlugs(lang = "ko") {
    const dir = getPostsDir(lang);
    if (!fs__WEBPACK_IMPORTED_MODULE_0___default().existsSync(dir)) return [];
    return fs__WEBPACK_IMPORTED_MODULE_0___default().readdirSync(dir).filter((f)=>f.endsWith(".md")).map((f)=>f.replace(/\.md$/, ""));
}
// 언어별 슬러그에 해당하는 한 개 파일
// 👉 영어(en)에서 파일이 없으면 자동으로 ko에서 다시 찾도록 fallback
function getPostBySlug(lang = "ko", slug) {
    let effectiveLang = lang;
    let dir = getPostsDir(effectiveLang);
    let fullPath = path__WEBPACK_IMPORTED_MODULE_1___default().join(dir, `${slug}.md`);
    if (!fs__WEBPACK_IMPORTED_MODULE_0___default().existsSync(fullPath)) {
        // 영어/다른 언어에서 못 찾으면 한국어로 fallback
        if (effectiveLang !== "ko") {
            effectiveLang = "ko";
            dir = getPostsDir(effectiveLang);
            fullPath = path__WEBPACK_IMPORTED_MODULE_1___default().join(dir, `${slug}.md`);
        }
    }
    if (!fs__WEBPACK_IMPORTED_MODULE_0___default().existsSync(fullPath)) {
        throw new Error(`Post not found (lang=${effectiveLang}, slug=${slug})`);
    }
    const file = fs__WEBPACK_IMPORTED_MODULE_0___default().readFileSync(fullPath, "utf-8");
    const { data , content  } = gray_matter__WEBPACK_IMPORTED_MODULE_2___default()(file);
    const html = marked__WEBPACK_IMPORTED_MODULE_3__.marked.parse(content || "");
    const cover = normalizeCover(data.cover);
    return {
        lang: effectiveLang,
        slug,
        title: data.title || "",
        description: data.description || "",
        category: data.category || "",
        tags: data.tags || [],
        datePublished: data.datePublished || "",
        dateModified: data.dateModified || data.datePublished || "",
        cover,
        contentHtml: html
    };
}
// 언어별 전체 리스트
// 👉 en에 글이 없으면 자동으로 ko로 전체 fallback
function getAllPosts(lang = "ko") {
    let effectiveLang = lang;
    let slugs = getAllSlugs(effectiveLang);
    // en/posts 디렉토리 비었으면 자동 ko로 전환
    if (!slugs.length && effectiveLang !== "ko") {
        effectiveLang = "ko";
        slugs = getAllSlugs(effectiveLang);
    }
    const posts = slugs.map((s)=>getPostBySlug(effectiveLang, s));
    return posts.sort((a, b)=>{
        return new Date(b.datePublished || 0) - new Date(a.datePublished || 0);
    });
}
// 카테고리별 필터 (언어 포함)
// 👉 여기서도 getAllPosts가 이미 fallback을 처리하므로 그대로 사용
function getPostsByCategory(lang = "ko", category) {
    return getAllPosts(lang).filter((p)=>(p.category || "").toLowerCase() === category.toLowerCase());
}

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ })

};
;