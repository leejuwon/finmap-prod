// lib/fireReport.js

// 금액 간략 포맷 (한국어)
function fmtKRW(n) {
  const v = Number(n) || 0;
  if (v >= 100_000_000) return (v / 100_000_000).toFixed(2) + "억";
  if (v >= 10_000_000) return (v / 10_000_000).toFixed(1) + "천만";
  if (v >= 10_000) return (v / 10_000).toFixed(0) + "만";
  return v.toLocaleString("ko-KR");
}

export function buildFireReport(result, params, lang = "ko") {
  const {
    fireTarget,
    retirementStartAsset,
    canFireAtEnd,
    timeline,
    retirement,
    risk,
    accumulation,
  } = result;

  const fireYear = accumulation.fireYear ?? null;
  const depletionYear = retirement.depletionYear ?? null;

  const isKo = lang === "ko";

  // ---------------------
  // 한국어 버전
  // ---------------------
  if (isKo) {
    let lines = [];

    // 1) FIRE 달성 여부
    if (fireYear) {
      lines.push(`현재 가정하에 **${fireYear}년 후 FIRE가 가능합니다.**`);
    } else {
      lines.push(
        `현재 가정하에서는 적립 기간 내에 FIRE 목표 자산에 도달하지 못합니다.`
      );
    }

    // 2) 목표 자산
    lines.push(
      `FIRE 목표 자산은 **${fmtKRW(fireTarget)}원**이며, 은퇴 시작 시점의 예상 자산은 **${fmtKRW(
        retirementStartAsset
      )}원**입니다.`
    );

    // 3) 은퇴 후 자산 지속 기간
    if (depletionYear === null) {
      lines.push(
        `현재 수익률·지출 가정에서 은퇴 후 **60년 이상 자산이 유지**됩니다.`
      );
    } else {
      lines.push(
        `은퇴 후 자산은 약 **${depletionYear}년 동안 유지**되며 그 이후 소진됩니다.`
      );
    }

    // 4) 위험도 해석
    lines.push(`종합 위험도는 **${risk.labelKo}** 수준입니다.`);

    return lines.join("\n");
  }

  // ---------------------
  // English version
  // ---------------------
  let lines = [];

  if (fireYear) {
    lines.push(`You can reach FIRE in **${fireYear} years** based on your inputs.`);
  } else {
    lines.push(
      `Under your current assumptions, you do not reach the FIRE target during the accumulation period.`
    );
  }

  lines.push(
    `Your FIRE target is **${fireTarget.toLocaleString()}**, and your estimated assets at the start of retirement are **${retirementStartAsset.toLocaleString()}**.`
  );

  if (depletionYear === null) {
    lines.push(
      `Your assets sustain for **60+ years** after retirement under current assumptions.`
    );
  } else {
    lines.push(
      `Your assets last for approximately **${depletionYear} years** after retirement.`
    );
  }

  lines.push(`Overall risk level is **${risk.labelEn}**.`);

  return lines.join("\n");
}
