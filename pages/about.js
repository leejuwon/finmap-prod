import SeoHead from '../_components/SeoHead';
import { useRouter } from 'next/router';

export default function About() {
  const { locale } = useRouter();
  const isEn = locale === 'en';

  return (
    <>
      <SeoHead
        title={isEn ? 'About FinMap' : 'FinMap 소개'}
        desc={
          isEn
            ? 'Learn how FinMap organizes finance articles, investing basics, calculators, and Korean real estate dashboards.'
            : 'FinMap이 금융 글, 투자 기초, 계산기, 한국 부동산 대시보드를 어떻게 정리하는지 소개합니다.'
        }
        url="/about"
        locale={locale}
      />

      <h1>About FinMap</h1>

      {isEn ? (
        <>
          <p>
            FinMap helps you understand macroeconomics and investing basics
            in a clear, structured way, and provides practical financial tools.
          </p>
          <p>
            All content is for informational purposes only. Investment decisions
            are your own responsibility.
          </p>
        </>
      ) : (
        <>
          <p>
            FinMap은 경제·투자 기초 정보를 쉽게 정리하고,
            실용적인 금융 계산 도구를 제공합니다.
          </p>
          <p>정보 제공 목적이며 투자 판단은 본인 책임입니다.</p>
        </>
      )}
    </>
  );
}
