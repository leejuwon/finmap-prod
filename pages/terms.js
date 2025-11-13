import SeoHead from '../_components/SeoHead';

export default function Terms(){
  return (
    <>
      <SeoHead title="서비스 이용약관" desc="FinMap 서비스 이용약관" url="/terms" />
      <h1 className="text-2xl font-bold mb-4">서비스 이용약관</h1>
      <h2 className="text-xl font-semibold mt-6 mb-2">1. 목적</h2>
      <p>본 약관은 FinMap(이하 ‘회사’)이 제공하는 서비스의 이용 조건 및 절차를 규정합니다.</p>
      <h2 className="text-xl font-semibold mt-6 mb-2">2. 이용계약 성립</h2>
      <p>이용자는 본 약관에 동의함으로써 서비스 이용계약이 성립합니다.</p>
      <h2 className="text-xl font-semibold mt-6 mb-2">3. 서비스 내용</h2>
      <p>금융 정보·콘텐츠·계산기 제공. 회사는 품질 향상을 위해 일부 기능을 변경할 수 있습니다.</p>
      <h2 className="text-xl font-semibold mt-6 mb-2">4. 책임의 제한</h2>
      <p>본 서비스의 정보는 참고용이며, 투자 손실에 대한 책임은 이용자에게 있습니다.</p>
      <h2 className="text-xl font-semibold mt-6 mb-2">5. 게시물</h2>
      <p>이용자가 게시한 콘텐츠의 책임과 권리는 이용자에게 있습니다.</p>
      <h2 className="text-xl font-semibold mt-6 mb-2">6. 준거법</h2>
      <p>대한민국 법령을 준거로 합니다.</p>
      <p className="text-sm text-slate-500 mt-6">시행일: 2025-11-13</p>
    </>
  );
}
