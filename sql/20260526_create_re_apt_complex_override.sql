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
  heating_type_verified VARCHAR(50) NULL,
  manage_type_verified VARCHAR(50) NULL,
  source_name VARCHAR(100) NULL,
  source_url VARCHAR(500) NULL,
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

INSERT INTO re_apt_complex_override (
  kapt_code, apt_seq, lawd_cd, dong_name, apt_name, apt_name_norm,
  household_count_verified, dong_count_verified, parking_total_verified,
  heating_type_verified, manage_type_verified,
  source_name, source_url, note, verified_at
) VALUES
  (
    'A10027205', NULL, '11650', '반포동', '아크로리버파크', '아크로리버파크',
    1612, NULL, NULL,
    NULL, NULL,
    'manual verified / audit seed', NULL,
    'Temporary verified seed from real-estate complex data audit. Fill source_url before production hardening.',
    NOW()
  ),
  (
    'A10027488', NULL, '41570', '풍무동', '김포풍무푸르지오', '김포풍무푸르지오',
    2712, NULL, NULL,
    NULL, NULL,
    'manual verified / audit seed', NULL,
    'Temporary verified seed from real-estate complex data audit. Fill source_url before production hardening.',
    NOW()
  ),
  (
    NULL, '41570-840', '41570', '풍무동', '풍무푸르지오센트레빌', '풍무푸르지오센트레빌',
    2712, NULL, NULL,
    NULL, NULL,
    'manual verified / audit seed', NULL,
    'Alias seed for RTMS trade name related to K-apt 김포풍무푸르지오. Fill source_url before production hardening.',
    NOW()
  )
ON DUPLICATE KEY UPDATE
  lawd_cd = VALUES(lawd_cd),
  dong_name = VALUES(dong_name),
  apt_name = VALUES(apt_name),
  apt_name_norm = VALUES(apt_name_norm),
  household_count_verified = VALUES(household_count_verified),
  dong_count_verified = VALUES(dong_count_verified),
  parking_total_verified = VALUES(parking_total_verified),
  heating_type_verified = VALUES(heating_type_verified),
  manage_type_verified = VALUES(manage_type_verified),
  source_name = VALUES(source_name),
  source_url = VALUES(source_url),
  note = VALUES(note),
  verified_at = VALUES(verified_at);
