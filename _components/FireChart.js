// _components/FireChart.js
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatMoneyAuto } from '../lib/money';

// ⬇ 여기 추가
function formatKrwHuman(value, withWon = false) {
  const n = Number(value) || 0;
  const abs = Math.abs(n);

  if (abs >= 100_000_000) {
    const v = n / 100_000_000;
    return `${v.toFixed(2)}억원`;
  }
  if (abs >= 10_000_000) {
    const v = n / 10_000_000;
    return `${v.toFixed(1)}천만원`;
  }
  if (abs >= 10_000) {
    const v = n / 10_000;
    return `${v.toFixed(0)}만원`;
  }
  const base = n.toLocaleString('ko-KR');
  return withWon ? `${base}원` : base;
}

export default function FireChart({ data = [], locale = 'ko-KR', currency = 'KRW' }) {
  const isKo = locale.startsWith('ko');
  if (!data || data.length === 0) return null;

  const tooltipFormatter = (value, name) => {
    const label =
      name === 'asset'
        ? isKo ? '자산' : 'Assets'
        : isKo ? 'FIRE 목표' : 'FIRE target';

    // 툴팁은 기존 자동 포맷 + 한글일 때는 사람이 보기 좋은 값까지 같이 보여줘도 됨
    if (isKo) {
      return [`${formatKrwHuman(value, true)}`, label];
    }
    return [formatMoneyAuto(value, locale, currency), label];
  };

  return (
    <section className="fire-chart">
      <h2 className="text-base md:text-lg font-semibold mb-3">
        {isKo ? '은퇴 전·후 자산 곡선' : 'Assets before & after FIRE'}
      </h2>
      <div className="w-full h-72 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="year" />
            <YAxis
              tickFormatter={(v) =>
                isKo ? formatKrwHuman(v, false) : v.toLocaleString(locale)
              }
            />
            <Tooltip formatter={tooltipFormatter} />
            <Legend />
            <Line
              type="monotone"
              dataKey="asset"
              name={isKo ? '자산' : 'Assets'}
              dot={false}
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="fireTarget"
              name={isKo ? 'FIRE 목표자산' : 'FIRE target'}
              dot={false}
              strokeDasharray="4 4"
              strokeWidth={1.5}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
