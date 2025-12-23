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

exports.getIndicesTypeInfo = async ({pIndicesType, pIfType,pDate, pCloseFlag}) => {
  /********************
   * pIfType: 
   *   - API : API키를 통한 통신
   *   - PPT : Puppeteer를 통한 크롤링 
   *   - AXC : Axios + Cheerio 통한 크롤링
   *   - YHF : Yahoo-finance2 라이브러리
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
      //ECOS의 경우 토요일 정보도 있음.
      if( pIndicesType === 'ECOS'){
        bfYmd.setDate(toDt.getDate() - 2); // 토요일        
        xbfYmd.setDate(toDt.getDate() - 3); // 금요일        
      }else{
        bfYmd.setDate(toDt.getDate() - 3); // 금요일        
        xbfYmd.setDate(toDt.getDate() - 4); // 목요일      
      }
      console.log('seoulDay1:', bfYmd, xbfYmd);
    } else {      
        bfYmd.setDate(toDt.getDate() - 1); // 전일                
        if (seoulDay == "2") {
          //ECOS의 경우 토요일 정보도 있음.
          if( pIndicesType === 'ECOS'){
            xbfYmd.setDate(toDt.getDate() - 3); // 토요일
          }else{
            xbfYmd.setDate(toDt.getDate() - 4); // 금요일
          }           
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

    if( pIndicesType === 'ECOS' && pIfType === 'API'){
      await fetchUsdKrwRate(formattedToday, formattedPrevDay, formattedXPrevDay,usHolyYn, krHolyYn);
    }

    if( pIndicesType === 'SMBS' && pIfType === 'PPT'){
      await fetchUsdKrwFromSMBS(formattedToday, formattedPrevDay, formattedXPrevDay,usHolyYn, krHolyYn);
    }    

    if( pIndicesType === 'USIDX' && pIfType === 'YHF'){
        await fetchUsIdxYhFinance(formattedToday, formattedPrevDay, formattedXPrevDay,usHolyYn, krHolyYn);
    }    

    if( pIndicesType === 'STOOQ' && pIfType === 'AXC'){
      //console.log('STOOQ:',formattedToday, formattedPrevDay, formattedXPrevDay);
        await fetchDataFromStooq(formattedToday, formattedPrevDay, formattedXPrevDay,usHolyYn, krHolyYn);
    }    

    if( pIndicesType === 'FRF' && pIfType === 'API'){      
        await getFrankFurterDxyApi(formattedToday, formattedPrevDay, formattedXPrevDay,usHolyYn, krHolyYn);
    }    

    if( pIndicesType === 'FRED' && pIfType === 'API'){      
        await fetchFredData(formattedToday, formattedPrevDay, formattedXPrevDay,usHolyYn, krHolyYn);
    }    

    if( pIndicesType === 'INV' && pIfType === 'PPT'){      
        await fetchUsdIdxDataFromInvesting(formattedToday, formattedPrevDay, formattedXPrevDay,usHolyYn, krHolyYn);
    }    
    
    if( pIndicesType === 'NVR' && pIfType === 'STD'){
      await fetchIndicesStdNaverData(formattedToday, formattedPrevDay, formattedXPrevDay,usHolyYn, krHolyYn);
    }

    if( pIndicesType === 'YHF' && pIfType === 'STD'){
      await fetchIndicesStdYahooData(formattedToday, formattedPrevDay, formattedXPrevDay,usHolyYn, krHolyYn);
    }

    if( pIndicesType === 'DMF' && pIfType === 'STD'){
      await fetchIndicesStdDaumData(formattedToday, formattedPrevDay, formattedXPrevDay,usHolyYn, krHolyYn);
    }

    if( pIndicesType === 'YHF' && pIfType === 'KHD'){
      await fetchIndicesKspHistoryYahooData(formattedToday, formattedPrevDay, formattedXPrevDay,usHolyYn, krHolyYn);
    }    

    if( pIndicesType === 'SET_KSP_INV'){
        await fnSetKspInvestInfo(formattedToday, formattedPrevDay, formattedXPrevDay,usHolyYn, krHolyYn, pCloseFlag);
    }            


    return { status: 'success', message: pIndicesType +' market Usd-krw I/F get successfully.' };
};

//한국은행의 경우 매매기준율을 제공하지 않음.
async function fetchUsdKrwRate(pToDate, pBfDate, pXBfDate, pUsHolyFlag, pKrHolyFlag) {
  console.log('fetchUsdKrwRate 호출!');
  const API_KEY = process.env.ECOS_API_KEY || 'BPHUYDGRDSTSXUIS3JLF';
  if (!process.env.ECOS_API_KEY) console.warn('[ECOS_API_KEY missing] using fallback key embedded in legacy code');
  const statCode  = '731Y003';
  const itemCode1 = ['0000003', '0000002', '0000013']; // 15:30분 종가
  const itemCode2 = ['0000013', '0000002', '0000003'];//'0000013'; // 02:00분 종가 
  const itemCode3 = ['0000002', '0000003', '0000013'];// '0000002'; // 시가
  const startIdx  = 1;
  const endIdx    = 1;
  const cycle     = 'D';         // 일별
  const d1        = pBfDate.replace(/-/g, ''); // '20250523'
  const d2        = d1;
  const xD1        = pXBfDate.replace(/-/g, ''); // '20250523'
  const xD2        = xD1;

  pUsHolyFlag = pUsHolyFlag ?? 'N';
  pKrHolyFlag = pKrHolyFlag ?? 'N';

  //https://ecos.bok.or.kr/api/StatisticSearch/BPHUYDGRDSTSXUIS3JLF/json/kr/1/1/731Y003/D/20250523/20250523/0000003
  //https://ecos.bok.or.kr/api/StatisticSearch/BPHUYDGRDSTSXUIS3JLF/json/kr/1/1/731Y003/D/20250530/20250530/0000002

  //https://ecos.bok.or.kr/api/StatisticSearch/BPHUYDGRDSTSXUIS3JLF/json/kr/1/1/731Y003/D/20250523/20250523/0000003/0000002/0000005/0000004
  const std15Url = [
    'https://ecos.bok.or.kr/api/StatisticSearch',
    API_KEY,
    'json/kr',
    startIdx,
    endIdx,
    statCode,    
    cycle,    
    xD1,xD2,
    ...itemCode1
  ].join('/');

  const std02Url = [
    'https://ecos.bok.or.kr/api/StatisticSearch',
    API_KEY,
    'json/kr',
    startIdx,
    endIdx,
    statCode,    
    cycle,    
    xD1,xD2,
    ...itemCode2
  ].join('/');

  const openUrl = [
    'https://ecos.bok.or.kr/api/StatisticSearch',
    API_KEY,
    'json/kr',
    startIdx,
    endIdx,
    statCode,        
    cycle,    
    d1,d2,
    ...itemCode3
  ].join('/');

  const close15Url = [
    'https://ecos.bok.or.kr/api/StatisticSearch',
    API_KEY,
    'json/kr',
    startIdx,
    endIdx,
    statCode,    
    cycle,    
    d1,d2,
    ...itemCode1
  ].join('/');

  const close02Url = [
    'https://ecos.bok.or.kr/api/StatisticSearch',
    API_KEY,
    'json/kr',
    startIdx,
    endIdx,
    statCode,    
    cycle,    
    d1,d2,
    ...itemCode2
  ].join('/');

  try {    
    let pUsIdxData      = {},
        yDateYnFlag       = false,
        bfYDateFlag     = false;

    const ecosKrwInfo = await objUtils.dbQuery(db,
          `SELECT * 
           FROM MARKETS_WORLD_INDICES_INFO
           WHERE INDEX_ID      = 'KRW'
           AND   INDEX_SITE_ID = 'ECOS'
           AND   INDEX_DATE    = ? 
           LIMIT 1`, [pBfDate]          
        );                                  
  
    // ecos 환율 정보가 없는 경우(종가용)
    if ((ecosKrwInfo || []).length == 0) {                
        await  objUtils.dbQuery(db,`INSERT INTO MARKETS_WORLD_INDICES_INFO (
                           INDEX_DATE, INDEX_ID, INDEX_SITE_ID, INDEX_SITE_NAME, KSP_STOCK_DATE, US_HOLYDAY_YN, KR_HOLYDAY_YN)  
                         VALUES(?, 'KRW', 'ECOS', '한국은행', ?, ?, ?)`
                , [pBfDate, pToDate, pUsHolyFlag, pKrHolyFlag]);
    }  
    
    const std15Data = await axios.get(std15Url);
    const std02Data = await axios.get(std02Url);
    const openData = await axios.get(openUrl);
    const close15Data = await axios.get(close15Url);
    const close02Data = await axios.get(close02Url);
    console.log('std15Data:',std15Data.data);
    console.log('std02Data:',std02Data.data);
    console.log('openData:',openData.data);
    console.log('close15Data:',close15Data.data);
    console.log('close02Data:',close02Data.data);
    pUsIdxData.IF_SUCC_YN = 'N';

    const std15Rows = std15Data.data.StatisticSearch?.row;
    console.log('std15Rows:',std15Rows);
    if (Array.isArray(std15Rows) && std15Rows.length > 0) {      
      pUsIdxData.INDEX_EXTR1_STD_PRICE = parseFloat(std15Rows[0].DATA_VALUE);
    } 

    const std02Rows = std02Data.data.StatisticSearch?.row;
    console.log('std02Rows:',std02Rows);
    if (Array.isArray(std02Rows) && std02Rows.length > 0) {      
      pUsIdxData.INDEX_EXTR2_STD_PRICE = parseFloat(std02Rows[0].DATA_VALUE);      
    }

    const openRows = openData.data.StatisticSearch?.row;
    console.log('openRows:',openRows);
    if (Array.isArray(openRows) && openRows.length > 0) {      
      pUsIdxData.INDEX_OPEN_PRICE = parseFloat(openRows[0].DATA_VALUE);      
    }

    const cls15Rows = close15Data.data.StatisticSearch?.row;
    console.log('cls15Rows:',cls15Rows);
    if (Array.isArray(cls15Rows) && cls15Rows.length > 0) {      
      pUsIdxData.INDEX_EXTR1_END_PRICE = parseFloat(cls15Rows[0].DATA_VALUE);            
    }

    const cls02Rows = close02Data.data.StatisticSearch?.row;
    console.log('cls02Rows:',cls02Rows);
    if (Array.isArray(cls02Rows) && cls02Rows.length > 0) {      
      pUsIdxData.INDEX_EXTR2_END_PRICE = parseFloat(cls02Rows[0].DATA_VALUE);      
    }

    if(objUtils.isValidValue( pUsIdxData.INDEX_OPEN_PRICE) && objUtils.isValidValue( pUsIdxData.INDEX_EXTR1_STD_PRICE)){
      pUsIdxData.INDEX_EXTR1_UD_RATE_REAL_BY_OPEN  = objUtils.calcRateRoundedClose( Number(pUsIdxData.INDEX_OPEN_PRICE).toFixed(2), pUsIdxData.INDEX_EXTR1_STD_PRICE);
    }

    if(objUtils.isValidValue( pUsIdxData.INDEX_OPEN_PRICE) && objUtils.isValidValue( pUsIdxData.INDEX_EXTR2_STD_PRICE)){
      pUsIdxData.INDEX_EXTR2_UD_RATE_REAL_BY_OPEN  = objUtils.calcRateRoundedClose( Number(pUsIdxData.INDEX_OPEN_PRICE).toFixed(2), pUsIdxData.INDEX_EXTR2_STD_PRICE);
    }

    if(objUtils.isValidValue( pUsIdxData.INDEX_EXTR1_STD_PRICE) && objUtils.isValidValue( pUsIdxData.INDEX_EXTR1_END_PRICE)){
      let diffPrice = Number(pUsIdxData.INDEX_EXTR1_END_PRICE) - Number(pUsIdxData.INDEX_EXTR1_STD_PRICE);
      pUsIdxData.INDEX_EXTR1_UD_PRICE  = diffPrice.toFixed(2);

    }

    if(objUtils.isValidValue( pUsIdxData.INDEX_EXTR2_STD_PRICE) && objUtils.isValidValue( pUsIdxData.INDEX_EXTR2_END_PRICE)){
      let diffPrice = Number(pUsIdxData.INDEX_EXTR2_END_PRICE) - Number(pUsIdxData.INDEX_EXTR2_STD_PRICE);
      pUsIdxData.INDEX_EXTR2_UD_PRICE  = diffPrice.toFixed(2);

    }

    if(objUtils.isValidValue( pUsIdxData.INDEX_EXTR1_STD_PRICE) && objUtils.isValidValue( pUsIdxData.INDEX_OPEN_PRICE)){
      pUsIdxData.INDEX_EXTR1_UD_RATE_REAL_BY_OPEN = objUtils.calcRateRoundedClose( Number(pUsIdxData.INDEX_OPEN_PRICE).toFixed(2), pUsIdxData.INDEX_EXTR1_STD_PRICE);        
    }

    if(objUtils.isValidValue( pUsIdxData.INDEX_EXTR2_STD_PRICE) && objUtils.isValidValue( pUsIdxData.INDEX_OPEN_PRICE)){
      pUsIdxData.INDEX_EXTR2_UD_RATE_REAL_BY_OPEN = objUtils.calcRateRoundedClose( Number(pUsIdxData.INDEX_OPEN_PRICE).toFixed(2), pUsIdxData.INDEX_EXTR2_STD_PRICE);        
    }        

    if(objUtils.isValidValue( pUsIdxData.INDEX_OPEN_PRICE) && objUtils.isValidValue( pUsIdxData.INDEX_EXTR1_END_PRICE)){
      pUsIdxData.INDEX_EXTR1_UD_RATE_REAL_BY_TODAY  = objUtils.calcRateRoundedClose( Number(pUsIdxData.INDEX_EXTR1_END_PRICE).toFixed(2), pUsIdxData.INDEX_OPEN_PRICE);
    }

    if(objUtils.isValidValue( pUsIdxData.INDEX_OPEN_PRICE) && objUtils.isValidValue( pUsIdxData.INDEX_EXTR2_END_PRICE)){
      pUsIdxData.INDEX_EXTR2_UD_RATE_REAL_BY_TODAY  = objUtils.calcRateRoundedClose( Number(pUsIdxData.INDEX_EXTR2_END_PRICE).toFixed(2), pUsIdxData.INDEX_OPEN_PRICE);
    }

    if(objUtils.isValidValue( pUsIdxData.INDEX_EXTR1_STD_PRICE) && objUtils.isValidValue( pUsIdxData.INDEX_EXTR1_END_PRICE)){
      pUsIdxData.INDEX_EXTR1_UD_RATE_REAL_BY_CLOSE  = objUtils.calcRateRoundedClose( Number(pUsIdxData.INDEX_EXTR1_END_PRICE).toFixed(2), pUsIdxData.INDEX_EXTR1_STD_PRICE);
      pUsIdxData.INDEX_EXTR1_SCORE = objUtils.oraclePrcRound(pUsIdxData.INDEX_EXTR1_UD_RATE_REAL_BY_CLOSE * 2.5 * 0.3, 2) * -1;

      pUsIdxData.IF_SUCC_YN = 'Y';
    }

    if(objUtils.isValidValue( pUsIdxData.INDEX_EXTR2_STD_PRICE) && objUtils.isValidValue( pUsIdxData.INDEX_EXTR2_END_PRICE)){
      pUsIdxData.INDEX_EXTR2_UD_RATE_REAL_BY_CLOSE  = objUtils.calcRateRoundedClose( Number(pUsIdxData.INDEX_EXTR2_END_PRICE).toFixed(2), pUsIdxData.INDEX_EXTR2_STD_PRICE);
      pUsIdxData.INDEX_EXTR2_SCORE = objUtils.oraclePrcRound(pUsIdxData.INDEX_EXTR2_UD_RATE_REAL_BY_CLOSE * 2.5 * 0.3, 2) * -1;
    }
         
    //빈객체가 아닐 시에 update 실행.
    if(Object.keys(pUsIdxData).length !== 0){
      await objUtils.dbQuery(db,
              `UPDATE MARKETS_WORLD_INDICES_INFO 
              SET ?, updated_at  = NOW()
              WHERE INDEX_ID      = 'KRW'
              AND   INDEX_SITE_ID = 'ECOS'
              AND   INDEX_DATE    = ?`,
                      [ pUsIdxData, pBfDate]);
    }
    return pUsIdxData;
  } catch (err) {
    console.error('API 호출 실패:', err.response?.data || err.message);
    return null;
  }
}

/**
 * SMBS 표준 환율 페이지에서 USD/KRW의 
 * 기준가·시가·15:30 종가·02:00 종가를 가져옵니다.
 *
 * @param {string} pBfDate 'YYYY-MM-DD' 형식 (예: '2025-05-23')
 * @param {string} pToday   'YYYY-MM-DD'
 */
async function fetchUsdKrwFromSMBS(pToday,  pBfDate, pXBfDate, pUsHolyFlag, pKrHolyFlag) {
  let browser;
  try{
    console.log('fetchUsdKrwFromSMBS 호출!');
    browser = await launchBrowserCore({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage', // shared memory 사용 줄임
        '--disable-gpu',
        '--single-process'         // 여러 프로세스 대신 단일 프로세스 사용
      ]
    });
    const page = await browser.newPage();

    let pUsIdxData = {},
        yDateYnFlag = false,
        bfYDateFlag = false;  

    pUsHolyFlag = pUsHolyFlag ?? 'N';
    pKrHolyFlag = pKrHolyFlag ?? 'N';

    const smbsKrwInfo = await objUtils.dbQuery(db,
          `SELECT * 
           FROM MARKETS_WORLD_INDICES_INFO
           WHERE INDEX_ID      = 'KRW'
           AND   INDEX_SITE_ID = 'SMBS'
           AND   INDEX_DATE    = ? 
           LIMIT 1`, [pBfDate]          
        );                                  

    //console.log('smbsKrwInfo:', smbsKrwInfo);
    pUsIdxData.IF_SUCC_YN = 'N';

    // smbs 환율 정보가 없는 경우(종가용)
    if ((smbsKrwInfo || []).length == 0) {
      await  objUtils.dbQuery(db,`INSERT INTO MARKETS_WORLD_INDICES_INFO (
                           INDEX_DATE, INDEX_ID, INDEX_SITE_ID, INDEX_SITE_NAME, KSP_STOCK_DATE, US_HOLYDAY_YN, KR_HOLYDAY_YN)  
                         VALUES(?, 'KRW', 'SMBS', '서울외국환중개', ?, ?, ?)`
                , [pBfDate, pToday, pUsHolyFlag, pKrHolyFlag]);
    }   


    // 1) 페이지 이동
    await page.goto('http://www.smbs.biz/ExRate/StdExRate.jsp', { waitUntil: 'load', timeout: 0 });
    await page.waitForSelector('.table_type2');

    // 2) 테이블 찾기
    const tables = await page.$$('.table_type2');
    for (const table of tables) {
      const caption = (await table.$eval('caption', el => el.textContent)).trim();
      if (caption !== '일별 매매기준율') continue;

      // 3) 데이터 로딩: 헤더 제외
      const rows = await table.$$eval('tr', trs =>
        trs.slice(1).map(tr =>
          Array.from(tr.querySelectorAll('td')).map(td => td.innerText.trim())
        )
      );

      // 4) 한 번에 순회하며 업데이트
      for (const cells of rows) {
        //console.log('rows:',rows);
        const [dateText,exName, stdText,udPrc, openText,highText,lowText, end1530Text, end0200Text] = cells;
        const date = dateText.replace(/\./g, '-');
        const stdValue = parseFloat(stdText.replace(/[%()+,]/g, '')) || 0;
        const openValue = parseFloat(openText.replace(/[%()+,]/g, '')) || 0;
        const end1530Value = parseFloat(end1530Text.replace(/[%()+,]/g, '')) || 0;
        const end0200Value = parseFloat(end0200Text.replace(/[%()+,]/g, '')) || 0;        

        //console.log('date~:',date, pBfDate,pToday);
        //console.log('data:',dateText,stdValue, openValue, end1530Value, end0200Value);
        // 4-1) 기준가(INDEX_STD_PRICE, INDEX_EXTR1_STD_PRICE, INDEX_EXTR2_STD_PRICE) 업데이트
        if (date === pXBfDate ) {          
          //console.log('date:',date);
          //console.log('stdText:',stdText, '  ', stdValue);
          //console.log('end1530Text:',end1530Text, '  ', end1530Value);
          //console.log('end0200Text:',end0200Text, '  ', end0200Value);                        
          pUsIdxData.INDEX_STD_PRICE = stdValue;     
          pUsIdxData.INDEX_MDF_STD_PRICE = stdValue;  
          pUsIdxData.INDEX_EXTR1_STD_PRICE = end1530Value;     
          pUsIdxData.INDEX_EXTR2_STD_PRICE = end0200Value;     
          bfYDateFlag = true;                
        }

        if (date === pBfDate ) {
          //console.log('rows:',rows);
          //console.log('date:',date);
          //console.log('stdText:',stdText, '  ', stdValue);          
          
          pUsIdxData.INDEX_OPEN_PRICE = openValue;     
          pUsIdxData.INDEX_END_PRICE = stdValue;               
          pUsIdxData.INDEX_EXTR1_END_PRICE = end1530Value;     
          pUsIdxData.INDEX_EXTR2_END_PRICE = end0200Value;                       
          pUsIdxData.INDEX_UD_RATE_REAL_BY_TODAY = objUtils.calcRateRoundedClose( Number(stdValue).toFixed(2), openValue);
          pUsIdxData.INDEX_EXTR1_UD_RATE_REAL_BY_TODAY = objUtils.calcRateRoundedClose( Number(end1530Value).toFixed(2), openValue);        
          pUsIdxData.INDEX_EXTR2_UD_RATE_REAL_BY_TODAY = objUtils.calcRateRoundedClose( Number(end0200Value).toFixed(2), openValue);        

          yDateYnFlag = true;            
        }        
      }
    }

    //Rate및 Score 정보는 전일, 전전일 정보가 존재해야만 작업한다.
    if(bfYDateFlag && yDateYnFlag){
      
          let diffPrice = Number(pUsIdxData.INDEX_END_PRICE) - Number(pUsIdxData.INDEX_STD_PRICE);
          let diffEx1Price = Number(pUsIdxData.INDEX_EXTR1_END_PRICE) - Number(pUsIdxData.INDEX_EXTR1_STD_PRICE);
          let diffEx2Price = Number(pUsIdxData.INDEX_EXTR2_END_PRICE) - Number(pUsIdxData.INDEX_EXTR2_STD_PRICE);

          pUsIdxData.INDEX_UD_PRICE = diffPrice.toFixed(2);          
          pUsIdxData.INDEX_EXTR1_UD_PRICE = diffEx1Price.toFixed(2);
          pUsIdxData.INDEX_EXTR2_UD_PRICE = diffEx2Price.toFixed(2);
          pUsIdxData.INDEX_UD_RATE_REAL_BY_OPEN = objUtils.calcRateRoundedClose( Number(pUsIdxData.INDEX_OPEN_PRICE).toFixed(2), pUsIdxData.INDEX_STD_PRICE);
          pUsIdxData.INDEX_EXTR1_UD_RATE_REAL_BY_OPEN = objUtils.calcRateRoundedClose( Number(pUsIdxData.INDEX_OPEN_PRICE).toFixed(2), pUsIdxData.INDEX_EXTR1_STD_PRICE);        
          pUsIdxData.INDEX_EXTR2_UD_RATE_REAL_BY_OPEN = objUtils.calcRateRoundedClose( Number(pUsIdxData.INDEX_OPEN_PRICE).toFixed(2), pUsIdxData.INDEX_EXTR2_STD_PRICE);        
          pUsIdxData.INDEX_UD_RATE_REAL_BY_CLOSE = objUtils.calcRateRoundedClose( Number(pUsIdxData.INDEX_END_PRICE).toFixed(2), pUsIdxData.INDEX_STD_PRICE);
          pUsIdxData.INDEX_EXTR1_UD_RATE_REAL_BY_CLOSE = objUtils.calcRateRoundedClose( Number(pUsIdxData.INDEX_EXTR1_END_PRICE).toFixed(2), pUsIdxData.INDEX_EXTR1_STD_PRICE);        
          pUsIdxData.INDEX_EXTR2_UD_RATE_REAL_BY_CLOSE = objUtils.calcRateRoundedClose( Number(pUsIdxData.INDEX_EXTR2_END_PRICE).toFixed(2), pUsIdxData.INDEX_EXTR2_STD_PRICE);        

          pUsIdxData.INDEX_SCORE = objUtils.oraclePrcRound(pUsIdxData.INDEX_UD_RATE_REAL_BY_CLOSE * 2.5 * 0.3, 2) * -1;
          pUsIdxData.INDEX_EXTR1_SCORE = objUtils.oraclePrcRound(pUsIdxData.INDEX_EXTR1_UD_RATE_REAL_BY_CLOSE * 2.5 * 0.3, 2) * -1;
          pUsIdxData.INDEX_EXTR2_SCORE = objUtils.oraclePrcRound(pUsIdxData.INDEX_EXTR2_UD_RATE_REAL_BY_CLOSE * 2.5 * 0.3, 2) * -1;
          pUsIdxData.IF_SUCC_YN = 'Y';
          
    }

    //빈객체가 아닐 시에 update 실행.
    if(Object.keys(pUsIdxData).length !== 0){
      await objUtils.dbQuery(db,
              `UPDATE MARKETS_WORLD_INDICES_INFO 
              SET ?, updated_at  = NOW()
              WHERE INDEX_ID      = 'KRW'
              AND   INDEX_SITE_ID = 'SMBS'
              AND   INDEX_DATE    = ?`,
                      [ pUsIdxData, pBfDate]);
    }

    //await browser.close(); // 반드시 호출
    return pUsIdxData;
  } catch (err) {
    console.error('USD/KRW 크롤링 중 에러:', err);        
    throw err;
  } finally {
    if (browser) await browser.close();  // browser가 선언됐을 때만 닫기
  }
}

