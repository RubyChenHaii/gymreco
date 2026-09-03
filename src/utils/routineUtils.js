// ── Routines（運動規則）相關計算工具 ──────────────────────────
// 供 RoutineTab、LogTab、HomeTab 共用
// 規則格式：[每週/每月] 至少進行 [指定動作/指定顏色/指定訓練部位] × [n 次]

import { localDate } from "./date.js";

export const MAX_ROUTINES = 5;

// 取得「本週」日期範圍，以週日為一週起始（與 HomeTab.jsx 月曆的 weekdays 排列一致：日一二三四五六）
export const getWeekRange = (baseDate = new Date()) => {
  const d = new Date(baseDate);
  d.setHours(0, 0, 0, 0);
  const dow = d.getDay(); // 0 = Sun
  const start = new Date(d);
  start.setDate(d.getDate() - dow);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// 取得「本月」日期範圍
export const getMonthRange = (baseDate = new Date()) => {
  const d = new Date(baseDate);
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const inRange = (dateStr, start, end) => {
  const d = localDate(dateStr);
  return d >= start && d <= end;
};

// 判斷單一 exercise 是否符合規則的比對條件
// 顏色/部位比對一律用「動作庫目前設定」（library.find 查當下值），不做逐筆歷史快照——
// 因為顏色/部位代表使用者現在的分類邏輯，跟 recordingMode 逐筆快照的處理原則不同
const exerciseMatches = (ex, routine, library) => {
  if (routine.matchType === "exercise") return ex.libId === routine.matchValue;
  const item = library.find(l => l.id === ex.libId);
  if (!item) return false;
  if (routine.matchType === "color") return item.color === routine.matchValue;
  if (routine.matchType === "muscleGroup") return item.muscleGroup === routine.matchValue;
  return false;
};

// 計算規則在指定期間內，符合條件的「天數」
// 同一天內即使有多筆符合條件的訓練紀錄，最多只算 1 天（比照 HomeTab.jsx 現有 thisMonthDays 的 Set 去重複寫法）
export const countMatchingDays = (routine, workouts, library, baseDate = new Date()) => {
  const { start, end } = routine.period === "month" ? getMonthRange(baseDate) : getWeekRange(baseDate);
  const matchedDates = new Set();
  workouts.forEach(w => {
    if (!inRange(w.date, start, end)) return;
    const hasMatch = w.exercises.some(ex => exerciseMatches(ex, routine, library));
    if (hasMatch) matchedDates.add(w.date);
  });
  return matchedDates.size;
};

// 判斷規則是否達標
// 回傳 { count, complete, deleted }
// - deleted: matchType 為 "exercise" 但對應動作已從動作庫刪除時為 true，此時視為無法比對，count 固定為 0
export const isRoutineComplete = (routine, workouts, library, baseDate = new Date()) => {
  if (routine.matchType === "exercise" && !library.find(l => l.id === routine.matchValue)) {
    return { count: 0, complete: false, deleted: true };
  }
  const count = countMatchingDays(routine, workouts, library, baseDate);
  return { count, complete: count >= routine.targetCount, deleted: false };
};
