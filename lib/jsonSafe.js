// lib/jsonSafe.js
// ✅ Next.js getServerSideProps props는 JSON-serializable만 허용
// mysql2가 DATE/DATETIME을 Date 객체로 반환할 수 있어 SSR 직렬화 에러(500) 방지
export function jsonSafe(v) {
  if (v == null) return v;
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "bigint") return v.toString();
  if (Array.isArray(v)) return v.map(jsonSafe);
  if (typeof v === "object") {
    const out = {};
    for (const [k, val] of Object.entries(v)) out[k] = jsonSafe(val);
    return out;
  }
  return v;
}

export default jsonSafe;