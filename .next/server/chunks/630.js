"use strict";
exports.id = 630;
exports.ids = [630];
exports.modules = {

/***/ 6915:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "W": () => (/* binding */ setLang),
/* harmony export */   "X": () => (/* binding */ getInitialLang)
/* harmony export */ });
// lib/lang.js
// 초깃값: 쿠키(fm_lang) → 브라우저 언어 → ko
function getInitialLang() {
    if (true) return "ko";
    const match = document.cookie.match(/(?:^|;\s*)fm_lang=(ko|en)/);
    if (match && match[1]) return match[1];
    const nav = (navigator.language || "ko").toLowerCase();
    if (nav.startsWith("en")) return "en";
    return "ko";
}
// 언어 설정 + 이벤트 브로드캐스트
function setLang(lang) {
    if (true) return;
    const safe = lang === "en" ? "en" : "ko";
    // 1년짜리 쿠키
    document.cookie = `fm_lang=${safe}; path=/; max-age=31536000`;
    // 전역 커스텀 이벤트 (계산기 등에서 듣기)
    window.dispatchEvent(new CustomEvent("fm_lang_change", {
        detail: safe
    }));
}


/***/ }),

/***/ 8904:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Bd": () => (/* binding */ getAllPosts),
/* harmony export */   "zC": () => (/* binding */ getAllPostsAllLangs),
/* harmony export */   "zQ": () => (/* binding */ getPostBySlug)
/* harmony export */ });
/* unused harmony exports getAllSlugs, getPostsByCategory, getAllPostsStrict */
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




