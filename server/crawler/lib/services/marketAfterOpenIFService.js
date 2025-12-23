/*******************************************************************************
 * S&P500, DawJones, Nasdaq
 * 달러 Index, 미국장기국채, 유가, 원달러환율 
 * 등을도 API, 크롤링을 통해  MARKET_WORLD_INDICES_INFO 테이블에 넣는 용도임.
 *
 *[달러 인덱스]
 * 1순위: 
 * 2순위:
 * 3순위:
 * 
 * [미국장기국채] 
 * 1순위:
 * 2순위:
 * 3순위:
 * 
 * [유가]
 * 1순위:
 * 2순위:
 * 3순위:
 * 
 * [원달러환율]
 * 1순위: 은행준비위원회(BOK, Bank of Korea) 공식 환율 API의 02시 정보  
 *        # 2025-06-10 날짜 한 건만 조회 (일별 데이터)        
 *        [15:30 종가]  https://ecos.bok.or.kr/api/StatisticSearch/BPHUYDGRDSTSXUIS3JLF/json/kr/1/1/731Y003/D/20250523/20250523/0000003
 *        [02:00 종가]  https://ecos.bok.or.kr/api/StatisticSearch/BPHUYDGRDSTSXUIS3JLF/json/kr/1/1/731Y003/D/20250523/20250523/0000013
 * 2순위: 서울외국환 중계 크롤링 02시 정보 
 * 3순위: 인베스팅 크롤링(02시 정보와 비슷) 
 * 4순위: stooq 크롤링 (15시 정보와 비슷) 
 * 
 * [S&P 500]
 * 1순위:
 * 2순위:
 * 3순위:
 * 
 * [DawJones]
 * 1순위:
 * 2순위:
 * 3순위:
 * 
 * [Nasdaq]
 * 1순위:
 * 2순위:
 * 3순위:
 * 한국은행 경제 key: BPHUYDGRDSTSXUIS3JLF 
 ******************************************************************************/
const db = require('../db');
const { isKoreaMarketHoliday } = require('../utils/marketUtils');
// yahoo-finance2 v3 client (singleton)
const yahooFinance = require('../vendors/yahooFinance');
const moment = require('moment-timezone');
const axios = require('axios');
const cheerio = require('cheerio');
const dayjs = require('dayjs');
const objUtils = require('../utils/utils'); //{ getSeoulDate, dbQuery, isValidValue }
// crawler/smbsFetcher.js

const { launchBrowser: launchBrowserCore } = require('../puppeteer/launch');

exports.getAfterOpenTypeInfo = async ({pIndicesType, pIfType,pDate, pCloseFlag}) => {
  /********************
   * pIfType: 
   *   - API : API키를 통한 통신
   *   - PPT : Puppeteer를 통한 크롤링 
   *   - AXC : Axios + Cheerio 통한 크롤링
   *   - LIB : Yahoo-finance2 라이브러리
   */
  let toDt = new Date(),        
      seoulDay,
      bfYmd = new Date(),        
      xbfYmd = new Date(),        
      prevXDay,
      krHolyYn = 'N',
      usHolyYn = 'N';
            
    if (pDate == null || pDate == undefined || pDate == '') {
        seoulDay = toDt.getDay();
    } else {
        toDt = new Date(pDate);        
        bfYmd = new Date(pDate);   
        xbfYmd = new Date(pDate);   
        seoulDay = toDt.getDay();
    }
    console.log('seoulDay:',toDt,  seoulDay);
    
    if (seoulDay == "1") {
        bfYmd.setDate(toDt.getDate() - 3); // 금요일        
        xbfYmd.setDate(toDt.getDate() - 4); // 목요일
        console.log('seoulDay1:', bfYmd, xbfYmd);
    } else {
        bfYmd.setDate(toDt.getDate() - 1); // 전일                
        if (seoulDay == "2") {
            xbfYmd.setDate(toDt.getDate() - 4); // 금요일

            console.log('seoulDay2:', bfYmd, xbfYmd);
        } else {
            xbfYmd.setDate(toDt.getDate() - 2); // 금요일
            console.log('seoulDay ESC:', bfYmd, xbfYmd);
        }
    } 
    
    const formattedToday = moment(toDt).tz('Asia/Seoul').format('YYYY-MM-DD');
    //const formattedPrevDay = bfYmd.toISOString().split('T')[0];    
    //const formattedXPrevDay = xbfYmd.toISOString().split('T')[0];    
    const formattedPrevDay = moment(bfYmd).tz('Asia/Seoul').format('YYYY-MM-DD');
    const formattedXPrevDay  = moment(xbfYmd).tz('Asia/Seoul').format('YYYY-MM-DD');
    
    console.log('실행일자들:', formattedToday, formattedPrevDay, formattedXPrevDay);     
    
    const [krHolyday] =  await db.query(` SELECT COUNT(*) AS H_CNT
                                      FROM MARKET_HOLYDAY_INFO
                                      WHERE HOLYDAY_COUNTRY = 'KR'
                                      AND   HOLYDAY_TYPE = 'ALL'
                                      AND   HOLYDAY_DATE = ? `, [formattedToday]);    
    let krHolydayCnt = krHolyday[0].H_CNT;

    // KR 휴장인 경우
    if(krHolydayCnt > 0){
        krHolyYn = 'Y';
    }    
    //US 휴일정보 체크하기
    const [usHolyday] =  await db.query(` SELECT COUNT(*) AS H_CNT
                                        FROM MARKET_HOLYDAY_INFO
                                        WHERE HOLYDAY_COUNTRY = 'US'
                                        AND   HOLYDAY_TYPE = 'ALL'
                                        AND   HOLYDAY_DATE = ? `, [formattedPrevDay]);  

    console.log('usHolyday:', usHolyday);                                      
    let usHolydayCnt = usHolyday[0].H_CNT;

    // US 휴장인 경우
    if(usHolydayCnt > 0){
        usHolyYn = 'Y';
    }    

    if( pIndicesType === 'NVR' && pIfType === 'AXC'){
      await fetchIndicesNaverData(formattedToday, formattedPrevDay, formattedXPrevDay,usHolyYn, krHolyYn, pCloseFlag);
    }

    if( pIndicesType === 'YHF' && pIfType === 'LIB'){
      await fetchIndicesYahooData(formattedToday, formattedPrevDay, formattedXPrevDay,usHolyYn, krHolyYn, pCloseFlag);
    }

    if( pIndicesType === 'DMF' && pIfType === 'AXC'){
      await fetchIndicesDaumData(formattedToday, formattedPrevDay, formattedXPrevDay,usHolyYn, krHolyYn, pCloseFlag);
    }

    return { status: 'success', message: pIndicesType +' market After Open I/F get successfully.' };
};

