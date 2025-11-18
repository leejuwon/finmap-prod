// pages/tools/index.js
import Link from 'next/link';
import SeoHead from '../../_components/SeoHead';

const TOOLS = [
  {
    href: '/tools/compound-interest',
    title: '복리 계산기',
    badge: '투자 · 저축',
    desc: '초기 투자금, 월 적립금, 수익률, 기간으로 세후 총자산을 계산합니다.',
  },
  {
    href: '/tools/goal-simulator',
    title: '목표 자산 도달 시뮬레이터',
    badge: '목표 자산',
    desc: '목표 금액까지 몇 년이 걸릴지, 매월 얼마나 모아야 할지 자산 성장 경로를 시뮬레이션합니다.',
  },
  // 앞으로 여기 계속 추가하면 됨
];

export default function ToolsHome() {
  return (
    <>
      <SeoHead
        title="금융 계산기 모음"
        desc="복리 계산기, 목표 자산 시뮬레이터 등 FinMap 금융 계산기 도구 모음."
        url="/tools"
      />

      <section className="mt-6 mb-10">
        <h1 className="text-2xl font-bold mb-2">금융 계산기 · 도구</h1>
        <p className="text-sm text-slate-600 mb-6">
          예금·투자·목표 자산 계획을 숫자로 확인해 보세요. 계산기는 계속 추가될 예정입니다.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {TOOLS.map((tool) => (
            <Link key={tool.href} href={tool.href}>
              <a className="card hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <span className="badge mb-2 inline-block">{tool.badge}</span>
                  <h2 className="text-lg font-semibold mb-1">{tool.title}</h2>
                  <p className="text-sm text-slate-600">{tool.desc}</p>
                </div>
                <span className="mt-4 text-xs text-blue-600 font-medium">
                  자세히 보기 →
                </span>
              </a>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}