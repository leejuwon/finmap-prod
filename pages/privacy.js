import SeoHead from '../_components/SeoHead';

export default function Privacy() {
  return (
    <>
      <SeoHead title="Privacy Policy" desc="개인정보 처리방침" url="/privacy" />
      <h1>Privacy Policy</h1>
      <p>본 사이트는 서비스 운영을 위해 필요한 범위 내에서만 개인정보를 최소 수집·이용합니다.</p>
      <p>수집 항목, 보유 기간, 제3자 제공, 이용자 권리 행사 방법 등을 여기에 명시하세요.</p>
      <p style={{opacity:.7, fontSize:12}}>시행일: 2025-11-12</p>
    </>
  );
}
