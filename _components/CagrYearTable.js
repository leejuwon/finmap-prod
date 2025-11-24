// _components/CagrYearTable.js
function formatMoneyAuto(value, currency = 'KRW', locale = 'ko-KR') {
  const v = Number(value) || 0;
  const isKo = locale.toLowerCase().startsWith('ko');
  const cur = currency || 'KRW';

  if (cur === 'KRW') {
    const abs = Math.abs(v);
    let divisor = 1;
    let suffix = isKo ? '원' : 'KRW';

    // 억 단위
    if (abs >= 100_000_000) {
      divisor = 100_000_000;
      suffix = isKo ? '억원' : '×100M KRW';
    }
    // 만원 단위
    else if (abs >= 10_000) {
      divisor = 10_000;
      suffix = isKo ? '만원' : '×10k KRW';
    }

    const scaled = v / divisor;
    const scaledAbs = Math.abs(scaled);

    let minimumFractionDigits = 0;
    let maximumFractionDigits = 0;

    if (divisor === 100_000_000) {
      // 🔥 억 단위: 소수점 최대 2자리
      // 12.00 → 12
      // 12.10 → 12.1
      // 12.12 → 12.12
      maximumFractionDigits = 2;
      minimumFractionDigits = scaled % 1 === 0 ? 0 : 1;
    } else if (divisor === 10_000) {
      // 🔥 만원 단위: 소수점 최대 1자리
      maximumFractionDigits = 1;
      minimumFractionDigits = scaled % 1 === 0 ? 0 : 1;
    } else {
      // 원 단위
      maximumFractionDigits = 0;
      minimumFractionDigits = 0;
    }

    const numStr = scaled.toLocaleString(locale, {
      minimumFractionDigits,
      maximumFractionDigits,
    });

    return `${numStr}${suffix}`;
  }

  // 기타 통화 (USD 등)
  const isValidCurrency =
    typeof cur === 'string' && /^[A-Z]{3}$/.test(cur);

  if (!isValidCurrency) {
    return new Intl.NumberFormat(locale).format(v);
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: cur,
    maximumFractionDigits: 2,
  }).format(v);
}

export default function CagrYearTable({
  result,
  locale = 'ko-KR',
  currency = 'KRW',
  initial = 0,
}) {
  const rows = result?.yearSummary || [];
  const isKo = locale.startsWith('ko');

  if (!rows.length) {
    return (
      <div className="card">
        <h2 className="text-xl font-semibold mb-2">
          {isKo ? '연간 요약 테이블' : 'Yearly Summary'}
        </h2>
        <p className="text-sm text-slate-500">
          {isKo ? '데이터가 없습니다.' : 'No data.'}
        </p>
      </div>
    );
  }

  const unitText = isKo
    ? '단위: 원 / 만원 / 억원 자동'
    : 'Unit: auto (KRW / 10k / 100M)';

  let cumulativeTaxFee = 0;

  const stats = rows.map((r) => {
    const year = r.year;
    const gross = Number(r.grossValue) || 0;
    const net = Number(r.netValue) || 0;
    const diff = gross - net;
    cumulativeTaxFee += diff;
    const invested = initial * Math.pow(
      1 + (rows[rows.length - 1].netCagr || 0),
      year
    ); // optional, not strictly used

    return {
      year,
      gross,
      net,
      diff,
      cumulativeTaxFee,
    };
  });

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-2">
        <h2 className="text-xl font-semibold">
          {isKo ? '연간 자산 경로' : 'Yearly asset path'}
        </h2>
        <span className="text-[11px] sm:text-xs text-slate-500">
          {unitText}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[720px] border-t">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-2 py-1 text-left whitespace-nowrap">
                {isKo ? '연도' : 'Year'}
              </th>
              <th className="px-2 py-1 text-right whitespace-nowrap">
                {isKo ? '세전 자산(추정)' : 'Gross (estimated)'}
              </th>
              <th className="px-2 py-1 text-right whitespace-nowrap">
                {isKo ? '세후 자산' : 'Net after tax/fee'}
              </th>
              <th className="px-2 py-1 text-right whitespace-nowrap">
                {isKo ? '연간 세금+수수료 효과' : 'Tax+fee impact (year)'}
              </th>
              <th className="px-2 py-1 text-right whitespace-nowrap">
                {isKo ? '누적 세금+수수료' : 'Tax+fee (cumulative)'}
              </th>
            </tr>
          </thead>
          <tbody>
            {stats.map((s) => (
              <tr key={s.year} className="border-t">
                <td className="px-2 py-1 text-left whitespace-nowrap">
                  {s.year}
                </td>
                <td className="px-2 py-1 text-right whitespace-nowrap">
                  {formatMoneyAuto(s.gross, currency, locale)}
                </td>
                <td className="px-2 py-1 text-right whitespace-nowrap">
                  {formatMoneyAuto(s.net, currency, locale)}
                </td>
                <td className="px-2 py-1 text-right whitespace-nowrap">
                  {formatMoneyAuto(s.diff, currency, locale)}
                </td>
                <td className="px-2 py-1 text-right whitespace-nowrap">
                  {formatMoneyAuto(s.cumulativeTaxFee, currency, locale)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