/* =========================================================
   0. 루트 디렉터리: content/posts
   - 구조: content/posts/[category]/[lang]/[slug].md
========================================================= */ const postsRootDir = path__WEBPACK_IMPORTED_MODULE_1___default().join(process.cwd(), "content", "posts");
/* 공통: 디렉터리 재귀 탐색 */ function walkDir(dir) {
    if (!fs__WEBPACK_IMPORTED_MODULE_0___default().existsSync(dir)) return [];
    const entries = fs__WEBPACK_IMPORTED_MODULE_0___default().readdirSync(dir, {
        withFileTypes: true
    });
    const files = [];
    for (const entry of entries){
        const fullPath = path__WEBPACK_IMPORTED_MODULE_1___default().join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...walkDir(fullPath));
        } else {
            files.push(fullPath);
        }
    }
    return files;
}
// 언어별 md 파일 목록
// - 카테고리 이름은 상관없이,
//   예) content/posts/(카테고리)/[lang]/*.md 형태의 파일을 전부 가져옴
//========================================================= 
function getPostFilesByLang(lang = "ko") {
    if (!fs__WEBPACK_IMPORTED_MODULE_0___default().existsSync(postsRootDir)) return [];
    const categoryDirs = fs__WEBPACK_IMPORTED_MODULE_0___default().readdirSync(postsRootDir, {
        withFileTypes: true
    }).filter((d)=>d.isDirectory()).map((d)=>d.name); // economics, personalFinance ...
    let files = [];
    for (const category of categoryDirs){
        const langDir = path__WEBPACK_IMPORTED_MODULE_1___default().join(postsRootDir, category, lang);
        if (!fs__WEBPACK_IMPORTED_MODULE_0___default().existsSync(langDir)) continue;
        files.push(...walkDir(langDir));
    }
    return files.filter((f)=>f.endsWith(".md"));
}
/* 커버 URL 정규화 (원본 그대로 유지) */ function normalizeCover(rawCover) {
    if (!rawCover) return null;
    let c = String(rawCover).trim();
    if (!c) return null;
    if (c.startsWith("http://") || c.startsWith("https://")) return c;
    if (c.startsWith("/public/")) c = c.replace(/^\/public/, "");
    if (!c.startsWith("/")) c = "/" + c;
    return c;
}
/* =========================================================
   1. 언어별 slugs 가져오기 (하위 폴더 포함)
========================================================= */ function getAllSlugs(lang = "ko") {
    const files = getPostFilesByLang(lang);
    return files.map((full)=>path.basename(full).replace(/\.md$/, ""));
}
/* =========================================================
   2. 언어별 슬러그에 해당하는 한 개 파일
      👉 영어(en)에서 파일이 없으면 ko로 fallback (원본 로직 유지)
========================================================= */ function getPostBySlug(lang = "ko", slug) {
    let effectiveLang = lang;
    // 1) 요청한 언어에서 slug 찾기
    let files = getPostFilesByLang(effectiveLang);
    let targetPath = files.find((full)=>{
        const base = path__WEBPACK_IMPORTED_MODULE_1___default().basename(full).replace(/\.md$/, "");
        return base === slug;
    });
    // 2) 못 찾았고, 언어가 ko가 아니면 ko에서 다시 시도
    if (!targetPath && effectiveLang !== "ko") {
        effectiveLang = "ko";
        files = getPostFilesByLang(effectiveLang);
        targetPath = files.find((full)=>{
            const base = path__WEBPACK_IMPORTED_MODULE_1___default().basename(full).replace(/\.md$/, "");
            return base === slug;
        });
    }
    if (!targetPath) {
        throw new Error(`Post not found (lang=${effectiveLang}, slug=${slug})`);
    }
    const file = fs__WEBPACK_IMPORTED_MODULE_0___default().readFileSync(targetPath, "utf-8");
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
/* =========================================================
   3. 언어별 전체 리스트
      👉 en에 글이 없으면 자동으로 ko 전체 fallback (원본 의미 유지)
========================================================= */ function getAllPosts(lang = "ko") {
    let effectiveLang = lang;
    let files = getPostFilesByLang(effectiveLang);
    // en 디렉토리에 글이 하나도 없으면 ko로 폴백
    if (!files.length && effectiveLang !== "ko") {
        effectiveLang = "ko";
        files = getPostFilesByLang(effectiveLang);
    }
    const posts = files.map((full)=>{
        const slug = path__WEBPACK_IMPORTED_MODULE_1___default().basename(full).replace(/\.md$/, "");
        return getPostBySlug(effectiveLang, slug);
    });
    return posts.sort((a, b)=>{
        return new Date(b.datePublished || 0) - new Date(a.datePublished || 0);
    });
}
/* =========================================================
   4. KO + EN 전부 한 번에 가져오는 헬퍼 (홈 화면용)
========================================================= */ function getAllPostsAllLangs() {
    const langs = [
        "ko",
        "en"
    ];
    const combined = [];
    langs.forEach((lang)=>{
        const files = getPostFilesByLang(lang);
        files.forEach((full)=>{
            const slug = path__WEBPACK_IMPORTED_MODULE_1___default().basename(full).replace(/\.md$/, "");
            // 여기서는 fallback 필요 없음 (파일은 이미 해당 lang 디렉터리에서 온 것)
            const post = getPostBySlug(lang, slug);
            combined.push(post);
        });
    });
    return combined.sort((a, b)=>{
        return new Date(b.datePublished || 0) - new Date(a.datePublished || 0);
    });
}
/* =========================================================
   5. 카테고리별 필터 (언어 포함)
   👉 여기서도 getAllPosts가 fallback 처리하므로 그대로 사용
========================================================= */ function getPostsByCategory(lang = "ko", category) {
    return getAllPosts(lang).filter((p)=>(p.category || "").toLowerCase() === category.toLowerCase());
}
/* =========================================================
   6. 언어별 디렉터리에서만 글을 읽어오는 버전 (fallback 없음)
========================================================= */ function getAllPostsStrict(lang = "ko") {
    const files = getPostFilesByLang(lang);
    if (!files.length) return [];
    return files.map((full)=>{
        const slug = path.basename(full).replace(/\.md$/, "");
        // 여기서는 lang 그대로 사용 (fallback X)
        return getPostBySlug(lang, slug);
    });
}

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ })

};
;