//Naver를 통한 API 통신 
async function fetchIndicesNaverData(pToDate, pBfDate, pXBfDate, pUsHolyFlag, pKrHolyFlag, pCloseFlag) {
  let   pKrIdxData = {},
        mdfTodate = pToDate.replace(/-/g, ''),
        openFlag = false,
        closeFlag = false,
        resultToAll = [],
        etfBfDate,
        kspEtfStdPrc = 1000;
  console.log('fetchIndicesNaverData333 시작!!');
  pUsHolyFlag = pUsHolyFlag ?? 'N';
  pKrHolyFlag = pKrHolyFlag ?? 'N';
  const krIdxInfo = await objUtils.dbQuery(db,
        `SELECT * 
        FROM MARKETS_WORLD_INDICES_INFO
        WHERE INDEX_ID      = ?
        AND   INDEX_SITE_ID = 'NVR'
        AND   INDEX_DATE    = ? 
        LIMIT 1`, ['KSP',pToDate]          
  );                                  
          
  // KR Index 정보가 없는 경우(종가용)
  if ((krIdxInfo || []).length == 0) {
    await  objUtils.dbQuery(db,`INSERT INTO MARKETS_WORLD_INDICES_INFO (
          INDEX_DATE, INDEX_ID, INDEX_SITE_ID, INDEX_SITE_NAME, KSP_STOCK_DATE, US_HOLYDAY_YN, KR_HOLYDAY_YN) 
          VALUES(?, ?, 'NVR', 'Naver Finance', ?, ?, ?)`
        , [pToDate, 'KSP', pToDate, pUsHolyFlag, pKrHolyFlag]);
  }             

  const indicesStdPrc = await objUtils.dbQuery(db,
        `SELECT INDEX_END_PRICE
               ,INDEX_DATE 
        FROM MARKETS_WORLD_INDICES_INFO
        WHERE INDEX_ID      = ?
        AND   INDEX_SITE_ID = 'NVR'
        AND   KR_HOLYDAY_YN != 'Y'
        AND   INDEX_END_PRICE IS NOT NULL
        AND   INDEX_DATE    < ? 
        ORDER BY INDEX_DATE DESC
        LIMIT 1`, ['KSP',pToDate]
  );                                  

  console.log('indicesStdPrc:', indicesStdPrc);
  let idxStd = indicesStdPrc?.[0]?.INDEX_END_PRICE;
  let idxStdDate = indicesStdPrc?.[0]?.INDEX_DATE;

  // DB에 전일 종가가 NULL로 들어간 경우(또는 데이터가 없는 경우) 대비
  if (!objUtils.isFiniteNumber(idxStd) || Number(idxStd) <= 0) {
    idxStd = null;
    idxStdDate = pBfDate; // fallback: 전 영업일(추정)
  }

  pKrIdxData.INDEX_STD_PRICE = idxStd;
  pKrIdxData.INDEX_MDF_STD_PRICE = idxStd;
  etfBfDate = idxStdDate;

  let etfKspLvgIdxInfo = await objUtils.dbQuery(db,
      `SELECT * 
       FROM MARKET_SITE_ETF_STOCK_INFO
       WHERE ETF_STOCK_ID    = ?
       AND   ETF_SITE_ID     = 'NVR'
       AND   ETF_STOCK_DATE  = ? 
       LIMIT 1`, ['KSP_LVG',pToDate]          
  );                                  
                  
  // ETF Index 정보가 없는 경우
  if ((etfKspLvgIdxInfo || []).length == 0) {
    await  objUtils.dbQuery(db,`INSERT INTO MARKET_SITE_ETF_STOCK_INFO (
          ETF_STOCK_DATE, ETF_STOCK_ID, ETF_SITE_ID, ETF_SITE_NAME, ETF_STOCK_NAME, ETF_BF_STOCK_DATE, ETF_BEF_CLOSE_PRICE) 
          VALUES(?, ?, 'NVR', 'Naver Finance',?, ?, ?)`
        , [pToDate, 'KSP_LVG', 'KOSPI 레버리지', etfBfDate, kspEtfStdPrc]);
  }

  let etfKspI2XIdxInfo = await objUtils.dbQuery(db,
      `SELECT * 
       FROM MARKET_SITE_ETF_STOCK_INFO
       WHERE ETF_STOCK_ID    = ?
       AND   ETF_SITE_ID     = 'NVR'
       AND   ETF_STOCK_DATE  = ? 
       LIMIT 1`, ['KSP_I2X',pToDate]          
  );                                  
                  
  // ETF Index 정보가 없는 경우
  if ((etfKspI2XIdxInfo || []).length == 0) {
    await  objUtils.dbQuery(db,`INSERT INTO MARKET_SITE_ETF_STOCK_INFO (
        ETF_STOCK_DATE, ETF_STOCK_ID, ETF_SITE_ID, ETF_SITE_NAME, ETF_STOCK_NAME, ETF_BF_STOCK_DATE, ETF_BEF_CLOSE_PRICE) 
        VALUES(?, ?, 'NVR', 'Naver Finance',?, ?, ?)`
      , [pToDate, 'KSP_I2X', 'KOSPI 인버스2X', etfBfDate, kspEtfStdPrc]);
  }

  // 1) 조회할 기호들을 SERVICE_ITEM:CODE 형태로 나열
  const toDaySymbols = [
    'SERVICE_INDEX:KOSPI'
  ];

  //const url = 'https://polling.finance.naver.com/api/realtime.nhn';
  const url = 'https://polling.finance.naver.com/api/realtime';
  // items 배열을 comma로 합쳐서 query 파라미터로 넘깁니다.
  const params = { query: toDaySymbols.join('|') };

  const { data } = await axios.get(url, { params });
  let pKspLvgData = {},
      pKspI2XData = {};
  
  // data.result.areas 에 각 SERVICE_INDEX / SERVICE_ITEM 별 datas 배열이 들어있습니다.
  const all = data.result.areas.flatMap(area => area.datas).map(o => ({
    code:        o.cd,    // 'KOSPI' 혹은 '252710' 등
    open:        o.ov,    // 시가
    high:        o.hv,    // 고가
    low:         o.lv,    // 저가
    close:       o.nv,    // 현재가(장후엔 종가)
    prevClose:   o.pcv,   // 전일 종가
  }));
  console.log('all:',all[0]);
  // DB에서 기준가(전일 종가)를 못가져오면 Naver prevClose로 보정
  if (!objUtils.isFiniteNumber(pKrIdxData.INDEX_STD_PRICE) || Number(pKrIdxData.INDEX_STD_PRICE) <= 0) {
    const fallbackStd = Number(all[0].prevClose) / 100;
    if (objUtils.isFiniteNumber(fallbackStd) && fallbackStd > 0) {
      const v = fallbackStd.toFixed(2);
      pKrIdxData.INDEX_STD_PRICE = v;
      pKrIdxData.INDEX_MDF_STD_PRICE = v;
      etfBfDate = pBfDate;
      console.log('[fallback] INDEX_STD_PRICE from Naver prevClose:', v);
    } else {
      console.warn('[skip] INDEX_STD_PRICE missing -> skip AFTER_OPEN update');
      return;
    }
  }

  if(all.length > 0){
    //장 오픈 후 
    if(!pCloseFlag){
      pKrIdxData.INDEX_OPEN_PRICE = Number(all[0].open/100).toFixed(2);   
      pKrIdxData.INDEX_UD_RATE_REAL_BY_OPEN = objUtils.calcRateRoundedClose( Number(pKrIdxData.INDEX_OPEN_PRICE), Number(pKrIdxData.INDEX_STD_PRICE));

      pKspI2XData.ETF_BEF_CLOSE_PRICE = kspEtfStdPrc;
      pKspI2XData.ETF_UD_RATE_REAL_BY_OPEN = Number(pKrIdxData.INDEX_UD_RATE_REAL_BY_OPEN * -2).toFixed(2);
      pKspI2XData.ETF_OPEN_PRICE = kspEtfStdPrc + Number((kspEtfStdPrc *  Number(pKspI2XData.ETF_UD_RATE_REAL_BY_OPEN) * 0.01).toFixed(2));
      pKspI2XData.AFTER_ETF_OPEN_DO_YN = 'Y';
            
      pKspLvgData.ETF_BEF_CLOSE_PRICE = kspEtfStdPrc;
      pKspLvgData.ETF_UD_RATE_REAL_BY_OPEN = Number(pKrIdxData.INDEX_UD_RATE_REAL_BY_OPEN * 2).toFixed(2);
      pKspLvgData.ETF_OPEN_PRICE = kspEtfStdPrc + Number((kspEtfStdPrc *  Number(pKspLvgData.ETF_UD_RATE_REAL_BY_OPEN) * 0.01).toFixed(2));
      pKspLvgData.AFTER_ETF_OPEN_DO_YN = 'Y';
    //장 마감 후
    }else{
      pKrIdxData.INDEX_OPEN_PRICE = Number(all[0].open/100).toFixed(2);   
      pKrIdxData.INDEX_HIGH_PRICE = Number(all[0].high/100).toFixed(2);   
      pKrIdxData.INDEX_LOW_PRICE = Number(all[0].low/100).toFixed(2);   
      pKrIdxData.INDEX_END_PRICE = Number(all[0].close/100).toFixed(2);   
      pKrIdxData.INDEX_UD_RATE_REAL_BY_TODAY = objUtils.calcRateRoundedClose( Number(pKrIdxData.INDEX_END_PRICE), Number(pKrIdxData.INDEX_OPEN_PRICE));    
      let diffPrice = Number(pKrIdxData.INDEX_END_PRICE) - Number(pKrIdxData.INDEX_STD_PRICE);
      pKrIdxData.INDEX_UD_PRICE = diffPrice.toFixed(2);
      pKrIdxData.INDEX_UD_RATE_REAL_BY_OPEN = objUtils.calcRateRoundedClose( Number(pKrIdxData.INDEX_OPEN_PRICE), Number(pKrIdxData.INDEX_STD_PRICE));
      pKrIdxData.INDEX_UD_RATE_REAL_BY_HIGH = objUtils.calcRateRoundedClose( Number(pKrIdxData.INDEX_HIGH_PRICE), Number(pKrIdxData.INDEX_STD_PRICE));
      pKrIdxData.INDEX_UD_RATE_REAL_BY_LOW = objUtils.calcRateRoundedClose( Number(pKrIdxData.INDEX_LOW_PRICE), Number(pKrIdxData.INDEX_STD_PRICE));
      pKrIdxData.INDEX_UD_RATE_REAL_BY_CLOSE = objUtils.calcRateRoundedClose( Number(pKrIdxData.INDEX_END_PRICE), Number(pKrIdxData.INDEX_STD_PRICE));      

      pKspI2XData.ETF_UD_RATE_REAL_BY_OPEN = Number(pKrIdxData.INDEX_UD_RATE_REAL_BY_OPEN * -2).toFixed(2);
      pKspI2XData.ETF_UD_RATE_REAL_BY_HIGH = Number(pKrIdxData.INDEX_UD_RATE_REAL_BY_HIGH * -2).toFixed(2);
      pKspI2XData.ETF_UD_RATE_REAL_BY_LOW = Number(pKrIdxData.INDEX_UD_RATE_REAL_BY_LOW * -2).toFixed(2);
      pKspI2XData.ETF_UD_RATE_REAL_BY_CLOSE = Number(pKrIdxData.INDEX_UD_RATE_REAL_BY_CLOSE * -2).toFixed(2);
      pKspI2XData.ETF_BEF_CLOSE_PRICE = kspEtfStdPrc;
      pKspI2XData.ETF_OPEN_PRICE = kspEtfStdPrc + Number((kspEtfStdPrc *  Number(pKspI2XData.ETF_UD_RATE_REAL_BY_OPEN) * 0.01).toFixed(2));
      pKspI2XData.ETF_HIGH_PRICE = kspEtfStdPrc + Number((kspEtfStdPrc *  Number(pKspI2XData.ETF_UD_RATE_REAL_BY_HIGH) * 0.01).toFixed(2));
      pKspI2XData.ETF_LOW_PRICE = kspEtfStdPrc + Number((kspEtfStdPrc *  Number(pKspI2XData.ETF_UD_RATE_REAL_BY_LOW) * 0.01).toFixed(2));
      pKspI2XData.ETF_CLOSE_PRICE = kspEtfStdPrc + Number((kspEtfStdPrc *  Number(pKspI2XData.ETF_UD_RATE_REAL_BY_CLOSE) * 0.01).toFixed(2));                  
      let diffI2XPrice = Number(pKspI2XData.ETF_CLOSE_PRICE) - Number(pKspI2XData.ETF_OPEN_PRICE);
      pKspI2XData.ETF_TODAY_DIFF_PRICE = diffI2XPrice.toFixed(2);
      pKspI2XData.ETF_UD_RATE_REAL_BY_TODAY = objUtils.calcRateRoundedClose( Number(pKspI2XData.ETF_CLOSE_PRICE), Number(pKspI2XData.ETF_OPEN_PRICE));
      pKspI2XData.CLOSE_ETF_OPEN_DO_YN = 'Y';

      pKspLvgData.ETF_UD_RATE_REAL_BY_OPEN = Number(pKrIdxData.INDEX_UD_RATE_REAL_BY_OPEN * 2).toFixed(2);
      pKspLvgData.ETF_UD_RATE_REAL_BY_HIGH = Number(pKrIdxData.INDEX_UD_RATE_REAL_BY_HIGH * 2).toFixed(2);
      pKspLvgData.ETF_UD_RATE_REAL_BY_LOW = Number(pKrIdxData.INDEX_UD_RATE_REAL_BY_LOW * 2).toFixed(2);
      pKspLvgData.ETF_UD_RATE_REAL_BY_CLOSE = Number(pKrIdxData.INDEX_UD_RATE_REAL_BY_CLOSE * 2).toFixed(2);
      pKspLvgData.ETF_BEF_CLOSE_PRICE = kspEtfStdPrc;
      pKspLvgData.ETF_OPEN_PRICE = kspEtfStdPrc + Number((kspEtfStdPrc *  Number(pKspLvgData.ETF_UD_RATE_REAL_BY_OPEN) * 0.01).toFixed(2));
      pKspLvgData.ETF_HIGH_PRICE = kspEtfStdPrc + Number((kspEtfStdPrc *  Number(pKspLvgData.ETF_UD_RATE_REAL_BY_HIGH) * 0.01).toFixed(2));
      pKspLvgData.ETF_LOW_PRICE = kspEtfStdPrc + Number((kspEtfStdPrc *  Number(pKspLvgData.ETF_UD_RATE_REAL_BY_LOW) * 0.01).toFixed(2));
      pKspLvgData.ETF_CLOSE_PRICE = kspEtfStdPrc + Number((kspEtfStdPrc *  Number(pKspLvgData.ETF_UD_RATE_REAL_BY_CLOSE) * 0.01).toFixed(2));                  
      let diffLvgPrice = Number(pKspLvgData.ETF_CLOSE_PRICE) - Number(pKspLvgData.ETF_OPEN_PRICE);
      pKspLvgData.ETF_TODAY_DIFF_PRICE = diffLvgPrice.toFixed(2);
      pKspLvgData.ETF_UD_RATE_REAL_BY_TODAY = objUtils.calcRateRoundedClose( Number(pKspLvgData.ETF_CLOSE_PRICE), Number(pKspLvgData.ETF_OPEN_PRICE));                                            
      pKspLvgData.CLOSE_ETF_OPEN_DO_YN = 'Y';
    }
    
  }else{
    console.warn(`[Kospi] ${pToDate} 데이터 없음`);            
    return;
  }
  
  // DB UPDATE 직전 Infinity/NaN 방지
  pKspLvgData = objUtils.sanitizeDbObject(pKspLvgData);
  pKspI2XData = objUtils.sanitizeDbObject(pKspI2XData);
  pKrIdxData  = objUtils.sanitizeDbObject(pKrIdxData);

  if(Object.keys(pKspLvgData).length !== 0){
    await objUtils.dbQuery(db,
      `UPDATE MARKET_SITE_ETF_STOCK_INFO 
       SET ?, updated_at  = NOW()
       WHERE ETF_STOCK_ID      = ?
       AND   ETF_SITE_ID = 'NVR'              
       AND   ETF_STOCK_DATE    = ?`,
        [ pKspLvgData, 'KSP_LVG', pToDate]);
    }

  if(Object.keys(pKspI2XData).length !== 0){
    await objUtils.dbQuery(db,
      `UPDATE MARKET_SITE_ETF_STOCK_INFO 
       SET ?, updated_at  = NOW()
       WHERE ETF_STOCK_ID      = ?
       AND   ETF_SITE_ID = 'NVR'              
       AND   ETF_STOCK_DATE    = ?`,
        [ pKspI2XData, 'KSP_I2X', pToDate]);
  }          

  if(Object.keys(pKrIdxData).length !== 0){
    await objUtils.dbQuery(db,
      `UPDATE MARKETS_WORLD_INDICES_INFO 
      SET ?, updated_at  = NOW()
      WHERE INDEX_ID      = ?
      AND   INDEX_SITE_ID = 'NVR'              
      AND   INDEX_DATE    = ?`,
        [ pKrIdxData, 'KSP', pToDate]);
  }

  resultToAll.push({ status: 'fulfilled', value: { name: 'KSP', pKrIdxData } });        

  await objUtils.sleep(5000 + Math.floor(Math.random() * 5000));

  const toDayEtfsSymbols = {       
    'TGR_I2X': '252710',
    'TGR_LVG': '267770',
    'KSF_I2X': '253230',
    'KSF_LVG': '253250',
    'KDX_I2X': '252670',
    'KDX_LVG': '122630',
    'KBS_I2X': '252420',
    'KBS_LVG': '252400',
    'PLS_I2X': '253160',
    'PLS_LVG': '253150',      
  };

  const toDayEtfNames = {       
    'TGR_I2X': 'TIGER 200선물 인버스2X',
    'TGR_LVG': 'TIGER 200선물 레버리지',
    'KSF_I2X': 'KIWOOM 200선물인버스2X',
    'KSF_LVG': 'KIWOOM 200선물레버리지',
    'KDX_I2X': 'KODEX 200선물 인버스2X',
    'KDX_LVG': 'KODEX 레버리지',
    'KBS_I2X': 'RISE 200선물인버스2X',
    'KBS_LVG': 'RISE 200선물레버리지',
    'PLS_I2X': 'PLUS 200선물인버스2X',
    'PLS_LVG': 'PLUS 200선물 레버리지',      
  };
  
  const entries = Object.entries(toDayEtfsSymbols);  
  for (const [sName, symbol] of entries) {
    const pollingUrl = `https://polling.finance.naver.com/api/realtime?query=SERVICE_ITEM:${symbol}`;

    try {
      openFlag = false;
      closeFlag = false;
      pKrEtfData = {};
      const { data } = await axios.get(pollingUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
        
      });      
      const resultData = data.result.areas.flatMap(area => area.datas).map(o => ({
        code:        o.cd,    // 'KOSPI' 혹은 '252710' 등
        open:        o.ov,    // 시가
        high:        o.hv,    // 고가
        low:         o.lv,    // 저가
        close:       o.nv,    // 현재가(장후엔 종가)
        prevClose:   o.pcv,   // 전일 종가
      }));      

      //console.log('symbl:', symbol);
      //console.log('resultData:', resultData);

      const etfIdxInfo = await objUtils.dbQuery(db,
              `SELECT * 
              FROM MARKET_SITE_ETF_STOCK_INFO
              WHERE ETF_STOCK_ID    = ?
              AND   ETF_SITE_ID     = 'NVR'
              AND   ETF_STOCK_DATE  = ? 
              LIMIT 1`, [sName,pToDate]          
        );                                  
                
        // ETF Index 정보가 없는 경우
        if ((etfIdxInfo || []).length == 0) {
          await  objUtils.dbQuery(db,`INSERT INTO MARKET_SITE_ETF_STOCK_INFO (
                ETF_STOCK_DATE, ETF_STOCK_ID, ETF_SITE_ID, ETF_SITE_NAME, ETF_STOCK_NAME, ETF_BF_STOCK_DATE) 
                VALUES(?, ?, 'NVR', 'Naver Finance',?, ?)`
              , [pToDate, sName, toDayEtfNames[sName], etfBfDate]);
        }

        //장 마감 후 
        if(pCloseFlag){            
          pKrEtfData.ETF_BEF_CLOSE_PRICE = Number(objUtils.cleanNumber(resultData[0].prevClose)); 
          pKrEtfData.ETF_OPEN_PRICE = Number(objUtils.cleanNumber(resultData[0].open));  
          pKrEtfData.ETF_HIGH_PRICE = Number(objUtils.cleanNumber(resultData[0].high));
          pKrEtfData.ETF_LOW_PRICE = Number(objUtils.cleanNumber(resultData[0].low));                        
          pKrEtfData.ETF_CLOSE_PRICE = Number(objUtils.cleanNumber(resultData[0].close));

          closeFlag = true;
        //장 오픈 후 
        }else{
          pKrEtfData.ETF_BEF_CLOSE_PRICE = Number(objUtils.cleanNumber(resultData[0].prevClose)); 
          pKrEtfData.ETF_OPEN_PRICE = Number(objUtils.cleanNumber(resultData[0].open));  
          openFlag = true;
        }     
          
        if(closeFlag){                    
          pKrEtfData.ETF_UD_RATE_REAL_BY_OPEN = objUtils.calcRateRoundedClose( Number(pKrEtfData.ETF_OPEN_PRICE), Number(pKrEtfData.ETF_BEF_CLOSE_PRICE));
          pKrEtfData.ETF_UD_RATE_REAL_BY_HIGH = objUtils.calcRateRoundedClose( Number(pKrEtfData.ETF_HIGH_PRICE), Number(pKrEtfData.ETF_BEF_CLOSE_PRICE));
          pKrEtfData.ETF_UD_RATE_REAL_BY_LOW = objUtils.calcRateRoundedClose( Number(pKrEtfData.ETF_LOW_PRICE), Number(pKrEtfData.ETF_BEF_CLOSE_PRICE));
          pKrEtfData.ETF_STOCK_NAME  = toDayEtfNames[sName];
          pKrEtfData.ETF_BF_STOCK_DATE = etfBfDate;
          
          if(pKrEtfData.hasOwnProperty('ETF_CLOSE_PRICE')){             
            let diffPrice = Number(pKrEtfData.ETF_CLOSE_PRICE) - Number(pKrEtfData.ETF_BEF_CLOSE_PRICE);
            pKrEtfData.ETF_TODAY_DIFF_PRICE = diffPrice.toFixed(2);
            pKrEtfData.ETF_UD_RATE_REAL_BY_TODAY = objUtils.calcRateRoundedClose( Number(pKrEtfData.ETF_CLOSE_PRICE), Number(pKrEtfData.ETF_OPEN_PRICE));
            pKrEtfData.ETF_UD_RATE_REAL_BY_CLOSE = objUtils.calcRateRoundedClose( Number(pKrEtfData.ETF_CLOSE_PRICE), Number(pKrEtfData.ETF_BEF_CLOSE_PRICE));
          }
        }else if(openFlag){
          pKrEtfData.ETF_UD_RATE_REAL_BY_OPEN = objUtils.calcRateRoundedClose( Number(pKrEtfData.ETF_OPEN_PRICE), Number(pKrEtfData.ETF_BEF_CLOSE_PRICE));
        }

        //console.log('pKrEtfData:', pKrEtfData);

        if(Object.keys(pKrEtfData).length !== 0){
          await objUtils.dbQuery(db,
            `UPDATE MARKET_SITE_ETF_STOCK_INFO 
            SET ?, updated_at  = NOW()
            WHERE ETF_STOCK_ID      = ?
            AND   ETF_SITE_ID = 'NVR'              
            AND   ETF_STOCK_DATE    = ?`,
              [ pKrEtfData, sName, pToDate]);
        }

        await objUtils.sleep(5000 + Math.floor(Math.random() * 5000));


      //console.log('resultData~:', resultData[0]);
    } catch (err) {
      console.warn(`⚠️ Polling API 실패 (${symbol}): ${err.message}`);
      return null;
    }
  }    

  /*const entries = Object.entries(toDayEtfsSymbols);  
  for (const [sName, symbol] of entries) {
      openFlag = false;
      closeFlag = false;
      pKrEtfData = {};
      try {        
        const etfIdxInfo = await objUtils.dbQuery(db,
              `SELECT * 
              FROM MARKET_SITE_ETF_STOCK_INFO
              WHERE ETF_STOCK_ID    = ?
              AND   ETF_SITE_ID     = 'NVR'
              AND   ETF_STOCK_DATE  = ? 
              LIMIT 1`, [sName,pToDate]          
        );                                  
                
        // ETF Index 정보가 없는 경우
        if ((etfIdxInfo || []).length == 0) {
          await  objUtils.dbQuery(db,`INSERT INTO MARKET_SITE_ETF_STOCK_INFO (
                ETF_STOCK_DATE, ETF_STOCK_ID, ETF_SITE_ID, ETF_SITE_NAME, ETF_STOCK_NAME, ETF_BF_STOCK_DATE) 
                VALUES(?, ?, 'NVR', 'Naver Finance',?, ?)`
              , [pToDate, sName, toDayEtfNames[sName], etfBfDate]);
        }
        await objUtils.sleep(5000 + Math.floor(Math.random() * 5000));
        //const url = `https://api.finance.naver.com/service/itemSummary.naver?symbol=${symbol}`;
         const url = `https://m.stock.naver.com/api/stock/${symbol}/integration`;
        const  {data}  = await axios.get(url);
        console.log('symbol:', symbol);
        console.log('dataAll:', data);
        console.log('data:', data.totalInfos);
        for( item of data.totalInfos){
          //장 마감 후 
          if(pCloseFlag){
            if( item.code === 'lastClosePrice'){            
              pKrEtfData.ETF_BEF_CLOSE_PRICE = Number(objUtils.cleanNumber(item.value));
            }else if( item.code === 'openPrice'){
              pKrEtfData.ETF_OPEN_PRICE = Number(objUtils.cleanNumber(item.value));
            }else if( item.code === 'highPrice'){
              pKrEtfData.ETF_HIGH_PRICE = Number(objUtils.cleanNumber(item.value));
            }else if( item.code === 'lowPrice'){
              pKrEtfData.ETF_LOW_PRICE = Number(objUtils.cleanNumber(item.value));
            }

            closeFlag = true;
          //장 오픈 후 
          }else{
            if( item.code === 'lastClosePrice'){            
              pKrEtfData.ETF_BEF_CLOSE_PRICE = Number(objUtils.cleanNumber(item.value));
            }else if( item.code === 'openPrice'){
              pKrEtfData.ETF_OPEN_PRICE = Number(objUtils.cleanNumber(item.value));
            }
            openFlag = true;
          }          
        }

        for( item of data.dealTrendInfos){
          //장 마감 후 
          if(pCloseFlag){
            if( item.bizdate === mdfTodate){            
              pKrEtfData.ETF_CLOSE_PRICE = Number(objUtils.cleanNumber(item.closePrice));              
            }
          }          
        }


        if(closeFlag){                    
          pKrEtfData.ETF_UD_RATE_REAL_BY_OPEN = objUtils.calcRateRoundedClose( Number(pKrEtfData.ETF_OPEN_PRICE), Number(pKrEtfData.ETF_BEF_CLOSE_PRICE));
          pKrEtfData.ETF_UD_RATE_REAL_BY_HIGH = objUtils.calcRateRoundedClose( Number(pKrEtfData.ETF_HIGH_PRICE), Number(pKrEtfData.ETF_BEF_CLOSE_PRICE));
          pKrEtfData.ETF_UD_RATE_REAL_BY_LOW = objUtils.calcRateRoundedClose( Number(pKrEtfData.ETF_LOW_PRICE), Number(pKrEtfData.ETF_BEF_CLOSE_PRICE));
          pKrEtfData.ETF_STOCK_NAME  = toDayEtfNames[sName];
          pKrEtfData.ETF_BF_STOCK_DATE = etfBfDate;
          
          if(pKrEtfData.hasOwnProperty('ETF_CLOSE_PRICE')){             
            let diffPrice = Number(pKrEtfData.ETF_CLOSE_PRICE) - Number(pKrEtfData.ETF_BEF_CLOSE_PRICE);
            pKrEtfData.ETF_TODAY_DIFF_PRICE = diffPrice.toFixed(2);
            pKrEtfData.ETF_UD_RATE_REAL_BY_TODAY = objUtils.calcRateRoundedClose( Number(pKrEtfData.ETF_CLOSE_PRICE), Number(pKrEtfData.ETF_OPEN_PRICE));
            pKrEtfData.ETF_UD_RATE_REAL_BY_CLOSE = objUtils.calcRateRoundedClose( Number(pKrEtfData.ETF_CLOSE_PRICE), Number(pKrEtfData.ETF_BEF_CLOSE_PRICE));
          }
        }else if(openFlag){
          pKrEtfData.ETF_UD_RATE_REAL_BY_OPEN = objUtils.calcRateRoundedClose( Number(pKrEtfData.ETF_OPEN_PRICE), Number(pKrEtfData.ETF_BEF_CLOSE_PRICE));
        }

        console.log('pKrEtfData:', pKrEtfData);

        if(Object.keys(pKrEtfData).length !== 0){
          await objUtils.dbQuery(db,
            `UPDATE MARKET_SITE_ETF_STOCK_INFO 
            SET ?, updated_at  = NOW()
            WHERE ETF_STOCK_ID      = ?
            AND   ETF_SITE_ID = 'NVR'              
            AND   ETF_STOCK_DATE    = ?`,
              [ pKrEtfData, sName, pToDate]);
        }
        
      }catch(reason){
        console.log('err:', reason);
      }
  }*/
}

