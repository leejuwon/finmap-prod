// pages/tools/index.js
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import SeoHead from '../../_components/SeoHead';
import { getInitialLang } from '../../lib/lang';

export default function ToolsHome() {
  const [lang, setLang] = useState('ko');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const initial = getInitialLang();
    setLang(initial);

    const handler = (e) => setLang(e.detail || 'ko');
    window.addEventListener('fm_lang_change', handler);
    return () => window.removeEventListener('fm_lang_change', handler);
  }, []);

  const isKo = lang === 'ko';

  const TOOLS = useMemo(
    () => [
      {
        href: '/tools/compound-interest',
        title: isKo ? '복리 계산기' : 'Compound Interest',
        badge: isKo ? '투자 · 저축' : 'Invest · Saving',
        desc: isKo
          ? '초기 투자금, 월 적립금, 수익률, 기간으로 세후 총자산을 계산합니다.'
          : 'Calculate net future value with principal, monthly saving, rate and term.',
      },
      {
        href: '/tools/goal-simulator',
        title: isKo ? '목표 자산 도달 시뮬레이터' : 'Goal Asset Simulator',
        badge: isKo ? '목표 자산' : 'Goal Planning',
        desc: isKo
          ? '목표 금액까지 몇 년이 걸릴지, 매월 얼마나 모아야 할지 자산 성장 경로를 시뮬레이션합니다.'
          : 'Simulate how long and how much per month you need to reach a target amount.',
      },
      {
        href: '/tools/cagr-calculator',
        title: isKo ? '투자 수익률(CAGR) 계산기' : 'CAGR (Investment Return) Calculator', 
        badge: isKo ? '성과 분석': 'Investment Return Analisys',
        desc:  isKo 
          ? '초기·최종 자산과 기간으로 연평균 복리 수익률(CAGR)을 계산하고 세금·수수료 효과를 확인합니다.'
          :'Calculate compound annual growth rate (CAGR) from initial and final value and see the impact of tax and fees.',
      },
    ],
    [isKo]
  );

  return (
    <>
      <SeoHead
        title={isKo ? '금융 계산기 모음' : 'Finance Tools'}
        desc={
          isKo
            ? '복리 계산기, 목표 자산 시뮬레이터 등 FinMap 금융 계산기 도구 모음.'
            : 'FinMap finance tools such as compound interest and goal simulators.'
        }
        url="/tools"
      />

      <section className="mt-6 mb-10">
        <h1 className="text-2xl font-bold mb-2">
          {isKo ? '금융 계산기 · 도구' : 'Finance tools'}
        </h1>
        <p className="text-sm text-slate-600 mb-6">
          {isKo
            ? '예금·투자·목표 자산 계획을 숫자로 확인해 보세요. 계산기는 계속 추가될 예정입니다.'
            : 'Check your savings, investing and goal plans with numbers. More tools are coming.'}
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
                  {isKo ? '자세히 보기 →' : 'See details →'}
                </span>
              </a>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
