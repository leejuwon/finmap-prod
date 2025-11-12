import SeoHead from '../_components/SeoHead';

export default function Disclaimer() {
  return (
    <>
      <SeoHead title="Disclaimer" desc="면책 고지" url="/disclaimer" />
      <h1>Disclaimer</h1>
      <p>본 사이트의 정보는 일반적인 정보 제공 목적이며 투자 자문이 아닙니다.</p>
      <p>투자 결과의 책임은 전적으로 이용자 본인에게 있으며, 오류·지연·중단에 대해 책임지지 않습니다.</p>
      <p style={{opacity:.7, fontSize:12}}>게시일: 2025-11-12</p>
    </>
  );
}
