// _components/GoalChart.js
import React from 'react';

function formatMoneyShort(value, currency = 'KRW', locale = 'ko-KR') {
  const v = Number(value) || 0;
  const isKo = locale.toLowerCase().startsWith('ko');
  const cur = currency || 'KRW';

  if (cur === 'KRW') {
    const abs = Math.abs(v);
    let divisor = 1;
    let suffix = isKo ? '원' : 'KRW';

    if (abs >= 100_000_000) {
      divisor = 100_000_000;
      suffix = isKo ? '억' : '×100M';
    } else if (abs >= 10_000) {
      divisor = 10_000;
      suffix = isKo ? '만' : '×10k';
    }

    const scaled = v / divisor;
    const scaledAbs = Math.abs(scaled);
    const hasFraction = Math.round(scaledAbs * 10) % 10 !== 0;
    const fractionDigits = hasFraction ? 1 : 0;

    const numStr = scaled.toLocaleString(locale, {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    });

    return `${numStr}${suffix}`;
  }

  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 1,
  }).format(v);
}

export default function GoalChart({
  data = [],
  locale = 'ko-KR',
  currency = 'KRW',
  target = 0,
}) {
  if (!data.length) {
    return (
      <div className="text-sm text-slate-500">
        {locale.toLowerCase().startsWith('ko')
          ? '데이터가 없습니다.'
          : 'No data.'}
      </div>
    );
  }

  const values = [
    ...data.map((d) => Number(d.invested) || 0),
    ...data.map((d) => Number(d.valueNet) || 0),
    target || 0,
  ];
  const maxVal = Math.max(...values, 1);
  const minVal = 0;

  const n = data.length;
  const xForIndex = (i) =>
    n === 1 ? 50 : 5 + (i / (n - 1)) * 90; // 5~95%
  const yForValue = (v) => {
    const ratio = (v - minVal) / (maxVal - minVal || 1);
    return 80 - ratio * 50; // y: 30~80 사이
  };

  const investedPoints = data
    .map((d, i) => {
      const x = xForIndex(i);
      const y = yForValue(Number(d.invested) || 0);
      return `${x},${y}`;
    })
    .join(' ');

  const netPoints = data
    .map((d, i) => {
      const x = xForIndex(i);
      const y = yForValue(Number(d.valueNet) || 0);
      return `${x},${y}`;
    })
    .join(' ');

  // 목표선 (수평 라인)
  const targetY = target > 0 ? yForValue(target) : null;

  // Y축 눈금 4개
  const ticks = [0, 0.33, 0.66, 1].map((r) => minVal + (maxVal - minVal) * r);

  const isKo = locale.toLowerCase().startsWith('ko');

  return (
    <div className="w-full">
      {/* SVG 차트 영역 */}

      <svg viewBox="0 0 100 90" className="w-full"
            style={{
                height: 'min(420px, 60vw)',     // PC 420px, 작은 화면은 화면비에 따라 조절
                maxHeight: '420px',
                minHeight: '260px',             // 모바일 최소 높이 확보
            }}
      >
        {/* 배경 */}
        <rect x="0" y="0" width="100" height="90" fill="white" />

        {/* Y축 격자 & 라벨 */}
        {ticks.map((t, idx) => {
          const y = yForValue(t);
          return (
            <g key={idx}>
              <line
                x1="5"
                y1={y}
                x2="95"
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="0.3"
              />
              <text
                x="2"
                y={y + 1.5}
                fontSize="3"
                fill="#9ca3af"
                textAnchor="start"
              >
                {formatMoneyShort(t, currency, locale)}
              </text>
            </g>
          );
        })}

        {/* X축 */}
        <line
          x1="5"
          y1="80"
          x2="95"
          y2="80"
          stroke="#9ca3af"
          strokeWidth="0.5"
        />

        {/* 목표 자산 라인 (주황, 점선) */}
        {targetY !== null && (
          <line
            x1="5"
            y1={targetY}
            x2="95"
            y2={targetY}
            stroke="#f59e0b"     // amber-500
            strokeWidth="0.8"
            strokeDasharray="2.5 2"
          />
        )}

        {/* 누적 투자금 라인 (파란색) */}
        <polyline
          fill="none"
          stroke="#2563eb"      // blue-600
          strokeWidth="1.2"
          points={investedPoints}
        />

        {/* 세후 자산 라인 (초록색) */}
        <polyline
          fill="none"
          stroke="#10b981"      // emerald-500
          strokeWidth="1.4"
          points={netPoints}
        />

        {/* 각 포인트에 작은 점(세후 자산) */}
        {data.map((d, i) => {
          const x = xForIndex(i);
          const y = yForValue(Number(d.valueNet) || 0);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="1.4"
              fill="#10b981"
              stroke="white"
              strokeWidth="0.4"
            />
          );
        })}

        {/* X축 라벨: 연도 */}
        {data.map((d, i) => {
          const x = xForIndex(i);
          return (
            <text
              key={i}
              x={x}
              y="86"
              fontSize="3"
              fill="#6b7280"
              textAnchor="middle"
            >
              {d.year}
            </text>
          );
        })}
      </svg>

      {/* 범례 */}
      <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-1">
          <span
            className="inline-block w-3 h-[3px] rounded-full"
            style={{ backgroundColor: '#2563eb' }}
          />
          <span>{isKo ? '누적 투자금' : 'Total invested'}</span>
        </div>
        <div className="flex items-center gap-1">
          <span
            className="inline-block w-3 h-[3px] rounded-full"
            style={{ backgroundColor: '#10b981' }}
          />
          <span>{isKo ? '세후 자산' : 'Net assets'}</span>
        </div>
        {target > 0 && (
          <div className="flex items-center gap-1">
            <span
              className="inline-block w-3 h-[3px] rounded-full border border-amber-500 border-dashed"
              style={{ borderColor: '#f59e0b' }}
            />
            <span>{isKo ? '목표 자산' : 'Target assets'}</span>
          </div>
        )}
      </div>
    </div>
  );
}
