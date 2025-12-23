// server/crawler/lib/vendors/yahooFinance.js
// Yahoo Finance client (yahoo-finance2 v3)
//
// v3 breaking change: you must create a client instance.
//   const YahooFinance = require('yahoo-finance2').default;
//   const yahooFinance = new YahooFinance();
//
// We keep this in one place so every service shares cookies/crumbs and config.

'use strict';

function createClient() {
  // CommonJS: the package exports default.
  const YahooFinance = require('yahoo-finance2').default;

  // v3: class instance
  const yahooFinance = new YahooFinance();

  // Reduce noisy console warnings from the library.
  // (These notice keys are safe; unknown keys are ignored by the library.)
  try {
    yahooFinance.suppressNotices([
      'ripHistorical',
      'yahooSurvey',
      'yahooCookie',
      'experimental',
    ]);
  } catch (_) {
    // ignore
  }

  // Optional: limit concurrency to avoid being throttled.
  try {
    yahooFinance.setGlobalConfig({
      queue: { concurrency: Number(process.env.YF_CONCURRENCY || 3) },
      validation: { logErrors: false },
    });
  } catch (_) {
    // ignore
  }

  return yahooFinance;
}

// Export a singleton instance so every import shares the same cookie/crumb state.
module.exports = createClient();
