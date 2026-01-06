import SeoHead from '../_components/SeoHead';
import { useRouter } from 'next/router';

export default function Disclaimer() {
  const { locale } = useRouter();
  const isEn = locale === 'en';

  return (
    <>
      <SeoHead
        title="Disclaimer"
        desc={isEn ? 'Legal disclaimer' : '면책 고지'}
        url="/disclaimer"
        locale={locale}
      />

      <h1>Disclaimer</h1>

      {isEn ? (
        <>
          <p>
            The information provided on this website is for general informational
            purposes only and does not constitute investment advice.
          </p>
          <p>
            You are solely responsible for your investment decisions. FinMap
            is not liable for any losses, errors, delays, or interruptions.
          </p>
          <p style={{ opacity: 0.7, fontSize: 12 }}>
            Published: 2025-11-12
          </p>
        </>
      ) : (
        <>
          <p>
            본 사이트의 정보는 일반적인 정보 제공 목적이며
            투자 자문이 아닙니다.
          </p>
          <p>
            투자 결과의 책임은 전적으로 이용자 본인에게 있으며,
            오류·지연·중단에 대해 책임지지 않습니다.
          </p>
          <p style={{ opacity: 0.7, fontSize: 12 }}>
            게시일: 2025-11-12
          </p>
        </>
      )}
    </>
  );
}
