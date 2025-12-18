const mysql = require('mysql2/promise');

const dbConfig  = {
    host: 'dokospi2025.cafe24app.com',
    user: 'ljw0209',
    password: 'fortnight0209!',
    database: 'ljw0209',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000,      // 단위: ms (10초)    
    // debug는 mysql2에서는 없어졌음. 필요 시 별도 로깅 추가
};

const pool = mysql.createPool(dbConfig);


// Next API에서 쓰기 좋은 헬퍼 함수
async function getDB() {
  // 필요하면 여기서 health check, 로깅도 가능
  return pool;
}

// 앱 시작 시 1회만 연결 체크 (선택 사항)
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('finmap DB connected!!!');
    conn.release();
  } catch (err) {
    console.error('DB connection failed:', err.message);
  }
})();

// ⭐ getDB와 pool 둘 다 export
module.exports = {
  getDB,
  pool,
};
