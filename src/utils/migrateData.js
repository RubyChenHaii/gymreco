// ── 載入時的資料轉換（唯一入口）────────────────────────────────────
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
//        動作已從動作庫刪除的找不到來源，維持原樣。之後快照不再隨動作庫變動，也不寫進各動作的 history
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

  const mapEntries = (entries, libId) => {
    let listChanged = false;
    const isCardio = cardioById.get(String(libId)) || false;
    const next = (entries || []).map((e) => {
      const n = migrateLengthPaceEntry(migrateWeightEntry(e, isCardio));
      if (n !== e) listChanged = true;
      return n;
    });
    if (listChanged) changed = true;
    return listChanged ? next : entries;
  };

  const newWorkouts = (workouts || []).map((w) => {
    const exercises = (w.exercises || []).map((ex) => fillSnapshot(mapEntries([ex], ex.libId)[0], libById));
    if (!exercises.some((ex, i) => ex !== w.exercises[i])) return w;
    changed = true;
    return { ...w, exercises };
  });
  const newLibrary = (library || []).map((item) => {
    const history = mapEntries(item.history, item.id);
    return history !== item.history ? { ...item, history } : item;
  });

  return changed ? { workouts: newWorkouts, library: newLibrary, changed: true } : { workouts, library, changed: false };
};