async function fetchUsIdxYhFinance( pDate,pBfDate, pXBfDate, pUsHolyFlag, pKrHolyFlag) {
  let   pUsIdxData = {},
        yDateYnFlag = false,
        bfYDateFlag = false,
        indicesPlus = 0;  

  const usIdxSymbols = {
    'SNP': '^GSPC',        
    'NDQ': '^IXIC',
    'DWJ': '^DJI',
    'DXY': 'DX-Y.NYB',
    'TNX': '^TNX',
    'WTI': 'CL=F'
  };   

  console.log('fetchUsIdxYhFinance 호출!');
  //const resultPreAll = await Promise.allSettled(Object.entries(usIdxSymbols).map(async ([sName, symbol]) => {
  const entries = Object.entries(usIdxSymbols);
  const resultPreAll = [];

  pUsHolyFlag = pUsHolyFlag ?? 'N';
  pKrHolyFlag = pKrHolyFlag ?? 'N';
  for (const [sName, symbol] of entries) {
    yDateYnFlag = false;
    bfYDateFlag = false;
      try {                          
        const usIdxInfo = await objUtils.dbQuery(db,
              `SELECT * 
              FROM MARKETS_WORLD_INDICES_INFO
              WHERE INDEX_ID      = ?
              AND   INDEX_SITE_ID = 'YHF'
              AND   INDEX_DATE    = ? 
              LIMIT 1`, [sName,pBfDate]          
            );                                  

        //console.log('usIdxInfo:', usIdxInfo);

        // US Index 정보가 없는 경우(종가용)
        if ((usIdxInfo || []).length == 0) {
          await  objUtils.dbQuery(db,`INSERT INTO MARKETS_WORLD_INDICES_INFO (
                              INDEX_DATE, INDEX_ID, INDEX_SITE_ID, INDEX_SITE_NAME, KSP_STOCK_DATE, US_HOLYDAY_YN, KR_HOLYDAY_YN) 
                            VALUES(?, ?, 'YHF', 'Yahoo Finance', ?, ?, ?)`
                    , [pBfDate, sName, pDate, pUsHolyFlag, pKrHolyFlag]);
        }   

        const result = await yahooFinance.chart(symbol, {
          period1: pXBfDate,
          period2: pDate,
          interval: '1d'
        });
  
        if (!result || !result.quotes || result.quotes.length === 0) {
            console.warn(`[${symbol}] 데이터 없음`);            
            return;
        }        

        pUsIdxData = {};
        pUsIdxData.IF_SUCC_YN = 'N';

        for (const item of result.quotes) {
          //console.log('item:', item);
          //console.log('pXBfDate:',pXBfDate,moment(item.date).tz('America/New_York').format('YYYY-MM-DD'),pXBfDate === moment(item.date).tz('America/New_York').format('YYYY-MM-DD'),item.close != null, item.close);
          //console.log('pBfDate:' , pBfDate,moment(item.date).tz('America/New_York').format('YYYY-MM-DD'),pBfDate === moment(item.date).tz('America/New_York').format('YYYY-MM-DD'),item.close != null, item.close);          
          //전일 정보에 해당.
          if( pXBfDate === moment(item.date).tz('America/New_York').format('YYYY-MM-DD')  && item.close != null){            
            pUsIdxData.INDEX_STD_PRICE = Number(item.close).toFixed(2);   
            pUsIdxData.INDEX_MDF_STD_PRICE = Number(item.close).toFixed(2);   
                    
            bfYDateFlag = true;  
            
          //당일 정보에 해당.  
          }else if(pBfDate === moment(item.date).tz('America/New_York').format('YYYY-MM-DD') && item.close != null){    
            //console.log('어떻게??:',pBfDate,moment(item.date).tz('America/New_York').format('YYYY-MM-DD'),pBfDate === moment(item.date).tz('America/New_York').format('YYYY-MM-DD'),item.close != null, item.close);        
            pUsIdxData.INDEX_OPEN_PRICE = Number(item.open).toFixed(2);
            pUsIdxData.INDEX_HIGH_PRICE = Number(item.high).toFixed(2);   
            pUsIdxData.INDEX_LOW_PRICE = Number(item.low).toFixed(2);   
            pUsIdxData.INDEX_END_PRICE = Number(item.close).toFixed(2);   
            pUsIdxData.INDEX_UD_RATE_REAL_BY_TODAY = objUtils.calcRateRoundedClose( Number(pUsIdxData.INDEX_END_PRICE), Number(pUsIdxData.INDEX_OPEN_PRICE));
          
            yDateYnFlag = true;
          }       
        }       
        
        console.log('flag:', bfYDateFlag, yDateYnFlag);
        //Rate및 Score 정보는 전일, 전전일 정보가 존재해야만 작업한다.
        if(bfYDateFlag && yDateYnFlag ){          
            let diffPrice = Number(pUsIdxData.INDEX_END_PRICE) - Number(pUsIdxData.INDEX_STD_PRICE);
            pUsIdxData.INDEX_UD_PRICE = diffPrice.toFixed(2);
            pUsIdxData.INDEX_UD_RATE_REAL_BY_OPEN = objUtils.calcRateRoundedClose( Number(pUsIdxData.INDEX_OPEN_PRICE), Number(pUsIdxData.INDEX_STD_PRICE));
            pUsIdxData.INDEX_UD_RATE_REAL_BY_HIGH = objUtils.calcRateRoundedClose( Number(pUsIdxData.INDEX_HIGH_PRICE), Number(pUsIdxData.INDEX_STD_PRICE));
            pUsIdxData.INDEX_UD_RATE_REAL_BY_LOW = objUtils.calcRateRoundedClose( Number(pUsIdxData.INDEX_LOW_PRICE), Number(pUsIdxData.INDEX_STD_PRICE));
            pUsIdxData.INDEX_UD_RATE_REAL_BY_CLOSE = objUtils.calcRateRoundedClose( Number(pUsIdxData.INDEX_END_PRICE), Number(pUsIdxData.INDEX_STD_PRICE));
            if( sName === 'SNP'){
               if(Number(pUsIdxData.INDEX_UD_RATE_REAL_BY_TODAY) >= 1.0 ){
                  indicesPlus = 0.1;
               }else if(Number(pUsIdxData.INDEX_UD_RATE_REAL_BY_TODAY) > 0.0 ){
                  indicesPlus = 0.05;
               }else if(Number(pUsIdxData.INDEX_UD_RATE_REAL_BY_TODAY) == 0.0 ){
                  indicesPlus = 0.0;
               }else if(Number(pUsIdxData.INDEX_UD_RATE_REAL_BY_TODAY) >= -1.0 ){
                  indicesPlus = -0.05;
               }else{
                indicesPlus = -0.1;
               }
               
              pUsIdxData.INDEX_SCORE = Number(objUtils.oraclePrcRound(pUsIdxData.INDEX_UD_RATE_REAL_BY_CLOSE * 0.5, 2) + indicesPlus).toFixed(2);
            }else if( sName === 'NDQ'){
              if(Number(pUsIdxData.INDEX_UD_RATE_REAL_BY_TODAY) >= 1.0 ){
                  indicesPlus = 0.06;
               }else if(Number(pUsIdxData.INDEX_UD_RATE_REAL_BY_TODAY) > 0.0 ){
                  indicesPlus = 0.03;
               }else if(Number(pUsIdxData.INDEX_UD_RATE_REAL_BY_TODAY) == 0.0 ){
                  indicesPlus = 0.0;
               }else if(Number(pUsIdxData.INDEX_UD_RATE_REAL_BY_TODAY) >= -1.0 ){
                  indicesPlus = -0.03;
               }else{
                indicesPlus = -0.06;
               }
              pUsIdxData.INDEX_SCORE = Number(objUtils.oraclePrcRound(pUsIdxData.INDEX_UD_RATE_REAL_BY_CLOSE * 0.3, 2) + indicesPlus).toFixed(2);
            }else if( sName === 'DWJ'){
              if(Number(pUsIdxData.INDEX_UD_RATE_REAL_BY_TODAY) >= 1.0 ){
                  indicesPlus = 0.04;
               }else if(Number(pUsIdxData.INDEX_UD_RATE_REAL_BY_TODAY) > 0.0 ){
                  indicesPlus = 0.02;
               }else if(Number(pUsIdxData.INDEX_UD_RATE_REAL_BY_TODAY) == 0.0 ){
                  indicesPlus = 0.0;
               }else if(Number(pUsIdxData.INDEX_UD_RATE_REAL_BY_TODAY) >= -1.0 ){
                  indicesPlus = -0.02;
               }else{
                indicesPlus = -0.04;
               }
              pUsIdxData.INDEX_SCORE = Number(objUtils.oraclePrcRound(pUsIdxData.INDEX_UD_RATE_REAL_BY_CLOSE * 0.2, 2) + indicesPlus).toFixed(2);                           
            }else if( sName === 'DXY'){
              pUsIdxData.INDEX_SCORE = objUtils.oraclePrcRound(pUsIdxData.INDEX_UD_RATE_REAL_BY_CLOSE * 5 * 0.3, 2) * -1;                            
            }else if( sName === 'TNX'){
              pUsIdxData.INDEX_SCORE = objUtils.oraclePrcRound(pUsIdxData.INDEX_UD_RATE_REAL_BY_CLOSE * 0.3, 2) * -1;                            
            }else if( sName === 'WTI'){
              pUsIdxData.INDEX_SCORE = objUtils.oraclePrcRound(pUsIdxData.INDEX_UD_RATE_REAL_BY_CLOSE * 0.1, 2);                            
            }               
            pUsIdxData.IF_SUCC_YN = 'Y';
        }

        // 3대지수의 경우 전일 정보가 없는 경우 당일 오픈가를 기준가로 한다.
        //if( !bfYDateFlag && yDateYnFlag && ['SNP','NDQ','DWJ'].includes(sName)){                    
        if( !bfYDateFlag && yDateYnFlag){                    
            const indicesStdObj = await objUtils.dbQuery(db,
              `SELECT INDEX_END_PRICE 
              FROM MARKETS_WORLD_INDICES_INFO
              WHERE INDEX_ID      = ?
              AND   INDEX_SITE_ID = 'YHF'
              AND   IFNULL(US_HOLYDAY_YN,'N') != 'Y'
              AND   INDEX_DATE    < ? 
              AND   IFNULL(INDEX_END_PRICE,0) != 0
              ORDER BY INDEX_DATE DESC
              LIMIT 1`, [sName,pBfDate]          
            );                                  
            //console.log('indicesStdPrc:', indicesStdPrc);
            let indicesStdValue = indicesStdObj[0].INDEX_END_PRICE;
            console.log('indicesStdObj:', indicesStdObj);
            
            if (indicesStdValue === '' || indicesStdValue == null) {
              indicesStdValue = 0;
            }
            
            //if (pUsIdxData.INDEX_STD_PRICE === '' || pUsIdxData.INDEX_STD_PRICE == null) {
              //pUsIdxData.INDEX_STD_PRICE = 0;
            //}

            pUsIdxData.INDEX_STD_PRICE = indicesStdValue;
            pUsIdxData.INDEX_MDF_STD_PRICE = pUsIdxData.INDEX_OPEN_PRICE;
            let diffPrice = Number(pUsIdxData.INDEX_END_PRICE) - Number(pUsIdxData.INDEX_OPEN_PRICE);
            pUsIdxData.INDEX_UD_PRICE = diffPrice.toFixed(2);
            pUsIdxData.INDEX_UD_RATE_REAL_BY_OPEN  = objUtils.calcRateRoundedClose( Number(pUsIdxData.INDEX_OPEN_PRICE), Number(pUsIdxData.INDEX_MDF_STD_PRICE));
            pUsIdxData.INDEX_UD_RATE_REAL_BY_HIGH  = objUtils.calcRateRoundedClose( Number(pUsIdxData.INDEX_HIGH_PRICE), Number(pUsIdxData.INDEX_MDF_STD_PRICE));
            pUsIdxData.INDEX_UD_RATE_REAL_BY_LOW   = objUtils.calcRateRoundedClose( Number(pUsIdxData.INDEX_LOW_PRICE), Number(pUsIdxData.INDEX_MDF_STD_PRICE));
            pUsIdxData.INDEX_UD_RATE_REAL_BY_CLOSE = objUtils.calcRateRoundedClose( Number(pUsIdxData.INDEX_END_PRICE), Number(pUsIdxData.INDEX_MDF_STD_PRICE));
            if( sName === 'SNP'){              
              indicesPlus = 0.0;                              
              pUsIdxData.INDEX_SCORE = Number(objUtils.oraclePrcRound(pUsIdxData.INDEX_UD_RATE_REAL_BY_CLOSE * 0.5, 2) + indicesPlus).toFixed(2);
            }else if( sName === 'NDQ'){
              indicesPlus = 0.0;                              
              pUsIdxData.INDEX_SCORE = Number(objUtils.oraclePrcRound(pUsIdxData.INDEX_UD_RATE_REAL_BY_CLOSE * 0.3, 2) + indicesPlus).toFixed(2);
            }else if( sName === 'DWJ'){
              indicesPlus = 0.0;                              
              pUsIdxData.INDEX_SCORE = Number(objUtils.oraclePrcRound(pUsIdxData.INDEX_UD_RATE_REAL_BY_CLOSE * 0.2, 2) + indicesPlus).toFixed(2);                            
            }               
            pUsIdxData.IF_SUCC_YN = 'Y';          
        }
        
        //빈객체가 아닐 시에 update 실행.
        if(Object.keys(pUsIdxData).length !== 0){
          //console.log(`${sName} update 실행!:`,pUsIdxData,  );
          await objUtils.dbQuery(db,
              `UPDATE MARKETS_WORLD_INDICES_INFO 
              SET ?, updated_at  = NOW()
              WHERE INDEX_ID      = ?
              AND   INDEX_SITE_ID = 'YHF'              
              AND   INDEX_DATE    = ?`,
                      [ pUsIdxData, sName, pBfDate]);
        }

        //resultPreAll.push(pUsIdxData);
        //return resultPreAll;                
        resultPreAll.push({ status: 'fulfilled', value: { sName, pUsIdxData } });
        await objUtils.sleep(5000 + Math.floor(Math.random() * 5000));
      } catch (reason) {
        resultPreAll.push({ status: 'rejected', reason });
      }   
    }   
    //}));
    return resultPreAll;
}

