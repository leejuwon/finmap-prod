// server/crawler/scripts/re_sync_apt_complex_dim.js
'use strict';

const path = require('path');
const fs = require('fs');
const mysql = require('mysql2/promise');
const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');

function loadEnv() {
  try {
    const dotenv = require('dotenv');
    const envPath =
      process.env.NODE_ENV === 'production'
        ? path.resolve(process.cwd(), '.env.production')
        : path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) dotenv.config({ path: envPath });
  } catch (_) {}
}
loadEnv();

function arg(name, defVal) {
  for (const v of process.argv) {
    if (v && v.startsWith(`--${name}=`)) return v.split('=')[1];
  }
  return defVal;
}

function asBool(v, defVal = false) {
  if (v == null) return defVal;
  const s = String(v).trim().toLowerCase();
  if (s === '1' || s === 'true' || s === 'y' || s === 'yes') return true;
  if (s === '0' || s === 'false' || s === 'n' || s === 'no') return false;
  return defVal;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function toArray(x) {
  if (x == null) return [];
  return Array.isArray(x) ? x : [x];
}

function pickFirst(obj, keys) {
  if (!obj || typeof obj !== 'object') return null;
  for (const k of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, k) && obj[k] != null && String(obj[k]).trim() !== '') {
      return obj[k];
    }
  }
  return null;
}

function pickText(obj, keys) {
  const v = pickFirst(obj, keys);
  if (v == null) return '';
  if (typeof v === 'string') return v.trim();
  if (typeof v === 'number') return String(v);
  if (typeof v === 'object') {
    const t = pickFirst(v, ['#text', 'text', '_text', 'value']);
    return t == null ? '' : String(t).trim();
  }
  return String(v).trim();
}

function toIntSafe(v) {
  if (v == null || v === '') return null;
  const n = Number(String(v).replace(/[^\d-]/g, ''));
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function toDateSafe(v) {
  if (v == null) return null;
  const s = String(v).trim();
  if (!s) return null;

  const digits = s.replace(/\D/g, '');
  if (digits.length === 8) return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  return null;
}

function normName(name) {
  const s = (name == null ? '' : String(name)).trim();
  if (!s) return '';
  return s
    .replace(/\s+/g, ' ')
    .replace(/[()（）\[\]【】]/g, '')
    .trim()
    .toLowerCase();
}

// data.go.kr “인코딩키” 중복 인코딩 방지
function normalizeAptNameKey(name) {
  const s = (name == null ? '' : String(name)).trim();
  if (!s) return '';
  return s
    .toLowerCase()
    .replace(/\([^)]*\)|\[[^\]]*\]/g, '')
    .replace(/apt|apartment|주상복합/gi, '')
    .replace(/[^\p{L}\p{N}]/gu, '');
}

function makeReasonError(reason, message, cause) {
  const err = new Error(message || reason);
  err.reason = reason;
  if (cause) err.cause = cause;
  return err;
}

function maskSecret(v) {
  const s = String(v || '').trim();
  if (!s) return '';
  if (s.length <= 8) return `${s.slice(0, 2)}***`;
  return `${s.slice(0, 4)}...${s.slice(-4)} (len=${s.length})`;
}

function getServiceKeyInfo() {
  const keys = ['APT_SERVICE_KEY', 'SERVICE_KEY', 'MOLIT_SERVICE_KEY', 'DATA_GO_KR_SERVICE_KEY'];
  for (const name of keys) {
    const raw = process.env[name];
    if (raw) return { name, raw, value: normalizeServiceKey(raw), masked: maskSecret(raw) };
  }
  return { name: '', raw: '', value: '', masked: '' };
}

function classifyBasisError(err, fallbackReason) {
  const msg = String(err?.message || '').toLowerCase();
  const code = String(err?.code || '').toUpperCase();
  if (err?.reason) return err.reason;
  if (code === 'ECONNABORTED' || code === 'ETIMEDOUT' || msg.includes('timeout')) return 'TIMEOUT';
  if (msg.includes('429') || msg.includes('quota') || msg.includes('limited_number') || msg.includes('traffic')) {
    return 'RATE_LIMIT_OR_QUOTA';
  }
  if (msg.includes('openapi_serviceresponse') || msg.includes('service error')) return 'SERVICE_ERROR';
  if (msg.includes('http ')) return 'HTTP_ERROR';
  if (msg.includes('parse')) return 'PARSE_ERROR';
  return fallbackReason || 'SERVICE_ERROR';
}

