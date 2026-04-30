function firstQueryValue(value) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function parseValue(raw, field) {
  if (raw === undefined || raw === null || raw === "") return undefined;

  if (field.type === "number") {
    const value = Number(raw);
    return Number.isFinite(value) ? value : undefined;
  }

  const value = String(raw);
  if (field.allowed && !field.allowed.includes(value)) return undefined;
  return value;
}

export function getToolPresetFromQuery(query, fields) {
  const preset = {};
  let found = false;

  fields.forEach((field) => {
    const raw = firstQueryValue(query?.[field.query]);
    const value = parseValue(raw, field);
    if (value === undefined) return;
    preset[field.state] = value;
    found = true;
  });

  return found ? preset : null;
}

export function buildToolPresetQuery(preset, fields) {
  const query = {};

  fields.forEach((field) => {
    const value = preset?.[field.state];
    if (value === undefined || value === null || value === "") return;
    query[field.query] = String(value);
  });

  return query;
}

export function readToolRecent(storageKey, fields) {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const values = parsed?.values && typeof parsed.values === "object"
      ? parsed.values
      : parsed;
    const preset = {};
    let found = false;

    fields.forEach((field) => {
      const value = parseValue(values?.[field.state], field);
      if (value === undefined) return;
      preset[field.state] = value;
      found = true;
    });

    return found ? preset : null;
  } catch {
    return null;
  }
}

export function writeToolRecent(storageKey, preset) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        version: 1,
        updatedAt: new Date().toISOString(),
        values: preset,
      })
    );
  } catch {
    // Storage can be unavailable in private mode.
  }
}

export function replaceUrlQuery(query) {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  url.search = "";

  Object.entries(query || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    url.searchParams.set(key, String(value));
  });

  const nextUrl = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState(window.history.state, "", nextUrl);
}