async function fetchIndicesYahooData( pToDate, pBfDate, pXBfDate, pUsHolyFlag, pKrHolyFlag, pCloseFlag) {
  let   pKrIdxData = {},
        pKrEtfData = {},
        mdfTodate = pToDate.replace(/-/g, ''),
        openFlag = false,
        closeFlag = false,
        etfBfDate;
  
    console.log('fetchIndicesYahooData333 시작!!');
    pUsHolyFlag = pUsHolyFlag ?? 'N';
    pKrHolyFlag = pKrHolyFlag ?? 'N';

    const toDaySymbols = {       
        //'KSP'    : '^KS11',    
        'TGR_I2X': '252710.KS',
        'TGR_LVG': '267770.KS',
        'KSF_I2X': '253230.KS',
        'KSF_LVG': '253250.KS',
        'KDX_I2X': '252670.KS',
        'KDX_LVG': '122630.KS',
        'KBS_I2X': '252420.KS',
        'KBS_LVG': '252400.KS',
        'PLS_I2X': '253160.KS',
        'PLS_LVG': '253150.KS',      
    };

    const toDayEtfNames = {  
      'TGR_I2X': 'TIGER 200선물 인버스2X',
      'TGR_LVG': 'TIGER 200선물 레버리지',
      'KSF_I2X': 'KIWOOM 200선물인버스2X',
      'KSF_LVG': 'KIWOOM 200선물레버리지',
      'KDX_I2X': 'KODEX 200선물 인버스2X',
      'KDX_LVG': 'KODEX 레버리지',
      'KBS_I2X': 'RISE 200선물인버스2X',
      'KBS_LVG': 'RISE 200선물레버리지',
      'PLS_I2X': 'PLUS 200선물인버스2X',
      'PLS_LVG': 'PLUS 200선물 레버리지',      
    };        

    const indicesBfDate = await objUtils.dbQuery(db,
      `SELECT INDEX_DATE 
       FROM MARKETS_WORLD_INDICES_INFO
       WHERE INDEX_ID      = ?
       AND   INDEX_SITE_ID = 'YHF'
       AND   KR_HOLYDAY_YN != 'Y'
       AND   INDEX_DATE    < ? 
       ORDER BY INDEX_DATE DESC
       LIMIT 1`, ['KSP',pToDate]
    );                                  

    console.log('indicesBfDate:', indicesBfDate);
    etfBfDate = indicesBfDate[0].INDEX_DATE;
    //const resultData = await yahooFinance.quote(symbol);    
    /*
    const priceChart = await yahooFinance.chart('^KS11', {      
      period1: pBfDate,
      period2: pToDate,
      interval: '1d',
    });
    */
    const resultKspData = await yahooFinance.quote('^KS11');    
        
        if (!resultKspData) {
            console.warn(`[KOSPI] 데이터 없음`);        
            return;
        }                
                        
          let pKspLvgData = {},
              pKspI2XData = {},
              kspEtfStdPrc = 1000;
          const krIdxInfo = await objUtils.dbQuery(db,
            `SELECT * 
            FROM MARKETS_WORLD_INDICES_INFO
            WHERE INDEX_ID      = ?
            AND   INDEX_SITE_ID = 'YHF'
            AND   INDEX_DATE    = ? 
            LIMIT 1`, ['KSP',pToDate]          
          );                                  
                          
          // KR Index 정보가 없는 경우(종가용)
          if ((krIdxInfo || []).length == 0) {
            await  objUtils.dbQuery(db,`INSERT INTO MARKETS_WORLD_INDICES_INFO (
                  INDEX_DATE, INDEX_ID, INDEX_SITE_ID, INDEX_SITE_NAME, KSP_STOCK_DATE, US_HOLYDAY_YN, KR_HOLYDAY_YN) 
                  VALUES(?, ?, 'YHF', 'Yahoo Finance', ?, ?, ?)`
                , [pToDate, 'KSP', pToDate, pUsHolyFlag, pKrHolyFlag]);
          }       

          let etfKspLvgIdxInfo = await objUtils.dbQuery(db,
                `SELECT * 
                FROM MARKET_SITE_ETF_STOCK_INFO
                WHERE ETF_STOCK_ID    = ?
                AND   ETF_SITE_ID     = 'YHF'
                AND   ETF_STOCK_DATE  = ? 
                LIMIT 1`, ['KSP_LVG',pToDate]          
          );                                  
                  
          // ETF Index 정보가 없는 경우
          if ((etfKspLvgIdxInfo || []).length == 0) {
            await  objUtils.dbQuery(db,`INSERT INTO MARKET_SITE_ETF_STOCK_INFO (
                  ETF_STOCK_DATE, ETF_STOCK_ID, ETF_SITE_ID, ETF_SITE_NAME, ETF_STOCK_NAME, ETF_BF_STOCK_DATE, ETF_BEF_CLOSE_PRICE) 
                  VALUES(?, ?, 'YHF', 'Yahoo Finance',?, ?, ?)`
                , [pToDate, 'KSP_LVG', 'KOSPI 레버리지', etfBfDate, kspEtfStdPrc]);
          }

          let etfKspI2XIdxInfo = await objUtils.dbQuery(db,
                `SELECT * 
                FROM MARKET_SITE_ETF_STOCK_INFO
                WHERE ETF_STOCK_ID    = ?
                AND   ETF_SITE_ID     = 'YHF'
                AND   ETF_STOCK_DATE  = ? 
                LIMIT 1`, ['KSP_I2X',pToDate]          
          );                                  
                  
          // ETF Index 정보가 없는 경우
          if ((etfKspI2XIdxInfo || []).length == 0) {
            await  objUtils.dbQuery(db,`INSERT INTO MARKET_SITE_ETF_STOCK_INFO (
                  ETF_STOCK_DATE, ETF_STOCK_ID, ETF_SITE_ID, ETF_SITE_NAME, ETF_STOCK_NAME, ETF_BF_STOCK_DATE, ETF_BEF_CLOSE_PRICE) 
                  VALUES(?, ?, 'YHF', 'Yahoo Finance',?, ?, ?)`
                , [pToDate, 'KSP_I2X', 'KOSPI 인버스2X', etfBfDate, kspEtfStdPrc]);
          }

          
          //장 마감 후 
          if(pCloseFlag){
            pKrIdxData.INDEX_STD_PRICE  = Number(resultKspData.regularMarketPreviousClose).toFixed(2);
            pKrIdxData.INDEX_MDF_STD_PRICE  = Number(resultKspData.regularMarketPreviousClose).toFixed(2);
            pKrIdxData.INDEX_OPEN_PRICE = Number(resultKspData.regularMarketOpen).toFixed(2);            
            pKrIdxData.INDEX_HIGH_PRICE  = Number(resultKspData.regularMarketDayHigh).toFixed(2);
            pKrIdxData.INDEX_LOW_PRICE  = Number(resultKspData.regularMarketDayLow).toFixed(2);
            pKrIdxData.INDEX_END_PRICE  = Number(resultKspData.regularMarketPrice).toFixed(2);            
            
            pKrIdxData.INDEX_UD_RATE_REAL_BY_TODAY = objUtils.calcRateRoundedClose( Number(pKrIdxData.INDEX_END_PRICE), Number(pKrIdxData.INDEX_OPEN_PRICE));            
            let diffPrice = Number(pKrIdxData.INDEX_END_PRICE) - Number(pKrIdxData.INDEX_STD_PRICE);
            pKrIdxData.INDEX_UD_PRICE = diffPrice.toFixed(2);
            pKrIdxData.INDEX_UD_RATE_REAL_BY_OPEN = objUtils.calcRateRoundedClose( Number(pKrIdxData.INDEX_OPEN_PRICE), Number(pKrIdxData.INDEX_STD_PRICE));
            pKrIdxData.INDEX_UD_RATE_REAL_BY_HIGH = objUtils.calcRateRoundedClose( Number(pKrIdxData.INDEX_HIGH_PRICE), Number(pKrIdxData.INDEX_STD_PRICE));
            pKrIdxData.INDEX_UD_RATE_REAL_BY_LOW = objUtils.calcRateRoundedClose( Number(pKrIdxData.INDEX_LOW_PRICE), Number(pKrIdxData.INDEX_STD_PRICE));
            pKrIdxData.INDEX_UD_RATE_REAL_BY_CLOSE = objUtils.calcRateRoundedClose( Number(pKrIdxData.INDEX_END_PRICE), Number(pKrIdxData.INDEX_STD_PRICE));

            pKspI2XData.ETF_UD_RATE_REAL_BY_OPEN = Number(pKrIdxData.INDEX_UD_RATE_REAL_BY_OPEN * -2).toFixed(2);
            pKspI2XData.ETF_UD_RATE_REAL_BY_HIGH = Number(pKrIdxData.INDEX_UD_RATE_REAL_BY_HIGH * -2).toFixed(2);
            pKspI2XData.ETF_UD_RATE_REAL_BY_LOW = Number(pKrIdxData.INDEX_UD_RATE_REAL_BY_LOW * -2).toFixed(2);
            pKspI2XData.ETF_UD_RATE_REAL_BY_CLOSE = Number(pKrIdxData.INDEX_UD_RATE_REAL_BY_CLOSE * -2).toFixed(2);
            pKspI2XData.ETF_BEF_CLOSE_PRICE = kspEtfStdPrc;
            pKspI2XData.ETF_OPEN_PRICE = kspEtfStdPrc + Number((kspEtfStdPrc *  Number(pKspI2XData.ETF_UD_RATE_REAL_BY_OPEN) * 0.01).toFixed(2));
            pKspI2XData.ETF_HIGH_PRICE = kspEtfStdPrc + Number((kspEtfStdPrc *  Number(pKspI2XData.ETF_UD_RATE_REAL_BY_HIGH) * 0.01).toFixed(2));
            pKspI2XData.ETF_LOW_PRICE = kspEtfStdPrc + Number((kspEtfStdPrc *  Number(pKspI2XData.ETF_UD_RATE_REAL_BY_LOW) * 0.01).toFixed(2));
            pKspI2XData.ETF_CLOSE_PRICE = kspEtfStdPrc + Number((kspEtfStdPrc *  Number(pKspI2XData.ETF_UD_RATE_REAL_BY_CLOSE) * 0.01).toFixed(2));                         
            let diffI2XPrice = Number(pKspI2XData.ETF_CLOSE_PRICE) - Number(pKspI2XData.ETF_OPEN_PRICE);
            pKspI2XData.ETF_TODAY_DIFF_PRICE = diffI2XPrice.toFixed(2);
            pKspI2XData.ETF_UD_RATE_REAL_BY_TODAY = objUtils.calcRateRoundedClose( Number(pKspI2XData.ETF_CLOSE_PRICE), Number(pKspI2XData.ETF_OPEN_PRICE));
            pKspI2XData.CLOSE_ETF_OPEN_DO_YN = 'Y';

            pKspLvgData.ETF_UD_RATE_REAL_BY_OPEN = Number(pKrIdxData.INDEX_UD_RATE_REAL_BY_OPEN * 2).toFixed(2);
            pKspLvgData.ETF_UD_RATE_REAL_BY_HIGH = Number(pKrIdxData.INDEX_UD_RATE_REAL_BY_HIGH * 2).toFixed(2);
            pKspLvgData.ETF_UD_RATE_REAL_BY_LOW = Number(pKrIdxData.INDEX_UD_RATE_REAL_BY_LOW * 2).toFixed(2);
            pKspLvgData.ETF_UD_RATE_REAL_BY_CLOSE = Number(pKrIdxData.INDEX_UD_RATE_REAL_BY_CLOSE * 2).toFixed(2);
            pKspLvgData.ETF_BEF_CLOSE_PRICE = kspEtfStdPrc;
            pKspLvgData.ETF_OPEN_PRICE = kspEtfStdPrc + Number((kspEtfStdPrc *  Number(pKspLvgData.ETF_UD_RATE_REAL_BY_OPEN) * 0.01).toFixed(2));
            pKspLvgData.ETF_HIGH_PRICE = kspEtfStdPrc + Number((kspEtfStdPrc *  Number(pKspLvgData.ETF_UD_RATE_REAL_BY_HIGH) * 0.01).toFixed(2));
            pKspLvgData.ETF_LOW_PRICE = kspEtfStdPrc + Number((kspEtfStdPrc *  Number(pKspLvgData.ETF_UD_RATE_REAL_BY_LOW) * 0.01).toFixed(2));
            pKspLvgData.ETF_CLOSE_PRICE = kspEtfStdPrc + Number((kspEtfStdPrc *  Number(pKspLvgData.ETF_UD_RATE_REAL_BY_CLOSE) * 0.01).toFixed(2));                        
            let diffLvgPrice = Number(pKspLvgData.ETF_CLOSE_PRICE) - Number(pKspLvgData.ETF_OPEN_PRICE)
            pKspLvgData.ETF_TODAY_DIFF_PRICE = diffLvgPrice.toFixed(2);
            pKspLvgData.ETF_UD_RATE_REAL_BY_TODAY = objUtils.calcRateRoundedClose( Number(pKspLvgData.ETF_CLOSE_PRICE), Number(pKspLvgData.ETF_OPEN_PRICE));                                            
            pKspLvgData.CLOSE_ETF_OPEN_DO_YN = 'Y';
          //장 마감 전           
          }else{
            pKrIdxData.INDEX_STD_PRICE  = Number(resultKspData.regularMarketPreviousClose).toFixed(2);
            pKrIdxData.INDEX_MDF_STD_PRICE  = Number(resultKspData.regularMarketPreviousClose).toFixed(2);
            pKrIdxData.INDEX_OPEN_PRICE = Number(resultKspData.regularMarketOpen).toFixed(2);
            pKrIdxData.INDEX_UD_RATE_REAL_BY_OPEN = objUtils.calcRateRoundedClose( Number(pKrIdxData.INDEX_OPEN_PRICE), Number(pKrIdxData.INDEX_STD_PRICE));                        
            
            pKspI2XData.ETF_BEF_CLOSE_PRICE = kspEtfStdPrc;
            pKspI2XData.ETF_UD_RATE_REAL_BY_OPEN = Number(pKrIdxData.INDEX_UD_RATE_REAL_BY_OPEN * -2).toFixed(2);
            pKspI2XData.ETF_OPEN_PRICE = kspEtfStdPrc + Number((kspEtfStdPrc *  Number(pKspI2XData.ETF_UD_RATE_REAL_BY_OPEN) * 0.01).toFixed(2));
            pKspI2XData.AFTER_ETF_OPEN_DO_YN = 'Y';
            
            pKspLvgData.ETF_BEF_CLOSE_PRICE = kspEtfStdPrc;
            pKspLvgData.ETF_UD_RATE_REAL_BY_OPEN = Number(pKrIdxData.INDEX_UD_RATE_REAL_BY_OPEN * 2).toFixed(2);
            pKspLvgData.ETF_OPEN_PRICE = kspEtfStdPrc + Number((kspEtfStdPrc *  Number(pKspLvgData.ETF_UD_RATE_REAL_BY_OPEN) * 0.01).toFixed(2));
            pKspLvgData.AFTER_ETF_OPEN_DO_YN = 'Y';
                                            
          } 

          if(Object.keys(pKspLvgData).length !== 0){
              await objUtils.dbQuery(db,
                `UPDATE MARKET_SITE_ETF_STOCK_INFO 
                SET ?, updated_at  = NOW()
                WHERE ETF_STOCK_ID      = ?
                AND   ETF_SITE_ID = 'YHF'              
                AND   ETF_STOCK_DATE    = ?`,
                  [ pKspLvgData, 'KSP_LVG', pToDate]);
          }

          if(Object.keys(pKspI2XData).length !== 0){
              await objUtils.dbQuery(db,
                `UPDATE MARKET_SITE_ETF_STOCK_INFO 
                SET ?, updated_at  = NOW()
                WHERE ETF_STOCK_ID      = ?
                AND   ETF_SITE_ID = 'YHF'              
                AND   ETF_STOCK_DATE    = ?`,
                  [ pKspI2XData, 'KSP_I2X', pToDate]);
          }          
          
          if(Object.keys(pKrIdxData).length !== 0){
              await objUtils.dbQuery(db,
                `UPDATE MARKETS_WORLD_INDICES_INFO 
                SET ?, updated_at  = NOW()
                WHERE INDEX_ID      = ?
                AND   INDEX_SITE_ID = 'YHF'              
                AND   INDEX_DATE    = ?`,
                  [ pKrIdxData, 'KSP', pToDate]);          
    }

    await objUtils.sleep(5000 + Math.floor(Math.random() * 5000));
                      
    const resultToAll = await Promise.allSettled(Object.entries(toDaySymbols).map(async ([sName, symbol]) => {
      
      try {
                                    
        const indicesBfDate = await objUtils.dbQuery(db,
              `SELECT INDEX_DATE 
              FROM MARKETS_WORLD_INDICES_INFO
              WHERE INDEX_ID      = ?
              AND   INDEX_SITE_ID = 'YHF'
              AND   KR_HOLYDAY_YN != 'Y'
              AND   INDEX_DATE    < ? 
              ORDER BY INDEX_DATE DESC
              LIMIT 1`, ['KSP',pToDate]
        );                                  

        console.log('indicesBfDate:', indicesBfDate);
        etfBfDate = indicesBfDate[0].INDEX_DATE;
        //const resultData = await yahooFinance.quote(symbol);
        const resultEtfData = await yahooFinance.quoteSummary(symbol);
        
        if (!resultEtfData.price) {
            console.warn(`[${sName}] 데이터 없음`);        
            return;
        }
        
        console.log(`[${sName}]`,resultEtfData.price);
                
        
          pKrEtfData = {};
          const etfIdxInfo = await objUtils.dbQuery(db,
                `SELECT * 
                FROM MARKET_SITE_ETF_STOCK_INFO
                WHERE ETF_STOCK_ID    = ?
                AND   ETF_SITE_ID     = 'YHF'
                AND   ETF_STOCK_DATE  = ? 
                LIMIT 1`, [sName,pToDate]          
          );                                  
                  
          // ETF Index 정보가 없는 경우
          if ((etfIdxInfo || []).length == 0) {
            await  objUtils.dbQuery(db,`INSERT INTO MARKET_SITE_ETF_STOCK_INFO (
                  ETF_STOCK_DATE, ETF_STOCK_ID, ETF_SITE_ID, ETF_SITE_NAME, ETF_STOCK_NAME, ETF_BF_STOCK_DATE) 
                  VALUES(?, ?, 'YHF', 'Yahoo Finance',?, ?)`
                , [pToDate, sName, toDayEtfNames[sName], etfBfDate]);
          }
             //장 마감 후 
          if(pCloseFlag){
            pKrEtfData.ETF_BEF_CLOSE_PRICE  = Number(resultEtfData.price.regularMarketPreviousClose).toFixed(2);
            pKrEtfData.ETF_OPEN_PRICE = Number(resultEtfData.price.regularMarketOpen).toFixed(2);            
            pKrEtfData.ETF_HIGH_PRICE  = Number(resultEtfData.price.regularMarketDayHigh).toFixed(2);
            pKrEtfData.ETF_LOW_PRICE  = Number(resultEtfData.price.regularMarketDayLow).toFixed(2);
            pKrEtfData.ETF_CLOSE_PRICE  = Number(resultEtfData.price.regularMarketPrice).toFixed(2);            
            
            pKrEtfData.ETF_UD_RATE_REAL_BY_TODAY = objUtils.calcRateRoundedClose( Number(pKrEtfData.ETF_CLOSE_PRICE), Number(pKrEtfData.ETF_OPEN_PRICE));            
            let diffPrice = Number(pKrEtfData.ETF_CLOSE_PRICE) - Number(pKrEtfData.ETF_BEF_CLOSE_PRICE);
            pKrEtfData.ETF_TODAY_DIFF_PRICE = diffPrice.toFixed(2);
            pKrEtfData.ETF_UD_RATE_REAL_BY_OPEN = objUtils.calcRateRoundedClose( Number(pKrEtfData.ETF_OPEN_PRICE), Number(pKrEtfData.ETF_BEF_CLOSE_PRICE));
            pKrEtfData.ETF_UD_RATE_REAL_BY_HIGH = objUtils.calcRateRoundedClose( Number(pKrEtfData.ETF_HIGH_PRICE), Number(pKrEtfData.ETF_BEF_CLOSE_PRICE));
            pKrEtfData.ETF_UD_RATE_REAL_BY_LOW = objUtils.calcRateRoundedClose( Number(pKrEtfData.ETF_LOW_PRICE), Number(pKrEtfData.ETF_BEF_CLOSE_PRICE));
            pKrEtfData.ETF_UD_RATE_REAL_BY_CLOSE = objUtils.calcRateRoundedClose( Number(pKrEtfData.ETF_CLOSE_PRICE), Number(pKrEtfData.ETF_BEF_CLOSE_PRICE));      
          //장 마감 전           
          }else{
            pKrEtfData.ETF_BEF_CLOSE_PRICE  = Number(resultEtfData.price.regularMarketPreviousClose).toFixed(2);
            pKrEtfData.ETF_OPEN_PRICE = Number(resultEtfData.price.regularMarketOpen).toFixed(2);
            pKrEtfData.ETF_UD_RATE_REAL_BY_OPEN = objUtils.calcRateRoundedClose( Number(pKrEtfData.ETF_OPEN_PRICE), Number(pKrEtfData.ETF_BEF_CLOSE_PRICE));                                        
          } 
          
          if(Object.keys(pKrEtfData).length !== 0){
              await objUtils.dbQuery(db,
                `UPDATE MARKET_SITE_ETF_STOCK_INFO 
                SET ?, updated_at  = NOW()
                WHERE ETF_STOCK_ID      = ?
                AND   ETF_SITE_ID = 'YHF'              
                AND   ETF_STOCK_DATE    = ?`,
                  [ pKrEtfData, sName, pToDate]);
          }  
          
          await objUtils.sleep(5000 + Math.floor(Math.random() * 5000));
      } catch (error) {
        console.error(`[${sName}] Error fetching data:`, error.message);        
      }                                
    }));            
}


