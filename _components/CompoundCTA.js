// _components/CompoundCTA.js

export default function CompoundCTA({ locale = 'ko', variant = 'A' }) {
  const isKo = locale === 'ko';

  const handleClick = (ctaId, location) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'calc_cta_click', {
        cta_id: ctaId,
        location,
        variant,
        locale,
      });
    }
    // TODO: 뉴스레터 모달 열기 / 앱 딥링크 등 연결
  };

  if (variant === 'B') {
    return (
      <div className="card mt-4 bg-indigo-50 border border-indigo-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div>
            <h3 className="text-lg font-semibold">
              {isKo ? '나만의 투자 플랜, 이메일로 받아보기' : 'Get your plan by email'}
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              {isKo
                ? '계산 결과를 기반으로 한 투자 체크리스트를 보내드립니다.'
                : 'We send a simple checklist based on your simulation.'}
            </p>
          </div>
          <button
            type="button"
            className="btn-primary sm:ml-auto"
            onClick={() => handleClick('cta_newsletter_B', 'compound_bottom')}
          >
            {isKo ? '뉴스레터 신청' : 'Subscribe'}
          </button>
        </div>
      </div>
    );
  }

  // 기본: Variant A
  return (
    <div className="card mt-4 bg-emerald-50 border border-emerald-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div>
          <h3 className="text-lg font-semibold">
            {isKo ? '복리 계산 결과를 저장해두고 싶나요?' : 'Want to save this plan?'}
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            {isKo
              ? '향후 FinMap 앱에서 계산 기록 연동 기능을 제공할 예정입니다.'
              : 'We are preparing an app to sync your simulations.'}
          </p>
        </div>
        <button
          type="button"
          className="btn-primary sm:ml-auto"
          onClick={() => handleClick('cta_app_A', 'compound_bottom')}
        >
          {isKo ? '앱 출시 알림 받기' : 'Get app launch alert'}
        </button>
      </div>
    </div>
  );
}
