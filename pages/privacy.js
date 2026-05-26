import SeoHead from '../_components/SeoHead';
import { useRouter } from 'next/router';

export default function Privacy() {
  const { locale } = useRouter();
  const isEn = locale === 'en';

  return (
    <>
      <SeoHead
        title={isEn ? 'Privacy Policy' : '개인정보처리방침'}
        desc={
          isEn
            ? 'FinMap privacy policy covering access logs, cookies, analytics, inquiry data, and user rights.'
            : 'FinMap의 접속 로그, 쿠키, 방문 통계, 문의 정보 처리와 이용자 권리를 안내합니다.'
        }
        url="/privacy"
        locale={locale}
      />

      <h1 className="text-2xl font-bold mb-4">
        {isEn ? 'Privacy Policy' : '개인정보처리방침'}
      </h1>

      {isEn ? (
        <>
          <p className="mb-2">
            FinMap complies with applicable privacy laws and processes the
            minimum personal data necessary to provide the service.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2">
            1. Purpose of processing
          </h2>
          <ul className="list-disc ml-5">
            <li>Responding to inquiries, service improvement, visit analytics</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-2">
            2. Data collected & retention
          </h2>
          <ul className="list-disc ml-5">
            <li>Required: access logs, cookies, IP (6 months)</li>
            <li>Optional: email (deleted after inquiry is resolved)</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-2">
            3. Third-party sharing
          </h2>
          <p>
            Data is shared only when permitted by law or with user consent
            (e.g. hosting, analytics).
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2">
            4. Your rights
          </h2>
          <p>You may request access, correction, or deletion of your data.</p>

          <h2 className="text-xl font-semibold mt-6 mb-2">
            5. Cookies
          </h2>
          <p>
            Cookies are used for service quality and analytics.
            You can disable them in your browser settings.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2">
            6. Contact
          </h2>
          <p>Email: contact@finmaphub.com</p>

          <p className="text-sm text-slate-500 mt-6">
            Effective date: 2025-11-13
          </p>
        </>
      ) : (
        <>
          <p className="mb-2">
            FinMap(이하 ‘회사’)은 「개인정보 보호법」 등 관련 법령을
            준수하며, 서비스 제공을 위해 필요한 최소한의 개인정보만
            처리합니다.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2">
            1. 처리 목적
          </h2>
          <ul className="list-disc ml-5">
            <li>문의 응대, 서비스 개선, 방문 통계 분석</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-2">
            2. 수집 항목 및 보유 기간
          </h2>
          <ul className="list-disc ml-5">
            <li>필수: 접속 로그/쿠키/IP (6개월)</li>
            <li>선택: 이메일(문의 시, 목적 달성 후 즉시 파기)</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-2">
            3. 제3자 제공
          </h2>
          <p>
            법령에 근거가 있거나 이용자 동의가 있는 경우에만 제공합니다.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2">
            4. 이용자 권리
          </h2>
          <p>열람·정정·삭제·처리정지를 요청할 수 있습니다.</p>

          <h2 className="text-xl font-semibold mt-6 mb-2">
            5. 쿠키
          </h2>
          <p>
            맞춤형 서비스 제공을 위해 쿠키를 사용하며,
            브라우저 설정으로 거부할 수 있습니다.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2">
            6. 개인정보 보호책임자
          </h2>
          <p>이메일: contact@finmaphub.com</p>

          <p className="text-sm text-slate-500 mt-6">
            시행일: 2025-11-13
          </p>
        </>
      )}
    </>
  );
}
