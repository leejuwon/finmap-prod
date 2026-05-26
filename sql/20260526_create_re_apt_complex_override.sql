-- Finmap real estate apartment complex verified override table.
-- Use this table only for values verified from an official source or an audit seed.
-- Matching priority in API:
--   1) kapt_code
--   2) apt_seq
--   3) lawd_cd + dong_name + apt_name_norm
-- Never match by apt_name alone.

CREATE TABLE IF NOT EXISTS re_apt_complex_override (
  id BIGINT NOT NULL AUTO_INCREMENT,
  kapt_code VARCHAR(30) NULL,
  apt_seq VARCHAR(30) NULL,
  lawd_cd CHAR(5) NULL,
  dong_name VARCHAR(50) NULL,
  apt_name VARCHAR(100) NOT NULL,
  apt_name_norm VARCHAR(120) NOT NULL DEFAULT '',
  household_count_verified INT NULL,
  dong_count_verified INT NULL,
  parking_total_verified INT NULL,
  parking_ground_verified INT NULL,
  parking_underground_verified INT NULL,
  heating_type_verified VARCHAR(50) NULL,
  manage_type_verified VARCHAR(50) NULL,
  approval_date_verified DATE NULL,
  source_name VARCHAR(100) NULL,
  source_url VARCHAR(500) NULL,
  source_file VARCHAR(255) NULL,
  source_version VARCHAR(100) NULL,
  note VARCHAR(500) NULL,
  verified_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_re_apt_complex_override_kapt_code (kapt_code),
  UNIQUE KEY uk_re_apt_complex_override_apt_seq (apt_seq),
  KEY idx_re_apt_complex_override_region_name (lawd_cd, dong_name, apt_name_norm),
  KEY idx_re_apt_complex_override_name_norm (apt_name_norm)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @idx_exists := (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 're_apt_complex_override'
    AND index_name = 'uk_re_apt_complex_override_kapt_code'
);
SET @sql := IF(@idx_exists = 0,
  'CREATE UNIQUE INDEX uk_re_apt_complex_override_kapt_code ON re_apt_complex_override (kapt_code)',
  'SELECT ''uk_re_apt_complex_override_kapt_code exists'' AS msg'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists := (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 're_apt_complex_override'
    AND index_name = 'uk_re_apt_complex_override_apt_seq'
);
SET @sql := IF(@idx_exists = 0,
  'CREATE UNIQUE INDEX uk_re_apt_complex_override_apt_seq ON re_apt_complex_override (apt_seq)',
  'SELECT ''uk_re_apt_complex_override_apt_seq exists'' AS msg'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists := (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 're_apt_complex_override'
    AND index_name = 'idx_re_apt_complex_override_region_name'
);
SET @sql := IF(@idx_exists = 0,
  'CREATE INDEX idx_re_apt_complex_override_region_name ON re_apt_complex_override (lawd_cd, dong_name, apt_name_norm)',
  'SELECT ''idx_re_apt_complex_override_region_name exists'' AS msg'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 're_apt_complex_override'
    AND column_name = 'parking_ground_verified'
);
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE re_apt_complex_override ADD COLUMN parking_ground_verified INT NULL AFTER parking_total_verified',
  'SELECT ''parking_ground_verified exists'' AS msg'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 're_apt_complex_override'
    AND column_name = 'parking_underground_verified'
);
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE re_apt_complex_override ADD COLUMN parking_underground_verified INT NULL AFTER parking_ground_verified',
  'SELECT ''parking_underground_verified exists'' AS msg'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 're_apt_complex_override'
    AND column_name = 'approval_date_verified'
);
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE re_apt_complex_override ADD COLUMN approval_date_verified DATE NULL AFTER manage_type_verified',
  'SELECT ''approval_date_verified exists'' AS msg'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 're_apt_complex_override'
    AND column_name = 'source_file'
);
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE re_apt_complex_override ADD COLUMN source_file VARCHAR(255) NULL AFTER source_url',
  'SELECT ''source_file exists'' AS msg'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 're_apt_complex_override'
    AND column_name = 'source_version'
);
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE re_apt_complex_override ADD COLUMN source_version VARCHAR(100) NULL AFTER source_file',
  'SELECT ''source_version exists'' AS msg'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

