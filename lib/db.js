// lib/db.js
const mysql = require("mysql2/promise");

const dbConfig = {
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "finmap_app",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "ljw0209", // ✅ 지금 복원된 DB가 ljw0209라서 기본값을 이렇게 둠
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_POOL_LIMIT || 10),
  queueLimit: 0,
  connectTimeout: Number(process.env.DB_CONNECT_TIMEOUT || 10000),
};

const pool = mysql.createPool(dbConfig);

// Next API에서 쓰기 좋은 헬퍼 함수
async function getDB() {
  return pool;
}

// 앱 시작 시 1회만 연결 체크 (선택)
// 빌드/서버리스 환경에서 원치 않으면 DB_BOOT_CHECK=false 로 끌 수 있음
(async () => {
  try {
    if (process.env.DB_BOOT_CHECK === "false") return;
    const conn = await pool.getConnection();
    console.log("finmap DB connected!!!", {
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user,
    });
    conn.release();
  } catch (err) {
    console.error("DB connection failed:", err.message);
  }
})();

module.exports = {
  getDB,
  pool,
};
