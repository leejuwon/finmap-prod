-- Finmap real estate apartment complex dimension table.
-- This migration only creates or adds columns/indexes for re_apt_complex_dim.
-- Do not DROP, TRUNCATE, DELETE, or update collected rows in this file.

CREATE TABLE IF NOT EXISTS re_apt_complex_dim (
  kapt_code VARCHAR(40) NOT NULL COMMENT 'Public apartment complex code',
  kapt_name VARCHAR(255) NULL,
  kapt_name_norm VARCHAR(255) NOT NULL DEFAULT '' COMMENT 'Normalized complex name used for fallback matching',
  sido_code VARCHAR(2) NULL,
  lawd_cd VARCHAR(10) NULL COMMENT 'Usually 5-digit sigungu code; keep VARCHAR for source compatibility',
  bjd_code VARCHAR(10) NULL COMMENT 'Legal dong code when provided by the source',
  sigungu_name VARCHAR(100) NULL,
  gu_name VARCHAR(100) NOT NULL DEFAULT '',
  dong_name VARCHAR(100) NULL,
  jibun VARCHAR(100) NULL,
  kapt_addr VARCHAR(500) NULL COMMENT 'Raw address from AptBasisInfo/List API',
  road_nm VARCHAR(255) NULL,
  road_nm_bonbun VARCHAR(20) NULL,
  road_nm_bubun VARCHAR(20) NULL,
  road_addr VARCHAR(500) NULL,
  approval_date DATE NULL,
  build_year INT NULL,
  dong_count INT NULL,
  household_count INT NULL,
  parking_total INT NULL,
  parking_ground INT NULL,
  parking_underground INT NULL,
  heating_type VARCHAR(100) NULL,
  manage_type VARCHAR(100) NULL,
  tel VARCHAR(100) NULL,
  homepage VARCHAR(500) NULL,
  basis_raw_json LONGTEXT NULL,
  basis_error_reason VARCHAR(40) NULL,
  source_updated_at DATE NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (kapt_code),
  KEY idx_re_apt_complex_sido_lawd (sido_code, lawd_cd),
  KEY idx_re_apt_complex_name_norm (kapt_name_norm),
  KEY idx_re_apt_complex_bjd_code (bjd_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Existing-table patch section.
-- MySQL/MariaDB version support for ADD COLUMN IF NOT EXISTS and ADD INDEX IF NOT EXISTS varies.
-- If your server rejects these statements, run SHOW COLUMNS/SHOW INDEX first and apply only the missing pieces.

ALTER TABLE re_apt_complex_dim
  ADD COLUMN IF NOT EXISTS kapt_name VARCHAR(255) NULL AFTER kapt_code,
  ADD COLUMN IF NOT EXISTS kapt_name_norm VARCHAR(255) NOT NULL DEFAULT '' AFTER kapt_name,
  ADD COLUMN IF NOT EXISTS sido_code VARCHAR(2) NULL AFTER kapt_name_norm,
  ADD COLUMN IF NOT EXISTS lawd_cd VARCHAR(10) NULL AFTER sido_code,
  ADD COLUMN IF NOT EXISTS bjd_code VARCHAR(10) NULL AFTER lawd_cd,
  ADD COLUMN IF NOT EXISTS sigungu_name VARCHAR(100) NULL AFTER bjd_code,
  ADD COLUMN IF NOT EXISTS gu_name VARCHAR(100) NOT NULL DEFAULT '' AFTER sigungu_name,
  ADD COLUMN IF NOT EXISTS dong_name VARCHAR(100) NULL AFTER gu_name,
  ADD COLUMN IF NOT EXISTS jibun VARCHAR(100) NULL AFTER dong_name,
  ADD COLUMN IF NOT EXISTS kapt_addr VARCHAR(500) NULL AFTER jibun,
  ADD COLUMN IF NOT EXISTS road_nm VARCHAR(255) NULL AFTER kapt_addr,
  ADD COLUMN IF NOT EXISTS road_nm_bonbun VARCHAR(20) NULL AFTER road_nm,
  ADD COLUMN IF NOT EXISTS road_nm_bubun VARCHAR(20) NULL AFTER road_nm_bonbun,
  ADD COLUMN IF NOT EXISTS road_addr VARCHAR(500) NULL AFTER road_nm_bubun,
  ADD COLUMN IF NOT EXISTS approval_date DATE NULL AFTER road_addr,
  ADD COLUMN IF NOT EXISTS build_year INT NULL AFTER approval_date,
  ADD COLUMN IF NOT EXISTS dong_count INT NULL AFTER build_year,
  ADD COLUMN IF NOT EXISTS household_count INT NULL AFTER dong_count,
  ADD COLUMN IF NOT EXISTS parking_total INT NULL AFTER household_count,
  ADD COLUMN IF NOT EXISTS parking_ground INT NULL AFTER parking_total,
  ADD COLUMN IF NOT EXISTS parking_underground INT NULL AFTER parking_ground,
  ADD COLUMN IF NOT EXISTS heating_type VARCHAR(100) NULL AFTER parking_underground,
  ADD COLUMN IF NOT EXISTS manage_type VARCHAR(100) NULL AFTER heating_type,
  ADD COLUMN IF NOT EXISTS tel VARCHAR(100) NULL AFTER manage_type,
  ADD COLUMN IF NOT EXISTS homepage VARCHAR(500) NULL AFTER tel,
  ADD COLUMN IF NOT EXISTS basis_raw_json LONGTEXT NULL AFTER homepage,
  ADD COLUMN IF NOT EXISTS basis_error_reason VARCHAR(40) NULL AFTER basis_raw_json,
  ADD COLUMN IF NOT EXISTS source_updated_at DATE NULL AFTER basis_error_reason,
  ADD COLUMN IF NOT EXISTS created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER source_updated_at,
  ADD COLUMN IF NOT EXISTS updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

-- Add these indexes only if they are missing.
SET @idx_exists := (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 're_apt_complex_dim'
    AND index_name = 'idx_re_apt_complex_sido_lawd'
);
SET @sql := IF(@idx_exists = 0,
  'CREATE INDEX idx_re_apt_complex_sido_lawd ON re_apt_complex_dim (sido_code, lawd_cd)',
  'SELECT ''idx_re_apt_complex_sido_lawd exists'' AS msg'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists := (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 're_apt_complex_dim'
    AND index_name = 'idx_re_apt_complex_name_norm'
);
SET @sql := IF(@idx_exists = 0,
  'CREATE INDEX idx_re_apt_complex_name_norm ON re_apt_complex_dim (kapt_name_norm)',
  'SELECT ''idx_re_apt_complex_name_norm exists'' AS msg'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists := (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 're_apt_complex_dim'
    AND index_name = 'idx_re_apt_complex_bjd_code'
);
SET @sql := IF(@idx_exists = 0,
  'CREATE INDEX idx_re_apt_complex_bjd_code ON re_apt_complex_dim (bjd_code)',
  'SELECT ''idx_re_apt_complex_bjd_code exists'' AS msg'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
