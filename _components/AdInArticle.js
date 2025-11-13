import { useEffect, useRef } from 'react';

export default function AdInArticle({ client="ca-pub-1869932115288976", slot }) {
  const ref = useRef(null);
  useEffect(() => {
    try {
      if (window.adsbygoogle && ref.current) {
        (adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch(e){}
  }, []);
  return (
    <ins
      ref={ref}
      className="adsbygoogle"
      style={{ display: 'block', textAlign:'center', minHeight:'120px' }}
      data-ad-client={client}
      data-ad-slot={slot}        // ★ 애드센스에서 발급되는 슬롯 ID
      data-ad-format="fluid"
      data-ad-layout="in-article"
      data-full-width-responsive="true"
    />
  );
}