"use strict";
(() => {
var exports = {};
exports.id = 265;
exports.ids = [265];
exports.modules = {

/***/ 2418:
/***/ ((module) => {

module.exports = require("mysql2/promise");

/***/ }),

/***/ 4808:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


const mysql = __webpack_require__(2418);
const dbConfig = {
    host: "dokospi2025.cafe24app.com",
    user: "ljw0209",
    password: "wndnjs2!",
    database: "ljw0209",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000
};
const pool = mysql.createPool(dbConfig);
// Next API에서 쓰기 좋은 헬퍼 함수
async function getDB() {
    // 필요하면 여기서 health check, 로깅도 가능
    return pool;
}
// 앱 시작 시 1회만 연결 체크 (선택 사항)
(async ()=>{
    try {
        const conn = await pool.getConnection();
        console.log("finmap DB connected!!!");
        conn.release();
    } catch (err) {
        console.error("DB connection failed:", err.message);
    }
})();
// ⭐ getDB와 pool 둘 다 export
module.exports = {
    getDB,
    pool
};


/***/ }),

/***/ 7246:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ handler)
/* harmony export */ });
/* harmony import */ var _lib_db__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4808);
/* harmony import */ var _lib_db__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_lib_db__WEBPACK_IMPORTED_MODULE_0__);
// pages/api/comments.js

async function handler(req, res) {
    const { method  } = req;
    const { slug  } = req.query;
    if (!slug) {
        return res.status(400).json({
            error: "slug is required"
        });
    }
    const db = await (0,_lib_db__WEBPACK_IMPORTED_MODULE_0__.getDB)();
    try {
        if (method === "GET") {
            const [rows] = await db.query(`
        SELECT id, nickname, content, created_at
        FROM blog_post_comments
        WHERE slug = ?
        ORDER BY id DESC
        `, [
                slug
            ]);
            return res.status(200).json({
                comments: rows
            });
        }
        if (method === "POST") {
            const { nickname , password , content  } = req.body || {};
            if (!nickname || !password || !content) {
                return res.status(400).json({
                    error: "invalid body"
                });
            }
            await db.query(`
        INSERT INTO blog_post_comments (slug, nickname, password, content)
        VALUES (?, ?, ?, ?)
        `, [
                slug,
                nickname,
                password,
                content
            ]);
            return res.status(201).json({
                ok: true
            });
        }
        // 삭제/수정 API는 나중에 확장
        return res.status(405).end();
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: "server error"
        });
    }
}


/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__(7246));
module.exports = __webpack_exports__;

})();