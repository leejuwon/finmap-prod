// _components/AdSenseUnit.js
import { useEffect } from 'react';

const ADS_CLIENT = 'ca-pub-1869932115288976';

export default function AdSenseUnit({ slot, className = '', adTest = false }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (_) {}
  }, []);

  if (!slot) return null;

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={ADS_CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
        {...(adTest ? { 'data-adtest': 'on' } : {})}
      />
    </div>
  );
}