async function fetchIndicesDaumData( pToDate, pBfDate, pXBfDate, pUsHolyFlag, pKrHolyFlag, pCloseFlag) {
  let   pKrIdxData = {},
        pKrEtfData = {},        
        mdfTodate = pToDate.replace(/-/g, ''),
        openFlag = false,
        closeFlag = false,
        etfBfDate;
  
    console.log('fetchIndicesDaumData333 시작!!');
    pUsHolyFlag = pUsHolyFlag ?? 'N';
    pKrHolyFlag = pKrHolyFlag ?? 'N';

    const toDayEtfsSymbols = {       
      'SMP_LVG': '267490',
      'TGR_LVG': '267770',
      'TGR_I2X': '252710',      
      'KSF_I2X': '253230',
      'KSF_LVG': '253250',
      'KDX_I2X': '252670',
      'KDX_LVG': '122630',
      'KBS_I2X': '252420',
      'KBS_LVG': '252400',
      'PLS_I2X': '253160',
      'PLS_LVG': '253150',     
      'KSP'    : 'kospi'
    };

    const toDayEtfNames = {       
      'KSP'    : 'KOSPI',
      'TGR_I2X': 'TIGER 200선물 인버스2X',
      'TGR_LVG': 'TIGER 200선물 레버리지',
      'KSF_I2X': 'KIWOOM 200선물인버스2X',
      'KSF_LVG': 'KIWOOM 200선물레버리지',
      'KDX_I2X': 'KODEX 200선물 인버스2X',
      'KDX_LVG': 'KODEX 레버리지',
      'KBS_I2X': 'RISE 200선물인버스2X',
      'KBS_LVG': 'RISE 200선물레버리지',
      'PLS_I2X': 'PLUS 200선물인버스2X',
      'PLS_LVG': 'PLUS 200선물 레버리지',      
    };
    

    const indicesBfDate = await objUtils.dbQuery(db,
      `SELECT INDEX_DATE 
       FROM MARKETS_WORLD_INDICES_INFO
       WHERE INDEX_ID      = ?
       AND   INDEX_SITE_ID = 'DMF'
       AND   KR_HOLYDAY_YN != 'Y'
       AND   INDEX_DATE    < ? 
       ORDER BY INDEX_DATE DESC
       LIMIT 1`, ['KSP',pToDate]
    );                                  

    console.log('indicesBfDate:', indicesBfDate);
    etfBfDate = indicesBfDate[0].INDEX_DATE;  

  let browser;
  try{
      browser = await launchBrowserCore(
        { headless: true,
          args: [          
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage', // shared memory 사용 줄임
            '--disable-gpu',
            '--single-process'         // 여러 프로세스 대신 단일 프로세스 사용
          ]
        });
      const page = await browser.newPage();
      const result = [];

      // ✅ 더미 페이지로 초기화 유도 (Daum 내 페이지로)
      await page.goto('https://m.daum.net', { waitUntil: 'domcontentloaded', timeout: 60000 });      
      await objUtils.sleep(2000);  // 약간의 대기 추가

      for (const [sName, code] of Object.entries(toDayEtfsSymbols)) {
        const url =
          sName === 'KSP'
            ? 'https://m.finance.daum.net/domestic/kospi'        
            : `https://m.finance.daum.net/quotes/A${code}/home`;

        try {      
          await objUtils.sleep(500); // 소량 대기 후 페이지 이동
          //await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });  
          await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });

          // 종가 selector 구분
          const closeSel = sName === 'KSP'
            ? '#root > div > main > section > article.stockInfo.mt > div > div.price > strong'
            : '#stockInfo > div > div > div > div:nth-child(2) > div.price > strong'

          //await page.waitForSelector(closeSel, { timeout: 10000 });
          //const close = await page.$eval(closeSel, el => el.textContent.trim());
          await page.waitForSelector(closeSel, { timeout: 10000 });
          const closeEl = await page.$(closeSel);
          if (!closeEl) throw new Error(`선택자 ${closeSel} 없음`);
          const close = await page.evaluate(el => el.textContent.trim(), closeEl);

        let open, high, low, prevClose;

          if (sName === 'SMP_LVG') continue; // ❗ 결과 저장에서 제외

          if (sName === 'KSP') {
            // 코스피 전용 셀렉터
            //open      = await page.$eval('#root > div > main > section > article.stockInfo.mt > div > div.numB > ol.leftB > li:nth-child(2) > div > span', el => el.textContent.trim());
            //high      = await page.$eval('#root > div > main > section > article.stockInfo.mt > div > div.numB > ol.leftB > li:nth-child(3) > div > span', el => el.textContent.trim());
            //low       = await page.$eval('#root > div > main > section > article.stockInfo.mt > div > div.numB > ol.leftB > li.last > div > span', el => el.textContent.trim());
            //prevClose = await page.$eval('#root > div > main > section > article.stockInfo.mt > div > div.numB > ol.leftB > li:nth-child(1) > div > span', el => el.textContent.trim());

            const openEl = await page.$('#root > div > main > section > article.stockInfo.mt > div > div.numB > ol.leftB > li:nth-child(2) > div > span');
            if (!openEl) throw new Error(`[${sName}] open selector 없음`);
            open = await page.evaluate(el => el.textContent.trim(), openEl);

            const highEl = await page.$('#root > div > main > section > article.stockInfo.mt > div > div.numB > ol.leftB > li:nth-child(3) > div > span');
            if (!highEl) throw new Error(`[${sName}] high selector 없음`);
            high = await page.evaluate(el => el.textContent.trim(), highEl);

            const lowEl = await page.$('#root > div > main > section > article.stockInfo.mt > div > div.numB > ol.leftB > li.last > div > span');
            if (!lowEl) throw new Error(`[${sName}] low selector 없음`);
            low = await page.evaluate(el => el.textContent.trim(), lowEl);

            const prevCloseEl = await page.$('#root > div > main > section > article.stockInfo.mt > div > div.numB > ol.leftB > li:nth-child(1) > div > span');
            if (!prevCloseEl) throw new Error(`[${sName}] prevClose selector 없음`);
            prevClose = await page.evaluate(el => el.textContent.trim(), prevCloseEl);          

              let pKspLvgData = {},
                  pKspI2XData = {},
                  kspEtfStdPrc = 1000;
              const krIdxInfo = await objUtils.dbQuery(db,
                `SELECT * 
                FROM MARKETS_WORLD_INDICES_INFO
                WHERE INDEX_ID      = ?
                AND   INDEX_SITE_ID = 'DMF'
                AND   INDEX_DATE    = ? 
                LIMIT 1`, ['KSP',pToDate]          
              );                                  
                              
              // KR Index 정보가 없는 경우(종가용)
              if ((krIdxInfo || []).length == 0) {
                await  objUtils.dbQuery(db,`INSERT INTO MARKETS_WORLD_INDICES_INFO (
                      INDEX_DATE, INDEX_ID, INDEX_SITE_ID, INDEX_SITE_NAME, KSP_STOCK_DATE, US_HOLYDAY_YN, KR_HOLYDAY_YN) 
                      VALUES(?, ?, 'DMF', 'Daum Finance', ?, ?, ?)`
                    , [pToDate, 'KSP', pToDate, pUsHolyFlag, pKrHolyFlag]);
              }       

              let etfKspLvgIdxInfo = await objUtils.dbQuery(db,
                    `SELECT * 
                    FROM MARKET_SITE_ETF_STOCK_INFO
                    WHERE ETF_STOCK_ID    = ?
                    AND   ETF_SITE_ID     = 'DMF'
                    AND   ETF_STOCK_DATE  = ? 
                    LIMIT 1`, ['KSP_LVG',pToDate]          
              );                                  
                      
              // ETF Index 정보가 없는 경우
              if ((etfKspLvgIdxInfo || []).length == 0) {
                await  objUtils.dbQuery(db,`INSERT INTO MARKET_SITE_ETF_STOCK_INFO (
                      ETF_STOCK_DATE, ETF_STOCK_ID, ETF_SITE_ID, ETF_SITE_NAME, ETF_STOCK_NAME, ETF_BF_STOCK_DATE, ETF_BEF_CLOSE_PRICE) 
                      VALUES(?, ?, 'DMF', 'Daum Finance',?, ?, ?)`
                    , [pToDate, 'KSP_LVG', 'KOSPI 레버리지', etfBfDate, kspEtfStdPrc]);
              }

              let etfKspI2XIdxInfo = await objUtils.dbQuery(db,
                    `SELECT * 
                    FROM MARKET_SITE_ETF_STOCK_INFO
                    WHERE ETF_STOCK_ID    = ?
                    AND   ETF_SITE_ID     = 'DMF'
                    AND   ETF_STOCK_DATE  = ? 
                    LIMIT 1`, ['KSP_I2X',pToDate]          
              );                                  
                      
              // ETF Index 정보가 없는 경우
              if ((etfKspI2XIdxInfo || []).length == 0) {
                await  objUtils.dbQuery(db,`INSERT INTO MARKET_SITE_ETF_STOCK_INFO (
                      ETF_STOCK_DATE, ETF_STOCK_ID, ETF_SITE_ID, ETF_SITE_NAME, ETF_STOCK_NAME, ETF_BF_STOCK_DATE, ETF_BEF_CLOSE_PRICE) 
                      VALUES(?, ?, 'DMF', 'Daum Finance',?, ?, ?)`
                    , [pToDate, 'KSP_I2X', 'KOSPI 인버스2X', etfBfDate, kspEtfStdPrc]);
              }
              
              //장 마감 후 
              if(pCloseFlag){
                pKrIdxData.INDEX_STD_PRICE  = Number(objUtils.cleanNumber(prevClose)).toFixed(2);
                pKrIdxData.INDEX_MDF_STD_PRICE  = Number(objUtils.cleanNumber(prevClose)).toFixed(2);
                pKrIdxData.INDEX_OPEN_PRICE = Number(objUtils.cleanNumber(open)).toFixed(2);            
                pKrIdxData.INDEX_HIGH_PRICE  = Number(objUtils.cleanNumber(high)).toFixed(2);
                pKrIdxData.INDEX_LOW_PRICE  = Number(objUtils.cleanNumber(low)).toFixed(2);
                pKrIdxData.INDEX_END_PRICE  = Number(objUtils.cleanNumber(close)).toFixed(2);            
                
                pKrIdxData.INDEX_UD_RATE_REAL_BY_TODAY = objUtils.calcRateRoundedClose( Number(pKrIdxData.INDEX_END_PRICE), Number(pKrIdxData.INDEX_OPEN_PRICE));
                let diffPrice = Number(pKrIdxData.INDEX_END_PRICE) - Number(pKrIdxData.INDEX_STD_PRICE);
                pKrIdxData.INDEX_UD_PRICE = diffPrice.toFixed(2);
                pKrIdxData.INDEX_UD_RATE_REAL_BY_OPEN = objUtils.calcRateRoundedClose( Number(pKrIdxData.INDEX_OPEN_PRICE), Number(pKrIdxData.INDEX_STD_PRICE));
                pKrIdxData.INDEX_UD_RATE_REAL_BY_HIGH = objUtils.calcRateRoundedClose( Number(pKrIdxData.INDEX_HIGH_PRICE), Number(pKrIdxData.INDEX_STD_PRICE));
                pKrIdxData.INDEX_UD_RATE_REAL_BY_LOW = objUtils.calcRateRoundedClose( Number(pKrIdxData.INDEX_LOW_PRICE), Number(pKrIdxData.INDEX_STD_PRICE));
                pKrIdxData.INDEX_UD_RATE_REAL_BY_CLOSE = objUtils.calcRateRoundedClose( Number(pKrIdxData.INDEX_END_PRICE), Number(pKrIdxData.INDEX_STD_PRICE));

                pKspI2XData.ETF_UD_RATE_REAL_BY_OPEN = Number(pKrIdxData.INDEX_UD_RATE_REAL_BY_OPEN * -2).toFixed(2);
                pKspI2XData.ETF_UD_RATE_REAL_BY_HIGH = Number(pKrIdxData.INDEX_UD_RATE_REAL_BY_HIGH * -2).toFixed(2);
                pKspI2XData.ETF_UD_RATE_REAL_BY_LOW = Number(pKrIdxData.INDEX_UD_RATE_REAL_BY_LOW * -2).toFixed(2);
                pKspI2XData.ETF_UD_RATE_REAL_BY_CLOSE = Number(pKrIdxData.INDEX_UD_RATE_REAL_BY_CLOSE * -2).toFixed(2);
                pKspI2XData.ETF_BEF_CLOSE_PRICE = kspEtfStdPrc;
                pKspI2XData.ETF_OPEN_PRICE = kspEtfStdPrc + Number((kspEtfStdPrc *  Number(pKspI2XData.ETF_UD_RATE_REAL_BY_OPEN) * 0.01).toFixed(2));
                pKspI2XData.ETF_HIGH_PRICE = kspEtfStdPrc + Number((kspEtfStdPrc *  Number(pKspI2XData.ETF_UD_RATE_REAL_BY_HIGH) * 0.01).toFixed(2));
                pKspI2XData.ETF_LOW_PRICE = kspEtfStdPrc + Number((kspEtfStdPrc *  Number(pKspI2XData.ETF_UD_RATE_REAL_BY_LOW) * 0.01).toFixed(2));
                pKspI2XData.ETF_CLOSE_PRICE = kspEtfStdPrc + Number((kspEtfStdPrc *  Number(pKspI2XData.ETF_UD_RATE_REAL_BY_CLOSE) * 0.01).toFixed(2));            
                pKspI2XData.ETF_TODAY_DIFF_PRICE = (Number(pKspI2XData.ETF_CLOSE_PRICE) - Number(pKspI2XData.ETF_OPEN_PRICE)).toFixed(2),
                pKspI2XData.ETF_UD_RATE_REAL_BY_TODAY = objUtils.calcRateRoundedClose( Number(pKspI2XData.ETF_CLOSE_PRICE), Number(pKspI2XData.ETF_OPEN_PRICE));
                pKspI2XData.CLOSE_ETF_OPEN_DO_YN = 'Y';

                pKspLvgData.ETF_UD_RATE_REAL_BY_OPEN = Number(pKrIdxData.INDEX_UD_RATE_REAL_BY_OPEN * 2).toFixed(2);
                pKspLvgData.ETF_UD_RATE_REAL_BY_HIGH = Number(pKrIdxData.INDEX_UD_RATE_REAL_BY_HIGH * 2).toFixed(2);
                pKspLvgData.ETF_UD_RATE_REAL_BY_LOW = Number(pKrIdxData.INDEX_UD_RATE_REAL_BY_LOW * 2).toFixed(2);
                pKspLvgData.ETF_UD_RATE_REAL_BY_CLOSE = Number(pKrIdxData.INDEX_UD_RATE_REAL_BY_CLOSE * 2).toFixed(2);
                pKspLvgData.ETF_BEF_CLOSE_PRICE = kspEtfStdPrc;
                pKspLvgData.ETF_OPEN_PRICE = kspEtfStdPrc + Number((kspEtfStdPrc *  Number(pKspLvgData.ETF_UD_RATE_REAL_BY_OPEN) * 0.01).toFixed(2));
                pKspLvgData.ETF_HIGH_PRICE = kspEtfStdPrc + Number((kspEtfStdPrc *  Number(pKspLvgData.ETF_UD_RATE_REAL_BY_HIGH) * 0.01).toFixed(2));
                pKspLvgData.ETF_LOW_PRICE = kspEtfStdPrc + Number((kspEtfStdPrc *  Number(pKspLvgData.ETF_UD_RATE_REAL_BY_LOW) * 0.01).toFixed(2));
                pKspLvgData.ETF_CLOSE_PRICE = kspEtfStdPrc + Number((kspEtfStdPrc *  Number(pKspLvgData.ETF_UD_RATE_REAL_BY_CLOSE) * 0.01).toFixed(2));            
                pKspLvgData.ETF_TODAY_DIFF_PRICE = (Number(pKspLvgData.ETF_CLOSE_PRICE) - Number(pKspLvgData.ETF_OPEN_PRICE)).toFixed(2),
                pKspLvgData.ETF_UD_RATE_REAL_BY_TODAY = objUtils.calcRateRoundedClose( Number(pKspLvgData.ETF_CLOSE_PRICE), Number(pKspLvgData.ETF_OPEN_PRICE));                                            
                pKspLvgData.CLOSE_ETF_OPEN_DO_YN = 'Y';
              //장 마감 전           
              }else{
                pKrIdxData.INDEX_STD_PRICE  = Number(objUtils.cleanNumber(prevClose)).toFixed(2);
                pKrIdxData.INDEX_MDF_STD_PRICE  = Number(objUtils.cleanNumber(prevClose)).toFixed(2);
                pKrIdxData.INDEX_OPEN_PRICE = Number(objUtils.cleanNumber(open)).toFixed(2);
                pKrIdxData.INDEX_UD_RATE_REAL_BY_OPEN = objUtils.calcRateRoundedClose( Number(pKrIdxData.INDEX_OPEN_PRICE), Number(pKrIdxData.INDEX_STD_PRICE));                        
                
                pKspI2XData.ETF_BEF_CLOSE_PRICE = kspEtfStdPrc;
                pKspI2XData.ETF_UD_RATE_REAL_BY_OPEN = Number(pKrIdxData.INDEX_UD_RATE_REAL_BY_OPEN * -2).toFixed(2);
                pKspI2XData.ETF_OPEN_PRICE = kspEtfStdPrc + Number((kspEtfStdPrc *  Number(pKspI2XData.ETF_UD_RATE_REAL_BY_OPEN) * 0.01).toFixed(2));
                pKspI2XData.AFTER_ETF_OPEN_DO_YN = 'Y';
                
                pKspLvgData.ETF_BEF_CLOSE_PRICE = kspEtfStdPrc;
                pKspLvgData.ETF_UD_RATE_REAL_BY_OPEN = Number(pKrIdxData.INDEX_UD_RATE_REAL_BY_OPEN * 2).toFixed(2);
                pKspLvgData.ETF_OPEN_PRICE = kspEtfStdPrc + Number((kspEtfStdPrc *  Number(pKspLvgData.ETF_UD_RATE_REAL_BY_OPEN) * 0.01).toFixed(2));
                pKspLvgData.AFTER_ETF_OPEN_DO_YN = 'Y';
                                                
              } 

              if(Object.keys(pKspLvgData).length !== 0){
                  await objUtils.dbQuery(db,
                    `UPDATE MARKET_SITE_ETF_STOCK_INFO 
                    SET ?, updated_at  = NOW()
                    WHERE ETF_STOCK_ID      = ?
                    AND   ETF_SITE_ID = 'DMF'              
                    AND   ETF_STOCK_DATE    = ?`,
                      [ pKspLvgData, 'KSP_LVG', pToDate]);
              }

              if(Object.keys(pKspI2XData).length !== 0){
                  await objUtils.dbQuery(db,
                    `UPDATE MARKET_SITE_ETF_STOCK_INFO 
                    SET ?, updated_at  = NOW()
                    WHERE ETF_STOCK_ID      = ?
                    AND   ETF_SITE_ID = 'DMF'              
                    AND   ETF_STOCK_DATE    = ?`,
                      [ pKspI2XData, 'KSP_I2X', pToDate]);
              }          
              
              if(Object.keys(pKrIdxData).length !== 0){
                  await objUtils.dbQuery(db,
                    `UPDATE MARKETS_WORLD_INDICES_INFO 
                    SET ?, updated_at  = NOW()
                    WHERE INDEX_ID      = ?
                    AND   INDEX_SITE_ID = 'DMF'              
                    AND   INDEX_DATE    = ?`,
                      [ pKrIdxData, 'KSP', pToDate]);          
              }
          } else {        
            // ETF 공통 셀렉터
            open      = await page.$eval('#root > div > main > section > article:nth-child(6) > div.stockB > div.numB > ol.leftB > li:nth-child(2) > div > span', el => el.textContent.trim());
            high      = await page.$eval('#root > div > main > section > article:nth-child(6) > div.stockB > div.numB > ol.leftB > li:nth-child(3) > div > span', el => el.textContent.trim());
            low       = await page.$eval('#root > div > main > section > article:nth-child(6) > div.stockB > div.numB > ol.leftB > li:nth-child(4) > div > span', el => el.textContent.trim());
            prevClose = await page.$eval('#root > div > main > section > article:nth-child(6) > div.stockB > div.numB > ol.leftB > li:nth-child(1) > div > span', el => el.textContent.trim());

            console.log(`📊 [${sName}] O:${open} H:${high} L:${low} C:${close} PrevClose:${prevClose}`);
            console.log(Number(objUtils.cleanNumber(prevClose)).toFixed(2));

            pKrEtfData = {};
              const etfIdxInfo = await objUtils.dbQuery(db,
                    `SELECT * 
                    FROM MARKET_SITE_ETF_STOCK_INFO
                    WHERE ETF_STOCK_ID    = ?
                    AND   ETF_SITE_ID     = 'DMF'
                    AND   ETF_STOCK_DATE  = ? 
                    LIMIT 1`, [sName,pToDate]          
              );                                  
                      
              // ETF Index 정보가 없는 경우
              if ((etfIdxInfo || []).length == 0) {
                await  objUtils.dbQuery(db,`INSERT INTO MARKET_SITE_ETF_STOCK_INFO (
                      ETF_STOCK_DATE, ETF_STOCK_ID, ETF_SITE_ID, ETF_SITE_NAME, ETF_STOCK_NAME, ETF_BF_STOCK_DATE) 
                      VALUES(?, ?, 'DMF', 'Daum Finance',?, ?)`
                    , [pToDate, sName, toDayEtfNames[sName], etfBfDate]);
              }
                //장 마감 후 
              if(pCloseFlag){
                pKrEtfData.ETF_BEF_CLOSE_PRICE  = Number(objUtils.cleanNumber(prevClose)).toFixed(2);
                pKrEtfData.ETF_OPEN_PRICE = Number(objUtils.cleanNumber(open)).toFixed(2);            
                pKrEtfData.ETF_HIGH_PRICE  = Number(objUtils.cleanNumber(high)).toFixed(2);
                pKrEtfData.ETF_LOW_PRICE  = Number(objUtils.cleanNumber(low)).toFixed(2);
                pKrEtfData.ETF_CLOSE_PRICE  = Number(objUtils.cleanNumber(close)).toFixed(2);            
                
                pKrEtfData.ETF_UD_RATE_REAL_BY_TODAY = objUtils.calcRateRoundedClose( Number(pKrEtfData.ETF_CLOSE_PRICE), Number(pKrEtfData.ETF_OPEN_PRICE));
                pKrEtfData.ETF_TODAY_DIFF_PRICE = Number(pKrEtfData.ETF_CLOSE_PRICE) - Number(pKrEtfData.ETF_BEF_CLOSE_PRICE);
                pKrEtfData.ETF_UD_RATE_REAL_BY_OPEN = objUtils.calcRateRoundedClose( Number(pKrEtfData.ETF_OPEN_PRICE), Number(pKrEtfData.ETF_BEF_CLOSE_PRICE));
                pKrEtfData.ETF_UD_RATE_REAL_BY_HIGH = objUtils.calcRateRoundedClose( Number(pKrEtfData.ETF_HIGH_PRICE), Number(pKrEtfData.ETF_BEF_CLOSE_PRICE));
                pKrEtfData.ETF_UD_RATE_REAL_BY_LOW = objUtils.calcRateRoundedClose( Number(pKrEtfData.ETF_LOW_PRICE), Number(pKrEtfData.ETF_BEF_CLOSE_PRICE));
                pKrEtfData.ETF_UD_RATE_REAL_BY_CLOSE = objUtils.calcRateRoundedClose( Number(pKrEtfData.ETF_CLOSE_PRICE), Number(pKrEtfData.ETF_BEF_CLOSE_PRICE));      
              //장 마감 전           
              }else{
                pKrEtfData.ETF_BEF_CLOSE_PRICE  = Number(objUtils.cleanNumber(prevClose)).toFixed(2);
                pKrEtfData.ETF_OPEN_PRICE = Number(objUtils.cleanNumber(open)).toFixed(2);
                pKrEtfData.ETF_UD_RATE_REAL_BY_OPEN = objUtils.calcRateRoundedClose( Number(pKrEtfData.ETF_OPEN_PRICE), Number(pKrEtfData.ETF_BEF_CLOSE_PRICE));                                        
              } 
              
              if(Object.keys(pKrEtfData).length !== 0){
                  await objUtils.dbQuery(db,
                    `UPDATE MARKET_SITE_ETF_STOCK_INFO 
                    SET ?, updated_at  = NOW()
                    WHERE ETF_STOCK_ID      = ?
                    AND   ETF_SITE_ID = 'DMF'              
                    AND   ETF_STOCK_DATE    = ?`,
                      [ pKrEtfData, sName, pToDate]);
              }                      
          }  
          
          await objUtils.sleep(5000 + Math.floor(Math.random() * 5000));
        } catch (err) {      
          console.warn(`⚠️ [${sName}] 페이지 이동 실패: ${err.message}`);
          continue; // 다음 루프 진행
        }
      }

      console.log('📊 최종 결과:', result);
    } catch (err) {
      console.error('❌ 전체 처리 중 오류 발생:', err.message);
    } finally {
      if (browser) await browser.close();
    } 
}