function normalizeServiceKey(key) {
  if (!key) return '';
  const k = String(key).trim();
  if (/%[0-9A-Fa-f]{2}/.test(k)) {
    try { return decodeURIComponent(k); } catch (_) { return k; }
  }
  return k;
}

function parseMaybeJsonOrXml(raw) {
  if (raw == null) return {};
  if (typeof raw === 'object') return raw;

  const s = String(raw).trim();
  if (!s) return {};
  if (s.startsWith('{') || s.startsWith('[')) {
    try { return JSON.parse(s); }
    catch (e) { throw makeReasonError('PARSE_ERROR', `JSON parse failed: ${e.message}`, e); }
  }

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
    trimValues: true,
  });
  try { return parser.parse(s); }
  catch (e) { throw makeReasonError('PARSE_ERROR', `XML parse failed: ${e.message}`, e); }
}

function extractHeaderBody(obj) {
  const response = obj?.response ?? obj?.Response ?? obj;
  const header = response?.header ?? response?.Header ?? obj?.header ?? obj?.Header ?? null;
  const body = response?.body ?? response?.Body ?? obj?.body ?? obj?.Body ?? null;
  return { header, body };
}

function okResultCode(code) {
  const c = String(code ?? '').trim();
  return c === '' || c === '00' || c === '000' || c === '0';
}

function deepFindObjectsHavingKeys(root, keySet) {
  const out = [];
  const seen = new Set();
  const stack = [root];

  while (stack.length) {
    const cur = stack.pop();
    if (cur == null) continue;

    if (Array.isArray(cur)) {
      for (const v of cur) stack.push(v);
      continue;
    }

    if (typeof cur === 'object') {
      if (seen.has(cur)) continue;
      seen.add(cur);

      const keys = Object.keys(cur);
      let hit = false;
      for (const k of keys) {
        if (keySet.has(k)) { hit = true; break; }
      }
      if (hit) out.push(cur);

      for (const k of keys) stack.push(cur[k]);
    }
  }
  return out;
}

function extractItemsFromBody(body) {
  if (!body || typeof body !== 'object') return [];

  const candidate =
    body?.items?.item ??
    body?.items?.Item ??
    body?.items ??
    body?.item ??
    body?.Item ??
    null;

  const arr = toArray(candidate);
  if (arr.length && typeof arr[0] === 'object') return arr;

  // fallback: kaptCode 가진 객체를 통째로 긁어오기
  return deepFindObjectsHavingKeys(body, new Set([
    'kaptCode', 'kapt_code', 'KAPT_CODE', 'kaptcode', 'kaptCd', 'kapt_cd'
  ]));
}

