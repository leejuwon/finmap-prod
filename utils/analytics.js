const TOOL_BY_PATH = [
  { match: "/tools/compound-interest", tool: "compound" },
  { match: "/tools/fire-calculator", tool: "fire" },
  { match: "/tools/cagr-calculator", tool: "cagr" },
  { match: "/tools/goal-simulator", tool: "goal" },
  { match: "/tools/dca-calculator", tool: "dca" },
  { match: "/tools/dsr-ltv-calculator", tool: "dsrLtv" },
];

const STATIC_INFO_PATHS = new Set([
  "/contact",
  "/privacy",
  "/terms",
  "/about",
  "/disclaimer",
]);

export function normalizePath(pathname = "") {
  const raw = String(pathname || "").trim();
  if (!raw) return "/";

  let path = raw;
  try {
    if (/^https?:\/\//i.test(raw)) {
      path = new URL(raw).pathname;
    }
  } catch {
    path = raw;
  }

  path = path.split("?")[0].split("#")[0] || "/";
  path = path.replace(/\/{2,}/g, "/");
  if (!path.startsWith("/")) path = `/${path}`;
  if (path.length > 1) path = path.replace(/\/+$/, "");
  return path || "/";
}

function stripLocalePrefix(pathname = "") {
  const path = normalizePath(pathname);
  if (path === "/en") return "/";
  if (path.startsWith("/en/")) return path.slice(3) || "/";
  return path;
}

export function getPageGroup(pathname = "") {
  const path = stripLocalePrefix(pathname);

  if (path === "/") return "home";
  if (STATIC_INFO_PATHS.has(path)) return "static_info";

  if (path === "/tools") return "tools_index";
  if (getToolFromPath(path)) return "tool_detail";

  if (/^\/category\/[^/]+$/.test(path)) return "blog_category";
  if (/^\/posts\/[^/]+\/[^/]+$/.test(path)) return "blog_detail";

  if (/^\/market\/real-estate\/apt\/[^/]+$/.test(path)) return "real_estate_detail";
  if (/^\/market\/real-estate\/[^/]*top100$/.test(path)) return "real_estate_landing";
  if (path === "/market/real-estate") return "real_estate_dashboard";
  if (path === "/market" || path === "/market/indices") return "market";

  return "other";
}

export function getToolFromPath(pathname = "") {
  const path = stripLocalePrefix(pathname);
  return TOOL_BY_PATH.find((item) => path === item.match)?.tool;
}

export function getGaPageContext(pathname = "") {
  return {
    page_group: getPageGroup(pathname),
    source_path: pathname || "/",
  };
}

export function trackGaEvent(name, params = {}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;

  const sourcePath = window.location?.pathname || "";
  window.gtag("event", name, {
    ...getGaPageContext(sourcePath),
    ...params,
  });
}
