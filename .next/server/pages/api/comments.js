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

/***/ 7618:
/***/ ((module) => {

module.exports = import("bcryptjs");;

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
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ handler)
/* harmony export */ });
/* harmony import */ var _lib_db__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4808);
/* harmony import */ var _lib_db__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_lib_db__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(7618);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([bcryptjs__WEBPACK_IMPORTED_MODULE_1__]);
bcryptjs__WEBPACK_IMPORTED_MODULE_1__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];
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
        // 📌 댓글 목록 조회
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
        // 📌 댓글 등록 (비밀번호 해시 저장)
        if (method === "POST") {
            const { nickname , password , content  } = req.body || {};
            if (!nickname || !password || !content) {
                return res.status(400).json({
                    error: "invalid body"
                });
            }
            // 🔐 비밀번호 해시
            const hash = await bcryptjs__WEBPACK_IMPORTED_MODULE_1__["default"].hash(password, 10);
            await db.query(`
        INSERT INTO blog_post_comments (slug, nickname, password, content)
        VALUES (?, ?, ?, ?)
        `, [
                slug,
                nickname,
                hash,
                content
            ]);
            return res.status(201).json({
                ok: true
            });
        }
        // 📌 댓글 수정 (PUT) – 비밀번호 검증 후 내용 수정
        if (method === "PUT") {
            const { id , password: password1 , content: content1  } = req.body || {};
            if (!id || !password1 || !content1) {
                return res.status(400).json({
                    error: "id, password, content required"
                });
            }
            // 저장된 해시 비밀번호 조회
            const [rows1] = await db.query(`
        SELECT password
        FROM blog_post_comments
        WHERE id = ? AND slug = ?
        `, [
                id,
                slug
            ]);
            if (rows1.length === 0) {
                return res.status(404).json({
                    error: "comment not found"
                });
            }
            const savedHash = rows1[0].password;
            // 🔐 비밀번호 비교 (입력값 vs 해시)
            const match = await bcryptjs__WEBPACK_IMPORTED_MODULE_1__["default"].compare(password1, savedHash);
            if (!match) {
                return res.status(403).json({
                    error: "invalid password"
                });
            }
            // 내용만 업데이트 (updated_at 컬럼 있으면 여기서 같이 업데이트 가능)
            await db.query(`
        UPDATE blog_post_comments
        SET content = ?
        WHERE id = ?
        `, [
                content1,
                id
            ]);
            return res.status(200).json({
                ok: true
            });
        }
        // 📌 댓글 삭제 (DELETE) – 비밀번호 검증 후 삭제
        if (method === "DELETE") {
            const { id: id1 , password: password2  } = req.body || {};
            if (!id1 || !password2) {
                return res.status(400).json({
                    error: "id, password required"
                });
            }
            const [rows2] = await db.query(`
        SELECT password
        FROM blog_post_comments
        WHERE id = ? AND slug = ?
        `, [
                id1,
                slug
            ]);
            if (rows2.length === 0) {
                return res.status(404).json({
                    error: "comment not found"
                });
            }
            const savedHash1 = rows2[0].password;
            // 🔐 비밀번호 비교
            const match1 = await bcryptjs__WEBPACK_IMPORTED_MODULE_1__["default"].compare(password2, savedHash1);
            if (!match1) {
                return res.status(403).json({
                    error: "invalid password"
                });
            }
            await db.query(`
        DELETE FROM blog_post_comments
        WHERE id = ?
        `, [
                id1
            ]);
            return res.status(200).json({
                ok: true
            });
        }
        // 그 외 메서드는 허용 안 함
        res.setHeader("Allow", [
            "GET",
            "POST",
            "PUT",
            "DELETE"
        ]);
        return res.status(405).end(`Method ${method} Not Allowed`);
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: "server error"
        });
    }
}

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

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