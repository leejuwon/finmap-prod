// utils.js 또는 marketUtils.js

const { dbQuery } = require('./utils'); // 또는 필요한 모듈 경로

/**
 * 해당 날짜가 한국 증시 휴장일인지 여부를 반환
 * @param {string} dateYMD YYYY-MM-DD 형식의 날짜
 * @param {object} db DB 커넥션(pool)
 * @returns {Promise<boolean>} true: 휴장일, false: 개장일
 */
async function isKoreaMarketHoliday(dateYMD, db) {
  const result = await dbQuery(db, `
    SELECT COUNT(*) AS CNT
    FROM MARKET_HOLYDAY_INFO
    WHERE HOLYDAY_COUNTRY = 'KR'
      AND HOLYDAY_DATE = ?
  `, [dateYMD]);

  return (result[0]?.CNT || 0) > 0;
}

module.exports = { isKoreaMarketHoliday };
