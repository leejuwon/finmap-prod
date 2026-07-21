import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowDownTrayIcon,
  CalculatorIcon,
  ClipboardDocumentIcon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";
import { trackGaEvent } from "../utils/analytics";

const TOOL_CONFIGS = {
  compound: {
    label: { ko: "복리 계산기", en: "Compound calculator" },
    checklistHref: "/posts/personalFinance/simple-vs-compound",
    checklistLabel: {
      ko: "단리와 복리 차이 체크",
      en: "Simple vs compound checklist",
    },
    relatedTool: "goal",
  },
  goal: {
    label: { ko: "목표자산 계산기", en: "Goal calculator" },
    checklistHref: "/posts/personalFinance/monthly-dca-10-year-result",
    checklistLabel: {
      ko: "월 적립식 10년 결과 보기",
      en: "Monthly DCA 10-year guide",
    },
    relatedTool: "dca",
  },
  fire: {
    label: { ko: "FIRE 계산기", en: "FIRE calculator" },
    checklistHref: "/posts/personalFinance/fire-3-numbers-spending-horizon-withdrawal",
    checklistLabel: {
      ko: "FIRE 3가지 숫자 체크",
      en: "FIRE three-number checklist",
    },
    relatedTool: "goal",
  },
  cagr: {
    label: { ko: "CAGR 계산기", en: "CAGR calculator" },
    checklistHref: "/posts/investingInfo/cagr-7percent-reality-check",
    checklistLabel: {
      ko: "CAGR 7% 현실성 점검",
      en: "CAGR 7% reality check",
    },
    relatedTool: "compound",
  },
  dca: {
    label: { ko: "DCA 계산기", en: "DCA calculator" },
    checklistHref: "/posts/personalFinance/dca-vs-lumpsum-decision-rules",
    checklistLabel: {
      ko: "적립식 vs 일시투자 판단표",
      en: "DCA vs lump sum decision rules",
    },
    relatedTool: "goal",
  },
  mortgageLoan: {
    label: { ko: "주담대 원리금 계산기", en: "Mortgage payment calculator" },
    checklistHref: "/posts/personalFinance/mortgage-risk-checklist-dsr-variable",
    checklistLabel: {
      ko: "주담대 리스크 체크리스트",
      en: "Mortgage risk checklist",
    },
    relatedTool: "dsrLtv",
  },
  dsrLtv: {
    label: { ko: "DSR/LTV 계산기", en: "DSR/LTV calculator" },
    checklistHref: "/posts/personalFinance/mortgage-risk-checklist-dsr-variable",
    checklistLabel: {
      ko: "주택대출 리스크 체크리스트",
      en: "Mortgage risk checklist",
    },
    relatedTool: "homeBuying",
  },
  homeBuying: {
    label: { ko: "아파트 구매 계산기", en: "Home buying budget calculator" },
    checklistHref: "/posts/personalFinance/apartment-buying-calculator-guide",
    checklistLabel: {
      ko: "아파트 구매 계산 순서",
      en: "Home buying budget guide",
    },
    relatedTool: "dsrLtv",
  },
};

const TOOL_PATHS = {
  compound: "/tools/compound-interest",
  goal: "/tools/goal-simulator",
  fire: "/tools/fire-calculator",
  cagr: "/tools/cagr-calculator",
  dca: "/tools/dca-calculator",
  mortgageLoan: "/tools/mortgage-loan-calculator",
  dsrLtv: "/tools/dsr-ltv-calculator",
  homeBuying: "/tools/home-buying-budget-calculator",
};

