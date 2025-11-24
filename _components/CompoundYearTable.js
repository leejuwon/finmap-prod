// _components/CompoundYearTable.js
import { useMemo } from 'react';

function formatMoneyAuto(value, currency = 'KRW', locale = 'ko-KR') {
  const v = Number(value) || 0;
  const isKo = locale.toLowerCase().startsWith('ko');
  const cur = currency || 'KRW';

  // KRW 전용 단위 자동 변환 (원 / 만원 / 억원)
  if (cur === 'KRW') {
    const abs = Math.abs(v);
    let divisor = 1;
    let suffix = isKo ? '원' : 'KRW';

    if (abs >= 100_000_000) {
      // 👉 억 단위: 항상 소수점 2자리
      divisor = 100_000_000;
      suffix = isKo ? '억원' : '×100M KRW';

      const scaled = v / divisor;

      const numStr = scaled.toLocaleString(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      return `${numStr}${suffix}`;
    } else if (abs >= 10_000) {
      // 👉 만원 단위: 필요할 때만 소수점 1자리
      divisor = 10_000;
      suffix = isKo ? '만원' : '×10k KRW';

      const scaled = v / divisor;
      const scaledAbs = Math.abs(scaled);
      const hasFraction = Math.round(scaledAbs * 10) % 10 !== 0; // x.0 이면 소수 안 보이게
      const fractionDigits = hasFraction ? 1 : 0;

      const numStr = scaled.toLocaleString(locale, {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
      });

      return `${numStr}${suffix}`;
    }

    // 👉 1만원 미만: 그냥 원 단위 정수
    const numStr = v.toLocaleString(locale, {
      maximumFractionDigits: 0,
    });
    return `${numStr}${suffix}`;
  }

  // 통화코드가 유효하지 않으면 그냥 숫자 포맷
  const isValidCurrency = typeof cur === 'string' && /^[A-Z]{3}$/.test(cur);
  if (!isValidCurrency) {
    return new Intl.NumberFormat(locale).format(v);
  }

  // 그 외 통화(USD 등)
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: cur,
    maximumFractionDigits: 2,
  }).format(v);
}


