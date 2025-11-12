"use strict";
exports.id = 746;
exports.ids = [746];
exports.modules = {

/***/ 2746:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// lib/md.js

const fs = __webpack_require__(7147);
const path = __webpack_require__(1017);
const matter = __webpack_require__(8076);
const { marked  } = __webpack_require__(9880);
const CONTENT_DIR = path.join(process.cwd(), "content");
function listPosts(lang = "ko") {
    const dir = path.join(CONTENT_DIR, lang);
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir).filter((f)=>f.endsWith(".md")).map((filename)=>{
        const slug = filename.replace(/\.md$/, "");
        const fullPath = path.join(dir, filename);
        const file = fs.readFileSync(fullPath, "utf-8");
        const { data  } = matter(file);
        return {
            slug,
            ...data
        };
    }).sort((a, b)=>(b.date || "").localeCompare(a.date || ""));
}
function getPost(lang = "ko", slug) {
    const fullPath = path.join(CONTENT_DIR, lang, `${slug}.md`);
    const raw = fs.readFileSync(fullPath, "utf-8");
    const { data , content  } = matter(raw);
    const html = marked.parse(content);
    return {
        front: data,
        html
    };
}
module.exports = {
    listPosts,
    getPost
};


/***/ })

};
;