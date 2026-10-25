// ── 訓練草稿（LogTab 尚未按「完成訓練」的內容）暫存工具 ──────────────
// 供 LogTab（讀/寫/清除）、HomeTab（判斷是否顯示「繼續本次訓練」）、App（重設/清除/匯入後清除）共用
// 草稿格式：{ updatedAt, selectedDate, rows }，存於 localStorage 的 wt_logDraft
//
// 這裡刻意直接用同步的 localStorage 讀寫，不用 useStorage.js 的 lsSet：
// lsSet 會延後一個 tick 才寫入，若「完成訓練」同步清除草稿後，才輪到先前排隊的寫入，草稿會被寫回去。
// 草稿只有幾 KB，同步寫入不會卡畫面。
import { todayStr, localDate } from "./date.js";
import { upgradeWeightSets } from "./setUtils.js";

const DRAFT_KEY = "wt_logDraft";
export const LOG_DRAFT_TTL_MS = 3 * 60 * 60 * 1000; // 草稿保存期限：從「最後一次修改」起算 3 小時
const BACKLOG_MAX_DAYS = 10;                         // 與 LogTab 日期選擇器的補登上限一致

export const clearLogDraft = () => {
  try { localStorage.removeItem(DRAFT_KEY); }
  catch (e) { console.warn("log draft clear failed:", e); }
};

// 沒有任何動作卡片時，視為「沒有草稿」，直接刪除
export const saveLogDraft = ({ rows, selectedDate }) => {
  if (!rows || rows.length === 0) { clearLogDraft(); return; }
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ updatedAt: Date.now(), selectedDate, rows }));
  } catch (e) {
    console.warn("log draft write failed:", e);
  }
};

// 補登日期保護：格式不對、是未來、或超過補登上限（10 天）→ 退回今天
const clampDate = (dateStr) => {
  const today = todayStr();
  if (typeof dateStr !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return today;
  const diffDays = Math.round((localDate(today) - localDate(dateStr)) / 86400000);
  return diffDays < 0 || diffDays > BACKLOG_MAX_DAYS ? today : dateStr;
};

// 讀取有效的草稿；沒有、已過期、或整份失效時回傳 null（過期/失效的會順手清掉）
// - 動作已從動作庫刪除的卡片會被濾掉（避免被隱藏的卡片仍被存進訓練紀錄）
// - 沒有被修改過的知識筆記，重新抓動作庫目前的內容；有修改過的則保留草稿裡的版本
export const loadLogDraft = (library, now = Date.now()) => {
  let draft;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    draft = JSON.parse(raw);
  } catch (e) {
    clearLogDraft();
    return null;
  }

  if (!draft || typeof draft.updatedAt !== "number" || !Array.isArray(draft.rows) || now - draft.updatedAt > LOG_DRAFT_TTL_MS) {
    clearLogDraft();
    return null;
  }

  const rows = draft.rows
    .filter(r => r && library.some(l => l.id === r.libId) && Array.isArray(r.weightSets) && Array.isArray(r.lengthPace))
    .map(r => {
      const item  = library.find(l => l.id === r.libId);
      const dirty = !!r.noteDirty;
      const up    = upgradeWeightSets(r.weightSets, r.setKind); // 舊版草稿（weight 字串）盡力轉成新結構
      return {
        ...r,
        setKind: up.setKind,
        weightSets: up.weightSets,
        mode: r.mode === "length_pace" ? "length_pace" : "weight_sets",
        equipment: r.equipment || "",
        feeling: r.feeling || "",
        noteDirty: dirty,
        noteLocal: dirty ? (r.noteLocal || "") : (item.note || ""),
      };
    });

  if (rows.length === 0) { clearLogDraft(); return null; }
  return { rows, selectedDate: clampDate(draft.selectedDate) };
};

// 供首頁判斷：與 LogTab 用同一套規則，避免兩邊對「有沒有草稿」的認定不一致
export const hasLogDraft = (library) => loadLogDraft(library) !== null;