import SeoHead from '../_components/SeoHead';
import { useRouter } from 'next/router';

export default function Contact() {
  const { locale } = useRouter();
  const isEn = locale === 'en';

  return (
    <>
      <SeoHead
        title={isEn ? 'Contact FinMap' : 'FinMap 문의'}
        desc={
          isEn
            ? 'Contact FinMap for site feedback, finance calculator issues, blog corrections, and real estate dashboard questions.'
            : 'FinMap 사이트 피드백, 계산기 오류, 글 정정, 부동산 대시보드 문의 안내.'
        }
        url="/contact"
        locale={locale}
      />

      <main className="card max-w-3xl">
        <h1 className="text-2xl font-bold mb-3">
          {isEn ? 'Contact FinMap' : 'FinMap 문의'}
        </h1>

        {isEn ? (
          <>
            <p className="text-slate-700 leading-7">
              Use this contact page for feedback about FinMap articles, finance calculators,
              market pages, or the Korean apartment transaction dashboard. If you noticed an
              outdated link, a calculation issue, or a data display problem, please include the
              page URL and the value you expected to see.
            </p>
            <h2 className="mt-6 text-lg font-semibold">Email</h2>
            <p className="mt-2 text-slate-700">contact@finmaphub.com</p>
            <h2 className="mt-6 text-lg font-semibold">Helpful details</h2>
            <ul className="mt-2 list-disc pl-5 text-slate-700 leading-7">
              <li>Page URL or tool name</li>
              <li>Browser/device if the issue is visual</li>
              <li>Input values if the issue is about a calculator result</li>
            </ul>
          </>
        ) : (
          <>
            <p className="text-slate-700 leading-7">
              FinMap 글, 금융 계산기, 시장 정보 페이지, 아파트 실거래 대시보드에 대한
              피드백을 받을 수 있는 문의 페이지입니다. 오래된 링크, 계산 결과 오류,
              데이터 표시 문제를 발견했다면 페이지 URL과 함께 알려주세요.
            </p>
            <h2 className="mt-6 text-lg font-semibold">이메일</h2>
            <p className="mt-2 text-slate-700">contact@finmaphub.com</p>
            <h2 className="mt-6 text-lg font-semibold">함께 보내주면 좋은 정보</h2>
            <ul className="mt-2 list-disc pl-5 text-slate-700 leading-7">
              <li>문제가 있는 페이지 URL 또는 도구 이름</li>
              <li>화면 표시 문제라면 브라우저/기기 정보</li>
              <li>계산기 문제라면 입력값과 예상 결과</li>
            </ul>
          </>
        )}
      </main>
    </>
  );
}
