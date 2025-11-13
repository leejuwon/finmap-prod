import SeoHead from '../_components/SeoHead';

export default function Privacy(){
  return (
    <>
      <SeoHead title="개인정보처리방침" desc="FinMap 개인정보처리방침" url="/privacy" />
      <h1 className="text-2xl font-bold mb-4">개인정보처리방침</h1>
      <p className="mb-2">FinMap(이하 ‘회사’)은 「개인정보 보호법」 등 관련 법령을 준수하며, 서비스 제공을 위해 필요한 범위 내에서 최소한의 개인정보를 처리합니다.</p>
      <h2 className="text-xl font-semibold mt-6 mb-2">1. 처리 목적</h2>
      <ul className="list-disc ml-5">
        <li>문의 응대, 서비스 개선, 방문 통계 분석</li>
      </ul>
      <h2 className="text-xl font-semibold mt-6 mb-2">2. 수집 항목 및 보유 기간</h2>
      <ul className="list-disc ml-5">
        <li>필수: 접속 로그/쿠키/접속 IP(보안 및 통계), 보유 6개월</li>
        <li>선택: 이메일(문의 시), 목적 달성 후 즉시 파기</li>
      </ul>
      <h2 className="text-xl font-semibold mt-6 mb-2">3. 제3자 제공/처리위탁</h2>
      <p>법령에 근거가 있거나 이용자 동의가 있는 경우에 한해 제공/위탁합니다. (예: 웹 호스팅, 분석 도구)</p>
      <h2 className="text-xl font-semibold mt-6 mb-2">4. 이용자 권리</h2>
      <p>열람·정정·삭제·처리정지 등을 요청할 수 있습니다.</p>
      <h2 className="text-xl font-semibold mt-6 mb-2">5. 쿠키</h2>
      <p>맞춤형 서비스 제공을 위해 쿠키를 사용하며, 브라우저 설정으로 저장 거부가 가능합니다.</p>
      <h2 className="text-xl font-semibold mt-6 mb-2">6. 개인정보 보호책임자</h2>
      <p>이메일: contact@finmaphub.com</p>
      <p className="text-sm text-slate-500 mt-6">시행일: 2025-11-13</p>
    </>
  );
}
