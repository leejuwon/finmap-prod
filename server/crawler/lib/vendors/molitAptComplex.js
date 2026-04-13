'use strict';

const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');

const parser = new XMLParser({ ignoreAttributes: false });

const LIST_URL =
  process.env.MOLIT_APT_LIST_URL ||
  'https://apis.data.go.kr/1613000/AptListService3/getSidoAptList3'; // :contentReference[oaicite:3]{index=3}

const BASIS_URL =
  process.env.MOLIT_APT_BASIS_URL ||
  'https://apis.data.go.kr/1613000/AptBasisInfoServiceV4/getAphusDtlInfoV4'; // :contentReference[oaicite:4]{index=4}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function normalizeItems(item) {
  if (!item) return [];
  return Array.isArray(item) ? item : [item];
}

function pick(obj, keys) {
  for (const k of keys) {
    if (obj && obj[k] != null && String(obj[k]).trim() !== '') return obj[k];
  }
  return null;
}

function toInt(v) {
  if (v == null) return null;
  const n = Number(String(v).replace(/[^\d]/g, ''));
  return Number.isFinite(n) ? n : null;
}

async function callXml(url, params) {
  const res = await axios.get(url, {
    params: { serviceKey: process.env.MOLIT_SERVICE_KEY, ...params },
    timeout: 20000,
    headers: { Accept: '*/*' },
  });

  const json = parser.parse(res.data);

  // 공공데이터 포털 표준 에러(OpenAPI_ServiceResponse) 방어
  const cmm = json?.OpenAPI_ServiceResponse?.cmmMsgHeader;
  if (cmm) {
    const errMsg = cmm.errMsg || 'SERVICE ERROR';
    const authMsg = cmm.returnAuthMsg || '';
    const reason = cmm.returnReasonCode || '';
    throw new Error(`MOLIT OpenAPI error: ${errMsg} ${authMsg} (${reason})`);
  }

  const header = json?.response?.header;
  if (!header) throw new Error(`Unexpected response: ${String(res.data).slice(0, 200)}`);
  if (header.resultCode && header.resultCode !== '000') {
    throw new Error(`MOLIT error ${header.resultCode}: ${header.resultMsg || ''}`);
  }

  return json?.response?.body || {};
}

async function fetchSidoAptListPage({ sidoCode, pageNo = 1, numOfRows = 1000 }) {
  const body = await callXml(LIST_URL, { sidoCode, pageNo, numOfRows });
  const totalCount = Number(body?.totalCount || 0);
  const items = normalizeItems(body?.items?.item);
  return { totalCount, items };
}

async function fetchAllSidoAptList({ sidoCode }) {
  const numOfRows = 1000;
  let pageNo = 1;
  let out = [];

  while (true) {
    const { totalCount, items } = await fetchSidoAptListPage({ sidoCode, pageNo, numOfRows });
    out = out.concat(items);
    if (pageNo * numOfRows >= totalCount) break;
    pageNo += 1;
    await sleep(120);
  }

  return out;
}

async function fetchAphusDtlInfo({ kaptCode }) {
  const body = await callXml(BASIS_URL, { kaptCode, pageNo: 1, numOfRows: 1 });
  const items = normalizeItems(body?.items?.item);
  const it = items[0] || {};

  // “세대수/동수”는 필드명이 환경에 따라 다를 수 있어 후보를 넉넉히 둠
  const households =
    toInt(pick(it, ['kaptTotHsehCnt', 'totHsehCnt', 'hsehCnt', 'householdCnt', 'hshldCnt']));
  const dongCnt =
    toInt(pick(it, ['kaptDongCnt', 'dongCnt', 'totDongCnt', 'buildingCnt']));

  const bjdCode = pick(it, ['bjdCode', 'bjd_code', 'BJD_CODE']);

  return {
    raw: it,
    kapt_code: String(pick(it, ['kaptCode', 'kapt_code']) || kaptCode),
    kapt_name: pick(it, ['kaptName', 'kapt_name']),
    bjd_code: bjdCode ? String(bjdCode) : null,
    households_total: households,
    dong_count: dongCnt,
    kapt_addr: pick(it, ['kaptAddr', 'addr', 'kapt_addr']),
    use_apr_day: pick(it, ['useAprDay', 'use_apr_day', 'aprvDate', 'approvalDate']),
    parking_total: toInt(pick(it, ['kaptPcnt', 'parkingCnt', 'parking_total'])),
    heating_type: pick(it, ['heatMethod', 'heatingType', 'heating_type']),
  };
}

module.exports = {
  fetchAllSidoAptList,
  fetchAphusDtlInfo,
};