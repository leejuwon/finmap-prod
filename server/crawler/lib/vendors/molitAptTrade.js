// server/crawler/lib/vendors/molitAptTrade.js  (AptTradeDev 기준)
'use strict';

const axios = require('axios');
const crypto = require('crypto');
const { XMLParser } = require('fast-xml-parser');

const parser = new XMLParser({ ignoreAttributes: false });

const DEV_URL =
  process.env.MOLIT_APT_TRADE_DETAIL_URL ||
  'https://apis.data.go.kr/1613000/RTMSDataSvcAptTradeDev/getRTMSDataSvcAptTradeDev';

function sha1(text) {
  return crypto.createHash('sha1').update(text, 'utf8').digest('hex');
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function fetchPage({ lawdCd, dealYmd, pageNo = 1, numOfRows = 1000 }) {
  const params = {
    serviceKey: process.env.MOLIT_SERVICE_KEY, // Decoding 키여도 axios가 URL 인코딩해줌
    LAWD_CD: lawdCd,
    DEAL_YMD: dealYmd,
    pageNo,
    numOfRows,
  };

  const res = await axios.get(DEV_URL, { params, timeout: 20000,  headers: { Accept: '*/*' }, });
  const json = parser.parse(res.data);
  
  // ✅ 공공데이터포털 에러 응답(OpenAPI_ServiceResponse) 감지
  const cmm = json?.OpenAPI_ServiceResponse?.cmmMsgHeader;
  if (cmm) {
    const errMsg = cmm.errMsg || 'SERVICE ERROR';
    const authMsg = cmm.returnAuthMsg || '';
    const reason = cmm.returnReasonCode || '';
    throw new Error(`MOLIT OpenAPI error: ${errMsg} ${authMsg} (${reason})`);
  }

  // ✅ 우리가 기대하는 정상 응답(response/header) 구조가 아니면 바로 실패시키기
  if (!json?.response?.header) {
    throw new Error(`Unexpected MOLIT response: ${String(res.data).slice(0, 200)}`);
  }

  const header = json?.response?.header;
  if (header?.resultCode && header.resultCode !== '000') {
    throw new Error(`MOLIT error ${header.resultCode}: ${header.resultMsg || ''}`);
  }

  const body = json?.response?.body;
  const totalCount = Number(body?.totalCount || 0);

  const item = body?.items?.item || [];
  const items = Array.isArray(item) ? item : [item];

  return { totalCount, items };
}

async function fetchAll({ lawdCd, dealYmd }) {
  const numOfRows = 1000;
  let pageNo = 1;
  let out = [];

  while (true) {
    const { totalCount, items } = await fetchPage({ lawdCd, dealYmd, pageNo, numOfRows });
    out = out.concat(items);

    if (pageNo * numOfRows >= totalCount) break;
    pageNo += 1;
    await sleep(120);
  }

  return out;
}

// Dev 응답엔 aptSeq/aptNm/umdNm/excluUseAr/dealAmount/dealYear... 등이 나옴 :contentReference[oaicite:4]{index=4}
function makeTxHash(lawdCd, it) {
  const s = (v) => (v == null ? '' : String(v).trim());
  const sNoComma = (v) => (v == null ? '' : String(v).replace(/,/g, '').trim());

  const key = [
    s(lawdCd),
    s(it.aptSeq),
    s(it.umdNm),
    s(it.jibun), // ✅ 숫자여도 OK
    s(it.aptNm),
    s(it.excluUseAr || it.exclUseAr), // 표기 흔들림 대비
    s(it.floor),
    s(it.dealYear),
    s(it.dealMonth),
    s(it.dealDay),
    sNoComma(it.dealAmount),
    s(it.cdealType),
    s(it.cdealDay),
  ].join('|');

  return sha1(key);
}

module.exports = { fetchAll, makeTxHash };
