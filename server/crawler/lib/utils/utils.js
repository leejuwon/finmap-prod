const moment = require('moment-timezone');
const dayjs = require('dayjs');

exports.getSeoulDate = (pDate) => {
  return (!pDate)
    ? moment().tz('Asia/Seoul').format("YYYY-MM-DD")
    : pDate;
};

exports.dbQuery = async (db, query, params = []) => {
  try {
    const [result] = await db.query(query, params);
    return result;
  } catch (error) {
    console.error("Database Error:", error);
    throw error;
  }
};


// ---- numeric safety helpers (Infinity/NaN 방지) ----
exports.isFiniteNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n);
};

// DB에 넣기 전 Infinity/NaN/문자열 'Infinity' 등을 NULL 로 정리
exports.sanitizeDbObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const out = Array.isArray(obj) ? [...obj] : { ...obj };

  for (const k of Object.keys(out)) {
    const v = out[k];

    // 숫자 타입인데 비정상
    if (typeof v === 'number' && !Number.isFinite(v)) {
      out[k] = null;
      continue;
    }

    // 문자열로 들어온 Infinity/NaN (toFixed 결과 포함) 방지
    if (typeof v === 'string') {
      const s = v.trim();
      if (s === 'Infinity' || s === '-Infinity' || s === 'NaN') {
        out[k] = null;
        continue;
      }
    }
  }

  return out;
};

exports.isValidValue = (val) => {
  return val !== '' && val !== null && val !== undefined && val !== 0 && !Number.isNaN(val);
}

exports.formatDateToStooq = (dateStr) => {
    return dayjs(dateStr).format('D MMM YYYY');
}

exports.oracleRound = (value, decimals = 2) => {
  const factor = Math.pow(10, decimals + 1); // 소수점 3자리까지 확보
  const floored = Math.floor(Math.abs(value) * factor); // 절대값 기준으로 자름
  const rounded = Math.round(floored / 10); // 3자리 → 2자리 반올림
  const result = rounded / Math.pow(10, decimals);
  return value < 0 ? -result : result; // 부호 복원
}

exports.oraclePrcRound = (value, precision = 2) => {
  const multiplier = Math.pow(10, precision);
  // EPSILON 보정 + toFixed 변환으로 정확한 반올림 유도
  return Number((Math.round((value + Number.EPSILON) * multiplier) / multiplier).toFixed(precision));
}

exports.calcStdRate = (close, before) => {
  const rate = ((close - before) / before) * 100;
  return exports.oracleRound(rate, 2);
}

exports.calcRateRoundedClose = (closeRaw, before) => {
  const close = Math.round(Number(closeRaw) * 100) / 100;
  const b = Number(before);

  // before 값이 없거나 0이면 % 변화율 계산 불가 → 0 처리 (Infinity 방지)
  if (!Number.isFinite(b) || b === 0) return 0;
  if (!Number.isFinite(close)) return 0;

  const rate = ((close - b) / b) * 100;
  if (!Number.isFinite(rate)) return 0;

  return Math.round(rate * 100) / 100;
}

// utils.js (별도의 util 파일로 빼서 재사용 권장)
const toNumber = (val, fallback = 0) => isNaN(Number(val)) ? fallback : Number(val);
//const round2 = (val) => Math.round(val * 100) / 100;

const limitValue = (value, min, max) => Math.min(Math.max(value, min), max);

// 계산 로직 공통화
exports.calcRate = (newDevRate, otPow, plus, minLimit, maxLimit) => {
    const result = (toNumber(newDevRate) * toNumber(otPow) * -1) + toNumber(plus);
    return limitValue(result, minLimit, maxLimit);
}

// 가격 반올림 로직 공통화
exports.calculateRoundedPrice = (basePrice, rate) => {
    const calcPrice = basePrice + (basePrice * rate / 100);
    const remainder = calcPrice % 10;

    if (remainder === 0) return calcPrice;
    if (remainder >= 5) return Math.ceil(calcPrice / 10) * 10 - 5;
    return Math.ceil(calcPrice / 10) * 10 - 10;
}

exports.sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

exports.cleanNumber = (val) => {
  if (!val) return null;
  return Number(String(val).replace(/,/g, ''));
};