export default function CompoundYearTable({
  result,
  locale = 'ko-KR',
  currency = 'KRW',
  principal = 0,
  monthly = 0,
  title,
}) {
  const rows = result?.yearSummary || [];

  const tableTitle = useMemo(() => {
    if (title) return title;
    return locale.startsWith('ko') ? '연간 요약 테이블' : 'Yearly Summary';
  }, [title, locale]);

  const unitText = locale.startsWith('ko')
    ? '단위: 원 / 만원 / 억원 자동 (1년차 연간 납입에 초기 투자금 포함)'
    : 'Unit: auto (KRW / 10k / 100M, year 1 includes initial principal)';

  // 연도별 통계 계산
  const buildYearStats = (rows) =>
    rows.map((r, idx) => {
      const year = r.year;
      const opening = Number(r.openingBalanceNet) || 0;
      const contribYearRaw = Number(r.contributionYear) || 0; // 실제 연간 월납입 (원금 제외)
      const closing = Number(r.closingBalanceNet) || 0;

      // 이자(세후) – 원래 로직 유지 (원금 포함)
      const interestNet =
        r.interestYearNet != null
          ? Number(r.interestYearNet) || 0
          : closing - opening - contribYearRaw;

      const prev = idx > 0 ? rows[idx - 1] : null;

      // 1) 우선 taxYear, feeYear 사용
      let taxYear = Number(r.taxYear) || 0;
      let feeYear = Number(r.feeYear) || 0;

      // 2) 없으면 누적 값의 차이로 계산
      if (!taxYear && r.cumulativeTax != null) {
        const prevCum =
          prev && prev.cumulativeTax != null
            ? Number(prev.cumulativeTax) || 0
            : 0;
        const curCum = Number(r.cumulativeTax) || 0;
        taxYear = curCum - prevCum;
      }

      if (!feeYear && r.cumulativeFee != null) {
        const prevCum =
          prev && prev.cumulativeFee != null
            ? Number(prev.cumulativeFee) || 0
            : 0;
        const curCum = Number(r.cumulativeFee) || 0;
        feeYear = curCum - prevCum;
      }

      // 3) 그래도 0이면, 이자 총액 차이로 추정
      if (
        !taxYear &&
        !feeYear &&
        r.interestYearGross != null &&
        r.interestYearNet != null
      ) {
        const diff =
          Number(r.interestYearGross) - Number(r.interestYearNet);
        taxYear = diff;
        feeYear = 0;
      }

      const taxFee = taxYear + feeYear;

      // ✅ 1년차 연간 납입 = 초기투자금 + 1년치 월 납입
      //    2년차부터는 월 납입만 표시
      const contribDisplay =
        year === 1
          ? Number(principal) + contribYearRaw
          : contribYearRaw;

      // 누적 실제 투자금 (초기 + 월 납입)
      const investedTotal =
        Number(principal) + Number(monthly) * 12 * year;

      // 누적 수익률 (세후) = 기말잔액 / 누적 투자금
      const returnRate =
        investedTotal > 0 ? (closing / investedTotal) * 100 : 0;

      return {
        year,
        contrib: contribDisplay,
        closing,
        interestNet,
        taxFee,
        investedTotal,
        returnRate,
      };
    });

  const stats = buildYearStats(rows);

  const downloadCsv = () => {
    if (!stats.length) return;

    const header = [
      'year',
      'contributionYearDisplay',
      'closingNet',
      'interestNet',
      'taxFeeYear',
      'investedTotal',
      'returnRateTotal',
    ];
    const lines = [header.join(',')];

    stats.forEach((s) => {
      lines.push(
        [
          s.year,
          s.contrib,
          s.closing,
          s.interestNet,
          s.taxFee,
          s.investedTotal,
          s.returnRate,
        ].join(',')
      );
    });

    const blob = new Blob(['\uFEFF' + lines.join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'compound_year_summary.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!stats.length) {
    return (
      <div className="card fm-year-table">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-xl font-semibold">{tableTitle}</h2>
        </div>
        <p className="text-sm text-slate-500">
          {locale.startsWith('ko') ? '데이터가 없습니다.' : 'No data.'}
        </p>
      </div>
    );
  }

  return (
    <div className="card fm-year-table">
      <div className="flex items-center gap-3 mb-2">
        <h2 className="text-xl font-semibold">{tableTitle}</h2>
        <span className="text-[11px] sm:text-xs text-slate-500">
          {unitText}
        </span>
        <button
          type="button"
          className="btn-secondary ml-auto text-xs sm:text-sm"
          onClick={downloadCsv}
        >
          {locale.startsWith('ko') ? 'CSV 다운로드' : 'Download CSV'}
        </button>
      </div>

      <div className="overflow-x-auto">
        {/* ✅ 플립같이 좁은 화면에서도 깨지지 않도록 최소 너비 유지 */}
        <table className="min-w-[760px] border-t">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-2 py-1 text-left whitespace-nowrap">
                {locale.startsWith('ko') ? '연도' : 'Year'}
              </th>
              <th className="px-2 py-1 text-right whitespace-nowrap">
                {locale.startsWith('ko') ? '연간 납입' : 'Contribution / year'}
              </th>
              <th className="px-2 py-1 text-right whitespace-nowrap">
                {locale.startsWith('ko') ? '기말잔액(세후)' : 'Closing (Net)'}
              </th>
              <th className="px-2 py-1 text-right whitespace-nowrap">
                {locale.startsWith('ko') ? '이자(세후)' : 'Interest (Net)'}
              </th>
              <th className="px-2 py-1 text-right whitespace-nowrap">
                {locale.startsWith('ko') ? '세금+수수료' : 'Tax + fee'}
              </th>
              <th className="px-2 py-1 text-right whitespace-nowrap">
                {locale.startsWith('ko')
                  ? '총 투자금(누적)'
                  : 'Invested total'}
              </th>
              <th className="px-2 py-1 text-right whitespace-nowrap">
                {locale.startsWith('ko')
                  ? '누적 수익률(세후)'
                  : 'Cum. return (net)'}
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
                  {formatMoneyAuto(s.contrib, currency, locale)}
                </td>
                <td className="px-2 py-1 text-right whitespace-nowrap">
                  {formatMoneyAuto(s.closing, currency, locale)}
                </td>
                <td className="px-2 py-1 text-right whitespace-nowrap">
                  {formatMoneyAuto(s.interestNet, currency, locale)}
                </td>
                <td className="px-2 py-1 text-right whitespace-nowrap">
                  {formatMoneyAuto(s.taxFee, currency, locale)}
                </td>
                <td className="px-2 py-1 text-right whitespace-nowrap">
                  {formatMoneyAuto(s.investedTotal, currency, locale)}
                </td>
                <td className="px-2 py-1 text-right whitespace-nowrap">
                  {s.returnRate.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