async function fetchDataFromStooq(pToDate,pBfDate,pXBfDate, pUsHolyFlag, pKrHolyFlag) {
  //console.log('fetchDataFromStooq:',pToDate,pBfDate,pXBfDate);
  let   pUsIdxData = {},
        yDateYnFlag = false,
        bfYDateFlag = false,
        indicesPlus;  

  pUsHolyFlag = pUsHolyFlag ?? 'N';
  pKrHolyFlag = pKrHolyFlag ?? 'N';

  const usIdxSymbols = {
    'SNP': '^SPX',
    'NDQ': '^NDQ',
    'DWJ': '^DJI',
    'WTI': 'CL.F'
  };   
  console.log('fetchDataFromStooq 호출!');
  //const resultPreAll = await Promise.allSettled(
    //Object.entries(usIdxSymbols).map(async ([sName, symbol]) => {
      //try {
  const entries = Object.entries(usIdxSymbols);
  const resultPreAll = [];
  for (const [sName, symbol] of entries) {
    yDateYnFlag = false;
    bfYDateFlag = false;
      try {                                
        const usIdxInfo = await objUtils.dbQuery(db,
              `SELECT * 
              FROM MARKETS_WORLD_INDICES_INFO
              WHERE INDEX_ID      = ?
              AND   INDEX_SITE_ID = 'STQ'
              AND   INDEX_DATE    = ? 
              LIMIT 1`, [sName,pBfDate]          
            );                                  

        //console.log('usIdxInfo:', usIdxInfo);

        // US Index 정보가 없는 경우(종가용)
        if ((usIdxInfo || []).length == 0) {
          await  objUtils.dbQuery(db,`INSERT INTO MARKETS_WORLD_INDICES_INFO (
                              INDEX_DATE, INDEX_ID, INDEX_SITE_ID, INDEX_SITE_NAME, KSP_STOCK_DATE, US_HOLYDAY_YN, KR_HOLYDAY_YN) 
                            VALUES(?, ?, 'STQ', 'stooq', ?, ?, ?)`
                    , [pBfDate, sName, pToDate, pUsHolyFlag, pKrHolyFlag]);
        }   

        if (process.env.DEBUG_CRAWLER === '1') console.log('fetchDataFromStooq:', symbol, pBfDate);
        const url = `https://stooq.com/q/d/?s=${symbol}`;
        //const { data: html } = await axios.get(url);
        const { data: html } = await axios.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36'
          }
        });

        /*
        const response = await axios.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0',
            'Accept-Encoding': 'gzip, deflate, br'
          },
          decompress: true,
          responseType: 'text',     // 중요!
          transformResponse: [(data) => data] // 자동 파싱 비활성화
        });
        const html = response.data;
        */
        await new Promise(resolve => setTimeout(resolve, 200)); // 100~200ms
        const $ = cheerio.load(html);
        if (process.env.DEBUG_CRAWLER === '1') console.log(html.slice(0, 500));
        //const formattedDate = dayjs(dateStr).format('YYYY-MM-DD');
        const formattedPrevDate = objUtils.formatDateToStooq(pBfDate); // '14 Feb 2025'
        const formattedXPrevDate = objUtils.formatDateToStooq(pXBfDate); // '14 Feb 2025'
        let result = null;

        pUsIdxData = {};
        pUsIdxData.IF_SUCC_YN = 'N'; 
        
        console.log('테이블 개수:', $('table#fth1').length);
        console.log('행 개수:', $('table#fth1 tbody tr').length);
    
        $('table#fth1 tbody tr').each((_, el) => {                    
          const tds = $(el).find('td');
          const date = $(tds[1]).text().trim();
          console.log(111);
          console.log('date Chk1:', date, formattedPrevDate, formattedXPrevDate);    
          console.log('date Chk2:', date === formattedPrevDate, date === formattedXPrevDate);    
          //console.log('data Chk!!:', Number($(tds[2]).text().trim()).toFixed(2),Number($(tds[5]).text().trim()).toFixed(2));
          if (date === formattedPrevDate) {
            console.log('yDateYnFlag true!');
            //const open = $(tds[2]).text().trim();
            //const close = $(tds[5]).text().trim();
            //result = { date, open, high, low, close };
            pUsIdxData.INDEX_OPEN_PRICE = Number($(tds[2]).text().trim()).toFixed(2);
            pUsIdxData.INDEX_HIGH_PRICE = Number($(tds[3]).text().trim()).toFixed(2);
            pUsIdxData.INDEX_LOW_PRICE = Number($(tds[4]).text().trim()).toFixed(2);
            pUsIdxData.INDEX_END_PRICE = Number($(tds[5]).text().trim()).toFixed(2);   
            pUsIdxData.INDEX_UD_RATE_REAL_BY_TODAY = objUtils.calcRateRoundedClose( Number(pUsIdxData.INDEX_END_PRICE), Number(pUsIdxData.INDEX_OPEN_PRICE));
          
            yDateYnFlag = true;
          }else if(date === formattedXPrevDate){            
            console.log('bfYDateFlag true!');
            pUsIdxData.INDEX_STD_PRICE = Number($(tds[5]).text().trim()).toFixed(2);   
            pUsIdxData.INDEX_MDF_STD_PRICE = Number($(tds[5]).text().trim()).toFixed(2);   
            //console.log('std:', pUsIdxData.INDEX_STD_PRICE);

            bfYDateFlag = true; 
          }
        });

        //Rate및 Score 정보는 전일, 전전일 정보가 존재해야만 작업한다.
        if(bfYDateFlag && yDateYnFlag ){          
            let diffPrice = Number(pUsIdxData.INDEX_END_PRICE) - Number(pUsIdxData.INDEX_STD_PRICE);
            pUsIdxData.INDEX_UD_PRICE = diffPrice.toFixed(2);
            pUsIdxData.INDEX_UD_RATE_REAL_BY_OPEN  = objUtils.calcRateRoundedClose( Number(pUsIdxData.INDEX_OPEN_PRICE), Number(pUsIdxData.INDEX_STD_PRICE));
            pUsIdxData.INDEX_UD_RATE_REAL_BY_HIGH  = objUtils.calcRateRoundedClose( Number(pUsIdxData.INDEX_HIGH_PRICE), Number(pUsIdxData.INDEX_STD_PRICE));
            pUsIdxData.INDEX_UD_RATE_REAL_BY_LOW   = objUtils.calcRateRoundedClose( Number(pUsIdxData.INDEX_LOW_PRICE), Number(pUsIdxData.INDEX_STD_PRICE));
            pUsIdxData.INDEX_UD_RATE_REAL_BY_CLOSE = objUtils.calcRateRoundedClose( Number(pUsIdxData.INDEX_END_PRICE), Number(pUsIdxData.INDEX_STD_PRICE));
            if( sName === 'SNP'){
               if(Number(pUsIdxData.INDEX_UD_RATE_REAL_BY_TODAY) >= 1.0 ){
                  indicesPlus = 0.1;
               }else if(Number(pUsIdxData.INDEX_UD_RATE_REAL_BY_TODAY) > 0.0 ){
                  indicesPlus = 0.05;
               }else if(Number(pUsIdxData.INDEX_UD_RATE_REAL_BY_TODAY) == 0.0 ){
                  indicesPlus = 0.0;
               }else if(Number(pUsIdxData.INDEX_UD_RATE_REAL_BY_TODAY) >= -1.0 ){
                  indicesPlus = -0.05;
               }else{
                indicesPlus = -0.1;
               }
               
              pUsIdxData.INDEX_SCORE = Number(objUtils.oraclePrcRound(pUsIdxData.INDEX_UD_RATE_REAL_BY_CLOSE * 0.5, 2) + indicesPlus).toFixed(2);
            }else if( sName === 'NDQ'){
              if(Number(pUsIdxData.INDEX_UD_RATE_REAL_BY_TODAY) >= 1.0 ){
                  indicesPlus = 0.06;
               }else if(Number(pUsIdxData.INDEX_UD_RATE_REAL_BY_TODAY) > 0.0 ){
                  indicesPlus = 0.03;
               }else if(Number(pUsIdxData.INDEX_UD_RATE_REAL_BY_TODAY) == 0.0 ){
                  indicesPlus = 0.0;
               }else if(Number(pUsIdxData.INDEX_UD_RATE_REAL_BY_TODAY) >= -1.0 ){
                  indicesPlus = -0.03;
               }else{
                indicesPlus = -0.06;
               }
              pUsIdxData.INDEX_SCORE = Number(objUtils.oraclePrcRound(pUsIdxData.INDEX_UD_RATE_REAL_BY_CLOSE * 0.3, 2) + indicesPlus).toFixed(2);
            }else if( sName === 'DWJ'){
              if(Number(pUsIdxData.INDEX_UD_RATE_REAL_BY_TODAY) >= 1.0 ){
                  indicesPlus = 0.04;
               }else if(Number(pUsIdxData.INDEX_UD_RATE_REAL_BY_TODAY) > 0.0 ){
                  indicesPlus = 0.02;
               }else if(Number(pUsIdxData.INDEX_UD_RATE_REAL_BY_TODAY) == 0.0 ){
                  indicesPlus = 0.0;
               }else if(Number(pUsIdxData.INDEX_UD_RATE_REAL_BY_TODAY) >= -1.0 ){
                  indicesPlus = -0.02;
               }else{
                indicesPlus = -0.04;
               }
              pUsIdxData.INDEX_SCORE = Number(objUtils.oraclePrcRound(pUsIdxData.INDEX_UD_RATE_REAL_BY_CLOSE * 0.2, 2) + indicesPlus).toFixed(2);                            
            }else if( sName === 'WTI'){
              pUsIdxData.INDEX_SCORE = objUtils.oraclePrcRound(pUsIdxData.INDEX_UD_RATE_REAL_BY_CLOSE * 0.1, 2);                            
            }               
            pUsIdxData.IF_SUCC_YN = 'Y';        
        }

        // 3대지수의 경우 전일 정보가 없는 경우 당일 오픈가를 기준가로 한다.
        if( !bfYDateFlag && yDateYnFlag && ['SNP','NDQ','DWJ'].includes(sName)){          
          
            const indicesStdPrc = await objUtils.dbQuery(db,
              `SELECT INDEX_END_PRICE 
              FROM MARKETS_WORLD_INDICES_INFO
              WHERE INDEX_ID      = ?
              AND   INDEX_SITE_ID = 'STQ'              
              AND   IFNULL(US_HOLYDAY_YN,'N') != 'Y'
              AND   INDEX_DATE    < ? 
              ORDER BY INDEX_DATE DESC
              LIMIT 1`, [sName,pBfDate]          
            );                                  

            pUsIdxData.INDEX_STD_PRICE = indicesStdPrc;   
            
            pUsIdxData.INDEX_MDF_STD_PRICE = pUsIdxData.INDEX_OPEN_PRICE;

            //pUsIdxData.INDEX_STD_PRICE = pUsIdxData.INDEX_OPEN_PRICE;
            let diffPrice = Number(pUsIdxData.INDEX_END_PRICE) - Number(pUsIdxData.INDEX_OPEN_PRICE);
            pUsIdxData.INDEX_UD_PRICE = diffPrice.toFixed(2);
            pUsIdxData.INDEX_UD_RATE_REAL_BY_OPEN  = objUtils.calcRateRoundedClose( Number(pUsIdxData.INDEX_OPEN_PRICE), Number(pUsIdxData.INDEX_MDF_STD_PRICE));
            pUsIdxData.INDEX_UD_RATE_REAL_BY_HIGH  = objUtils.calcRateRoundedClose( Number(pUsIdxData.INDEX_HIGH_PRICE), Number(pUsIdxData.INDEX_MDF_STD_PRICE));
            pUsIdxData.INDEX_UD_RATE_REAL_BY_LOW   = objUtils.calcRateRoundedClose( Number(pUsIdxData.INDEX_LOW_PRICE), Number(pUsIdxData.INDEX_MDF_STD_PRICE));
            pUsIdxData.INDEX_UD_RATE_REAL_BY_CLOSE = objUtils.calcRateRoundedClose( Number(pUsIdxData.INDEX_END_PRICE), Number(pUsIdxData.INDEX_MDF_STD_PRICE));
            if( sName === 'SNP'){              
              indicesPlus = 0.0;                              
              pUsIdxData.INDEX_SCORE = Number(objUtils.oraclePrcRound(pUsIdxData.INDEX_UD_RATE_REAL_BY_CLOSE * 0.5, 2) + indicesPlus).toFixed(2);
            }else if( sName === 'NDQ'){
              indicesPlus = 0.0;                              
              pUsIdxData.INDEX_SCORE = Number(objUtils.oraclePrcRound(pUsIdxData.INDEX_UD_RATE_REAL_BY_CLOSE * 0.3, 2) + indicesPlus).toFixed(2);
            }else if( sName === 'DWJ'){
              indicesPlus = 0.0;                              
              pUsIdxData.INDEX_SCORE = Number(objUtils.oraclePrcRound(pUsIdxData.INDEX_UD_RATE_REAL_BY_CLOSE * 0.2, 2) + indicesPlus).toFixed(2);                            
            }               
            pUsIdxData.IF_SUCC_YN = 'Y';         
        }
        //console.log('pUsIdxData:', pUsIdxData);
        //빈객체가 아닐 시에 update 실행.
        if(Object.keys(pUsIdxData).length !== 0){
          await objUtils.dbQuery(db,
              `UPDATE MARKETS_WORLD_INDICES_INFO 
              SET ?, updated_at  = NOW()
              WHERE INDEX_ID      = ?
              AND   INDEX_SITE_ID = 'STQ'              
              AND   INDEX_DATE    = ?`,
                      [ pUsIdxData, sName, pBfDate]);
        }

        resultPreAll.push({ status: 'fulfilled', value: { sName, pUsIdxData } });        
      } catch (reason) {
        resultPreAll.push({ status: 'rejected', reason });        
      }        
      await objUtils.sleep(5000 + Math.floor(Math.random() * 5000));  
    }  
    return resultPreAll;
}

