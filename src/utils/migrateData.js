// ── 載入時的資料轉換（唯一入口）────────────────────────────────────
// schemaVersion 1 的定義（constants.js 的 SCHEMA_VERSION；沒有 schemaVersion 欄位的備份一律視為舊格式）：
//   · workouts 是唯一的訓練資料來源；library[] 不含 history（歷史由 workouts 現算）
//   · exercise：{ libId, muscleGroup, color, mode, equipment, feeling, ... }，muscleGroup / color 為「紀錄當下」的快照
//       （原動作已從動作庫刪除、又沒有快照的舊紀錄除外，這類紀錄補不出來）
//   · mode "weight_sets"：setKind "weight" | "laps"（缺少時視為 "weight"）；weightSets: [{ value, unit, note, reps[] }]
//       unit：weight 為 kg / lb；laps 為 m / km / mi
//   · mode "length_pace"：lengthPace: [{ distance, unit, paceMin, paceSec }]，unit 為 m / km / mi（沒有 setKind）
//   · 例外：需要人工判斷的組別（看不懂的重量字串、有氧動作的自重…）仍可能保持舊格式 { weight, reps }，
//       讀取端遇到沒有 unit 的組別，應視為「舊格式、單位不明」而非錯誤
// 把舊格式的 workouts / library 一次轉成目前的資料結構，供 App 在「讀取 localStorage」與「匯入備份」時呼叫。
// - 純函式、可重複執行：沒有需要轉換的內容時，原樣回傳同一份資料（changed:false，物件參照不變）
// - 只轉換「能確定的」內容；需要人工判斷的組別維持舊格式（App 仍可顯示，開啟編輯時會盡力轉換）：
//     · 解析不出數字＋單位的 weight 字串
//     · 有氧／跑步動作的「自重」（可能是游泳、跑步的圈數，要由使用者決定，請用 scripts/migrate-data.js）
//     · 同一筆紀錄同時出現重量與距離單位
// - 轉換內容：
//     1. weight_sets：{ weight:"15kg", reps } → { value, unit, note, reps }，並補上 setKind
//     2. length_pace：每段 unit 的別名（KM、公里、miles…）統一成 m / km / mi；認不得的字串原樣保留
//     3. 補存快照：workouts 裡缺少 muscleGroup / color 的 exercise，用動作庫「現值」補上一次（資料契約，供 GymStats 使用）；
//        動作已從動作庫刪除的找不到來源，維持原樣。之後快照不再隨動作庫變動
//     4. 移除 library[].history：訓練歷史不再另存，一律由 workouts 現算（workouts 是唯一的訓練資料來源）。
//        匯入舊備份時，舊的 history 在這裡被丟棄；若其中有 workouts 找不到對應訓練的孤兒紀錄，會隨之遺失，
//        要事先檢查請用 scripts/migrate-data.js（預覽時會列出孤兒紀錄）
// ⚠️ 解析規則集中在 setUtils.js（parseLegacyWeight / normalizeDistanceUnit），本檔不重複定義
import { parseLegacyWeight, normalizeDistanceUnit } from "./setUtils.js";

const CARDIO_GROUPS = ["有氧", "跑步"];
const isNewGroup = (g) => g.unit !== undefined;

const migrateWeightEntry = (entry, isCardio) => {
  if ((entry.mode || "weight_sets") !== "weight_sets" || !Array.isArray(entry.weightSets)) return entry;
  if (!entry.weightSets.some((g) => !isNewGroup(g))) return entry; // 已是新結構

  const parsed = entry.weightSets.map((g) => {
    if (isNewGroup(g)) return null;
    const p = parseLegacyWeight(g.weight);
    return p && !(p.bodyweight && isCardio) ? p : null;
  });

  const kinds = new Set(parsed.filter(Boolean).map((p) => p.kind));
  if (entry.setKind === "weight" || entry.setKind === "laps") kinds.add(entry.setKind);
  if (kinds.size !== 1) return entry; // 沒有可轉換的組別，或同一筆混了重量與距離
  const [kind] = kinds;

  return {
    ...entry,
    setKind: kind,
    weightSets: entry.weightSets.map((g, i) => {
      const p = parsed[i];
      return p && p.kind === kind ? { value: p.value, unit: p.unit, note: p.note, reps: g.reps } : g;
    }),
  };
};

const fillSnapshot = (ex, libById) => {
  if (ex.muscleGroup !== undefined && ex.color !== undefined) return ex;
  const it = libById.get(String(ex.libId));
  if (!it) return ex;
  const { libId, muscleGroup, color, ...rest } = ex;
  return { libId, muscleGroup: muscleGroup ?? it.muscleGroup, color: color ?? it.color, ...rest };
};

const migrateLengthPaceEntry = (entry) => {
  if (entry.mode !== "length_pace" || !Array.isArray(entry.lengthPace)) return entry;
  let changed = false;
  const lengthPace = entry.lengthPace.map((seg) => {
    const u = normalizeDistanceUnit(seg.unit);
    if (!u || u === seg.unit) return seg;
    changed = true;
    return { ...seg, unit: u };
  });
  return changed ? { ...entry, lengthPace } : entry;
};

export const migrateData = ({ workouts, library }) => {
  const libById = new Map((library || []).map((l) => [String(l.id), l]));
  const cardioById = new Map((library || []).map((l) => [String(l.id), CARDIO_GROUPS.includes(l.muscleGroup)]));
  let changed = false;

  const migrateExercise = (ex) => {
    const isCardio = cardioById.get(String(ex.libId)) || false;
    return fillSnapshot(migrateLengthPaceEntry(migrateWeightEntry(ex, isCardio)), libById);
  };

  const newWorkouts = (workouts || []).map((w) => {
    const exercises = (w.exercises || []).map(migrateExercise);
    if (!exercises.some((ex, i) => ex !== w.exercises[i])) return w;
    changed = true;
    return { ...w, exercises };
  });
  const newLibrary = (library || []).map((item) => {
    if (!("history" in item)) return item;
    const { history, ...rest } = item;   // 4. 丟棄舊的 library[].history
    changed = true;
    return rest;
  });

  return changed ? { workouts: newWorkouts, library: newLibrary, changed: true } : { workouts, library, changed: false };
};
