// lib/fireReport.js — UPGRADED 2025 FIRE MODEL VERSION

// ===============================
// 금액 포맷 (KRW / USD 자동 지원)
// ===============================
function formatMoney(n, lang = "ko") {
  const v = Number(n) || 0;

  // 한국어 금액 (억 / 천만 / 만)
  if (lang === "ko") {
    if (v >= 100_000_000) return (v / 100_000_000).toFixed(2) + "억";
    if (v >= 10_000_000) return (v / 10_000_000).toFixed(1) + "천만";
    if (v >= 10_000) return (v / 10_000).toFixed(0) + "만";
    return v.toLocaleString("ko-KR") + "원";
  }

  // 영어 (USD) 표기: K / M / B
  if (v >= 1_000_000_000) return "$" + (v / 1_000_000_000).toFixed(2) + "B";
  if (v >= 1_000_000) return "$" + (v / 1_000_000).toFixed(2) + "M";
  if (v >= 1_000) return "$" + (v / 1_000).toFixed(1) + "K";
  return "$" + v.toLocaleString("en-US");
}

// ===============================
// FIRE 분석 리포트 생성 함수
// ===============================
export function buildFireReport(result, params, lang = "ko") {
  if (!result) return "";

  const {
    fireTarget,
    retirementStartReal,
    canFireAtEnd,
    accumulation,
    retirement,
    risk,
  } = result;

  const fireYear = accumulation?.fireYear ?? null;
  const depletionYear = retirement?.depletionYear ?? null;

  const isKo = lang === "ko";

  // ===============================
  // 🇰🇷 한국어 버전
  // ===============================
  if (isKo) {
    const lines = [];

    // 1) FIRE 달성 여부
    if (canFireAtEnd && fireYear) {
      lines.push(`현재 가정에서는 약 **${fireYear}년 후 FIRE 달성이 가능합니다.**`);
    } else {
      lines.push(
        `현재 가정하에서는 **적립 기간 동안 FIRE 목표 자산에 도달하지 못하는 것으로 계산됩니다.**`
      );
    }

    // 2) FIRE 목표 자산 / 은퇴 시작 실질 자산
    lines.push(
      `FIRE 목표 자산은 **${formatMoney(fireTarget, lang)}**, 은퇴 시점의 실질 자산은 **${formatMoney(
        retirementStartReal,
        lang
      )}**입니다.`
    );

    // 3) 은퇴 후 자산 지속 기간
    if (depletionYear === null) {
      lines.push(
        `은퇴 후 자산은 현재 지출·수익률 가정하에서 **60년 이상 유지**되는 것으로 추정됩니다.`
      );
    } else {
      lines.push(
        `은퇴 후 자산은 약 **${depletionYear}년 동안 유지**되며, 이후 점차 소진되는 경로로 나타납니다.`
      );
    }

    // 4) 위험도 해석
    if (risk?.labelKo) {
      lines.push(`현재 조건 기반 종합 위험도는 **${risk.labelKo}** 수준입니다.`);
    }

    return lines.join("\n");
  }

  // ===============================
  // 🇺🇸 English Version
  // ===============================
  const lines = [];

  // 1) FIRE Achievability
  if (canFireAtEnd && fireYear) {
    lines.push(
      `Based on your assumptions, you can reach FIRE in approximately **${fireYear} years**.`
    );
  } else {
    lines.push(
      `Under your current assumptions, you **do not reach the FIRE target** during the accumulation period.`
    );
  }

  // 2) FIRE target & starting assets
  lines.push(
    `Your FIRE target is **${formatMoney(fireTarget, lang)}**, and your estimated real assets at the start of retirement are **${formatMoney(
      retirementStartReal,
      lang
    )}**.`
  );

  // 3) Asset longevity
  if (depletionYear === null) {
    lines.push(
      `Your assets are projected to sustain for **60+ years** after retirement.`
    );
  } else {
    lines.push(
      `Your assets are expected to last for approximately **${depletionYear} years** after retirement.`
    );
  }

  // 4) Risk label
  if (risk?.labelEn) {
    lines.push(`Overall risk level: **${risk.labelEn}**.`);
  }

  return lines.join("\n");
}
