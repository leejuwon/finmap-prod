// pages/api/compound.js
import { calcCompound } from '../../lib/compound';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const {
      principal,
      monthly,
      annualRate,
      years,
      months,
      compounding,
      taxOption,
      feeOption,
      locale,
      currency,
    } = req.body || {};

    // -----------------------------
    // 1) 기본 파라미터 숫자 변환
    // -----------------------------
    const p = Number(principal) || 0;
    const m = Number(monthly) || 0;
    const r = Number(annualRate) || 0;
    const y = years != null ? Number(years) : undefined;
    const mo = months != null ? Number(months) : undefined;

    // -----------------------------
    // 2) 유효성 검증 (기존 로직 유지)
    // -----------------------------
    if (p < 0 || p > 1_000_000_000) {
      return res.status(400).json({ error: 'INVALID_PRINCIPAL' });
    }
    if (m < 0 || m > 5_000_000) {
      return res.status(400).json({ error: 'INVALID_MONTHLY' });
    }
    if (r < 0 || r > 40) {
      return res.status(400).json({ error: 'INVALID_RATE' });
    }
    if (
      (y != null && (y <= 0 || y > 50)) ||
      (mo != null && (mo <= 0 || mo > 600))
    ) {
      return res.status(400).json({ error: 'INVALID_TERM' });
    }

    // --------------------------------------
    // 3) 실제 계산 – calcCompound 사용
    //    (calcCompoundAdvanced 대체)
    // --------------------------------------
    const result = calcCompound({
      principal: p,
      monthly: m,
      annualRate: r,
      years: y,
      months: mo,
      compounding,  // 'monthly' | 'yearly' | 'daily' 등
      taxOption,    // 'apply' | 'none' 등 (calcCompound에서 처리)
      feeOption,    // 'apply' | 'none'
      baseYear: new Date().getFullYear(),
    });

    // --------------------------------------
    // 4) 서버 로그 (KPI 집계용) – 안전하게 접근
    // --------------------------------------
    const yearsTotal =
      result?.yearsTotal ??
      (y != null ? y : (mo != null ? mo / 12 : undefined));

    const monthsTotal =
      result?.monthsTotal ??
      (mo != null ? mo : (y != null ? y * 12 : undefined));

    const fvNet =
      result?.futureValueNet ??
      result?.netFutureValue ??
      result?.futureValue ??
      null;

    console.log('[compound:compute]', {
      ts: new Date().toISOString(),
      principal: p,
      monthly: m,
      annualRate: r,
      years: yearsTotal,
      months: monthsTotal,
      compounding: result?.compounding || compounding || 'monthly',
      locale: locale || 'unknown',
      currency: currency || 'unknown',
      fvNet,
    });

    // 기존과 동일하게 ok/result 형태로 응답
    return res.status(200).json({ ok: true, result });
  } catch (e) {
    console.error('[compound:error]', e);
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
}