async function getFrankFurterDxyApi(pToDate, pBfDate, pXBfDate, pUsHolyFlag, pKrHolyFlag) {
  const endInfoUrl = `https://api.frankfurter.app/${pBfDate}`;
  const stdInfoUrl = `https://api.frankfurter.app/${pXBfDate}`;
  const excSymbols = ['EUR', 'JPY', 'GBP', 'CAD', 'SEK', 'CHF'];

  let endUsdTo,
      stdUsdTo,
      stdDxy,
      endDxy,
      yDateYnFlag = false,
      bfYDateFlag = false,
      pUsIdxData = {};

  pUsHolyFlag = pUsHolyFlag ?? 'N';
  pKrHolyFlag = pKrHolyFlag ?? 'N';

  try {
    console.log('getFrankFurterDxyApi 호출!');
    const dxyInfo = await objUtils.dbQuery(db,
              `SELECT * 
              FROM MARKETS_WORLD_INDICES_INFO
              WHERE INDEX_ID      = 'DXY'
              AND   INDEX_SITE_ID = 'FRF'
              AND   INDEX_DATE    = ? 
              LIMIT 1`, [pBfDate]          
            );                                  

        //console.log('dxyInfo:', dxyInfo);

        // US  Dollar Index 정보가 없는 경우(종가용)
        if ((dxyInfo || []).length == 0) {
          await  objUtils.dbQuery(db,`INSERT INTO MARKETS_WORLD_INDICES_INFO (
                              INDEX_DATE, INDEX_ID, INDEX_SITE_ID, INDEX_SITE_NAME, KSP_STOCK_DATE, US_HOLYDAY_YN, KR_HOLYDAY_YN) 
                            VALUES(?, 'DXY', 'FRF', 'Frank Furter', ?, ?, ?)`
                    , [pBfDate, pToDate, pUsHolyFlag, pKrHolyFlag]);
        }   

    const resStdInfo = await axios.get(`${stdInfoUrl}?from=USD&to=${excSymbols.join(',')}`);
    const stdRates = resStdInfo.data.rates;
    console.log('stdRates:', stdRates);

    pUsIdxData.IF_SUCC_YN = 'N';        
    if (!stdRates || Object.keys(stdRates).length === 0) {
      console.error('기준 달러인덱스 정보를 가져올 수 없습니다.');
      //return null;
    }else{
      // 개별 환율 추출
      stdUsdTo = {
        EUR: 1 / stdRates.EUR,  // EUR/USD
        JPY: stdRates.JPY,      // USD/JPY
        GBP: 1 / stdRates.GBP,  // GBP/USD
        CAD: stdRates.CAD,      // USD/CAD
        SEK: 1 / stdRates.SEK,  // SEK/USD
        CHF: 1 / stdRates.CHF   // CHF/USD
      };

      // DXY 공식 적용
      stdDxy =
        50.14348112 *
        Math.pow(stdUsdTo.EUR, -0.576) *
        Math.pow(stdUsdTo.JPY, 0.136) *
        Math.pow(stdUsdTo.GBP, -0.119) *
        Math.pow(stdUsdTo.CAD, 0.091) *
        Math.pow(stdUsdTo.SEK, -0.042) *
        Math.pow(stdUsdTo.CHF, -0.036);

        pUsIdxData.INDEX_STD_PRICE = Number(stdDxy).toFixed(2);
        pUsIdxData.INDEX_MDF_STD_PRICE = pUsIdxData.INDEX_STD_PRICE;
        bfYDateFlag = true;        
    }

    const resEndInfo = await axios.get(`${endInfoUrl}?from=USD&to=${excSymbols.join(',')}`);
    const endRates = resEndInfo.data.rates;
    console.log('endRates:', endRates);

     if (!endRates || Object.keys(endRates).length === 0) {
      console.error('달러 인덱스 정보를 가져올 수 없습니다.');
      //return null;
    }else{
      // 개별 환율 추출
      endUsdTo = {
        EUR: 1 / endRates.EUR,  // EUR/USD
        JPY: endRates.JPY,      // USD/JPY
        GBP: 1 / endRates.GBP,  // GBP/USD
        CAD: endRates.CAD,      // USD/CAD
        SEK: 1 / endRates.SEK,  // SEK/USD
        CHF: 1 / endRates.CHF   // CHF/USD
      };

      // DXY 공식 적용
      endDxy =
        50.14348112 *
        Math.pow(endUsdTo.EUR, -0.576) *
        Math.pow(endUsdTo.JPY, 0.136) *
        Math.pow(endUsdTo.GBP, -0.119) *
        Math.pow(endUsdTo.CAD, 0.091) *
        Math.pow(endUsdTo.SEK, -0.042) *
        Math.pow(endUsdTo.CHF, -0.036);

      pUsIdxData.INDEX_END_PRICE = Number(endDxy).toFixed(2);;
      yDateYnFlag = true;
    }
    
    if( yDateYnFlag && bfYDateFlag){      
      pUsIdxData.INDEX_UD_RATE_REAL_BY_CLOSE = objUtils.calcRateRoundedClose( Number(pUsIdxData.INDEX_END_PRICE), Number(pUsIdxData.INDEX_STD_PRICE));
      pUsIdxData.INDEX_SCORE = objUtils.oraclePrcRound(pUsIdxData.INDEX_UD_RATE_REAL_BY_CLOSE * 5 * 0.3, 2) * -1;
      pUsIdxData.IF_SUCC_YN = 'Y';        
    }

    //빈객체가 아닐 시에 update 실행.
    if(Object.keys(pUsIdxData).length !== 0){
     await objUtils.dbQuery(db,
              `UPDATE MARKETS_WORLD_INDICES_INFO 
              SET ?, updated_at  = NOW()
              WHERE INDEX_ID      = 'DXY'
              AND   INDEX_SITE_ID = 'FRF'              
              AND   INDEX_DATE    = ?`,
                      [ pUsIdxData, pBfDate]);
     }
    //console.log(`📅 날짜: ${date}`);
    //console.log('💱 환율 정보:', usdTo);
    //console.log(`📊 계산된 DXY: ${dxy.toFixed(3)}`);
    return pUsIdxData;
  } catch (err) {
    console.error('⚠️ 달러인덱스 가져오기 실패:', err.message);
    return null;
  }
}