// 요청 URL 스킴 토글(http<->https)
function toggleScheme(u) {
  const s = String(u || '').trim();
  if (!s) return s;
  if (/^https:\/\//i.test(s)) return s.replace(/^https:\/\//i, 'http://');
  if (/^http:\/\//i.test(s)) return s.replace(/^http:\/\//i, 'https://');
  return s;
}

// 공통 GET
async function httpGetGov(url, params, { debug }) {
  const serviceKeyInfo = getServiceKeyInfo();
  const serviceKey = serviceKeyInfo.value;
  if (!serviceKey) throw new Error('Missing service key env (APT_SERVICE_KEY or MOLIT_SERVICE_KEY etc).');

  const finalParams = { ...params, serviceKey, _type: 'json' };

  let res;
  try {
    res = await axios.get(url, {
      params: finalParams,
      timeout: 30000,
      responseType: 'text',
      validateStatus: () => true,
      headers: { 'User-Agent': 'finmap-bot/1.0', 'Accept': '*/*' },
    });
  } catch (e) {
    const reason = classifyBasisError(e, 'HTTP_ERROR');
    throw makeReasonError(reason, `${reason}: ${e.message}`, e);
  }

  const parsed = parseMaybeJsonOrXml(res.data);

  // OpenAPI_ServiceResponse 케이스
  const svcErr = parsed?.OpenAPI_ServiceResponse?.cmmMsgHeader;
  if (svcErr) {
    const msg = `${svcErr.returnReasonCode || ''} ${svcErr.errMsg || ''} ${svcErr.returnAuthMsg || ''}`.trim();
    const reason = classifyBasisError(new Error(msg), 'SERVICE_ERROR');
    throw makeReasonError(reason, `OpenAPI_ServiceResponse: ${msg || 'unknown'}`);
  }

  const { header, body } = extractHeaderBody(parsed);

  if (res.status >= 400) {
    const msg = header?.resultMsg || header?.resultmsg || header?.resultMessage || '';
    const snippet = (typeof res.data === 'string')
      ? res.data.slice(0, 200).replace(/\s+/g, ' ')
      : JSON.stringify(parsed).slice(0, 200);
    const reason = res.status === 429 ? 'RATE_LIMIT_OR_QUOTA' : 'HTTP_ERROR';
    throw makeReasonError(reason, `HTTP ${res.status}: ${msg || 'Unexpected errors'} | snippet=${snippet}`);
  }

  if (!header) {
    if (debug) {
      const snippet = (typeof res.data === 'string')
        ? res.data.slice(0, 300).replace(/\s+/g, ' ')
        : JSON.stringify(parsed).slice(0, 300);
      console.log('[debug][no_header_snippet]', snippet);
    }
    throw makeReasonError('PARSE_ERROR', 'NO_HEADER: unexpected payload (no response.header)');
  }

  if (!okResultCode(header.resultCode || header.resultcode)) {
    const msg = `OpenAPI error ${header.resultCode}: ${header.resultMsg || ''}`.trim();
    const reason = classifyBasisError(new Error(msg), 'SERVICE_ERROR');
    throw makeReasonError(reason, msg);
  }

  return { header, body: body || {}, raw: parsed };
}

async function withRetry(fn, { tries = 3, baseSleepMs = 700 } = {}) {
  let lastErr = null;
  for (let i = 1; i <= tries; i++) {
    try { return await fn(); }
    catch (e) {
      lastErr = e;
      if (i < tries) await sleep(baseSleepMs * i);
    }
  }
  throw lastErr;
}

async function assertDimTable(conn, { debug }) {
  const [cols] = await conn.query(`SHOW COLUMNS FROM re_apt_complex_dim`);
  const colSet = new Set(cols.map((r) => String(r.Field || r.field || '').toLowerCase()).filter(Boolean));
  if (debug) console.log('[debug][dim columns]', Array.from(colSet).sort());
  if (!colSet.has('kapt_code')) throw new Error('re_apt_complex_dim must have kapt_code column (PK).');

  const requiredCols = [
    'kapt_name', 'kapt_name_norm', 'sido_code', 'lawd_cd', 'bjd_code',
    'sigungu_name', 'gu_name', 'dong_name', 'jibun', 'kapt_addr',
    'road_nm', 'road_nm_bonbun', 'road_nm_bubun', 'road_addr',
    'approval_date', 'build_year', 'dong_count', 'household_count',
    'parking_total', 'parking_ground', 'parking_underground',
    'heating_type', 'manage_type', 'tel', 'homepage',
    'basis_raw_json', 'basis_error_reason', 'source_updated_at',
  ];
  const missingCols = requiredCols.filter((c) => !colSet.has(c));
  if (missingCols.length) {
    throw new Error(`re_apt_complex_dim missing columns: ${missingCols.join(', ')}. Apply sql/20260506_create_re_apt_complex_dim.sql first.`);
  }

  const [pkRows] = await conn.query(`SHOW INDEX FROM re_apt_complex_dim WHERE Key_name='PRIMARY'`);
  const pkCols = pkRows.map((r) => String(r.Column_name || r.column_name || '').toLowerCase()).filter(Boolean);
  if (debug) console.log('[debug][dim pk]', pkCols);
  if (!pkCols.includes('kapt_code')) throw new Error('re_apt_complex_dim PK must include kapt_code.');
}

function safeJsonStringify(value) {
  try { return JSON.stringify(value); }
  catch (_) { return null; }
}

function mapBasisToRow({ sidoCode, listItem, basisItem, basisMeta }) {
  const kapt_code = pickText(listItem, ['kaptCode', 'kapt_code', 'kaptcode', 'KAPT_CODE', 'kaptCd', 'kapt_cd']);
  const kapt_name =
    pickText(basisItem, ['kaptName', 'kapt_name', 'kaptNm', 'kapt_nm']) ||
    pickText(listItem, ['kaptName', 'kaptNm']) ||
    '';
  const kapt_name_norm = normalizeAptNameKey(kapt_name);

  const bjd_code =
    pickText(basisItem, ['bjdCode', 'bjd_code', 'BJD_CODE', 'bjdCd', 'bjd_cd']) ||
    pickText(listItem, ['bjdCode', 'bjd_code', 'BJD_CODE', 'bjdCd', 'bjd_cd']) ||
    '';
  const lawd_cd =
    pickText(basisItem, ['lawdCd', 'lawd_cd', 'sigunguCode', 'sigungu_code', 'sigunguCd', 'sigungu_cd']) ||
    pickText(listItem, ['lawdCd', 'lawd_cd', 'sigunguCode', 'sigungu_code', 'sigunguCd', 'sigungu_cd']) ||
    (bjd_code ? String(bjd_code).slice(0, 5) : '') ||
    null;
  const source_sido_code =
    pickText(basisItem, ['sidoCode', 'sido_code', 'SIDO_CODE']) ||
    pickText(listItem, ['sidoCode', 'sido_code', 'SIDO_CODE']) ||
    String(sidoCode || '') ||
    (lawd_cd ? String(lawd_cd).slice(0, 2) : '');
  const sigungu_name = pickText(basisItem, ['sigunguNm', 'sigunguName', 'sigungu_name']) || null;
  const gu_name = (pickText(basisItem, ['guNm', 'guName', 'gu_name']) || '').trim();
  const dong_name = pickText(basisItem, ['dongNm', 'dongName', 'dong_name', 'umdNm', 'umdName']) || null;
  const jibun = pickText(basisItem, ['jibun', 'jibunAddr', 'jibun_address']) || null;
  const kapt_addr =
    pickText(basisItem, ['kaptAddr', 'kapt_addr', 'addr', 'address', 'juso', 'jibunAddr', 'roadAddr']) ||
    pickText(listItem, ['kaptAddr', 'kapt_addr', 'addr', 'address', 'juso']) ||
    null;

  const road_nm = pickText(basisItem, ['roadNm', 'road_nm']) || null;
  const road_nm_bonbun = pickText(basisItem, ['roadNmBonbun', 'road_nm_bonbun', 'bonbun']) || null;
  const road_nm_bubun = pickText(basisItem, ['roadNmBubun', 'road_nm_bubun', 'bubun']) || null;
  const road_addr = pickText(basisItem, ['roadAddr', 'doroJuso', 'road_address']) || null;

  const approval_date = toDateSafe(pickText(basisItem, ['approvalDate', 'useAprDay', 'aprvDt', 'approval_date'])) || null;
  const build_year = toIntSafe(pickText(basisItem, ['buildYear', 'bldgYear', 'build_year'])) ?? null;

  const dong_count = toIntSafe(pickText(basisItem, ['kaptdDcnt', 'kaptDcnt', 'kaptDongCnt', 'dongCnt', 'dongCo', 'totDongCnt', 'buildingCnt', 'dong_count'])) ?? null;
  const household_count = toIntSafe(pickText(basisItem, ['kaptdScnt', 'kaptScnt', 'kaptTotHsehCnt', 'totHsehCnt', 'hsehCnt', 'hshldCnt', 'householdCnt', 'hshldCo', 'household_count', 'hoCnt'])) ?? null;

  const parking_total = toIntSafe(pickText(basisItem, ['kaptdPcnt', 'kaptPcnt', 'parkingTotCnt', 'parkingTotal', 'parkingCnt', 'parking_total', 'parkTotCnt'])) ?? null;
  const parking_underground = toIntSafe(pickText(basisItem, ['kaptdPcntu', 'kaptPcntu', 'parkingUndgrndCnt', 'parkingUnder', 'parking_underground', 'parkUndgrndCnt'])) ?? null;
  const explicitParkingGround = toIntSafe(pickText(basisItem, ['parkingGroundCnt', 'parkingGrnd', 'parking_ground', 'parkGrndCnt'])) ?? null;
  const parking_ground = explicitParkingGround != null
    ? explicitParkingGround
    : (parking_total != null && parking_underground != null ? parking_total - parking_underground : null);

  const heating_type = pickText(basisItem, ['heatMthd', 'heatingType', 'heating_type', 'heatSystem']) || null;
  const manage_type = pickText(basisItem, ['manageMthd', 'manageType', 'manage_type', 'mgmtType']) || null;

  const tel = pickText(basisItem, ['tel', 'kaptTel', 'telephone', 'officeTel']) || null;
  const homepage = pickText(basisItem, ['homepage', 'homePage', 'kaptUrl', 'url']) || null;

  const source_updated_at = toDateSafe(pickText(basisItem, ['dataUpdDt', 'updDate', 'updateDate', 'dataStdde', 'source_updated_at'])) || null;

  return {
    kapt_code,
    kapt_name,
    kapt_name_norm,
    sido_code: source_sido_code || null,
    lawd_cd: lawd_cd || null,
    bjd_code: bjd_code || null,
    sigungu_name: sigungu_name || null,
    gu_name: gu_name || '',
    dong_name: dong_name || null,
    jibun: jibun || null,
    kapt_addr: kapt_addr || null,
    road_nm: road_nm || null,
    road_nm_bonbun: road_nm_bonbun || null,
    road_nm_bubun: road_nm_bubun || null,
    road_addr: road_addr || null,
    approval_date,
    build_year,
    dong_count,
    household_count,
    parking_total,
    parking_ground,
    parking_underground,
    heating_type,
    manage_type,
    tel,
    homepage,
    basis_raw_json: safeJsonStringify({
      basisSource: basisMeta?.source || null,
      basisErrorReason: basisMeta?.reason || null,
      basisErrors: basisMeta?.errors || [],
      listItem,
      basisItem,
    }),
    basis_error_reason: basisMeta?.reason || null,
    source_updated_at,
  };
}

(async () => {
  const debug = asBool(arg('debug', '0'));
  const sidosArg = String(arg('sidos', '11,28,41'));
  const throttle = Math.max(0, Number(arg('throttle', '600')));
  const limit = String(arg('limit', '')).trim() ? Number(arg('limit', '0')) : null;
  const onlyNew = asBool(arg('onlyNew', '0'));
  const requireBasis = asBool(arg('requireBasis', '0')); // ✅ 세대수/동수 꼭 필요하면 1
  const upsert = asBool(arg('upsert', '1'), true);
  const singleKaptCode = String(arg('kaptCode', arg('aptKey', '')) || '').trim();

  const parsedSidos = sidosArg.split(',').map((s) => s.trim()).filter(Boolean);
  const sidos = singleKaptCode ? [parsedSidos[0] || ''] : parsedSidos;

  ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'].forEach((k) => {
    if (!process.env[k]) throw new Error(`${k} is missing`);
  });

  // ✅ 너가 확인한 서비스 기준
  const LIST_URL = (process.env.APT_LIST_URL || 'http://apis.data.go.kr/1613000/AptListService3/getSidoAptList3').trim();

  // ✅ V4 우선 + V3 fallback (V3 getAphusBassInfoV3 는 500 많이 남)
  const BASIS_V4_URL = (process.env.APT_BASIS_V4_URL || 'http://apis.data.go.kr/1613000/AptBasisInfoServiceV4/getAphusDtlInfoV4').trim();
  const BASIS_V3_URL = (process.env.APT_BASIS_V3_URL || 'http://apis.data.go.kr/1613000/AptBasisInfoServiceV3/getAphusDtlInfoV3').trim();

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: 'utf8mb4',
  });

  const [info] = await conn.query('SELECT DATABASE() db, @@hostname host, @@port port, USER() user');
  console.log('[conn]', info[0]);
  console.log(`[start] sidos=${sidos.join(',')} throttle=${throttle}ms onlyNew=${onlyNew} limit=${limit ?? 'none'} upsert=${upsert} requireBasis=${requireBasis}`);
  console.log('[api] LIST_URL=', LIST_URL);
  console.log('[api] BASIS_V4_URL=', BASIS_V4_URL);
  console.log('[api] BASIS_V3_URL=', BASIS_V3_URL);
  const serviceKeyInfo = getServiceKeyInfo();
  console.log(`[api] serviceKey=${serviceKeyInfo.name || 'missing'} ${serviceKeyInfo.masked || ''}`.trim());
  if (singleKaptCode) console.log(`[single] kaptCode=${singleKaptCode} (aptKey is treated as kaptCode alias)`);

  await assertDimTable(conn, { debug });

  let listed = 0;
  let totalCandidates = 0;
  let basisOk = 0;
  let basisFailed = 0;
  let basisSkipped = 0;
  let upserted = 0;
  let dryRunUpserted = 0;
  let skipped = 0;
  let errors = 0;

  let existsSet = null;
  if (onlyNew) {
    const [rows] = await conn.query(`SELECT kapt_code FROM re_apt_complex_dim`);
    existsSet = new Set(rows.map((r) => String(r.kapt_code)));
    console.log(`[onlyNew] existing kapt_code=${existsSet.size}`);
  }

  // ✅ [중요] 컬럼 25개 = VALUES 물음표 25개 (여기 틀리면 너가 본 DB 에러가 바로 남)
  const sqlUpsert = `
    INSERT INTO re_apt_complex_dim (
      kapt_code, kapt_name, kapt_name_norm,
      sido_code, lawd_cd, bjd_code, sigungu_name, gu_name, dong_name, jibun, kapt_addr,
      road_nm, road_nm_bonbun, road_nm_bubun, road_addr,
      approval_date, build_year, dong_count, household_count,
      parking_total, parking_ground, parking_underground,
      heating_type, manage_type, tel, homepage,
      basis_raw_json, basis_error_reason,
      source_updated_at
    ) VALUES (
      ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?,
      ?
    )
    ON DUPLICATE KEY UPDATE
      kapt_name = VALUES(kapt_name),
      kapt_name_norm = VALUES(kapt_name_norm),
      sido_code = VALUES(sido_code),
      lawd_cd = VALUES(lawd_cd),
      bjd_code = VALUES(bjd_code),
      sigungu_name = VALUES(sigungu_name),
      gu_name = VALUES(gu_name),
      dong_name = VALUES(dong_name),
      jibun = VALUES(jibun),
      kapt_addr = VALUES(kapt_addr),
      road_nm = VALUES(road_nm),
      road_nm_bonbun = VALUES(road_nm_bonbun),
      road_nm_bubun = VALUES(road_nm_bubun),
      road_addr = VALUES(road_addr),
      approval_date = VALUES(approval_date),
      build_year = VALUES(build_year),
      dong_count = VALUES(dong_count),
      household_count = VALUES(household_count),
      parking_total = VALUES(parking_total),
      parking_ground = VALUES(parking_ground),
      parking_underground = VALUES(parking_underground),
      heating_type = VALUES(heating_type),
      manage_type = VALUES(manage_type),
      tel = VALUES(tel),
      homepage = VALUES(homepage),
      basis_raw_json = VALUES(basis_raw_json),
      basis_error_reason = VALUES(basis_error_reason),
      source_updated_at = VALUES(source_updated_at),
      updated_at = CURRENT_TIMESTAMP
  `;

  async function listBySido(sidoCode) {
    const pageSize = 1000; // ✅ 안전 (2000에서 간헐적으로 got=0 케이스 방지)
    let pageNo = 1;
    let totalCount = 0;
    const all = [];

    while (true) {
      // 1차: LIST_URL 그대로
      let r = await httpGetGov(LIST_URL, { sidoCode: String(sidoCode), pageNo, numOfRows: pageSize }, { debug });

      const tc = toIntSafe(r.body?.totalCount) ?? toIntSafe(r.body?.totalcount) ?? toIntSafe(r.body?.totCnt) ?? 0;
      totalCount = tc || totalCount;

      let items = extractItemsFromBody(r.body);

      // totalCount는 있는데 items=0이면 스킴 토글해서 1번 더 시도
      if (totalCount > 0 && items.length === 0) {
        const altUrl = toggleScheme(LIST_URL);
        if (altUrl && altUrl !== LIST_URL) {
          try {
            const r2 = await httpGetGov(altUrl, { sidoCode: String(sidoCode), pageNo, numOfRows: pageSize }, { debug });
            const items2 = extractItemsFromBody(r2.body);
            if (items2.length > 0) {
              if (debug) console.log('[debug][list] recovered by scheme toggle:', altUrl);
              items = items2;
            }
          } catch (_) {}
        }
      }

      for (const it of items) {
        const kapt = pickText(it, ['kaptCode', 'kapt_code', 'kaptcode', 'KAPT_CODE', 'kaptCd', 'kapt_cd']);
        if (kapt) all.push(it);
      }

      if (debug) console.log(`[debug][list] page=${pageNo} got=${items.length} acc=${all.length} totalCount=${totalCount}`);

      if (!totalCount) break;
      if (all.length >= totalCount) break;
      if (items.length === 0) break;

      pageNo += 1;
      await sleep(Math.max(50, throttle));
    }

    // kaptCode 중복 제거
    const uniq = new Map();
    for (const it of all) {
      const kapt = pickText(it, ['kaptCode', 'kapt_code', 'kaptcode', 'KAPT_CODE', 'kaptCd', 'kapt_cd']);
      if (kapt && !uniq.has(kapt)) uniq.set(kapt, it);
    }

    const arr = Array.from(uniq.values());
    return { totalCount: totalCount || arr.length, items: arr };
  }

  async function fetchBasisByUrl(url, kaptCode) {
    const r = await httpGetGov(url, { kaptCode: String(kaptCode), pageNo: 1, numOfRows: 10 }, { debug });
    const items = extractItemsFromBody(r.body);
    if (items.length > 0) return { item: items[0], raw: r.raw };

    const recovered = deepFindObjectsHavingKeys(r.raw, new Set(['kaptCode', 'kapt_code', 'KAPT_CODE', 'kaptcode', 'kaptCd', 'kapt_cd']));
    return recovered.length ? { item: recovered[0], raw: r.raw } : { item: null, raw: r.raw };
  }

  async function fetchBasis(kaptCode) {
    // V4 -> (실패/빈값이면) V3
    const errorsForRaw = [];

    try {
      const b4 = await withRetry(() => fetchBasisByUrl(BASIS_V4_URL, kaptCode), { tries: 3, baseSleepMs: 900 });
      if (b4?.item) return { item: b4.item, source: 'V4', reason: null, errors: errorsForRaw };
      errorsForRaw.push({ source: 'V4', reason: 'NO_BASIS_ITEM', message: 'V4 returned no basis item' });
    } catch (e) {
      const reason = classifyBasisError(e, 'V4_ERROR');
      errorsForRaw.push({ source: 'V4', reason, message: e.message });
      if (debug) console.log('[debug][basis v4 err]', kaptCode, reason, e.message);
    }

    try {
      const b3 = await withRetry(() => fetchBasisByUrl(BASIS_V3_URL, kaptCode), { tries: 3, baseSleepMs: 900 });
      if (b3?.item) return { item: b3.item, source: 'V3', reason: null, errors: errorsForRaw };
      errorsForRaw.push({ source: 'V3', reason: 'NO_BASIS_ITEM', message: 'V3 returned no basis item' });
    } catch (e) {
      const reason = classifyBasisError(e, 'V3_ERROR');
      errorsForRaw.push({ source: 'V3', reason, message: e.message });
      if (debug) console.log('[debug][basis v3 err]', kaptCode, reason, e.message);
    }

    const severe = errorsForRaw.find((e) => e.reason !== 'NO_BASIS_ITEM');
    return {
      item: null,
      source: null,
      reason: severe?.reason || 'NO_BASIS_ITEM',
      errors: errorsForRaw,
    };
  }

  for (const sido of sidos) {
    console.log(`\n[sido] ${sido}`);

    let listRes;
    try {
      listRes = singleKaptCode
        ? { totalCount: 1, items: [{ kaptCode: singleKaptCode }] }
        : await listBySido(sido);
    } catch (e) {
      errors++;
      console.error(`[error][list] sido=${sido} -> ${e.message}`);
      continue;
    }

    listed += listRes.totalCount || 0;

    let listItems = listRes.items;
    if (limit != null && Number.isFinite(limit) && limit > 0) listItems = listItems.slice(0, limit);
    totalCandidates += listItems.length;

    console.log(`[list] totalCount=${listRes.totalCount} fetched=${listItems.length}`);

    for (const li of listItems) {
      const kapt = pickText(li, ['kaptCode', 'kapt_code', 'kaptcode', 'KAPT_CODE', 'kaptCd', 'kapt_cd']);
      if (!kapt) { skipped++; continue; }
      if (existsSet && existsSet.has(kapt)) { skipped++; continue; }

      try {
        await sleep(Math.max(10, throttle));

        let basisResult = { item: null, source: null, reason: 'NO_BASIS_ITEM', errors: [] };
        try {
          basisResult = await fetchBasis(kapt);
        } catch (e) {
          const reason = classifyBasisError(e, 'SERVICE_ERROR');
          if (debug) console.log('[debug][basis err final]', kapt, reason, e.message);
          basisResult = { item: null, source: null, reason, errors: [{ source: 'FINAL', reason, message: e.message }] };
        }

        if (basisResult.item) {
          basisOk++;
        } else {
          basisFailed++;
          if (debug) console.log('[debug][basis failed]', kapt, basisResult.reason);
        }

        if (requireBasis && !basisResult.item) {
          // 세대수/동수 목적이면, basis 실패는 저장 안하고 다음 실행에 다시 시도
          basisSkipped++;
          skipped++;
          continue;
        }

        const row = mapBasisToRow({ sidoCode: sido, listItem: li, basisItem: basisResult.item || {}, basisMeta: basisResult });
        if (debug) {
          console.log(`[debug][mapped counts] kapt=${row.kapt_code} household=${row.household_count ?? 'null'} dong=${row.dong_count ?? 'null'} parkingTotal=${row.parking_total ?? 'null'} parkingUnderground=${row.parking_underground ?? 'null'}`);
        }

        if (upsert) {
          await conn.execute(sqlUpsert, [
            row.kapt_code, row.kapt_name, row.kapt_name_norm,
            row.sido_code, row.lawd_cd, row.bjd_code, row.sigungu_name, row.gu_name, row.dong_name, row.jibun, row.kapt_addr,
            row.road_nm, row.road_nm_bonbun, row.road_nm_bubun, row.road_addr,
            row.approval_date, row.build_year, row.dong_count, row.household_count,
            row.parking_total, row.parking_ground, row.parking_underground,
            row.heating_type, row.manage_type, row.tel, row.homepage,
            row.basis_raw_json, row.basis_error_reason,
            row.source_updated_at,
          ]);
          upserted++;
        } else {
          dryRunUpserted++;
        }
      } catch (e) {
        errors++;
        console.error(`[error][db] kapt=${kapt} -> ${e.message}`);
      }
    }
  }

  await conn.end();
  const dryRunPart = upsert ? '' : ` dryRunUpserted=${dryRunUpserted}`;
  console.log(`\n[done] totalCandidates=${totalCandidates} listed=${listed} basisOk=${basisOk} basisFailed=${basisFailed} basisSkipped=${basisSkipped} upserted=${upserted}${dryRunPart} skipped=${skipped} errors=${errors}`);
})().catch((e) => {
  console.error('[fatal]', e);
  process.exit(1);
});