async function fetchIndicesInveData( pToDate, pBfDate, pXBfDate, pUsHolyFlag, pKrHolyFlag, pCloseFlag) {
  let   pKrIdxData = {},
        pKrEtfData = {},
        mdfTodate = pToDate.replace(/-/g, ''),
        openFlag = false,
        closeFlag = false,
        etfBfDate;
  
    pUsHolyFlag = pUsHolyFlag ?? 'N';
    pKrHolyFlag = pKrHolyFlag ?? 'N';

    const toDayEtfsSymbols = {       
      'KSP'    : '^KS11',
      'TGR_I2X': '252710',
      'TGR_LVG': '267770',
      'KSF_I2X': '253230',
      'KSF_LVG': '253250',
      'KDX_I2X': '252670',
      'KDX_LVG': '122630',
      'KBS_I2X': '252420',
      'KBS_LVG': '252400',
      'PLS_I2X': '253160',
      'PLS_LVG': '253150',      
    };

    const toDayEtfNames = {       
      'KSP'    : 'KOSPI',
      'TGR_I2X': 'TIGER 200선물 인버스2X',
      'TGR_LVG': 'TIGER 200선물 레버리지',
      'KSF_I2X': 'KIWOOM 200선물인버스2X',
      'KSF_LVG': 'KIWOOM 200선물레버리지',
      'KDX_I2X': 'KODEX 200선물 인버스2X',
      'KDX_LVG': 'KODEX 레버리지',
      'KBS_I2X': 'RISE 200선물인버스2X',
      'KBS_LVG': 'RISE 200선물레버리지',
      'PLS_I2X': 'PLUS 200선물인버스2X',
      'PLS_LVG': 'PLUS 200선물 레버리지',      
    };
    

    const indicesBfDate = await objUtils.dbQuery(db,
      `SELECT INDEX_DATE 
       FROM MARKETS_WORLD_INDICES_INFO
       WHERE INDEX_ID      = ?
       AND   INDEX_SITE_ID = 'DMF'
       AND   KR_HOLYDAY_YN != 'Y'
       AND   INDEX_DATE    < ? 
       ORDER BY INDEX_DATE DESC
       LIMIT 1`, ['KSP',pToDate]
    );                                  

    console.log('indicesBfDate:', indicesBfDate);
    etfBfDate = indicesBfDate[0].INDEX_DATE;

    let kspUrl = 'https://www.investing.com/indices/kospi';
    let etfUrl = 'https://www.investing.com/etfs/ma-tiger-200-futures-inverse-2x';
     try {
    const res = await axios.get(kspUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    const $ = cheerio.load(res.data);

    const row = $('table.freeze-column-w-1 tbody tr').first();
    const cols = row.find('td');

    const closePrc = $("div[class*='text-5xl']").first().text().trim();

    if (closePrc) {
      console.log(`✅ KOSPI 종가 (Summary): ${closePrc}`);
    } else {
      console.warn('⚠️ 종가를 찾지 못했습니다. selector 변경 필요');
    }
    
    const [date, price, open, high, low] = cols.map((i, el) => $(el).text().trim()).get();

    console.log(`📊 KSP (${date})`);
    console.log(`  ▸ 시가: ${open}`);
    console.log(`  ▸ 고가: ${high}`);
    console.log(`  ▸ 저가: ${low}`);
    console.log(`  ▸ 종가: ${price}`);
    console.log(`  ▸ 종가[Summary]: ${closePrc}`);
  } catch (err) {
    console.error(`❌ [KOSPI] 크롤링 실패:`, err.message);
    //return null;
  }

   try {
    const res = await axios.get(etfUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    const $ = cheerio.load(res.data);

    const closePrc = $("div[class*='text-5xl']").first().text().trim();

    if (closePrc) {
      console.log(`✅ TGR 종가 (Summary): ${closePrc}`);
    } else {
      console.warn('⚠️ 종가를 찾지 못했습니다. selector 변경 필요');
    }

    const row = $('table.freeze-column-w-1 tbody tr').first();
    const cols = row.find('td');
    
    const [date, price, open, high, low] = cols.map((i, el) => $(el).text().trim()).get();

    console.log(`📊 TGR (${date})`);
    console.log(`  ▸ 시가: ${open}`);
    console.log(`  ▸ 고가: ${high}`);
    console.log(`  ▸ 저가: ${low}`);
    console.log(`  ▸ 종가: ${price}`);
    console.log(`  ▸ 종가[Summary]: ${closePrc}`);
    //return { label, open, high, low, close };

    await objUtils.sleep(5000 + Math.floor(Math.random() * 5000));
  } catch (err) {
    console.error(`❌ [TGR] 크롤링 실패:`, err.message);
    //return null;
  }
}