const LEAD_MAGNETS = {
  homeBudget: {
    filename: "finmap-home-buying-budget-checklist.pdf",
    label: {
      ko: "주택구매 예산 체크리스트",
      en: "Home purchase budget checklist",
    },
    title: {
      ko: "주택구매 예산 체크리스트",
      en: "Home Purchase Budget Checklist",
    },
    description: {
      ko: "집값, DSR, LTV, 보유현금, 부대비용을 한 번에 점검하는 사전 확인표입니다.",
      en: "A quick worksheet for checking price, DSR, LTV, cash on hand, and closing costs before buying a home.",
    },
    sections: {
      ko: [
        "후보 집값과 지역을 적는다.",
        "DSR/LTV 계산기로 대출 가능액과 월 상환액을 확인한다.",
        "취득세, 중개보수, 등기비, 이사비를 별도로 더한다.",
        "잔금 후 최소 비상금이 남는지 확인한다.",
      ],
      en: [
        "Write down the target home price and area.",
        "Check borrowing capacity and monthly payment with the DSR/LTV calculator.",
        "Add acquisition tax, brokerage, legal, moving, and setup costs separately.",
        "Confirm that emergency cash remains after closing.",
      ],
    },
    rows: {
      ko: [
        ["집값", "후보 매매가"],
        ["대출", "DSR/LTV 계산 결과"],
        ["현금", "자기자본 + 부대비용 + 비상금"],
      ],
      en: [
        ["Home price", "Target purchase price"],
        ["Loan", "DSR/LTV calculator result"],
        ["Cash", "Equity + closing costs + emergency cash"],
      ],
    },
  },
  salaryBudget: {
    filename: "finmap-salary-budget-sheet.pdf",
    label: {
      ko: "월급관리 예산표",
      en: "Salary budget sheet",
    },
    title: {
      ko: "월급관리 예산표",
      en: "Salary Budget Sheet",
    },
    description: {
      ko: "월급을 고정비, 변동비, 저축, 투자, 목표자금으로 나눠 보는 간단한 예산표입니다.",
      en: "A simple budget sheet for splitting salary into fixed costs, variable costs, savings, investing, and goal funding.",
    },
    sections: {
      ko: [
        "세후 월급을 기준으로 시작한다.",
        "고정비와 변동비를 먼저 분리한다.",
        "비상금, 목표자금, 투자 금액을 같은 표에서 비교한다.",
        "월말 잔액이 반복적으로 마이너스면 목표 납입액을 낮춘다.",
      ],
      en: [
        "Start with take-home pay.",
        "Separate fixed costs and variable costs first.",
        "Compare emergency fund, goal savings, and investing in one table.",
        "Reduce the monthly target if the balance is repeatedly negative.",
      ],
    },
    rows: {
      ko: [
        ["고정비", "주거비, 통신비, 보험료"],
        ["변동비", "식비, 교통, 쇼핑"],
        ["목표", "비상금, 투자, 주택자금"],
      ],
      en: [
        ["Fixed costs", "Housing, phone, insurance"],
        ["Variable costs", "Food, transport, shopping"],
        ["Goals", "Emergency fund, investing, home fund"],
      ],
    },
  },
  dcaPlan: {
    filename: "finmap-dca-investment-plan.pdf",
    label: {
      ko: "적립식 투자 계획표",
      en: "DCA investment plan",
    },
    title: {
      ko: "적립식 투자 계획표",
      en: "DCA Investment Plan",
    },
    description: {
      ko: "월 납입액, 기간, 기대수익률, 환율·수수료 가정을 따로 적어 보는 적립식 투자 점검표입니다.",
      en: "A planning sheet for monthly contribution, timeline, expected return, currency, and fee assumptions.",
    },
    sections: {
      ko: [
        "월 납입액을 생활비와 분리해서 정한다.",
        "목표 기간과 기대수익률을 보수적으로 입력한다.",
        "해외 자산은 환율과 수수료 가정을 따로 적는다.",
        "하락장에서 납입을 유지할 수 있는 금액인지 확인한다.",
      ],
      en: [
        "Choose a monthly contribution that does not strain daily cash flow.",
        "Use conservative timeline and return assumptions.",
        "Track FX and fees separately for overseas assets.",
        "Confirm the contribution is sustainable during drawdowns.",
      ],
    },
    rows: {
      ko: [
        ["월 납입액", "생활비 후 남는 지속 가능 금액"],
        ["기간", "3년, 5년, 10년 등"],
        ["가정", "수익률, 환율, 수수료"],
      ],
      en: [
        ["Monthly contribution", "Sustainable amount after living costs"],
        ["Timeline", "3, 5, 10 years, etc."],
        ["Assumptions", "Return, FX, fees"],
      ],
    },
  },
  retirementChecklist: {
    filename: "finmap-retirement-fund-checklist.pdf",
    label: {
      ko: "은퇴자금 체크리스트",
      en: "Retirement fund checklist",
    },
    title: {
      ko: "은퇴자금 체크리스트",
      en: "Retirement Fund Checklist",
    },
    description: {
      ko: "은퇴 목표자산, 생활비, 인출률, 추가 소득, 안전마진을 함께 적어 보는 점검표입니다.",
      en: "A checklist for target assets, spending, withdrawal rate, extra income, and safety margin.",
    },
    sections: {
      ko: [
        "월 생활비와 연 생활비를 따로 계산한다.",
        "목표 인출률을 정하고 필요한 자산을 역산한다.",
        "연금, 임대소득, 부업소득 같은 보조 현금흐름을 분리한다.",
        "시장 하락과 물가 상승을 반영한 안전마진을 둔다.",
      ],
      en: [
        "Calculate monthly and annual spending separately.",
        "Pick a withdrawal-rate assumption and reverse-calculate target assets.",
        "Separate pension, rental, or side-income cash flows.",
        "Add a margin for market drawdowns and inflation.",
      ],
    },
    rows: {
      ko: [
        ["생활비", "월 생활비 x 12"],
        ["목표자산", "연 생활비 / 인출률"],
        ["안전마진", "하락장, 물가, 의료비"],
      ],
      en: [
        ["Spending", "Monthly spending x 12"],
        ["Target assets", "Annual spending / withdrawal rate"],
        ["Safety margin", "Drawdowns, inflation, medical costs"],
      ],
    },
  },
};

