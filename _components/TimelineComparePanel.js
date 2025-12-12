// _components/TimelineComparePanel.js
import { useEffect, useMemo, useState } from "react";
import {
  addScenario,
  listScenarios,
  removeScenario,
  renameScenario,
  clearScenarios,
} from "../lib/scenarioStore";
import ScenarioCompareView from "./ScenarioCompareView";

function suggestName(current, numberLocale) {
  const r = current?.inputs?.annualRate ?? "?";
  const y = current?.inputs?.years ?? "?";
  const fee = current?.inputs?.feeRatePercent ?? "?";
  const tax = current?.inputs?.taxRatePercent ?? "?";
  const comp = current?.inputs?.compounding === "yearly" ? "연" : "월";
  const isKo = numberLocale.startsWith("ko");
  return isKo
    ? `${r}% · ${y}년 · ${comp}복리 (fee ${fee} / tax ${tax})`
    : `${r}% · ${y}y · ${comp} (fee ${fee} / tax ${tax})`;
}

export default function TimelineComparePanel({
  currentScenario, // ✅ 현재 결과 스냅샷
  numberLocale = "ko-KR",
  currency = "KRW",
}) {
  const isKo = numberLocale.startsWith("ko");

  const [saved, setSaved] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  useEffect(() => {
    setSaved(listScenarios());
  }, []);

  const onSaveCurrent = () => {
    if (!currentScenario) return;

    const name = suggestName(currentScenario, numberLocale);

    const next = addScenario({
      ...currentScenario,
      currency,
      numberLocale,
      name,
    });

    setSaved(next);

    // 저장한 항목 자동 선택(UX)
    const firstId = next?.[0]?.id;
    if (firstId) {
      setSelectedIds((prev) => {
        const set = new Set(prev);
        set.add(firstId);
        return Array.from(set);
      });
    }
  };

  const onToggle = (id) => {
    setSelectedIds((prev) => {
      const set = new Set(prev);
      if (set.has(id)) set.delete(id);
      else set.add(id);
      return Array.from(set);
    });
  };

  const onRemove = (id) => {
    const next = removeScenario(id);
    setSaved(next);
    setSelectedIds((prev) => prev.filter((x) => x !== id));
    if (editingId === id) {
      setEditingId(null);
      setEditingName("");
    }
  };

  const onRenameStart = (item) => {
    setEditingId(item.id);
    setEditingName(item.name || "");
  };

  const onRenameCommit = () => {
    if (!editingId) return;
    const next = renameScenario(editingId, editingName);
    setSaved(next);
    setEditingId(null);
    setEditingName("");
  };

  const onClearAll = () => {
    const next = clearScenarios();
    setSaved(next);
    setSelectedIds([]);
    setEditingId(null);
    setEditingName("");
  };

  const selected = useMemo(() => {
    const map = new Map(saved.map((s) => [s.id, s]));
    return selectedIds.map((id) => map.get(id)).filter(Boolean);
  }, [saved, selectedIds]);

  const canCompare = selected.length >= 2;

  const sameCurrency = useMemo(() => {
    const set = new Set(selected.map((s) => s.currency));
    return set.size <= 1;
  }, [selected]);

  return (
    <div className="card mt-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">
            {isKo ? "시나리오 저장 · 비교" : "Save & Compare Scenarios"}
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            {isKo
              ? "현재 결과를 최대 5개까지 저장하고, 2개 이상 선택해서 한 번에 비교할 수 있어요."
              : "Save up to 5 results and compare 2+ scenarios at once."}
          </p>
        </div>

        <div className="flex gap-2 shrink-0">
          <button type="button" className="btn-primary" onClick={onSaveCurrent}>
            {isKo ? "현재 결과 저장" : "Save current"}
          </button>
          <button type="button" className="btn" onClick={onClearAll}>
            {isKo ? "전체 삭제" : "Clear"}
          </button>
        </div>
      </div>

      {/* Saved list */}
      <div className="mt-4 space-y-2">
        {saved.length === 0 ? (
          <div className="text-sm text-slate-500">
            {isKo
              ? "아직 저장된 시나리오가 없어요. 먼저 ‘현재 결과 저장’을 눌러보세요."
              : "No saved scenarios yet. Click “Save current” first."}
          </div>
        ) : (
          saved.map((item) => {
            const inp = item.inputs || {};
            const checked = selectedIds.includes(item.id);

            return (
              <div
                key={item.id}
                className="border rounded-xl p-3 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggle(item.id)}
                  />

                  <div className="min-w-0">
                    {editingId === item.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          className="input h-9"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") onRenameCommit();
                            if (e.key === "Escape") {
                              setEditingId(null);
                              setEditingName("");
                            }
                          }}
                        />
                        <button className="btn" onClick={onRenameCommit}>
                          {isKo ? "저장" : "Save"}
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="font-semibold truncate">{item.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {inp.annualRate}% · {inp.years}y ·{" "}
                          {inp.compounding === "yearly" ? "연복리" : "월복리"} ·
                          fee {inp.feeRatePercent}% · tax {inp.taxRatePercent}%
                          {item.currency ? ` · ${item.currency}` : ""}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  {editingId !== item.id && (
                    <button className="btn" onClick={() => onRenameStart(item)}>
                      {isKo ? "이름" : "Rename"}
                    </button>
                  )}
                  <button className="btn" onClick={() => onRemove(item.id)}>
                    {isKo ? "삭제" : "Delete"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Compare view */}
      <div className="mt-4">
        {!canCompare ? (
          <div className="text-sm text-slate-500">
            {isKo
              ? "비교하려면 시나리오를 2개 이상 선택하세요."
              : "Select at least 2 scenarios to compare."}
          </div>
        ) : !sameCurrency ? (
          <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
            {isKo
              ? "통화(KRW/USD)가 섞여 있어 비교 차트를 표시할 수 없어요. 같은 통화끼리만 선택해서 비교해 주세요."
              : "Currencies are mixed (KRW/USD). Compare scenarios with the same currency."}
          </div>
        ) : (
          <ScenarioCompareView
            selected={selected}
            numberLocale={numberLocale}
            currency={currency}
          />
        )}
      </div>
    </div>
  );
}