INSERT INTO re_apt_complex_override (
  kapt_code, apt_seq, lawd_cd, dong_name, apt_name, apt_name_norm,
  household_count_verified, dong_count_verified, parking_total_verified,
  parking_ground_verified, parking_underground_verified,
  heating_type_verified, manage_type_verified, approval_date_verified,
  source_name, source_url, source_file, source_version, note, verified_at
) VALUES
  (
    'A10027205', NULL, '11650', '반포동', '아크로리버파크', '아크로리버파크',
    1612, NULL, NULL,
    NULL, NULL,
    NULL, NULL,
    NULL,
    'manual verified / audit seed', NULL, 'audit-seed', '2026-05-26',
    'Temporary verified seed from real-estate complex data audit. Fill source_url before production hardening.',
    NOW()
  ),
  (
    'A10027488', NULL, '41570', '풍무동', '김포풍무푸르지오', '김포풍무푸르지오',
    2712, NULL, NULL,
    NULL, NULL,
    NULL, NULL,
    NULL,
    'manual verified / audit seed', NULL, 'audit-seed', '2026-05-26',
    'Temporary verified seed from real-estate complex data audit. Fill source_url before production hardening.',
    NOW()
  ),
  (
    NULL, '41570-840', '41570', '풍무동', '풍무푸르지오센트레빌', '풍무푸르지오센트레빌',
    2712, NULL, NULL,
    NULL, NULL,
    NULL, NULL,
    NULL,
    'manual verified / audit seed', NULL, 'audit-seed', '2026-05-26',
    'Alias seed for RTMS trade name related to K-apt 김포풍무푸르지오. Fill source_url before production hardening.',
    NOW()
  )
ON DUPLICATE KEY UPDATE
  lawd_cd = IF(LOWER(COALESCE(source_name, '')) LIKE '%manual%' OR LOWER(COALESCE(source_name, '')) LIKE '%seed%', VALUES(lawd_cd), lawd_cd),
  dong_name = IF(LOWER(COALESCE(source_name, '')) LIKE '%manual%' OR LOWER(COALESCE(source_name, '')) LIKE '%seed%', VALUES(dong_name), dong_name),
  apt_name = IF(LOWER(COALESCE(source_name, '')) LIKE '%manual%' OR LOWER(COALESCE(source_name, '')) LIKE '%seed%', VALUES(apt_name), apt_name),
  apt_name_norm = IF(LOWER(COALESCE(source_name, '')) LIKE '%manual%' OR LOWER(COALESCE(source_name, '')) LIKE '%seed%', VALUES(apt_name_norm), apt_name_norm),
  household_count_verified = IF(LOWER(COALESCE(source_name, '')) LIKE '%manual%' OR LOWER(COALESCE(source_name, '')) LIKE '%seed%', VALUES(household_count_verified), household_count_verified),
  dong_count_verified = IF(LOWER(COALESCE(source_name, '')) LIKE '%manual%' OR LOWER(COALESCE(source_name, '')) LIKE '%seed%', VALUES(dong_count_verified), dong_count_verified),
  parking_total_verified = IF(LOWER(COALESCE(source_name, '')) LIKE '%manual%' OR LOWER(COALESCE(source_name, '')) LIKE '%seed%', VALUES(parking_total_verified), parking_total_verified),
  parking_ground_verified = IF(LOWER(COALESCE(source_name, '')) LIKE '%manual%' OR LOWER(COALESCE(source_name, '')) LIKE '%seed%', VALUES(parking_ground_verified), parking_ground_verified),
  parking_underground_verified = IF(LOWER(COALESCE(source_name, '')) LIKE '%manual%' OR LOWER(COALESCE(source_name, '')) LIKE '%seed%', VALUES(parking_underground_verified), parking_underground_verified),
  heating_type_verified = IF(LOWER(COALESCE(source_name, '')) LIKE '%manual%' OR LOWER(COALESCE(source_name, '')) LIKE '%seed%', VALUES(heating_type_verified), heating_type_verified),
  manage_type_verified = IF(LOWER(COALESCE(source_name, '')) LIKE '%manual%' OR LOWER(COALESCE(source_name, '')) LIKE '%seed%', VALUES(manage_type_verified), manage_type_verified),
  approval_date_verified = IF(LOWER(COALESCE(source_name, '')) LIKE '%manual%' OR LOWER(COALESCE(source_name, '')) LIKE '%seed%', VALUES(approval_date_verified), approval_date_verified),
  source_name = IF(LOWER(COALESCE(source_name, '')) LIKE '%manual%' OR LOWER(COALESCE(source_name, '')) LIKE '%seed%', VALUES(source_name), source_name),
  source_url = IF(LOWER(COALESCE(source_name, '')) LIKE '%manual%' OR LOWER(COALESCE(source_name, '')) LIKE '%seed%', VALUES(source_url), source_url),
  source_file = IF(LOWER(COALESCE(source_name, '')) LIKE '%manual%' OR LOWER(COALESCE(source_name, '')) LIKE '%seed%', VALUES(source_file), source_file),
  source_version = IF(LOWER(COALESCE(source_name, '')) LIKE '%manual%' OR LOWER(COALESCE(source_name, '')) LIKE '%seed%', VALUES(source_version), source_version),
  note = IF(LOWER(COALESCE(source_name, '')) LIKE '%manual%' OR LOWER(COALESCE(source_name, '')) LIKE '%seed%', VALUES(note), note),
  verified_at = IF(LOWER(COALESCE(source_name, '')) LIKE '%manual%' OR LOWER(COALESCE(source_name, '')) LIKE '%seed%', VALUES(verified_at), verified_at);
