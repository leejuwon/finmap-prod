// _components/AdResponsive.js
import { useEffect, useRef } from 'react';

export default function AdResponsive({ client="ca-pub-1869932115288976", slot, align='center' }) {
  const ref = useRef(null);
  useEffect(() => {
    try {
      if (window.adsbygoogle && ref.current) {
        (adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch(e){}
  }, []);
  return (
    <div style={{ textAlign: align }}>
      <ins
        ref={ref}
        className="adsbygoogle"
        style={{ display:'block' }}
        data-ad-client={client}
        data-ad-slot={slot}        // ★ 슬롯 ID 필요
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