const LEAD_MAGNET_ORDER = [
  "homeBudget",
  "salaryBudget",
  "dcaPlan",
  "retirementChecklist",
];

const DEFAULT_LEAD_BY_TOOL = {
  compound: "dcaPlan",
  goal: "salaryBudget",
  fire: "retirementChecklist",
  cagr: "dcaPlan",
  dca: "dcaPlan",
  mortgageLoan: "homeBudget",
  dsrLtv: "homeBudget",
  homeBuying: "homeBudget",
};

function normalizeToolId(toolId) {
  const raw = String(toolId || "").trim();
  if (raw === "dsr-ltv" || raw === "dsr_ltv") return "dsrLtv";
  if (
    raw === "home-buying" ||
    raw === "home_buying" ||
    raw === "home-buying-budget" ||
    raw === "home-buying-budget-calculator"
  ) return "homeBuying";
  if (
    raw === "mortgage-loan" ||
    raw === "mortgage_loan" ||
    raw === "mortgage-loan-calculator" ||
    raw === "mortgage-payment-calculator"
  ) return "mortgageLoan";
  if (raw === "goal-calculator") return "goal";
  if (raw === "compound-interest") return "compound";
  return raw;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function waitForNextPaint() {
  if (typeof window === "undefined" || typeof window.requestAnimationFrame !== "function") {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(resolve);
    });
  });
}

