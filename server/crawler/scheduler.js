// server/crawler/scheduler.js
const schedule = require("node-schedule");
const moment = require("moment-timezone");

const indicesIfService = require("./lib/services/marketIndicesIFService");
const afterOpenIfService = require("./lib/services/marketAfterOpenIFService");

// 중복 실행 방지(single-flight)
function createSingleFlight(name, fn) {
  let running = false;
  let pending = false;

  return async (...args) => {
    if (running) {
      pending = true;
      console.log(`⏳ [${name}] already running → mark pending`);
      return;
    }
    running = true;
    try {
      await fn(...args);
    } finally {
      running = false;
      if (pending) {
        pending = false;
        console.log(`🔁 [${name}] run pending once`);
        await fn(...args);
      }
    }
  };
}

async function getBfIfAll(doDate) {
  await indicesIfService.getIndicesTypeInfo({ pIndicesType: "ECOS", pIfType: "API", pDate: doDate });
  await sleep(20000);
  await indicesIfService.getIndicesTypeInfo({ pIndicesType: "SMBS", pIfType: "PPT", pDate: doDate });
  await sleep(150000);
  await indicesIfService.getIndicesTypeInfo({ pIndicesType: "USIDX", pIfType: "YHF", pDate: doDate });
  await sleep(150000);
  await indicesIfService.getIndicesTypeInfo({ pIndicesType: "STOOQ", pIfType: "AXC", pDate: doDate });
  await sleep(150000);
  await indicesIfService.getIndicesTypeInfo({ pIndicesType: "FRF", pIfType: "API", pDate: doDate });
  await sleep(20000);
  await indicesIfService.getIndicesTypeInfo({ pIndicesType: "FRED", pIfType: "API", pDate: doDate });
  await sleep(20000);
  await indicesIfService.getIndicesTypeInfo({ pIndicesType: "INV", pIfType: "PPT", pDate: doDate });
}

async function getAfIfAll(doDate, closeFlag) {
  await afterOpenIfService.getAfterOpenTypeInfo({ pIndicesType: "NVR", pIfType: "AXC", pDate: doDate, pCloseFlag: closeFlag });
  await sleep(150000);
  await afterOpenIfService.getAfterOpenTypeInfo({ pIndicesType: "YHF", pIfType: "LIB", pDate: doDate, pCloseFlag: closeFlag });
  await sleep(150000);
  await afterOpenIfService.getAfterOpenTypeInfo({ pIndicesType: "DMF", pIfType: "AXC", pDate: doDate, pCloseFlag: closeFlag });
  await sleep(150000);
  await indicesIfService.getIndicesTypeInfo({ pIndicesType: "SET_KSP_INV", pDate: doDate, pCloseFlag: closeFlag });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

const runBfIfAll = createSingleFlight("bfIfAll", getBfIfAll);
const runAfIfAll = createSingleFlight("afIfAll", getAfIfAll);

function startScheduler() {
  console.log("🗓️ Scheduler started.");
  const nowSeoul = () => moment().tz("Asia/Seoul");
  const isWeekday = () => {
    const d = nowSeoul().day();
    return d !== 0 && d !== 6;
  };

  // 07:30 / 08:00 / 09:20
  const timesBf = [
    { h: 7, m: 30, s: 20 },
    { h: 8, m: 0, s: 20 },
    { h: 9, m: 20, s: 20 },
  ];
  timesBf.forEach(({ h, m, s }) => {
    const rule = new schedule.RecurrenceRule();
    rule.dayOfWeek = [0, new schedule.Range(1, 5)];
    rule.hour = h; rule.minute = m; rule.second = s;
    schedule.scheduleJob(rule, async () => {
      if (!isWeekday()) return;
      const ymd = nowSeoul().format("YYYY-MM-DD");
      await runBfIfAll(ymd);
    });
  });

  // 09:05 / 10:00 / 13:20 장중
  const timesAfOpen = [
    { h: 9, m: 5, s: 20 },
    { h: 10, m: 0, s: 20 },
    { h: 13, m: 20, s: 20 },
  ];
  timesAfOpen.forEach(({ h, m, s }) => {
    const rule = new schedule.RecurrenceRule();
    rule.dayOfWeek = [0, new schedule.Range(1, 5)];
    rule.hour = h; rule.minute = m; rule.second = s;
    schedule.scheduleJob(rule, async () => {
      if (!isWeekday()) return;
      const ymd = nowSeoul().format("YYYY-MM-DD");
      await runAfIfAll(ymd, false);
    });
  });

  // 15:50 / 22:50 장마감(종가)
  const timesAfClose = [
    { h: 15, m: 50, s: 20 },
    { h: 22, m: 50, s: 20 },
  ];
  timesAfClose.forEach(({ h, m, s }) => {
    const rule = new schedule.RecurrenceRule();
    rule.dayOfWeek = [0, new schedule.Range(1, 5)];
    rule.hour = h; rule.minute = m; rule.second = s;
    schedule.scheduleJob(rule, async () => {
      if (!isWeekday()) return;
      const ymd = nowSeoul().format("YYYY-MM-DD");
      await runAfIfAll(ymd, true);
    });
  });
}

module.exports = { 
  startScheduler,
  runBfIfAllOnce: (date) => runBfIfAll(date),
  runAfIfAllOnce: (date, closeFlag) => runAfIfAll(date, closeFlag), };
