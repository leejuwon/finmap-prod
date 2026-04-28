const objUtils = require('./utils');

const TABLE_NAME = 'CRAWLER_FAILURE_HISTORY';
const MAX_ERROR_MESSAGE_LENGTH = 1000;
let ensureTablePromise = null;

function trimText(value, maxLength) {
  if (value == null) return null;
  const text = String(value);
  return text.length > maxLength ? text.slice(0, maxLength) : text;
}

function normalizeDate(value) {
  if (!value) return null;
  return String(value).slice(0, 10);
}

function safeText(value, maxLength = 255) {
  return trimText(value == null ? null : value, maxLength);
}

async function ensureFailureTable(db) {
  if (!ensureTablePromise) {
    ensureTablePromise = objUtils.dbQuery(db, `
      CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
        ID BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        TARGET_DATE DATE NOT NULL,
        INDICATOR_CODE VARCHAR(32) NOT NULL,
        INDICATOR_NAME VARCHAR(100) NULL,
        SOURCE_NAME VARCHAR(100) NOT NULL,
        CRAWLER_NAME VARCHAR(150) NULL,
        FAILURE_STAGE VARCHAR(100) NOT NULL,
        FAILURE_REASON VARCHAR(255) NULL,
        ERROR_MESSAGE VARCHAR(1000) NULL,
        ATTEMPT_NO INT UNSIGNED NOT NULL DEFAULT 1,
        RETRY_COUNT INT UNSIGNED NOT NULL DEFAULT 0,
        RESOLVED_YN CHAR(1) NOT NULL DEFAULT 'N',
        PROCESSED_YN CHAR(1) NOT NULL DEFAULT 'N',
        RESOLVED_AT DATETIME NULL,
        CREATED_AT TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UPDATED_AT TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (ID),
        UNIQUE KEY uq_crawler_failure_target_indicator_source (
          TARGET_DATE,
          INDICATOR_CODE,
          SOURCE_NAME
        ),
        KEY idx_crawler_failure_unresolved (RESOLVED_YN, TARGET_DATE),
        KEY idx_crawler_failure_processed (PROCESSED_YN, TARGET_DATE),
        KEY idx_crawler_failure_updated (UPDATED_AT)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `).catch((err) => {
      ensureTablePromise = null;
      throw err;
    });
  }

  return ensureTablePromise;
}

async function recordCrawlerFailure(db, failure) {
  const targetDate = normalizeDate(failure.targetDate);
  const indicatorCode = safeText(failure.indicatorCode, 32);
  const sourceName = safeText(failure.sourceName || 'UNKNOWN', 100);

  if (!targetDate || !indicatorCode) {
    console.warn('[crawlerFailure] skip invalid failure record', { targetDate, indicatorCode });
    return;
  }

  try {
    await ensureFailureTable(db);
    await objUtils.dbQuery(db, `
      INSERT INTO ${TABLE_NAME} (
        TARGET_DATE,
        INDICATOR_CODE,
        INDICATOR_NAME,
        SOURCE_NAME,
        CRAWLER_NAME,
        FAILURE_STAGE,
        FAILURE_REASON,
        ERROR_MESSAGE,
        ATTEMPT_NO,
        RETRY_COUNT,
        RESOLVED_YN,
        PROCESSED_YN,
        RESOLVED_AT
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, 'N', 'N', NULL)
      ON DUPLICATE KEY UPDATE
        INDICATOR_NAME = VALUES(INDICATOR_NAME),
        CRAWLER_NAME = VALUES(CRAWLER_NAME),
        FAILURE_STAGE = VALUES(FAILURE_STAGE),
        FAILURE_REASON = VALUES(FAILURE_REASON),
        ERROR_MESSAGE = VALUES(ERROR_MESSAGE),
        ATTEMPT_NO = ATTEMPT_NO + 1,
        RETRY_COUNT = RETRY_COUNT + 1,
        RESOLVED_YN = 'N',
        RESOLVED_AT = NULL,
        UPDATED_AT = NOW()
    `, [
      targetDate,
      indicatorCode,
      safeText(failure.indicatorName, 100),
      sourceName,
      safeText(failure.crawlerName, 150),
      safeText(failure.failureStage || 'FINAL_CHECK', 100),
      safeText(failure.failureReason || 'missing_after_fallback', 255),
      trimText(failure.errorMessage || failure.message || '', MAX_ERROR_MESSAGE_LENGTH),
      Number.isFinite(Number(failure.retryCount)) ? Number(failure.retryCount) : 0,
    ]);

    console.warn(`[crawlerFailure] recorded ${indicatorCode} ${targetDate} source=${sourceName}`);
  } catch (err) {
    console.warn(`[crawlerFailure] write skipped ${indicatorCode} ${targetDate}: ${err?.message || err}`);
  }
}

async function resolveCrawlerFailure(db, { targetDate, indicatorCode, sourceName = 'UNKNOWN' }) {
  const normalizedDate = normalizeDate(targetDate);
  const normalizedCode = safeText(indicatorCode, 32);
  const normalizedSource = safeText(sourceName, 100);

  if (!normalizedDate || !normalizedCode) return;

  try {
    await ensureFailureTable(db);
    const result = await objUtils.dbQuery(db, `
      UPDATE ${TABLE_NAME}
      SET
        RESOLVED_YN = 'Y',
        RESOLVED_AT = NOW(),
        UPDATED_AT = NOW()
      WHERE TARGET_DATE = ?
        AND INDICATOR_CODE = ?
        AND SOURCE_NAME = ?
        AND RESOLVED_YN <> 'Y'
    `, [normalizedDate, normalizedCode, normalizedSource]);

    if (result?.affectedRows) {
      console.log(`[crawlerFailure] resolved ${normalizedCode} ${normalizedDate} source=${normalizedSource}`);
    }
  } catch (err) {
    console.warn(`[crawlerFailure] resolve skipped ${normalizedCode} ${normalizedDate}: ${err?.message || err}`);
  }
}

async function syncCrawlerFailures(db, { failures = [], successes = [] }) {
  for (const failure of failures) {
    await recordCrawlerFailure(db, failure);
  }

  for (const success of successes) {
    await resolveCrawlerFailure(db, success);
  }
}

module.exports = {
  recordCrawlerFailure,
  resolveCrawlerFailure,
  syncCrawlerFailures,
};
