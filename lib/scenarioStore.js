// lib/scenarioStore.js
const STORAGE_KEY = "finmap_compound_scenarios_v1";
const MAX_ITEMS = 5;

const isBrowser = () => typeof window !== "undefined";

function safeParse(json, fallback) {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

function readAll() {
  if (!isBrowser()) return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const list = safeParse(raw || "[]", []);
  return Array.isArray(list) ? list : [];
}

function writeAll(list) {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function makeId() {
  return (
    "scn_" +
    Date.now().toString(36) +
    "_" +
    Math.random().toString(36).slice(2, 8)
  );
}

export function listScenarios() {
  // 최신순 정렬 보장
  const list = readAll();
  return list
    .filter(Boolean)
    .sort((a, b) => (b?.createdAt || 0) - (a?.createdAt || 0));
}

export function addScenario(scenario) {
  const list = listScenarios();

  const item = {
    id: scenario?.id || makeId(),
    name: scenario?.name || "Scenario",
    createdAt: scenario?.createdAt || Date.now(),
    currency: scenario?.currency || "KRW",
    numberLocale: scenario?.numberLocale || "ko-KR",
    inputs: scenario?.inputs || {},
    summary: scenario?.summary || {},
    series: scenario?.series || {},
  };

  // 같은 id가 있으면 업데이트로 처리
  const withoutSame = list.filter((x) => x?.id !== item.id);

  const next = [item, ...withoutSame].slice(0, MAX_ITEMS);
  writeAll(next);
  return next;
}

export function removeScenario(id) {
  const list = listScenarios().filter((x) => x?.id !== id);
  writeAll(list);
  return list;
}

export function renameScenario(id, name) {
  const list = listScenarios().map((x) =>
    x?.id === id ? { ...x, name: String(name || "").trim() || x.name } : x
  );
  writeAll(list);
  return list;
}

export function clearScenarios() {
  writeAll([]);
  return [];
}