async function fetchFredData(pToDate, pBfDate, pXBfDate, pUsHolyFlag, pKrHolyFlag) {
      const seriesId = 'DGS10';
      const apiKey = 'b8b4610003f634f8684dc4df70d44c18';
      const start = dayjs(pXBfDate).format('YYYY-MM-DD');
      const end = dayjs(pBfDate).format('YYYY-MM-DD');      
      let yDateYnFlag = false,
          bfYDateFlag = false,
          pUsIdxData = {};

      pUsHolyFlag = pUsHolyFlag ?? 'N';
      pKrHolyFlag = pKrHolyFlag ?? 'N';
  
      const url = `https://api.stlouisfed.org/fred/series/observations`;
      console.log('fetchFredData 호출!');
      try {
          const tnxInfo = await objUtils.dbQuery(db,
                `SELECT * 
                FROM MARKETS_WORLD_INDICES_INFO
                WHERE INDEX_ID      = 'TNX'
                AND   INDEX_SITE_ID = 'FRED'
                AND   INDEX_DATE    = ? 
                LIMIT 1`, [pBfDate]          
              );                                  

          //console.log('tnxInfo:', tnxInfo);

          // US  Dollar Index 정보가 없는 경우(종가용)
          if ((tnxInfo || []).length == 0) {
            await  objUtils.dbQuery(db,`INSERT INTO MARKETS_WORLD_INDICES_INFO (
                                INDEX_DATE, INDEX_ID, INDEX_SITE_ID, INDEX_SITE_NAME, KSP_STOCK_DATE, US_HOLYDAY_YN, KR_HOLYDAY_YN) 
                              VALUES(?, 'TNX', 'FRED', 'FRED 10Y', ?, ?, ?)`
                      , [pBfDate, pToDate, pUsHolyFlag, pKrHolyFlag]);
          } 

          const response = await axios.get(url, {
            params: {
                series_id: seriesId,
                api_key: apiKey,
                file_type: 'json',
                observation_start: pXBfDate,
                observation_end: pToDate,
            },
          });
  
          pUsIdxData.IF_SUCC_YN = 'N';        
          const obs = response.data.observations;
          console.log('obs:', obs, obs.length);
          //console.log('obs 실행일자:', pXBfDate, pBfDate);
          if (obs.length === 0) {
            return null;
          }else{
            for (const item of obs) {
              //console.log('item:', item, pBfDate,pXBfDate);
              if (item.date === pBfDate) {
                pUsIdxData.INDEX_END_PRICE = Number(item.value).toFixed(2);   
                yDateYnFlag = true;
                
              }else if(item.date === pXBfDate){
                pUsIdxData.INDEX_STD_PRICE = Number(item.value).toFixed(2);   
                pUsIdxData.INDEX_MDF_STD_PRICE = pUsIdxData.INDEX_STD_PRICE;   
                bfYDateFlag = true;
              }
            }
            if( yDateYnFlag && bfYDateFlag){    
              let diffPrice = Number(pUsIdxData.INDEX_END_PRICE) - Number(pUsIdxData.INDEX_STD_PRICE);
              pUsIdxData.INDEX_UD_PRICE = diffPrice.toFixed(2);
              pUsIdxData.INDEX_UD_RATE_REAL_BY_CLOSE = objUtils.calcRateRoundedClose( Number(pUsIdxData.INDEX_END_PRICE), Number(pUsIdxData.INDEX_STD_PRICE));
              pUsIdxData.INDEX_SCORE = objUtils.oraclePrcRound(pUsIdxData.INDEX_UD_RATE_REAL_BY_CLOSE * 0.3, 2) * -1; 
              pUsIdxData.IF_SUCC_YN = 'Y';        
            }       
            
            //빈객체가 아닐 시에 update 실행.
            if(Object.keys(pUsIdxData).length !== 0){
              await objUtils.dbQuery(db,
                `UPDATE MARKETS_WORLD_INDICES_INFO 
                SET ?, updated_at  = NOW()
                WHERE INDEX_ID      = 'TNX'
                AND   INDEX_SITE_ID = 'FRED'              
                AND   INDEX_DATE    = ?`,
                        [ pUsIdxData, pBfDate]);
            }
          }
  
          return pUsIdxData;
      } catch (err) {
          console.error('❌ Error fetching FRED data:', err.message);
          return null;
      }
  }

  async function fetchUsdIdxDataFromInvesting(pToDate, pBfDate, pXBfDate, pUsHolyFlag, pKrHolyFlag) {
  const usIdxSymbols = {
    'SNP': 'https://www.investing.com/indices/us-spx-500-historical-data',
    'NDQ': 'https://www.investing.com/indices/nasdaq-composite-historical-data',
    'DWJ': 'https://www.investing.com/indices/us-30-historical-data',
    'DXY': 'https://www.investing.com/indices/usdollar-historical-data?cid=1224074',
    'TNX': 'https://www.investing.com/rates-bonds/u.s.-10-year-bond-yield-historical-data',
    'WTI': 'https://www.investing.com/commodities/crude-oil-historical-data',
    'KRW': 'https://www.investing.com/currencies/usd-krw-historical-data'
  };

  const parsedBfDate  = dayjs(pBfDate).format('MMM DD, YYYY');
  const parsedXBfDate = dayjs(pXBfDate).format('MMM DD, YYYY');

  console.log('fetchUsdIdxDataFromInvesting 호출!');
  const resultPreAll = [];
  let browser;
  let failStreak = 0;

  const LAUNCH_ARGS = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    // '--single-process', // ← 오히려 불안정할 수 있어 비활성
    '--disable-features=site-per-process',
    '--blink-settings=imagesEnabled=false',
  ];

  const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36';
  const ACCEPT_LANG = 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7';

  async function launchInvestingBrowser() {
    const b = await launchBrowserCore({ headless: true, args: LAUNCH_ARGS, timeout: 0 });
    return b;
  }

  // Investing 첫 방문으로 쿠키/세션 warm-up
  async function warmUp(b) {
    let page;
    try {
      page = await b.newPage();
      await page.setUserAgent(UA);
      await page.setExtraHTTPHeaders({ 'Accept-Language': ACCEPT_LANG });
      await page.setRequestInterception(true);
      page.on('request', req => {
        const t = req.resourceType();
        if (t === 'image' || t === 'media' || t === 'font') return req.abort();
        req.continue();
      });
      await page.goto('https://www.investing.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });
      await objUtils.sleep(1500);
    } catch (e) {
      console.warn('warmUp 실패(무시 가능):', e.message);
    } finally {
      if (page) await page.close().catch(() => {});
    }
  }

  // 이동 + 셀렉터 대기 재시도 유틸
  async function gotoWithRetry(page, url, selector, navTimeout = 60000, selTimeout = 30000, retries = 1) {
    for (let i = 0; i <= retries; i++) {
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: navTimeout });
        await page.waitForSelector(selector, { timeout: selTimeout });
        return true;
      } catch (e) {
        if (i === retries) throw e;
        console.warn(`goto 재시도 ${i + 1}/${retries}:`, e.message);
        try { await page.reload({ waitUntil: 'domcontentloaded', timeout: navTimeout }); } catch {}
        await objUtils.sleep(1200 + Math.random() * 800);
      }
    }
  }

  try {
    // 브라우저 1회 띄우고 warm-up
    browser = await launchInvestingBrowser();
    await warmUp(browser);

    pUsHolyFlag = pUsHolyFlag ?? 'N';
    pKrHolyFlag = pKrHolyFlag ?? 'N';

    for (const [sName, sUrl] of Object.entries(usIdxSymbols)) {
      let page;
      console.log(`→ 처리중: ${sName}`, sUrl);

      try {
        // 사전 DB ensure
        const usIdxInfo = await objUtils.dbQuery(
          db,
          `SELECT * 
           FROM MARKETS_WORLD_INDICES_INFO
           WHERE INDEX_ID = ? AND INDEX_SITE_ID = 'INV' AND INDEX_DATE = ? 
           LIMIT 1`,
          [sName, pBfDate]
        );
        if ((usIdxInfo || []).length == 0) {
          await objUtils.dbQuery(
            db,
            `INSERT INTO MARKETS_WORLD_INDICES_INFO
             (INDEX_DATE, INDEX_ID, INDEX_SITE_ID, INDEX_SITE_NAME, KSP_STOCK_DATE, US_HOLYDAY_YN, KR_HOLYDAY_YN) 
             VALUES(?, ?, 'INV', 'Investing', ?, ?, ?)`,
            [pBfDate, sName, pToDate, pUsHolyFlag, pKrHolyFlag]
          );
        }

        // 페이지 생성 + 경량화
        page = await browser.newPage();
        await page.setUserAgent(UA);
        await page.setExtraHTTPHeaders({ 'Accept-Language': ACCEPT_LANG });
        await page.setViewport({ width: 1366, height: 768 });
        page.setDefaultNavigationTimeout(60000);
        page.setDefaultTimeout(30000);
        await page.setRequestInterception(true);
        page.on('request', req => {
          const t = req.resourceType();
          if (t === 'image' || t === 'media' || t === 'font') return req.abort();
          req.continue();
        });

        // 이동 + 테이블 대기 (재시도 1회)
        await gotoWithRetry(page, sUrl, 'table.freeze-column-w-1 tbody tr', 60000, 30000, 1);

        const html = await page.content();
        const $ = cheerio.load(html);

        if ($('table.freeze-column-w-1').length > 0) {
          console.log('✅ table.freeze-column-w-1 있음');
        } else {
          console.log('❌ table.freeze-column-w-1 없음');
        }

        let pUsIdxData = {};
        let yDateYnFlag = false;
        let bfYDateFlag = false;
        let indicesPlus;

        // ※ 테이블 구조 주의: 날짜가 td[0]에, Close가 td[1], Open이 td[2]인 케이스가 많음
        $('table.freeze-column-w-1 tbody tr').each((i, el) => {
          const tds = $(el).find('td');
          const date = $(tds[0]).text().trim();

          if (date === parsedBfDate) {
            const open  = Number(objUtils.cleanNumber($(tds[2]).text().trim()));
            const close = Number(objUtils.cleanNumber($(tds[1]).text().trim()));
            pUsIdxData.INDEX_OPEN_PRICE = open.toFixed(2);
            pUsIdxData.INDEX_END_PRICE  = close.toFixed(2);
            pUsIdxData.INDEX_UD_RATE_REAL_BY_TODAY = objUtils.calcRateRoundedClose(close, open);
            yDateYnFlag = true;
          } else if (date === parsedXBfDate) {
            const closeStd = Number(objUtils.cleanNumber($(tds[1]).text().trim()));
            pUsIdxData.INDEX_STD_PRICE     = closeStd.toFixed(2);
            pUsIdxData.INDEX_MDF_STD_PRICE = pUsIdxData.INDEX_STD_PRICE;
            bfYDateFlag = true;
          }
        });

        // 전전일(기준가)이 테이블에 없으면 DB로 보정
        if (!bfYDateFlag) {
          const indicesStdObj = await objUtils.dbQuery(
            db,
            `SELECT INDEX_END_PRICE 
             FROM MARKETS_WORLD_INDICES_INFO
             WHERE INDEX_ID = ?
               AND INDEX_SITE_ID = 'INV'
               AND IFNULL(US_HOLYDAY_YN,'N') != 'Y'
               AND INDEX_DATE < ?
               AND IFNULL(INDEX_END_PRICE,0) != 0
             ORDER BY INDEX_DATE DESC
             LIMIT 1`,
            [sName, pXBfDate]
          );
          if ((indicesStdObj || []).length > 0) {
            const val = Number(indicesStdObj[0].INDEX_END_PRICE);
            pUsIdxData.INDEX_STD_PRICE     = val.toFixed(2);
            pUsIdxData.INDEX_MDF_STD_PRICE = pUsIdxData.INDEX_STD_PRICE;
            bfYDateFlag = true;
          }
        }

        // 전일/전전일 둘 다 확보 시 계산
        if (bfYDateFlag && yDateYnFlag) {
          const diffPrice = Number(pUsIdxData.INDEX_END_PRICE) - Number(pUsIdxData.INDEX_STD_PRICE);
          pUsIdxData.INDEX_UD_PRICE = diffPrice.toFixed(2);
          pUsIdxData.INDEX_UD_RATE_REAL_BY_OPEN  = objUtils.calcRateRoundedClose(Number(pUsIdxData.INDEX_OPEN_PRICE), Number(pUsIdxData.INDEX_STD_PRICE));
          pUsIdxData.INDEX_UD_RATE_REAL_BY_CLOSE = objUtils.calcRateRoundedClose(Number(pUsIdxData.INDEX_END_PRICE), Number(pUsIdxData.INDEX_STD_PRICE));

          if (sName === 'SNP') {
            if (Number(pUsIdxData.INDEX_UD_RATE_REAL_BY_TODAY) >= 1.0)       indicesPlus = 0.1;
            else if (Number(pUsIdxData.INDEX_UD_RATE_REAL_BY_TODAY) > 0.0)   indicesPlus = 0.05;
            else if (Number(pUsIdxData.INDEX_UD_RATE_REAL_BY_TODAY) == 0.0)  indicesPlus = 0.0;
            else if (Number(pUsIdxData.INDEX_UD_RATE_REAL_BY_TODAY) >= -1.0) indicesPlus = -0.05;
            else                                                             indicesPlus = -0.1;
            pUsIdxData.INDEX_SCORE = Number(objUtils.oraclePrcRound(pUsIdxData.INDEX_UD_RATE_REAL_BY_CLOSE * 0.5, 2) + indicesPlus).toFixed(2);
          } else if (sName === 'NDQ') {
            if (Number(pUsIdxData.INDEX_UD_RATE_REAL_BY_TODAY) >= 1.0)       indicesPlus = 0.06;
            else if (Number(pUsIdxData.INDEX_UD_RATE_REAL_BY_TODAY) > 0.0)   indicesPlus = 0.03;
            else if (Number(pUsIdxData.INDEX_UD_RATE_REAL_BY_TODAY) == 0.0)  indicesPlus = 0.0;
            else if (Number(pUsIdxData.INDEX_UD_RATE_REAL_BY_TODAY) >= -1.0) indicesPlus = -0.03;
            else                                                             indicesPlus = -0.06;
            pUsIdxData.INDEX_SCORE = Number(objUtils.oraclePrcRound(pUsIdxData.INDEX_UD_RATE_REAL_BY_CLOSE * 0.3, 2) + indicesPlus).toFixed(2);
          } else if (sName === 'DWJ') {
            if (Number(pUsIdxData.INDEX_UD_RATE_REAL_BY_TODAY) >= 1.0)       indicesPlus = 0.04;
            else if (Number(pUsIdxData.INDEX_UD_RATE_REAL_BY_TODAY) > 0.0)   indicesPlus = 0.02;
            else if (Number(pUsIdxData.INDEX_UD_RATE_REAL_BY_TODAY) == 0.0)  indicesPlus = 0.0;
            else if (Number(pUsIdxData.INDEX_UD_RATE_REAL_BY_TODAY) >= -1.0) indicesPlus = -0.02;
            else                                                             indicesPlus = -0.04;
            pUsIdxData.INDEX_SCORE = Number(objUtils.oraclePrcRound(pUsIdxData.INDEX_UD_RATE_REAL_BY_CLOSE * 0.2, 2) + indicesPlus).toFixed(2);
          } else if (sName === 'DXY') {
            pUsIdxData.INDEX_SCORE = objUtils.oraclePrcRound(pUsIdxData.INDEX_UD_RATE_REAL_BY_CLOSE * 5 * 0.3, 2) * -1;
          } else if (sName === 'TNX') {
            pUsIdxData.INDEX_SCORE = objUtils.oraclePrcRound(pUsIdxData.INDEX_UD_RATE_REAL_BY_CLOSE * 0.3, 2) * -1;
          } else if (sName === 'WTI') {
            pUsIdxData.INDEX_SCORE = objUtils.oraclePrcRound(pUsIdxData.INDEX_UD_RATE_REAL_BY_CLOSE * 0.1, 2);
          } else if (sName === 'KRW') {
            pUsIdxData.INDEX_SCORE = objUtils.oraclePrcRound(pUsIdxData.INDEX_UD_RATE_REAL_BY_CLOSE * 2.5 * 0.3, 2) * -1;
          }
          pUsIdxData.IF_SUCC_YN = 'Y';
        }

        // 전전일 없는 케이스 보정 (오픈가 기준)
        if (!bfYDateFlag && yDateYnFlag) {
          console.log(sName + ': 전전일 데이터 미존재!');
          const indicesStdPrc = await objUtils.dbQuery(
            db,
            `SELECT INDEX_END_PRICE 
             FROM MARKETS_WORLD_INDICES_INFO
             WHERE INDEX_ID = ?
               AND INDEX_SITE_ID = 'INV'
               AND IFNULL(US_HOLYDAY_YN,'N') != 'Y'
               AND INDEX_DATE < ?
             ORDER BY INDEX_DATE DESC
             LIMIT 1`,
            [sName, pBfDate]
          );

          pUsIdxData.INDEX_STD_PRICE = indicesStdPrc; // (주의) 이건 배열 그대로 셋팅하던 기존 로직 유지
          if (pUsIdxData.INDEX_STD_PRICE === '' || pUsIdxData.INDEX_STD_PRICE == null) {
            pUsIdxData.INDEX_STD_PRICE = 0;
          }

          pUsIdxData.INDEX_MDF_STD_PRICE = pUsIdxData.INDEX_OPEN_PRICE;
          const diffPrice = Number(pUsIdxData.INDEX_END_PRICE) - Number(pUsIdxData.INDEX_OPEN_PRICE);
          pUsIdxData.INDEX_UD_PRICE = diffPrice.toFixed(2);
          pUsIdxData.INDEX_UD_RATE_REAL_BY_OPEN  = objUtils.calcRateRoundedClose(Number(pUsIdxData.INDEX_OPEN_PRICE), Number(pUsIdxData.INDEX_STD_PRICE));
          pUsIdxData.INDEX_UD_RATE_REAL_BY_CLOSE = objUtils.calcRateRoundedClose(Number(pUsIdxData.INDEX_END_PRICE), Number(pUsIdxData.INDEX_STD_PRICE));
          indicesPlus = 0.0;
          if (sName === 'SNP') {
            pUsIdxData.INDEX_SCORE = Number(objUtils.oraclePrcRound(pUsIdxData.INDEX_UD_RATE_REAL_BY_CLOSE * 0.5, 2) + indicesPlus).toFixed(2);
          } else if (sName === 'NDQ') {
            pUsIdxData.INDEX_SCORE = Number(objUtils.oraclePrcRound(pUsIdxData.INDEX_UD_RATE_REAL_BY_CLOSE * 0.3, 2) + indicesPlus).toFixed(2);
          } else if (sName === 'DWJ') {
            pUsIdxData.INDEX_SCORE = Number(objUtils.oraclePrcRound(pUsIdxData.INDEX_UD_RATE_REAL_BY_CLOSE * 0.2, 2) + indicesPlus).toFixed(2);
          }
          pUsIdxData.IF_SUCC_YN = 'Y';
        }

        // 업데이트
        if (Object.keys(pUsIdxData).length !== 0) {
          await objUtils.dbQuery(
            db,
            `UPDATE MARKETS_WORLD_INDICES_INFO 
             SET ?, updated_at = NOW()
             WHERE INDEX_ID = ? AND INDEX_SITE_ID = 'INV' AND INDEX_DATE = ?`,
            [pUsIdxData, sName, pBfDate]
          );
        }

        resultPreAll.push({ status: 'fulfilled', value: { sName, pUsIdxData } });
        failStreak = 0; // 성공 시 리셋
      } catch (err) {
        console.error(`${sName} 처리 중 에러:`, err);
        resultPreAll.push({ status: 'rejected', reason: err });

        // 브라우저 세션 끊김 or 실패 누적 시 재시작
        if (err.message?.includes('browser has disconnected') || ++failStreak >= 2) {
          console.warn('⚠️ 브라우저 재시작');
          try { await browser.close(); } catch {}
          browser = await launchInvestingBrowser();
          await warmUp(browser);
          failStreak = 0;
        }
      } finally {
        if (page) await page.close().catch(() => {});
        await objUtils.sleep(2500 + Math.floor(Math.random() * 2000));
      }
    }
  } catch (e) {
    console.error('❌ 전체 처리 중 치명적 에러:', e.message);
  } finally {
    if (browser) await browser.close().catch(() => {});
  }

  return resultPreAll;
}


  //Naver를 통한 API 통신 
  async function fetchIndicesStdNaverData(pToDate, pBfDate, pXBfDate, pUsHolyFlag, pKrHolyFlag) {
    let   etfBfDate,
          kspEtfStdPrc = 1000;
    console.log('fetchIndicesStdNaverData333 시작!!');
    pUsHolyFlag = pUsHolyFlag ?? 'N';
    pKrHolyFlag = pKrHolyFlag ?? 'N';

    const indicesStdPrc = await objUtils.dbQuery(db,
          `SELECT INDEX_END_PRICE
                 ,INDEX_DATE 
          FROM MARKETS_WORLD_INDICES_INFO
          WHERE INDEX_ID      = ?
          AND   INDEX_SITE_ID = 'NVR'
          AND   KR_HOLYDAY_YN != 'Y'
          AND   INDEX_DATE    < ? 
          ORDER BY INDEX_DATE DESC
          LIMIT 1`, ['KSP',pToDate]
    );                                  
  
    console.log('indicesStdPrc:', indicesStdPrc);
    etfBfDate = indicesStdPrc[0].INDEX_DATE;
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
            INDEX_DATE, INDEX_ID, INDEX_SITE_ID, INDEX_SITE_NAME, KSP_STOCK_DATE, US_HOLYDAY_YN, KR_HOLYDAY_YN, INDEX_STD_PRICE, INDEX_MDF_STD_PRICE) 
            VALUES(?, ?, 'NVR', 'Naver Finance', ?, ?, ?, ?, ?)`
          , [pToDate, 'KSP', pToDate, pUsHolyFlag, pKrHolyFlag, indicesStdPrc[0].INDEX_END_PRICE, indicesStdPrc[0].INDEX_END_PRICE]);
    }                   
    
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
  }

  async function fetchIndicesKspHistoryYahooData( pToDate,pBfDate, pXBfDate, pUsHolyFlag, pKrHolyFlag) {
    let   pKrIdxData = {},
          kspEtfStdPrc = 1000,
          pKspLvgData = {},
          pKspI2XData = {},
          resultPreAll = [],
          etfBfDate,
          bfYDateFlag = false,
          yDateYnFlag = false;
    
    console.log('fetchIndicesKspHistoryYahooData 시작!!');
    pUsHolyFlag = pUsHolyFlag ?? 'N';
    pKrHolyFlag = pKrHolyFlag ?? 'N';
                
    try {                                  
        const result = await yahooFinance.chart('^KS11', {
          period1: pXBfDate,
          period2: pToDate,
          interval: '1d'
        });
  
        if (!result || !result.quotes || result.quotes.length === 0) {
            console.warn(`[${symbol}] 데이터 없음`);            
            return;
        }       
        
      
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
            ETF_STOCK_DATE, ETF_STOCK_ID, ETF_SITE_ID, ETF_SITE_NAME, ETF_STOCK_NAME) 
            VALUES(?, ?, 'YHF', 'Yahoo Finance',?)`
            , [pToDate, 'KSP_LVG', 'KOSPI 레버리지']);
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
          ETF_STOCK_DATE, ETF_STOCK_ID, ETF_SITE_ID, ETF_SITE_NAME, ETF_STOCK_NAME) 
          VALUES(?, ?, 'YHF', 'Yahoo Finance',?)`
          , [pToDate, 'KSP_I2X', 'KOSPI 인버스2X']);
      }                                                          

        pKrIdxData = {};
        pKrIdxData.IF_SUCC_YN = 'N';

        for (const item of result.quotes) {
          //console.log('item:', item);
          //console.log('pXBfDate:',pXBfDate,moment(item.date).tz('America/New_York').format('YYYY-MM-DD'),pXBfDate === moment(item.date).tz('America/New_York').format('YYYY-MM-DD'),item.close != null, item.close);
          //console.log('pBfDate:' , pBfDate,moment(item.date).tz('America/New_York').format('YYYY-MM-DD'),pBfDate === moment(item.date).tz('America/New_York').format('YYYY-MM-DD'),item.close != null, item.close);          
          //전일 정보에 해당.
          if( pBfDate === moment(item.date).tz('Asia/Seoul').format('YYYY-MM-DD')  && item.close != null){            
            pKrIdxData.INDEX_STD_PRICE = Number(item.close).toFixed(2);   
            pKrIdxData.INDEX_MDF_STD_PRICE = Number(item.close).toFixed(2);   
                    
            bfYDateFlag = true;  
            
          //당일 정보에 해당.  
          }else if(pToDate === moment(item.date).tz('Asia/Seoul').format('YYYY-MM-DD') && item.close != null){    
            //console.log('어떻게??:',pBfDate,moment(item.date).tz('America/New_York').format('YYYY-MM-DD'),pBfDate === moment(item.date).tz('America/New_York').format('YYYY-MM-DD'),item.close != null, item.close);        
            pKrIdxData.INDEX_OPEN_PRICE = Number(item.open).toFixed(2);
            pKrIdxData.INDEX_HIGH_PRICE = Number(item.high).toFixed(2);   
            pKrIdxData.INDEX_LOW_PRICE = Number(item.low).toFixed(2);   
            pKrIdxData.INDEX_END_PRICE = Number(item.close).toFixed(2);   
            pKrIdxData.INDEX_UD_RATE_REAL_BY_TODAY = objUtils.calcRateRoundedClose( Number(pKrIdxData.INDEX_END_PRICE), Number(pKrIdxData.INDEX_OPEN_PRICE));
          
            yDateYnFlag = true;
          }       
        }       
        
        console.log('flag:', bfYDateFlag, yDateYnFlag);
        console.log('flag1:', pKrIdxData);
        //Rate및 Score 정보는 전일, 전전일 정보가 존재해야만 작업한다.
        if(bfYDateFlag && yDateYnFlag ){       

            let diffPrice = Number(pKrIdxData.INDEX_END_PRICE) - Number(pKrIdxData.INDEX_STD_PRICE);
            pKrIdxData.INDEX_UD_PRICE = diffPrice.toFixed(2);
            pKrIdxData.INDEX_UD_RATE_REAL_BY_OPEN = objUtils.calcRateRoundedClose( Number(pKrIdxData.INDEX_OPEN_PRICE), Number(pKrIdxData.INDEX_STD_PRICE));
            pKrIdxData.INDEX_UD_RATE_REAL_BY_HIGH = objUtils.calcRateRoundedClose( Number(pKrIdxData.INDEX_HIGH_PRICE), Number(pKrIdxData.INDEX_STD_PRICE));
            pKrIdxData.INDEX_UD_RATE_REAL_BY_LOW = objUtils.calcRateRoundedClose( Number(pKrIdxData.INDEX_LOW_PRICE), Number(pKrIdxData.INDEX_STD_PRICE));
            pKrIdxData.INDEX_UD_RATE_REAL_BY_CLOSE = objUtils.calcRateRoundedClose( Number(pKrIdxData.INDEX_END_PRICE), Number(pKrIdxData.INDEX_STD_PRICE));            
            pKrIdxData.IF_SUCC_YN = 'Y';            
            console.log('pKrIdxData!!:', pKrIdxData);
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
            console.log('pKspI2XData!!:', pKspI2XData);
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
            console.log('pKspLvgData!!:', pKspLvgData);
        }

        // 3대지수의 경우 전일 정보가 없는 경우 당일 오픈가를 기준가로 한다.
        //if( !bfYDateFlag && yDateYnFlag && ['SNP','NDQ','DWJ'].includes(sName)){                    
        if( !bfYDateFlag && yDateYnFlag){                    
            const indicesStdObj = await objUtils.dbQuery(db,
              `SELECT IFNULL(INDEX_END_PRICE, INDEX_STD_PRICE ) AS INDEX_END_PRICE 
              FROM MARKETS_WORLD_INDICES_INFO
              WHERE INDEX_ID      = ?
              AND   INDEX_SITE_ID = 'YHF'
              AND   IFNULL(US_HOLYDAY_YN,'N') != 'Y'
              AND   INDEX_DATE    < ? 
              ORDER BY INDEX_DATE DESC
              LIMIT 1`, ['KSP',pBfDate]
            );             
            let indicesStdValue = indicesStdObj[0].INDEX_END_PRICE;
            console.log('indicesStdObj:', indicesStdObj);
            
            if (indicesStdValue === '' || indicesStdValue == null) {
              indicesStdValue = 0;
            }

            pKrIdxData.INDEX_STD_PRICE = indicesStdValue;
            pKrIdxData.INDEX_MDF_STD_PRICE = indicesStdValue;
            let diffPrice = Number(pKrIdxData.INDEX_END_PRICE) - Number(pKrIdxData.INDEX_OPEN_PRICE);
            pKrIdxData.INDEX_UD_PRICE = diffPrice.toFixed(2);
            pKrIdxData.INDEX_UD_RATE_REAL_BY_OPEN  = objUtils.calcRateRoundedClose( Number(pKrIdxData.INDEX_OPEN_PRICE), Number(pKrIdxData.INDEX_MDF_STD_PRICE));
            pKrIdxData.INDEX_UD_RATE_REAL_BY_HIGH  = objUtils.calcRateRoundedClose( Number(pKrIdxData.INDEX_HIGH_PRICE), Number(pKrIdxData.INDEX_MDF_STD_PRICE));
            pKrIdxData.INDEX_UD_RATE_REAL_BY_LOW   = objUtils.calcRateRoundedClose( Number(pKrIdxData.INDEX_LOW_PRICE), Number(pKrIdxData.INDEX_MDF_STD_PRICE));
            pKrIdxData.INDEX_UD_RATE_REAL_BY_CLOSE = objUtils.calcRateRoundedClose( Number(pKrIdxData.INDEX_END_PRICE), Number(pKrIdxData.INDEX_MDF_STD_PRICE));            
            pKrIdxData.IF_SUCC_YN = 'Y';          

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
        
        //빈객체가 아닐 시에 update 실행.
        if(Object.keys(pKrIdxData).length !== 0){
          //console.log(`${sName} update 실행!:`,pKrIdxData,  );
          await objUtils.dbQuery(db,
              `UPDATE MARKETS_WORLD_INDICES_INFO 
              SET ?, updated_at  = NOW()
              WHERE INDEX_ID      = ?
              AND   INDEX_SITE_ID = 'YHF'              
              AND   INDEX_DATE    = ?`,
                      [ pKrIdxData, 'KSP', pToDate]);
        }

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

        //resultPreAll.push(pKrIdxData);
        //return resultPreAll;                
        resultPreAll.push({ status: 'fulfilled', value: { 'sName': 'KSP', pKrIdxData } });
        await objUtils.sleep(5000 + Math.floor(Math.random() * 5000));
      } catch (reason) {
        resultPreAll.push({ status: 'rejected', reason });
      }   
  }
  
  async function fetchIndicesStdYahooData( pToDate, pBfDate, pXBfDate, pUsHolyFlag, pKrHolyFlag) {
    let   pKrIdxData = {},
          etfBfDate;
    
    console.log('fetchIndicesStdYahooData 시작!!');
    pUsHolyFlag = pUsHolyFlag ?? 'N';
    pKrHolyFlag = pKrHolyFlag ?? 'N';
            
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
      
    const resultKspData = await yahooFinance.quote('^KS11');    
          
    if (!resultKspData) {
      console.warn(`[KOSPI] 데이터 없음`);        
      return;
    }                
                          
    let kspEtfStdPrc = 1000,
        kspStdPrice  = Number(resultKspData.regularMarketPreviousClose).toFixed(2);        
    
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
        INDEX_DATE, INDEX_ID, INDEX_SITE_ID, INDEX_SITE_NAME, KSP_STOCK_DATE, US_HOLYDAY_YN, KR_HOLYDAY_YN, INDEX_STD_PRICE, INDEX_MDF_STD_PRICE)  
        VALUES(?, ?, 'YHF', 'Yahoo Finance', ?, ?, ?, ?, ?)`
        , [pToDate, 'KSP', pToDate, pUsHolyFlag, pKrHolyFlag, kspStdPrice, kspStdPrice]);
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
  }
  
  
  async function fetchIndicesStdDaumData( pToDate, pBfDate, pXBfDate, pUsHolyFlag, pKrHolyFlag) {
    let   pKrIdxData = {},
          etfBfDate;
    
      console.log('fetchIndicesStdDaumData333 시작!!');
      pUsHolyFlag = pUsHolyFlag ?? 'N';
      pKrHolyFlag = pKrHolyFlag ?? 'N';
        
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
              '--disable-dev-shm-usage',
              '--disable-gpu',
              '--single-process'
            ]
          });
        const page = await browser.newPage();
        const result = [];
  
        // ✅ 더미 페이지로 초기화 유도 (Daum 내 페이지로)
        await page.goto('https://m.daum.net', { waitUntil: 'domcontentloaded' });
        await objUtils.sleep(2000);  // 약간의 대기 추가  
        
        const url = 'https://m.finance.daum.net/domestic/kospi';
  
        try {      
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });                
  
            const prevClose = await page.$eval('#root > div > main > section > article.stockInfo.mt > div > div.numB > ol.leftB > li:nth-child(1) > div > span', el => el.textContent.trim());
            const indexStdPrc = Number(objUtils.cleanNumber(prevClose)).toFixed(2);
  
            let kspEtfStdPrc = 1000;
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
                INDEX_DATE, INDEX_ID, INDEX_SITE_ID, INDEX_SITE_NAME, KSP_STOCK_DATE, US_HOLYDAY_YN, KR_HOLYDAY_YN, INDEX_STD_PRICE, INDEX_MDF_STD_PRICE)  
                VALUES(?, ?, 'DMF', 'Daum Finance', ?, ?, ?, ?, ?)`
                , [pToDate, 'KSP', pToDate, pUsHolyFlag, pKrHolyFlag, indexStdPrc, indexStdPrc]);
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
        } catch (err) {      
          console.warn(`⚠️ [KSP] 페이지 이동 실패: ${err.message}`);            
        }        
  
        console.log('📊 최종 결과:', result);        
      } catch (err) {
        console.error('❌ 전체 처리 중 오류 발생:', err.message);
      } finally {
        if (browser) await browser.close();
      } 
  }
    

  async function fnSetKspInvestInfo(pToDate, pBfDate, pXBfDate, pUsHolyFlag, pKrHolyFlag, pCloseFlag) {
        
    console.log('fnSetKspInvestInfo 호출!:', pCloseFlag);
    const stockInvestObj = {};
    pUsHolyFlag = pUsHolyFlag ?? 'N';
    pKrHolyFlag = pKrHolyFlag ?? 'N';
    
    try {                                    
          const stockInvestInfo = await objUtils.dbQuery(db,
                `SELECT * 
                FROM STOCK_INVEST_INFO
                WHERE KSP_STOCK_DATE    = ? 
                LIMIT 1`, [pToDate]          
              );                                  
          
          // KSP Stock 정보가 없는 경우(종가용)
          if ((stockInvestInfo || []).length == 0) {
            await  objUtils.dbQuery(db,`INSERT INTO STOCK_INVEST_INFO (
                  KSP_STOCK_DATE, KSP_BF_STOCK_DATE, US_HOLYDAY_YN, KR_HOLYDAY_YN) 
                  VALUES(?, ?, ?, ?)`
                , [pToDate, pBfDate, pUsHolyFlag, pKrHolyFlag]);
          }                     
          stockInvestObj.KSP_STOCK_DATE = pToDate;
          
          const kspStock1stInfo = await objUtils.dbQuery(db,
                `SELECT * 
                FROM MARKETS_WORLD_INDICES_INFO
                WHERE INDEX_ID      = 'KSP'
                AND   INDEX_SITE_ID = 'DMF'
                AND   INDEX_DATE    = ? 
                LIMIT 1`, [pToDate]          
              );                                  
          
          // KSP Stock 정보가 없는 경우(종가용)
          if ((kspStock1stInfo || []).length == 0 ) {
            const kspStock2ndInfo = await objUtils.dbQuery(db,
                `SELECT INDEX_STD_PRICE 
                FROM MARKETS_WORLD_INDICES_INFO
                WHERE INDEX_ID      = 'KSP'
                AND   INDEX_SITE_ID = 'NVR'
                AND   INDEX_DATE    = ? 
                LIMIT 1`, [pToDate]          
            );                                  

            if ((kspStock2ndInfo || []).length == 0) {
              console.log('KOSPI 1, 2순위  데이터 조회 실패!');
            }else{
              if(pCloseFlag){
                stockInvestObj.KSP_BEF_CLOSE_PRICE = kspStock2ndInfo[0].INDEX_MDF_STD_PRICE;
                stockInvestObj.KSP_OPEN_PRICE = kspStock2ndInfo[0].INDEX_OPEN_PRICE;                            
                stockInvestObj.KSP_HIGH_PRICE = kspStock2ndInfo[0].INDEX_HIGH_PRICE;
                stockInvestObj.KSP_LOW_PRICE = kspStock2ndInfo[0].INDEX_LOW_PRICE;
                stockInvestObj.KSP_CLOSE_PRICE = kspStock2ndInfo[0].INDEX_END_PRICE;
                stockInvestObj.KSP_TODAY_DIFF_PRICE = kspStock2ndInfo[0].INDEX_UD_PRICE;
                stockInvestObj.KSP_UD_RATE_REAL_BY_OPEN = kspStock2ndInfo[0].INDEX_UD_RATE_REAL_BY_OPEN;              
                stockInvestObj.KSP_UD_RATE_REAL_BY_HIGH = kspStock2ndInfo[0].INDEX_UD_RATE_REAL_BY_HIGH;
                stockInvestObj.KSP_UD_RATE_REAL_BY_LOW = kspStock2ndInfo[0].INDEX_UD_RATE_REAL_BY_LOW;
                stockInvestObj.KSP_UD_RATE_REAL_BY_TODAY = kspStock2ndInfo[0].INDEX_UD_RATE_REAL_BY_TODAY;
                stockInvestObj.KSP_UD_RATE_REAL_BY_CLOSE = kspStock2ndInfo[0].INDEX_UD_RATE_REAL_BY_CLOSE;              
                stockInvestObj.BF_KSP_OPEN_DO_YN = 'Y';
                stockInvestObj.AF_KSP_OPEN_DO_YN = 'Y';
              }else{
                stockInvestObj.KSP_BEF_CLOSE_PRICE = kspStock2ndInfo[0].INDEX_STD_PRICE;
                stockInvestObj.BF_KSP_OPEN_DO_YN = 'Y';
              }              
            }            
          }else{
            if(pCloseFlag){
              stockInvestObj.KSP_BEF_CLOSE_PRICE = kspStock1stInfo[0].INDEX_MDF_STD_PRICE;
              stockInvestObj.KSP_OPEN_PRICE = kspStock1stInfo[0].INDEX_OPEN_PRICE;                            
              stockInvestObj.KSP_HIGH_PRICE = kspStock1stInfo[0].INDEX_HIGH_PRICE;
              stockInvestObj.KSP_LOW_PRICE = kspStock1stInfo[0].INDEX_LOW_PRICE;
              stockInvestObj.KSP_CLOSE_PRICE = kspStock1stInfo[0].INDEX_END_PRICE;
              stockInvestObj.KSP_TODAY_DIFF_PRICE = kspStock1stInfo[0].INDEX_UD_PRICE;
              stockInvestObj.KSP_UD_RATE_REAL_BY_OPEN = kspStock1stInfo[0].INDEX_UD_RATE_REAL_BY_OPEN;              
              stockInvestObj.KSP_UD_RATE_REAL_BY_HIGH = kspStock1stInfo[0].INDEX_UD_RATE_REAL_BY_HIGH;
              stockInvestObj.KSP_UD_RATE_REAL_BY_LOW = kspStock1stInfo[0].INDEX_UD_RATE_REAL_BY_LOW;
              stockInvestObj.KSP_UD_RATE_REAL_BY_TODAY = kspStock1stInfo[0].INDEX_UD_RATE_REAL_BY_TODAY;
              stockInvestObj.KSP_UD_RATE_REAL_BY_CLOSE = kspStock1stInfo[0].INDEX_UD_RATE_REAL_BY_CLOSE;              
              stockInvestObj.BF_KSP_OPEN_DO_YN = 'Y';
              stockInvestObj.AF_KSP_OPEN_DO_YN = 'Y';
            }else{
              stockInvestObj.KSP_BEF_CLOSE_PRICE = kspStock1stInfo[0].INDEX_STD_PRICE;
              stockInvestObj.BF_KSP_OPEN_DO_YN = 'Y';
            }
          } 

          const snpStock1stInfo = await objUtils.dbQuery(db,
                `SELECT INDEX_STD_PRICE 
                       ,INDEX_MDF_STD_PRICE
                       ,INDEX_OPEN_PRICE
                       ,INDEX_END_PRICE
                       ,INDEX_UD_PRICE
                       ,INDEX_UD_RATE_REAL_BY_OPEN
                       ,INDEX_UD_RATE_REAL_BY_TODAY
                       ,INDEX_UD_RATE_REAL_BY_CLOSE
                       ,INDEX_SCORE
                       ,IFNULL(IF_SUCC_YN, 'N' ) AS IF_SUCC_YN
                FROM MARKETS_WORLD_INDICES_INFO
                WHERE INDEX_ID      = 'SNP'
                AND   INDEX_SITE_ID = 'YHF'
                AND   INDEX_DATE    = ? 
                LIMIT 1`, [pBfDate]          
              );                                  
          
          // SNP Stock 정보가 없는 경우(종가용)
          if ((snpStock1stInfo || []).length == 0 || snpStock1stInfo[0].IF_SUCC_YN !== 'Y') {
            const snpStock2ndInfo = await objUtils.dbQuery(db,
                `SELECT INDEX_STD_PRICE 
                       ,INDEX_MDF_STD_PRICE
                       ,INDEX_OPEN_PRICE
                       ,INDEX_END_PRICE
                       ,INDEX_UD_PRICE
                       ,INDEX_UD_RATE_REAL_BY_OPEN
                       ,INDEX_UD_RATE_REAL_BY_TODAY
                       ,INDEX_UD_RATE_REAL_BY_CLOSE
                       ,INDEX_SCORE
                       ,IFNULL(IF_SUCC_YN, 'N' ) AS IF_SUCC_YN
                FROM MARKETS_WORLD_INDICES_INFO
                WHERE INDEX_ID      = 'SNP'
                AND   INDEX_SITE_ID = 'STQ'
                AND   INDEX_DATE    = ? 
                LIMIT 1`, [pBfDate]          
            );                                  

            if ((snpStock2ndInfo || []).length == 0 || snpStock1stInfo[0].IF_SUCC_YN !== 'Y') {
              console.log('SNP500 1, 2순위  데이터 조회 실패!');
            }else{              
              stockInvestObj.SNP_STD_PRICE = snpStock2ndInfo[0].INDEX_MDF_STD_PRICE;
              stockInvestObj.SNP_OPEN_PRICE = snpStock2ndInfo[0].INDEX_OPEN_PRICE;
              stockInvestObj.SNP_END_PRICE = snpStock2ndInfo[0].INDEX_END_PRICE;
              stockInvestObj.SNP_UD_PRICE = snpStock2ndInfo[0].INDEX_UD_PRICE;
              stockInvestObj.SNP_UD_RATE_REAL_BY_OPEN = snpStock2ndInfo[0].INDEX_UD_RATE_REAL_BY_OPEN;
              stockInvestObj.SNP_UD_RATE_REAL_BY_TODAY = snpStock2ndInfo[0].INDEX_UD_RATE_REAL_BY_TODAY;
              stockInvestObj.SNP_UD_RATE_REAL_BY_CLOSE = snpStock2ndInfo[0].INDEX_UD_RATE_REAL_BY_CLOSE;
              stockInvestObj.SNP_SCORE = snpStock2ndInfo[0].INDEX_SCORE;
              stockInvestObj.SNP_OPEN_DO_YN = snpStock2ndInfo[0].IF_SUCC_YN;
            }            
          }else{
            stockInvestObj.SNP_STD_PRICE = snpStock1stInfo[0].INDEX_MDF_STD_PRICE;
            stockInvestObj.SNP_OPEN_PRICE = snpStock1stInfo[0].INDEX_OPEN_PRICE;
            stockInvestObj.SNP_END_PRICE = snpStock1stInfo[0].INDEX_END_PRICE;
            stockInvestObj.SNP_UD_PRICE = snpStock1stInfo[0].INDEX_UD_PRICE;
            stockInvestObj.SNP_UD_RATE_REAL_BY_OPEN = snpStock1stInfo[0].INDEX_UD_RATE_REAL_BY_OPEN;
            stockInvestObj.SNP_UD_RATE_REAL_BY_TODAY = snpStock1stInfo[0].INDEX_UD_RATE_REAL_BY_TODAY;
            stockInvestObj.SNP_UD_RATE_REAL_BY_CLOSE = snpStock1stInfo[0].INDEX_UD_RATE_REAL_BY_CLOSE;
            stockInvestObj.SNP_SCORE = snpStock1stInfo[0].INDEX_SCORE;
            stockInvestObj.SNP_OPEN_DO_YN = snpStock1stInfo[0].IF_SUCC_YN;
          }  

          const ndqStock1stInfo = await objUtils.dbQuery(db,
                `SELECT INDEX_STD_PRICE 
                       ,INDEX_MDF_STD_PRICE
                       ,INDEX_OPEN_PRICE
                       ,INDEX_END_PRICE
                       ,INDEX_UD_PRICE
                       ,INDEX_UD_RATE_REAL_BY_OPEN
                       ,INDEX_UD_RATE_REAL_BY_TODAY
                       ,INDEX_UD_RATE_REAL_BY_CLOSE
                       ,INDEX_SCORE
                       ,IFNULL(IF_SUCC_YN, 'N' ) AS IF_SUCC_YN 
                FROM MARKETS_WORLD_INDICES_INFO
                WHERE INDEX_ID      = 'NDQ'
                AND   INDEX_SITE_ID = 'YHF'
                AND   INDEX_DATE    = ? 
                LIMIT 1`, [pBfDate]          
              );                                  
          
          // NDQ Stock 정보가 없는 경우(종가용)
          if ((ndqStock1stInfo || []).length == 0 || ndqStock1stInfo[0].IF_SUCC_YN !== 'Y') {
            const ndqStock2ndInfo = await objUtils.dbQuery(db,
                `SELECT INDEX_STD_PRICE 
                       ,INDEX_MDF_STD_PRICE
                       ,INDEX_OPEN_PRICE
                       ,INDEX_END_PRICE
                       ,INDEX_UD_PRICE
                       ,INDEX_UD_RATE_REAL_BY_OPEN
                       ,INDEX_UD_RATE_REAL_BY_TODAY
                       ,INDEX_UD_RATE_REAL_BY_CLOSE
                       ,INDEX_SCORE
                       ,IFNULL(IF_SUCC_YN, 'N' ) AS IF_SUCC_YN
                FROM MARKETS_WORLD_INDICES_INFO
                WHERE INDEX_ID      = 'NDQ'
                AND   INDEX_SITE_ID = 'STQ'
                AND   INDEX_DATE    = ? 
                LIMIT 1`, [pBfDate]          
            );                                  

            if ((ndqStock2ndInfo || []).length == 0 || ndqStock2ndInfo[0].IF_SUCC_YN !== 'Y') {
              console.log('NASDAQ 1, 2순위  데이터 조회 실패!');
            }else{              
              stockInvestObj.NDQ_STD_PRICE = ndqStock2ndInfo[0].INDEX_MDF_STD_PRICE;
              stockInvestObj.NDQ_OPEN_PRICE = ndqStock2ndInfo[0].INDEX_OPEN_PRICE;
              stockInvestObj.NDQ_END_PRICE = ndqStock2ndInfo[0].INDEX_END_PRICE;
              stockInvestObj.NDQ_UD_PRICE = ndqStock2ndInfo[0].INDEX_UD_PRICE;
              stockInvestObj.NDQ_UD_RATE_REAL_BY_OPEN = ndqStock2ndInfo[0].INDEX_UD_RATE_REAL_BY_OPEN;
              stockInvestObj.NDQ_UD_RATE_REAL_BY_TODAY = ndqStock2ndInfo[0].INDEX_UD_RATE_REAL_BY_TODAY;
              stockInvestObj.NDQ_UD_RATE_REAL_BY_CLOSE = ndqStock2ndInfo[0].INDEX_UD_RATE_REAL_BY_CLOSE;
              stockInvestObj.NDQ_SCORE = ndqStock2ndInfo[0].INDEX_SCORE;
              stockInvestObj.NDQ_OPEN_DO_YN = ndqStock2ndInfo[0].IF_SUCC_YN;
            }            
          }else{
            stockInvestObj.NDQ_STD_PRICE = ndqStock1stInfo[0].INDEX_MDF_STD_PRICE;
            stockInvestObj.NDQ_OPEN_PRICE = ndqStock1stInfo[0].INDEX_OPEN_PRICE;
            stockInvestObj.NDQ_END_PRICE = ndqStock1stInfo[0].INDEX_END_PRICE;
            stockInvestObj.NDQ_UD_PRICE = ndqStock1stInfo[0].INDEX_UD_PRICE;
            stockInvestObj.NDQ_UD_RATE_REAL_BY_OPEN = ndqStock1stInfo[0].INDEX_UD_RATE_REAL_BY_OPEN;
            stockInvestObj.NDQ_UD_RATE_REAL_BY_TODAY = ndqStock1stInfo[0].INDEX_UD_RATE_REAL_BY_TODAY;
            stockInvestObj.NDQ_UD_RATE_REAL_BY_CLOSE = ndqStock1stInfo[0].INDEX_UD_RATE_REAL_BY_CLOSE;
            stockInvestObj.NDQ_SCORE = ndqStock1stInfo[0].INDEX_SCORE;
            stockInvestObj.NDQ_OPEN_DO_YN = ndqStock1stInfo[0].IF_SUCC_YN;
          }

          const dwjStock1stInfo = await objUtils.dbQuery(db,
                `SELECT INDEX_STD_PRICE 
                       ,INDEX_MDF_STD_PRICE
                       ,INDEX_OPEN_PRICE
                       ,INDEX_END_PRICE
                       ,INDEX_UD_PRICE
                       ,INDEX_UD_RATE_REAL_BY_OPEN
                       ,INDEX_UD_RATE_REAL_BY_TODAY
                       ,INDEX_UD_RATE_REAL_BY_CLOSE
                       ,INDEX_SCORE
                       ,IFNULL(IF_SUCC_YN, 'N' ) AS IF_SUCC_YN 
                FROM MARKETS_WORLD_INDICES_INFO
                WHERE INDEX_ID      = 'DWJ'
                AND   INDEX_SITE_ID = 'YHF'
                AND   INDEX_DATE    = ? 
                LIMIT 1`, [pBfDate]          
              );                                  
          
          // DWJ Stock 정보가 없는 경우(종가용)
          if ((dwjStock1stInfo || []).length == 0 || dwjStock1stInfo[0].IF_SUCC_YN !== 'Y') {
            const dwjStock2ndInfo = await objUtils.dbQuery(db,
                `SELECT INDEX_STD_PRICE 
                       ,INDEX_MDF_STD_PRICE
                       ,INDEX_OPEN_PRICE
                       ,INDEX_END_PRICE
                       ,INDEX_UD_PRICE
                       ,INDEX_UD_RATE_REAL_BY_OPEN
                       ,INDEX_UD_RATE_REAL_BY_TODAY
                       ,INDEX_UD_RATE_REAL_BY_CLOSE
                       ,INDEX_SCORE
                       ,IFNULL(IF_SUCC_YN, 'N' ) AS IF_SUCC_YN
                FROM MARKETS_WORLD_INDICES_INFO
                WHERE INDEX_ID      = 'DWJ'
                AND   INDEX_SITE_ID = 'STQ'
                AND   INDEX_DATE    = ? 
                LIMIT 1`, [pBfDate]          
            );                                  

            if ((dwjStock2ndInfo || []).length == 0 || dwjStock2ndInfo[0].IF_SUCC_YN !== 'Y') {
              console.log('DAWJONES 1, 2순위  데이터 조회 실패!');
            }else{              
              stockInvestObj.DWJ_STD_PRICE = dwjStock2ndInfo[0].INDEX_MDF_STD_PRICE;
              stockInvestObj.DWJ_OPEN_PRICE = dwjStock2ndInfo[0].INDEX_OPEN_PRICE;
              stockInvestObj.DWJ_END_PRICE = dwjStock2ndInfo[0].INDEX_END_PRICE;
              stockInvestObj.DWJ_UD_PRICE = dwjStock2ndInfo[0].INDEX_UD_PRICE;
              stockInvestObj.DWJ_UD_RATE_REAL_BY_OPEN = dwjStock2ndInfo[0].INDEX_UD_RATE_REAL_BY_OPEN;
              stockInvestObj.DWJ_UD_RATE_REAL_BY_TODAY = dwjStock2ndInfo[0].INDEX_UD_RATE_REAL_BY_TODAY;
              stockInvestObj.DWJ_UD_RATE_REAL_BY_CLOSE = dwjStock2ndInfo[0].INDEX_UD_RATE_REAL_BY_CLOSE;
              stockInvestObj.DWJ_SCORE = dwjStock2ndInfo[0].INDEX_SCORE;
              stockInvestObj.DWJ_OPEN_DO_YN = dwjStock2ndInfo[0].IF_SUCC_YN;
            }            
          }else{
            stockInvestObj.DWJ_STD_PRICE = dwjStock1stInfo[0].INDEX_MDF_STD_PRICE;
            stockInvestObj.DWJ_OPEN_PRICE = dwjStock1stInfo[0].INDEX_OPEN_PRICE;
            stockInvestObj.DWJ_END_PRICE = dwjStock1stInfo[0].INDEX_END_PRICE;
            stockInvestObj.DWJ_UD_PRICE = dwjStock1stInfo[0].INDEX_UD_PRICE;
            stockInvestObj.DWJ_UD_RATE_REAL_BY_OPEN = dwjStock1stInfo[0].INDEX_UD_RATE_REAL_BY_OPEN;
            stockInvestObj.DWJ_UD_RATE_REAL_BY_TODAY = dwjStock1stInfo[0].INDEX_UD_RATE_REAL_BY_TODAY;
            stockInvestObj.DWJ_UD_RATE_REAL_BY_CLOSE = dwjStock1stInfo[0].INDEX_UD_RATE_REAL_BY_CLOSE;
            stockInvestObj.DWJ_SCORE = dwjStock1stInfo[0].INDEX_SCORE;
            stockInvestObj.DWJ_OPEN_DO_YN = dwjStock1stInfo[0].IF_SUCC_YN;
          }

          const dxyStock1stInfo = await objUtils.dbQuery(db,
                `SELECT INDEX_STD_PRICE 
                       ,INDEX_MDF_STD_PRICE
                       ,INDEX_OPEN_PRICE
                       ,INDEX_END_PRICE
                       ,INDEX_UD_PRICE
                       ,INDEX_UD_RATE_REAL_BY_OPEN
                       ,INDEX_UD_RATE_REAL_BY_TODAY
                       ,INDEX_UD_RATE_REAL_BY_CLOSE
                       ,INDEX_SCORE
                       ,IFNULL(IF_SUCC_YN, 'N' ) AS IF_SUCC_YN 
                FROM MARKETS_WORLD_INDICES_INFO
                WHERE INDEX_ID      = 'DXY'
                AND   INDEX_SITE_ID = 'YHF'
                AND   INDEX_DATE    = ? 
                LIMIT 1`, [pBfDate]          
              );                                  
          
          // DWJ Stock 정보가 없는 경우(종가용)
          if ((dxyStock1stInfo || []).length == 0 || dxyStock1stInfo[0].IF_SUCC_YN !== 'Y') {
            const dxyStock2ndInfo = await objUtils.dbQuery(db,
                `SELECT INDEX_STD_PRICE 
                       ,INDEX_MDF_STD_PRICE
                       ,INDEX_OPEN_PRICE
                       ,INDEX_END_PRICE
                       ,INDEX_UD_PRICE
                       ,INDEX_UD_RATE_REAL_BY_OPEN
                       ,INDEX_UD_RATE_REAL_BY_TODAY
                       ,INDEX_UD_RATE_REAL_BY_CLOSE
                       ,INDEX_SCORE
                       ,IFNULL(IF_SUCC_YN, 'N' ) AS IF_SUCC_YN
                FROM MARKETS_WORLD_INDICES_INFO
                WHERE INDEX_ID      = 'DXY'
                AND   INDEX_SITE_ID = 'INV'
                AND   INDEX_DATE    = ? 
                LIMIT 1`, [pBfDate]          
            );                                  

            if ((dxyStock2ndInfo || []).length == 0 || dxyStock2ndInfo[0].IF_SUCC_YN !== 'Y') {
              console.log('Dollar Index 1, 2순위  데이터 조회 실패!');
            }else{              
              stockInvestObj.DXY_STD_PRICE = dxyStock2ndInfo[0].INDEX_MDF_STD_PRICE;
              stockInvestObj.DXY_OPEN_PRICE = dxyStock2ndInfo[0].INDEX_OPEN_PRICE;
              stockInvestObj.DXY_END_PRICE = dxyStock2ndInfo[0].INDEX_END_PRICE;
              stockInvestObj.DXY_UD_PRICE = dxyStock2ndInfo[0].INDEX_UD_PRICE;
              stockInvestObj.DXY_UD_RATE_REAL_BY_OPEN = dxyStock2ndInfo[0].INDEX_UD_RATE_REAL_BY_OPEN;
              stockInvestObj.DXY_UD_RATE_REAL_BY_TODAY = dxyStock2ndInfo[0].INDEX_UD_RATE_REAL_BY_TODAY;
              stockInvestObj.DXY_UD_RATE_REAL_BY_CLOSE = dxyStock2ndInfo[0].INDEX_UD_RATE_REAL_BY_CLOSE;
              stockInvestObj.DXY_SCORE = dxyStock2ndInfo[0].INDEX_SCORE;
              stockInvestObj.DXY_OPEN_DO_YN = dxyStock2ndInfo[0].IF_SUCC_YN;
            }            
          }else{
            stockInvestObj.DXY_STD_PRICE = dxyStock1stInfo[0].INDEX_MDF_STD_PRICE;
            stockInvestObj.DXY_OPEN_PRICE = dxyStock1stInfo[0].INDEX_OPEN_PRICE;
            stockInvestObj.DXY_END_PRICE = dxyStock1stInfo[0].INDEX_END_PRICE;
            stockInvestObj.DXY_UD_PRICE = dxyStock1stInfo[0].INDEX_UD_PRICE;
            stockInvestObj.DXY_UD_RATE_REAL_BY_OPEN = dxyStock1stInfo[0].INDEX_UD_RATE_REAL_BY_OPEN;
            stockInvestObj.DXY_UD_RATE_REAL_BY_TODAY = dxyStock1stInfo[0].INDEX_UD_RATE_REAL_BY_TODAY;
            stockInvestObj.DXY_UD_RATE_REAL_BY_CLOSE = dxyStock1stInfo[0].INDEX_UD_RATE_REAL_BY_CLOSE;
            stockInvestObj.DXY_SCORE = dxyStock1stInfo[0].INDEX_SCORE;
            stockInvestObj.DXY_OPEN_DO_YN = dxyStock1stInfo[0].IF_SUCC_YN;
          }

          const tnxStock1stInfo = await objUtils.dbQuery(db,
                `SELECT INDEX_STD_PRICE 
                       ,INDEX_MDF_STD_PRICE
                       ,INDEX_OPEN_PRICE
                       ,INDEX_END_PRICE
                       ,INDEX_UD_PRICE
                       ,INDEX_UD_RATE_REAL_BY_OPEN
                       ,INDEX_UD_RATE_REAL_BY_TODAY
                       ,INDEX_UD_RATE_REAL_BY_CLOSE
                       ,INDEX_SCORE
                       ,IFNULL(IF_SUCC_YN, 'N' ) AS IF_SUCC_YN 
                FROM MARKETS_WORLD_INDICES_INFO
                WHERE INDEX_ID      = 'TNX'
                AND   INDEX_SITE_ID = 'YHF'
                AND   INDEX_DATE    = ? 
                LIMIT 1`, [pBfDate]          
              );                                  
          
          // TNX Stock 정보가 없는 경우(종가용)
          if ((tnxStock1stInfo || []).length == 0 || tnxStock1stInfo[0].IF_SUCC_YN !== 'Y') {
            const tnxStock2ndInfo = await objUtils.dbQuery(db,
                `SELECT INDEX_STD_PRICE 
                       ,INDEX_MDF_STD_PRICE
                       ,INDEX_OPEN_PRICE
                       ,INDEX_END_PRICE
                       ,INDEX_UD_PRICE
                       ,INDEX_UD_RATE_REAL_BY_OPEN
                       ,INDEX_UD_RATE_REAL_BY_TODAY
                       ,INDEX_UD_RATE_REAL_BY_CLOSE
                       ,INDEX_SCORE
                       ,IFNULL(IF_SUCC_YN, 'N' ) AS IF_SUCC_YN
                FROM MARKETS_WORLD_INDICES_INFO
                WHERE INDEX_ID      = 'TNX'
                AND   INDEX_SITE_ID = 'INV'
                AND   INDEX_DATE    = ? 
                LIMIT 1`, [pBfDate]          
            );                                  

            if ((tnxStock2ndInfo || []).length == 0 || tnxStock2ndInfo[0].IF_SUCC_YN !== 'Y') {
              console.log('10년 만기 채권 1, 2순위  데이터 조회 실패!');
            }else{              
              stockInvestObj.TNX_STD_PRICE = tnxStock2ndInfo[0].INDEX_MDF_STD_PRICE;
              stockInvestObj.TNX_OPEN_PRICE = tnxStock2ndInfo[0].INDEX_OPEN_PRICE;
              stockInvestObj.TNX_END_PRICE = tnxStock2ndInfo[0].INDEX_END_PRICE;
              stockInvestObj.TNX_UD_PRICE = tnxStock2ndInfo[0].INDEX_UD_PRICE;
              stockInvestObj.TNX_UD_RATE_REAL_BY_OPEN = tnxStock2ndInfo[0].INDEX_UD_RATE_REAL_BY_OPEN;
              stockInvestObj.TNX_UD_RATE_REAL_BY_TODAY = tnxStock2ndInfo[0].INDEX_UD_RATE_REAL_BY_TODAY;
              stockInvestObj.TNX_UD_RATE_REAL_BY_CLOSE = tnxStock2ndInfo[0].INDEX_UD_RATE_REAL_BY_CLOSE;
              stockInvestObj.TNX_SCORE = tnxStock2ndInfo[0].INDEX_SCORE;
              stockInvestObj.TNX_OPEN_DO_YN = tnxStock2ndInfo[0].IF_SUCC_YN;
            }            
          }else{
            stockInvestObj.TNX_STD_PRICE = tnxStock1stInfo[0].INDEX_MDF_STD_PRICE;
            stockInvestObj.TNX_OPEN_PRICE = tnxStock1stInfo[0].INDEX_OPEN_PRICE;
            stockInvestObj.TNX_END_PRICE = tnxStock1stInfo[0].INDEX_END_PRICE;
            stockInvestObj.TNX_UD_PRICE = tnxStock1stInfo[0].INDEX_UD_PRICE;
            stockInvestObj.TNX_UD_RATE_REAL_BY_OPEN = tnxStock1stInfo[0].INDEX_UD_RATE_REAL_BY_OPEN;
            stockInvestObj.TNX_UD_RATE_REAL_BY_TODAY = tnxStock1stInfo[0].INDEX_UD_RATE_REAL_BY_TODAY;
            stockInvestObj.TNX_UD_RATE_REAL_BY_CLOSE = tnxStock1stInfo[0].INDEX_UD_RATE_REAL_BY_CLOSE;
            stockInvestObj.TNX_SCORE = tnxStock1stInfo[0].INDEX_SCORE;
            stockInvestObj.TNX_OPEN_DO_YN = tnxStock1stInfo[0].IF_SUCC_YN;
          }

          const wtiStock1stInfo = await objUtils.dbQuery(db,
                `SELECT INDEX_STD_PRICE 
                       ,INDEX_MDF_STD_PRICE
                       ,INDEX_OPEN_PRICE
                       ,INDEX_END_PRICE
                       ,INDEX_UD_PRICE
                       ,INDEX_UD_RATE_REAL_BY_OPEN
                       ,INDEX_UD_RATE_REAL_BY_TODAY
                       ,INDEX_UD_RATE_REAL_BY_CLOSE
                       ,INDEX_SCORE
                       ,IFNULL(IF_SUCC_YN, 'N' ) AS IF_SUCC_YN 
                FROM MARKETS_WORLD_INDICES_INFO
                WHERE INDEX_ID      = 'WTI'
                AND   INDEX_SITE_ID = 'YHF'
                AND   INDEX_DATE    = ? 
                LIMIT 1`, [pBfDate]          
              );                                  
          
          // WTI Stock 정보가 없는 경우(종가용)
          if ((wtiStock1stInfo || []).length == 0 || wtiStock1stInfo[0].IF_SUCC_YN !== 'Y') {
            const wtiStock2ndInfo = await objUtils.dbQuery(db,
                `SELECT INDEX_STD_PRICE 
                       ,INDEX_MDF_STD_PRICE
                       ,INDEX_OPEN_PRICE
                       ,INDEX_END_PRICE
                       ,INDEX_UD_PRICE
                       ,INDEX_UD_RATE_REAL_BY_OPEN
                       ,INDEX_UD_RATE_REAL_BY_TODAY
                       ,INDEX_UD_RATE_REAL_BY_CLOSE
                       ,INDEX_SCORE
                       ,IFNULL(IF_SUCC_YN, 'N' ) AS IF_SUCC_YN
                FROM MARKETS_WORLD_INDICES_INFO
                WHERE INDEX_ID      = 'WTI'
                AND   INDEX_SITE_ID = 'STQ'
                AND   INDEX_DATE    = ? 
                LIMIT 1`, [pBfDate]          
            );                                  

            if ((wtiStock2ndInfo || []).length == 0 || wtiStock2ndInfo[0].IF_SUCC_YN !== 'Y') {
              console.log('WTI 1, 2순위  데이터 조회 실패!');
            }else{              
              stockInvestObj.WTI_STD_PRICE = wtiStock2ndInfo[0].INDEX_MDF_STD_PRICE;
              stockInvestObj.WTI_OPEN_PRICE = wtiStock2ndInfo[0].INDEX_OPEN_PRICE;
              stockInvestObj.WTI_END_PRICE = wtiStock2ndInfo[0].INDEX_END_PRICE;
              stockInvestObj.WTI_UD_PRICE = wtiStock2ndInfo[0].INDEX_UD_PRICE;
              stockInvestObj.WTI_UD_RATE_REAL_BY_OPEN = wtiStock2ndInfo[0].INDEX_UD_RATE_REAL_BY_OPEN;
              stockInvestObj.WTI_UD_RATE_REAL_BY_TODAY = wtiStock2ndInfo[0].INDEX_UD_RATE_REAL_BY_TODAY;
              stockInvestObj.WTI_UD_RATE_REAL_BY_CLOSE = wtiStock2ndInfo[0].INDEX_UD_RATE_REAL_BY_CLOSE;
              stockInvestObj.WTI_SCORE = wtiStock2ndInfo[0].INDEX_SCORE;
              stockInvestObj.WTI_OPEN_DO_YN = wtiStock2ndInfo[0].IF_SUCC_YN;
            }            
          }else{
            stockInvestObj.WTI_STD_PRICE = wtiStock1stInfo[0].INDEX_MDF_STD_PRICE;
            stockInvestObj.WTI_OPEN_PRICE = wtiStock1stInfo[0].INDEX_OPEN_PRICE;
            stockInvestObj.WTI_END_PRICE = wtiStock1stInfo[0].INDEX_END_PRICE;
            stockInvestObj.WTI_UD_PRICE = wtiStock1stInfo[0].INDEX_UD_PRICE;
            stockInvestObj.WTI_UD_RATE_REAL_BY_OPEN = wtiStock1stInfo[0].INDEX_UD_RATE_REAL_BY_OPEN;
            stockInvestObj.WTI_UD_RATE_REAL_BY_TODAY = wtiStock1stInfo[0].INDEX_UD_RATE_REAL_BY_TODAY;
            stockInvestObj.WTI_UD_RATE_REAL_BY_CLOSE = wtiStock1stInfo[0].INDEX_UD_RATE_REAL_BY_CLOSE;
            stockInvestObj.WTI_SCORE = wtiStock1stInfo[0].INDEX_SCORE;
            stockInvestObj.WTI_OPEN_DO_YN = wtiStock1stInfo[0].IF_SUCC_YN;
          }

          const krwStock1stInfo = await objUtils.dbQuery(db,
                `SELECT INDEX_STD_PRICE 
                       ,IFNULL(INDEX_EXTR2_STD_PRICE, INDEX_STD_PRICE ) AS INDEX_MDF_STD_PRICE 
                       ,INDEX_OPEN_PRICE
                       ,IFNULL(INDEX_EXTR2_END_PRICE, INDEX_END_PRICE) AS INDEX_END_PRICE
                       ,IFNULL(INDEX_EXTR2_UD_PRICE, INDEX_UD_PRICE) AS INDEX_UD_PRICE
                       ,IFNULL(INDEX_EXTR2_UD_RATE_REAL_BY_OPEN, INDEX_UD_RATE_REAL_BY_OPEN) AS INDEX_UD_RATE_REAL_BY_OPEN
                       ,IFNULL(INDEX_EXTR2_UD_RATE_REAL_BY_TODAY, INDEX_UD_RATE_REAL_BY_TODAY) AS INDEX_UD_RATE_REAL_BY_TODAY                       
                       ,IFNULL(INDEX_EXTR2_UD_RATE_REAL_BY_CLOSE, INDEX_UD_RATE_REAL_BY_CLOSE) AS INDEX_UD_RATE_REAL_BY_CLOSE
                       ,IFNULL(INDEX_EXTR2_SCORE, INDEX_SCORE) AS INDEX_SCORE
                       ,IFNULL(IF_SUCC_YN, 'N' ) AS IF_SUCC_YN
                FROM MARKETS_WORLD_INDICES_INFO
                WHERE INDEX_ID      = 'KRW'
                AND   INDEX_SITE_ID = 'ECOS'
                AND   INDEX_DATE    = ? 
                LIMIT 1`, [pBfDate]                          
              );                                  
          
          // DWJ Stock 정보가 없는 경우(종가용)
          if ((krwStock1stInfo || []).length == 0 || krwStock1stInfo[0].IF_SUCC_YN !== 'Y') {
            const krwStock2ndInfo = await objUtils.dbQuery(db,
                `SELECT INDEX_STD_PRICE 
                       ,IFNULL(INDEX_EXTR2_STD_PRICE, INDEX_STD_PRICE ) AS INDEX_MDF_STD_PRICE 
                       ,INDEX_OPEN_PRICE
                       ,IFNULL(INDEX_EXTR2_END_PRICE, INDEX_END_PRICE) AS INDEX_END_PRICE
                       ,IFNULL(INDEX_EXTR2_UD_PRICE, INDEX_UD_PRICE) AS INDEX_UD_PRICE
                       ,IFNULL(INDEX_EXTR2_UD_RATE_REAL_BY_OPEN, INDEX_UD_RATE_REAL_BY_OPEN) AS INDEX_UD_RATE_REAL_BY_OPEN
                       ,IFNULL(INDEX_EXTR2_UD_RATE_REAL_BY_TODAY, INDEX_UD_RATE_REAL_BY_TODAY) AS INDEX_UD_RATE_REAL_BY_TODAY                       
                       ,IFNULL(INDEX_EXTR2_UD_RATE_REAL_BY_CLOSE, INDEX_UD_RATE_REAL_BY_CLOSE) AS INDEX_UD_RATE_REAL_BY_CLOSE
                       ,IFNULL(INDEX_EXTR2_SCORE, INDEX_SCORE) AS INDEX_SCORE
                       ,IFNULL(IF_SUCC_YN, 'N' ) AS IF_SUCC_YN
                FROM MARKETS_WORLD_INDICES_INFO
                WHERE INDEX_ID      = 'KRW'
                AND   INDEX_SITE_ID = 'SMBS'
                AND   INDEX_DATE    = ? 
                LIMIT 1`, [pBfDate]          
            );                                  

            if ((krwStock2ndInfo || []).length == 0 || krwStock2ndInfo[0].IF_SUCC_YN !== 'Y') {
              console.log('USD/KRW 1, 2순위  데이터 조회 실패!');
            }else{              
              stockInvestObj.KRW_STD_PRICE = krwStock2ndInfo[0].INDEX_MDF_STD_PRICE;
              stockInvestObj.KRW_OPEN_PRICE = krwStock2ndInfo[0].INDEX_OPEN_PRICE;
              stockInvestObj.KRW_END_PRICE = krwStock2ndInfo[0].INDEX_END_PRICE;
              stockInvestObj.KRW_UD_PRICE = krwStock2ndInfo[0].INDEX_UD_PRICE;
              stockInvestObj.KRW_UD_RATE_REAL_BY_OPEN = krwStock2ndInfo[0].INDEX_UD_RATE_REAL_BY_OPEN;
              stockInvestObj.KRW_UD_RATE_REAL_BY_TODAY = krwStock2ndInfo[0].INDEX_UD_RATE_REAL_BY_TODAY;
              stockInvestObj.KRW_UD_RATE_REAL_BY_CLOSE = krwStock2ndInfo[0].INDEX_UD_RATE_REAL_BY_CLOSE;
              stockInvestObj.KRW_SCORE = krwStock2ndInfo[0].INDEX_SCORE;
              stockInvestObj.KRW_OPEN_DO_YN = krwStock2ndInfo[0].IF_SUCC_YN;
            }            
          }else{
            stockInvestObj.KRW_STD_PRICE = krwStock1stInfo[0].INDEX_MDF_STD_PRICE;
            stockInvestObj.KRW_OPEN_PRICE = krwStock1stInfo[0].INDEX_OPEN_PRICE;
            stockInvestObj.KRW_END_PRICE = krwStock1stInfo[0].INDEX_END_PRICE;
            stockInvestObj.KRW_UD_PRICE = krwStock1stInfo[0].INDEX_UD_PRICE;
            stockInvestObj.KRW_UD_RATE_REAL_BY_OPEN = krwStock1stInfo[0].INDEX_UD_RATE_REAL_BY_OPEN;
            stockInvestObj.KRW_UD_RATE_REAL_BY_TODAY = krwStock1stInfo[0].INDEX_UD_RATE_REAL_BY_TODAY;
            stockInvestObj.KRW_UD_RATE_REAL_BY_CLOSE = krwStock1stInfo[0].INDEX_UD_RATE_REAL_BY_CLOSE;
            stockInvestObj.KRW_SCORE = krwStock1stInfo[0].INDEX_SCORE;
            stockInvestObj.KRW_OPEN_DO_YN = krwStock1stInfo[0].IF_SUCC_YN;
          }
                    
          
      //빈객체가 아닐 시에 update 실행.
      if(Object.keys(stockInvestObj).length !== 0){
        console.log('update 실행:', stockInvestObj);
        await objUtils.dbQuery(db,
          `UPDATE STOCK_INVEST_INFO 
           SET ?, updated_at  = NOW()
           WHERE KSP_STOCK_DATE    = ?`,
            [ stockInvestObj, pToDate]);
      }         
      
      await fnCalcGrade(stockInvestObj);

      console.log('KSP INVEST 작업 종료!');
    } catch (err) {
      console.error(`KSP INVEST 작업 중 에러:`, err);      
    }   
  }

  async function fnCalcGrade(pObj) {
    var returnObj = {},
        growthTotScore = Math.round((Number(pObj.SNP_SCORE) + Number(pObj.NDQ_SCORE) + Number(pObj.DWJ_SCORE)) * 100) / 100,
        priceTotScore = Math.round((Number(pObj.DXY_SCORE) + Number(pObj.TNX_SCORE) + Number(pObj.WTI_SCORE) + Number(pObj.KRW_SCORE)) * 100) / 100,
        //priceTotScore = Math.round((pObj.DXY_SCORE + pObj.TNX_SCORE + pObj.KRW_SCORE) * 100) / 100,
        growthTotScoreGrade = 0,
        priceTotScoreGrade = 0,
        priceSetRngGrp = 0,
        parentGrowthTotScoreGrade = 0,
        parentPrcSetRngGrp = 0;
    
    console.log('fnCalcGrade!!!:', growthTotScore, priceTotScore);
    if (growthTotScore > 2) {
        growthTotScoreGrade = 9;
        parentGrowthTotScoreGrade = 3;
    }else if (growthTotScore > 1.4) {
        growthTotScoreGrade = 8;
        parentGrowthTotScoreGrade = 3;
    }else if (growthTotScore > 1.0) {
        growthTotScoreGrade = 7;
        parentGrowthTotScoreGrade = 2;
    }else if (growthTotScore > 0.75) {
        growthTotScoreGrade = 6;
        parentGrowthTotScoreGrade = 2;
    }else if (growthTotScore > 0.54) {
        growthTotScoreGrade = 5;
        parentGrowthTotScoreGrade = 2;
    }else if (growthTotScore > 0.37) {
        growthTotScoreGrade = 4;
        parentGrowthTotScoreGrade = 1;
    }else if (growthTotScore > 0.21) {
        growthTotScoreGrade = 3;
        parentGrowthTotScoreGrade = 1;
    }else if (growthTotScore > 0.05) {
        growthTotScoreGrade = 2;
        parentGrowthTotScoreGrade = 1;
    }else if (growthTotScore >= 0) {
        growthTotScoreGrade = 1;
        parentGrowthTotScoreGrade = 1;
    }else if (growthTotScore < -2.5) {
        growthTotScoreGrade = -9;
        parentGrowthTotScoreGrade = -3;
    }else if (growthTotScore < -1.8) {
        growthTotScoreGrade = -8;
        parentGrowthTotScoreGrade = -3;
    }else if (growthTotScore < -1.3) {
        growthTotScoreGrade = -7;
        parentGrowthTotScoreGrade = -2;
    }else if (growthTotScore < -0.95) {
        growthTotScoreGrade = -6;
        parentGrowthTotScoreGrade = -2;
    }else if (growthTotScore < -0.65) {
        growthTotScoreGrade = -5;
        parentGrowthTotScoreGrade = -2;
    }else if (growthTotScore < -0.45) {
        growthTotScoreGrade = -4;
        parentGrowthTotScoreGrade = -1;
    }else if (growthTotScore < -0.28) {
        growthTotScoreGrade = -3;
        parentGrowthTotScoreGrade = -1;
    }else if (growthTotScore < -0.15) {
        growthTotScoreGrade = -2;
        parentGrowthTotScoreGrade = -1;
    }else if (growthTotScore < 0) {
        growthTotScoreGrade = -1;
        parentGrowthTotScoreGrade = -1;
    }else{
        growthTotScoreGrade = 0; 
        parentGrowthTotScoreGrade = 0;        
    }    
  
    if (priceTotScore > 1.2) {
        priceTotScoreGrade = 9;              
        parentPrcSetRngGrp = 3;
    }else if (priceTotScore > 0.9) {
        priceTotScoreGrade = 8;
        parentPrcSetRngGrp = 3;
    }else if (priceTotScore > 0.65) {
        priceTotScoreGrade = 7;
        parentPrcSetRngGrp = 3;
    }else if (priceTotScore > 0.5) {
        priceTotScoreGrade = 6;
        parentPrcSetRngGrp = 2;
    }else if (priceTotScore > 0.35) {
        priceTotScoreGrade = 5;
        parentPrcSetRngGrp = 2;
    }else if (priceTotScore > 0.22) {
        priceTotScoreGrade = 4;
        parentPrcSetRngGrp = 2;
    }else if (priceTotScore > 0.12) {
        priceTotScoreGrade = 3;
        parentPrcSetRngGrp = 1;
    }else if (priceTotScore > 0.03) {
        priceTotScoreGrade = 2;
        parentPrcSetRngGrp = 1;
    }else if (priceTotScore >= 0) {
        priceTotScoreGrade = 1;
        parentPrcSetRngGrp = 1;
    }else if (priceTotScore < -1.4) {
        priceTotScoreGrade = -9;            
        parentPrcSetRngGrp = -3;
    }else if (priceTotScore < -1.0) {
        priceTotScoreGrade = -8;      
        parentPrcSetRngGrp = -3;
    }else if (priceTotScore < -0.75) {
        priceTotScoreGrade = -7;
        parentPrcSetRngGrp = -3;
    }else if (priceTotScore < -0.55) {
        priceTotScoreGrade = -6;
        parentPrcSetRngGrp = -2;
    }else if (priceTotScore < -0.4) {
        priceTotScoreGrade = -5;
        parentPrcSetRngGrp = -2;
    }else if (priceTotScore < -0.25) {
        priceTotScoreGrade = -4;
        parentPrcSetRngGrp = -2;
    }else if (priceTotScore < -0.15) {
        priceTotScoreGrade = -3;
        parentPrcSetRngGrp = -1;
    }else if (priceTotScore < -0.05) {
        priceTotScoreGrade = -2;
        parentPrcSetRngGrp = -1;
    }else if (priceTotScore < 0) {
        priceTotScoreGrade = -1;    
        parentPrcSetRngGrp = -1;
    } else {
        priceTotScoreGrade = 0;
        parentPrcSetRngGrp = 0;
    }
  
    if (priceTotScoreGrade != 0) {
        priceSetRngGrp = priceTotScoreGrade * 10;
        parentPrcSetRngGrp = parentPrcSetRngGrp * 10;
    }

    returnObj.GROWTH_TOT_SCORE_GRADE = growthTotScoreGrade;
    returnObj.GROWTH_TOT_SCORE = growthTotScore;
    returnObj.PRICE_TOT_SCORE_GRADE = priceTotScoreGrade;
    returnObj.PRC_SET_RNG_GRP = priceSetRngGrp;        
    returnObj.PRICE_TOT_SCORE = priceTotScore;        
    returnObj.PARENT_GROWTH_TOT_SCORE_GRADE = parentGrowthTotScoreGrade;
    returnObj.PARENT_PRC_SET_RNG_GRP = parentPrcSetRngGrp;
  
    if(Object.keys(returnObj).length !== 0){
      await objUtils.dbQuery(db,    
       `UPDATE STOCK_INVEST_INFO 
        SET ?,
            IF_SUCC_YN = 'Y',
            updated_at = NOW()                  
        WHERE KSP_STOCK_DATE = ?`,
        [returnObj, pObj.KSP_STOCK_DATE]);
    }
    return returnObj;
  }