async function copyCurrentUrl() {
  if (typeof window === "undefined") return false;
  const value = window.location.href;

  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // Fall back to a temporary textarea below.
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

function LeadMagnetPdfTemplate({ id, magnet, locale, sourceLabel }) {
  const copy = locale === "ko" ? "ko" : "en";
  const rows = magnet.rows[copy];
  const items = magnet.sections[copy];

  return (
    <div
      id={id}
      aria-hidden="true"
      data-finmap-pdf-export="lead-magnet"
      style={{
        position: "fixed",
        left: 0,
        top: "calc(100vh + 24px)",
        width: "794px",
        minHeight: "1123px",
        background: "#ffffff",
        color: "#0f172a",
        padding: "44px",
        fontFamily:
          "Pretendard, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
        lineHeight: 1.55,
        pointerEvents: "none",
      }}
    >
      <p style={{ margin: "0 0 10px", fontSize: "13px", color: "#2563eb", fontWeight: 700 }}>
        FinMap Free Download
      </p>
      <h1 style={{ margin: "0 0 12px", fontSize: "30px", lineHeight: 1.25 }}>
        {magnet.title[copy]}
      </h1>
      <p style={{ margin: "0 0 22px", fontSize: "15px", color: "#475569" }}>
        {magnet.description[copy]}
      </p>

      <div style={{ borderTop: "2px solid #dbeafe", paddingTop: "20px" }}>
        <h2 style={{ margin: "0 0 10px", fontSize: "18px" }}>
          {copy === "ko" ? "작성 순서" : "How to use"}
        </h2>
        <ol style={{ margin: "0 0 24px", paddingLeft: "22px", fontSize: "14px" }}>
          {items.map((item) => (
            <li key={item} style={{ marginBottom: "8px" }}>
              {item}
            </li>
          ))}
        </ol>

        <h2 style={{ margin: "0 0 10px", fontSize: "18px" }}>
          {copy === "ko" ? "점검표" : "Worksheet"}
        </h2>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "14px",
            marginBottom: "22px",
          }}
        >
          <tbody>
            {rows.map(([label, desc]) => (
              <tr key={label}>
                <th
                  style={{
                    width: "34%",
                    textAlign: "left",
                    border: "1px solid #cbd5e1",
                    background: "#f8fafc",
                    padding: "12px",
                  }}
                >
                  {label}
                </th>
                <td style={{ border: "1px solid #cbd5e1", padding: "12px" }}>
                  {desc}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p style={{ margin: "0", fontSize: "12px", color: "#64748b" }}>
          {copy === "ko"
            ? `${sourceLabel} 결과 화면에서 생성한 교육용 점검표입니다. 실제 대출, 투자, 은퇴 판단은 개인 조건과 최신 제도, 금융기관 심사에 따라 달라질 수 있습니다.`
            : `Generated from the ${sourceLabel} result page for educational planning. Actual borrowing, investing, or retirement decisions may differ by personal situation, current rules, and financial-institution review.`}
        </p>
      </div>
    </div>
  );
}

export default function ToolResultCta({
  locale = "ko",
  sourceTool = "compound",
  location = "result_after",
  onDownloadPDF,
  pdfTargetId = "pdf-target",
  downloadFilename,
  enableLeadCapture = false,
}) {
  const normalizedTool = normalizeToolId(sourceTool);
  const config = TOOL_CONFIGS[normalizedTool] || TOOL_CONFIGS.compound;
  const relatedTool = config.relatedTool;
  const relatedConfig = TOOL_CONFIGS[relatedTool] || TOOL_CONFIGS.compound;
  const isKo = locale === "ko";
  const viewedRef = useRef(false);
  const resultDownloadLockRef = useRef(false);
  const leadDownloadLockRef = useRef(false);
  const [feedback, setFeedback] = useState("");
  const [resultPdfDownloading, setResultPdfDownloading] = useState(false);
  const defaultLeadId = DEFAULT_LEAD_BY_TOOL[normalizedTool] || "homeBudget";
  const [leadOpen, setLeadOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState(defaultLeadId);
  const [leadEmail, setLeadEmail] = useState("");
  const [leadConsent, setLeadConsent] = useState(false);
  const [leadFeedback, setLeadFeedback] = useState("");
  const [leadDownloading, setLeadDownloading] = useState(false);
  const [leadPdfRenderId, setLeadPdfRenderId] = useState(null);
  const selectedLead = LEAD_MAGNETS[selectedLeadId] || LEAD_MAGNETS[defaultLeadId];
  const getLeadPdfId = (leadId) => `lead-magnet-pdf-${normalizedTool}-${leadId}`;
  const pdfAvailable = Boolean(onDownloadPDF || pdfTargetId);

  useEffect(() => {
    if (viewedRef.current) return;
    viewedRef.current = true;
    trackGaEvent("tool_result_cta_view", {
      source_tool: normalizedTool,
      locale,
      location,
      checklist_url: config.checklistHref,
      related_tool: relatedTool,
    });
  }, [config.checklistHref, locale, location, normalizedTool, relatedTool]);

  const trackClick = (action, extra = {}) => {
    trackGaEvent("tool_result_cta_click", {
      source_tool: normalizedTool,
      action,
      locale,
      location,
      ...extra,
    });
  };

  const handleDownload = async () => {
    if (resultDownloadLockRef.current || resultPdfDownloading) return;
    resultDownloadLockRef.current = true;
    setResultPdfDownloading(true);
    trackClick("save_pdf");

    try {
      if (onDownloadPDF) {
        const completed = await onDownloadPDF();
        if (completed === false) return;
      } else {
        if (!pdfTargetId || typeof document === "undefined") return;
        if (!document.getElementById(pdfTargetId)) {
          setFeedback(isKo ? "저장할 결과 영역을 찾지 못했습니다." : "Result area was not found.");
          trackGaEvent("result_pdf_download_error", {
            source_tool: normalizedTool,
            locale,
            location,
            error_reason: "missing_target",
          });
          return;
        }

        const { downloadPDF } = await import("./PDFGenerator");
        await downloadPDF(pdfTargetId, downloadFilename || `${normalizedTool}-result.pdf`);
      }

      trackGaEvent("result_pdf_download_success", {
        source_tool: normalizedTool,
        locale,
        location,
      });
    } catch {
      setFeedback(
        isKo
          ? "PDF 저장 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요."
          : "Could not save the PDF. Please try again."
      );
      trackGaEvent("result_pdf_download_error", {
        source_tool: normalizedTool,
        locale,
        location,
        error_reason: "download_failed",
      });
    } finally {
      setResultPdfDownloading(false);
      resultDownloadLockRef.current = false;
    }
  };

  const handleCopy = async () => {
    trackClick("copy_result_url");
    const ok = await copyCurrentUrl();
    setFeedback(
      ok
        ? isKo
          ? "계산 결과 URL을 복사했습니다."
          : "Result URL copied."
        : isKo
          ? "URL 복사에 실패했습니다."
          : "Could not copy the URL."
    );
  };

  const handleChecklist = () => {
    trackClick("open_checklist", { target_url: config.checklistHref });
    trackGaEvent("checklist_cta_click", {
      source_tool: normalizedTool,
      locale,
      location,
      target_url: config.checklistHref,
    });
  };

  const handleRelatedTool = () => {
    trackClick("open_related_tool", {
      target_tool: relatedTool,
      target_url: TOOL_PATHS[relatedTool],
    });
  };

  const handleLeadOpen = () => {
    if (leadDownloading || leadDownloadLockRef.current) return;
    setLeadOpen(true);
    setLeadFeedback("");
    trackClick("open_lead_magnet", { lead_magnet_id: selectedLeadId });
    trackGaEvent("lead_magnet_cta_click", {
      source_tool: normalizedTool,
      locale,
      location,
      lead_magnet_id: selectedLeadId,
    });
  };

  const handleLeadSelect = (leadId) => {
    if (leadDownloading || leadDownloadLockRef.current) return;
    setSelectedLeadId(leadId);
    setLeadFeedback("");
    trackGaEvent("lead_magnet_select", {
      source_tool: normalizedTool,
      locale,
      location,
      lead_magnet_id: leadId,
    });

    if (!enableLeadCapture) {
      void downloadLeadMagnet(leadId, { emailProvided: false });
    }
  };

  const downloadLeadMagnet = async (leadId, { emailProvided }) => {
    if (leadDownloadLockRef.current) return;
    leadDownloadLockRef.current = true;
    const magnet = LEAD_MAGNETS[leadId] || selectedLead;
    const storageMode = enableLeadCapture ? "mock_lead_capture" : "mock_no_email";
    setLeadDownloading(true);
    setLeadFeedback("");
    trackClick("download_lead_magnet", { lead_magnet_id: leadId });
    trackGaEvent("lead_magnet_download_click", {
      source_tool: normalizedTool,
      locale,
      location,
      lead_magnet_id: leadId,
      email_provided: emailProvided,
      storage_mode: storageMode,
    });

    if (typeof window !== "undefined") {
      const payload = {
        sourceTool: normalizedTool,
        locale,
        location,
        leadMagnetId: leadId,
        emailProvided,
        storageMode,
        submittedAt: new Date().toISOString(),
      };
      try {
        window.localStorage?.setItem("finmapLeadMagnetMvpLast", JSON.stringify(payload));
      } catch {
        // Local storage is optional for this mock flow.
      }
      window.dispatchEvent(new CustomEvent("finmap_lead_magnet_download", { detail: payload }));
    }

    try {
      const leadPdfId = getLeadPdfId(leadId);
      setLeadPdfRenderId(leadId);
      await waitForNextPaint();
      if (typeof document === "undefined" || !document.getElementById(leadPdfId)) {
        throw new Error("missing_lead_pdf_template");
      }
      const { downloadPDF } = await import("./PDFGenerator");
      await downloadPDF(leadPdfId, magnet.filename);
      trackGaEvent("lead_magnet_download_success", {
        source_tool: normalizedTool,
        locale,
        location,
        lead_magnet_id: leadId,
        email_provided: emailProvided,
        storage_mode: storageMode,
      });
      setLeadFeedback(
        isKo
          ? enableLeadCapture
            ? "자료 다운로드를 시작했습니다. MVP에서는 이메일을 서버에 저장하지 않습니다."
            : "자료 다운로드를 시작했습니다."
          : enableLeadCapture
            ? "Download started. This MVP does not store the email on a server."
            : "Download started."
      );
    } catch {
      trackGaEvent("lead_magnet_download_error", {
        source_tool: normalizedTool,
        locale,
        location,
        lead_magnet_id: leadId,
        email_provided: emailProvided,
        storage_mode: storageMode,
        error_reason: "download_failed",
      });
      setLeadFeedback(
        isKo
          ? "다운로드 생성 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요."
          : "Could not generate the download. Please try again."
      );
    } finally {
      setLeadPdfRenderId(null);
      setLeadDownloading(false);
      leadDownloadLockRef.current = false;
    }
  };

  const handleLeadDownload = async (event) => {
    event.preventDefault();
    if (leadDownloading || leadDownloadLockRef.current) return;

    if (enableLeadCapture && !isValidEmail(leadEmail)) {
      setLeadFeedback(isKo ? "이메일 형식을 확인해 주세요." : "Please enter a valid email address.");
      return;
    }

    if (enableLeadCapture && !leadConsent) {
      setLeadFeedback(
        isKo
          ? "개인정보 수집 문구 확인 체크가 필요합니다."
          : "Please confirm the privacy notice placeholder."
      );
      return;
    }

    await downloadLeadMagnet(selectedLeadId, { emailProvided: enableLeadCapture });
  };

  return (
    <section className="rounded-xl border border-blue-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex min-w-0 flex-col gap-1">
        <p className="break-words text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
          {isKo ? "결과 다음 단계" : "Next steps"}
        </p>
        <h2 className="break-words text-base font-semibold leading-snug text-slate-950 sm:text-lg">
          {isKo
            ? `${config.label.ko} 결과를 저장하고 다음 계산으로 이어가세요`
            : `Save this ${config.label.en} result and continue planning`}
        </h2>
        <p className="break-words text-sm leading-6 text-slate-600">
          {isKo
            ? "PDF로 보관하거나 결과 URL을 복사한 뒤, 관련 글과 다음 계산기로 가정을 다시 점검할 수 있습니다."
            : "Save a PDF, copy the result URL, then use a related guide and calculator to review the assumptions."}
        </p>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-2 min-[420px]:grid-cols-2 lg:grid-cols-4">
        {pdfAvailable && (
          <button
            type="button"
            className={`btn-primary inline-flex min-h-[44px] w-full items-center justify-center gap-2 ${
              resultPdfDownloading ? "cursor-not-allowed opacity-70" : ""
            }`}
            disabled={resultPdfDownloading}
            aria-disabled={resultPdfDownloading}
            onClick={handleDownload}
          >
            <ArrowDownTrayIcon className="h-5 w-5 flex-shrink-0" />
            <span>
              {resultPdfDownloading
                ? isKo
                  ? "PDF 저장 중"
                  : "Saving PDF"
                : isKo
                  ? "PDF 저장"
                  : "Save PDF"}
            </span>
          </button>
        )}

        <button
          type="button"
          className="btn-secondary inline-flex min-h-[44px] w-full items-center justify-center gap-2"
          onClick={handleCopy}
        >
          <ClipboardDocumentIcon className="h-5 w-5 flex-shrink-0" />
          <span>{isKo ? "결과 URL 복사" : "Copy result URL"}</span>
        </button>

        <Link
          href={config.checklistHref}
          locale={locale}
          className="btn-outline inline-flex min-h-[44px] w-full items-center justify-center gap-2 text-center"
          onClick={handleChecklist}
        >
          <ListBulletIcon className="h-5 w-5 flex-shrink-0" />
          <span>{isKo ? "체크리스트 보기" : "View checklist"}</span>
        </Link>

        <Link
          href={TOOL_PATHS[relatedTool]}
          locale={locale}
          className="btn-outline inline-flex min-h-[44px] w-full items-center justify-center gap-2 text-center"
          onClick={handleRelatedTool}
        >
          <CalculatorIcon className="h-5 w-5 flex-shrink-0" />
          <span>{isKo ? relatedConfig.label.ko : relatedConfig.label.en}</span>
        </Link>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-4">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="break-words text-sm font-semibold text-slate-900">
              {isKo ? "무료 체크리스트/PDF 받기" : "Get a free checklist/PDF"}
            </p>
            <p className="mt-1 break-words text-xs leading-5 text-slate-500">
              {isKo
                ? enableLeadCapture
                  ? "이메일 입력 후 주택구매, 월급관리, 적립식 투자, 은퇴자금 자료 중 하나를 바로 다운로드합니다."
                  : "이메일 입력 없이 주택구매, 월급관리, 적립식 투자, 은퇴자금 자료 중 하나를 바로 다운로드합니다."
                : enableLeadCapture
                  ? "Enter an email and download a home, salary, DCA, or retirement planning file."
                  : "Download a home, salary, DCA, or retirement planning file without entering an email."}
            </p>
          </div>
          <button
            type="button"
            className={`btn-primary inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 ${
              leadDownloading ? "cursor-not-allowed opacity-70" : ""
            }`}
            disabled={leadDownloading}
            aria-disabled={leadDownloading}
            onClick={handleLeadOpen}
          >
            <ArrowDownTrayIcon className="h-5 w-5 flex-shrink-0" />
            <span>
              {leadDownloading
                ? isKo
                  ? "다운로드 준비 중"
                  : "Preparing download"
                : isKo
                  ? "무료 자료 받기"
                  : "Get free file"}
            </span>
          </button>
        </div>

        {leadOpen && (
          <form className="mt-4 grid gap-3" onSubmit={handleLeadDownload} aria-busy={leadDownloading}>
            {!enableLeadCapture && (
              <p className="break-words text-xs font-medium text-slate-600">
                {isKo
                  ? "자료를 선택하면 바로 PDF 다운로드가 시작됩니다."
                  : "Select a file to start the PDF download immediately."}
              </p>
            )}

            <div className="grid gap-2 sm:grid-cols-2">
              {LEAD_MAGNET_ORDER.map((leadId) => {
                const item = LEAD_MAGNETS[leadId];
                const active = selectedLeadId === leadId;
                return (
                  <button
                    key={leadId}
                    type="button"
                    disabled={leadDownloading}
                    aria-disabled={leadDownloading}
                    className={`min-h-[72px] rounded-lg border p-3 text-left transition ${
                      active
                        ? "border-blue-500 bg-blue-50 text-blue-950"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    } ${leadDownloading ? "cursor-not-allowed opacity-60" : ""}`}
                    onClick={() => handleLeadSelect(leadId)}
                  >
                    <span className="block break-words text-sm font-semibold">
                      {item.label[isKo ? "ko" : "en"]}
                    </span>
                    <span className="mt-1 block break-words text-xs leading-5 text-slate-500">
                      {item.description[isKo ? "ko" : "en"]}
                    </span>
                  </button>
                );
              })}
            </div>

            {enableLeadCapture && (
              <>
                <label className="grid gap-1 text-sm font-medium text-slate-800">
                  <span>{isKo ? "이메일" : "Email"}</span>
                  <input
                    type="email"
                    value={leadEmail}
                    onChange={(event) => setLeadEmail(event.target.value)}
                    placeholder="name@example.com"
                    className="min-h-[44px] rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                <label className="flex items-start gap-2 text-xs leading-5 text-slate-600">
                  <input
                    type="checkbox"
                    checked={leadConsent}
                    onChange={(event) => setLeadConsent(event.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300"
                  />
                  <span>
                    {isKo
                      ? "개인정보 수집·이용 문구 placeholder: 이메일은 무료 자료 제공과 전환 측정 목적으로 입력받습니다. 실제 리드 수집을 켜기 전에는 서버 저장이나 실제 이메일 발송 없이 GA4 이벤트와 브라우저 로컬 이벤트만 발생합니다."
                      : "Privacy notice placeholder: email is collected for free-file delivery and conversion measurement. Before real lead capture is enabled, no server storage or email sending runs; only GA4 and browser-local events are triggered."}
                  </span>
                </label>

                <button
                  type="submit"
                  className={`btn-primary inline-flex min-h-[44px] w-full items-center justify-center gap-2 sm:w-auto sm:justify-self-start ${
                    leadDownloading ? "cursor-not-allowed opacity-70" : ""
                  }`}
                  disabled={leadDownloading}
                  aria-disabled={leadDownloading}
                >
                  <ArrowDownTrayIcon className="h-5 w-5 flex-shrink-0" />
                  <span>
                    {leadDownloading
                      ? isKo
                        ? "다운로드 준비 중"
                        : "Preparing download"
                      : isKo
                        ? "이메일 입력 후 다운로드"
                        : "Download after email"}
                  </span>
                </button>
              </>
            )}

            {leadFeedback && (
              <p className="break-words text-xs font-medium text-blue-700" role="status">
                {leadFeedback}
              </p>
            )}
          </form>
        )}
      </div>

      {feedback && (
        <p className="mt-3 break-words text-xs font-medium text-blue-700" role="status">
          {feedback}
        </p>
      )}

      {leadPdfRenderId && (
        <LeadMagnetPdfTemplate
          id={getLeadPdfId(leadPdfRenderId)}
          magnet={LEAD_MAGNETS[leadPdfRenderId] || selectedLead}
          locale={locale}
          sourceLabel={isKo ? config.label.ko : config.label.en}
        />
      )}
    </section>
  );
}
