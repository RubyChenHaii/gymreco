// ── 「重量 / 圈數」組次資料結構工具 ───────────────────────────────
// 供 WeightSetEditor、LogTab、DetailTab、LibraryTab、HistoryTab、exportUtils、logDraft 共用
//
// 新版資料結構（recording mode 為 weight_sets 的 exercise / history 紀錄）：
//   setKind: "weight" | "laps"          ← 整個動作共用一個模式（沒有此欄位的舊資料視為 "weight"）
//   weightSets: [{ value, unit, note, reps:[...] }, ...]
//     value：實質資料（≥0 的數字；編輯中尚未填寫時為 ""，不可存檔）
//     unit ：weight 模式為 kg / lb；laps 模式為 m / km / mi
//     note ：自由文字（選填），會寫入歷史、顯示於 DetailTab / LibraryTab，但不顯示在 HistoryTab 預覽
//
// 舊版資料結構：weightSets: [{ weight:"15kg", reps:[...] }]
//   App 讀到舊資料時，用 upgradeWeightSets() 做「盡力轉換」，讓編輯器永遠拿到新結構；
//   顯示用途則用 coreText() 直接相容舊資料。要一次性轉換整份備份請用 scripts/migrate-data.js
//   ⚠️ parseLegacyWeight 的規則與 scripts/migrate-data.js 內的版本必須保持一致（腳本是 CommonJS，無法直接 import 此檔）

export const SET_KINDS      = ["weight", "laps"];
export const WEIGHT_UNITS   = ["kg", "lb"];
export const DISTANCE_UNITS = ["m", "km", "mi"];

export const unitsOf       = (kind) => kind === "laps" ? DISTANCE_UNITS : WEIGHT_UNITS;
export const defaultUnitOf = (kind) => unitsOf(kind)[0];
export const kindOf        = (entry) => entry?.setKind === "laps" ? "laps" : "weight";

// 自重 / 徒手一類的字串
const BW_RE = /^(bw|body\s*-?\s*weight|self\s*-?\s*weight|自重|徒手|體重)$/i;

const UNIT_ALIASES = {
  kg:"kg", kgs:"kg", "公斤":"kg",
  lb:"lb", lbs:"lb", "磅":"lb",
  m:"m", "公尺":"m", "米":"m",
  km:"km", "公里":"km",
  mi:"mi", mile:"mi", miles:"mi",
};
const LEGACY_RE = /^(\d+(?:\.\d+)?)\s*(kgs|kg|lbs|lb|miles|mile|mi|km|m|公斤|公里|公尺|磅|米)(?![a-zA-Z])(.*)$/i;

// 解析舊版 weight 字串。回傳 { kind, value, unit, note } 或 null（無法自動判斷）
// - "15kg" / "70 lbs" / "400m"             → 數字 + 單位，note 為空
// - "60kg 左右各15kg"（數字 + 單位 + 其他） → 數字 + 單位，note 保留整串原文
// - "BW" / "自重" …                         → value 0、kg、note 保留原文
export const parseLegacyWeight = (raw) => {
  const s = String(raw ?? "").trim();
  if (!s) return null;
  if (BW_RE.test(s)) return { kind:"weight", value:0, unit:"kg", note:s, bodyweight:true };
  const m = s.match(LEGACY_RE);
  if (!m) return null;
  const unit = UNIT_ALIASES[m[2].toLowerCase()] || UNIT_ALIASES[m[2]];
  if (!unit) return null;
  const rest = m[3].trim();
  return { kind: DISTANCE_UNITS.includes(unit) ? "laps" : "weight", value: Number(m[1]), unit, note: rest ? s : "" };
};

// 把任何版本的 weightSets 升級成新結構（盡力轉換；無法判斷的組別 value 留空、原文放進 note，編輯時會被要求補填）
export const upgradeWeightSets = (weightSets, setKind) => {
  let kind = setKind === "laps" || setKind === "weight" ? setKind : null;
  const parsed = (weightSets || []).map(ws => {
    if (ws.unit !== undefined) return { done:true, ws };            // 已是新結構
    const p = parseLegacyWeight(ws.weight);
    if (p && !kind) kind = p.kind;
    return { done:false, ws, p };
  });
  kind = kind || "weight";
  return {
    setKind: kind,
    weightSets: parsed.map(({ done, ws, p }) => {
      if (done) return { value: ws.value ?? "", unit: ws.unit, note: ws.note || "", reps: ws.reps };
      if (p) return { value: p.value, unit: p.unit, note: p.note, reps: ws.reps };
      return { value:"", unit: defaultUnitOf(kind), note: String(ws.weight ?? ""), reps: ws.reps };
    }),
  };
};

// 數字顯示：400 → "400"、7.5 → "7.5"
export const fmtNum = (n) => {
  const r = Math.round(Number(n) * 100) / 100;
  return String(r);
};

// 實質資料的文字（HistoryTab / DetailTab / LibraryTab / 匯出共用）。相容舊資料：沒有 unit 的就直接用 weight 字串
export const coreText = (ws) => {
  if (ws.unit !== undefined) return ws.value === "" || ws.value == null ? "—" : `${fmtNum(ws.value)} ${ws.unit}`;
  return ws.weight ?? "";
};

// 自由文字（舊資料沒有）
export const noteText = (ws) => (ws.unit !== undefined ? (ws.note || "") : "");

// 單位標籤：weight 模式的 reps 叫「下 / reps」，laps 模式叫「圈 / laps」
export const repUnitLabel = (kind, t) => kind === "laps" ? t.lapsUnit : t.repsUnit;

// 存檔前檢查：weight_sets 模式下，每一組的實質資料都必須已填
export const hasEmptyCore = (rows) =>
  rows.some(r => (r.mode || "weight_sets") === "weight_sets" &&
    (r.weightSets || []).some(ws => ws.value === "" || ws.value == null));

// ── 距離單位（LengthPaceEditor 與「圈數」模式共用同一份代碼清單）────────
// 儲存用代碼固定為 DISTANCE_UNITS（"m" / "km" / "mi"）。舊資料裡的自由字串用別名表對應（載入時由 migrateData 轉換）；
// 對不上的回傳 null（App 內保留原字串並仍可顯示，轉換腳本則會詢問）
// ⚠️ 別名表與 scripts/migrate-data.js 內的 DISTANCE_ALIASES 必須保持一致
const DISTANCE_ALIASES = {
  m:"m", meter:"m", meters:"m", metre:"m", metres:"m", "公尺":"m", "米":"m",
  km:"km", kms:"km", kilometer:"km", kilometers:"km", kilometre:"km", kilometres:"km", "公里":"km", "千米":"km",
  mi:"mi", mile:"mi", miles:"mi", "英里":"mi",
};
export const normalizeDistanceUnit = (raw) => {
  const s = String(raw ?? "").trim().toLowerCase().replace(/\.$/, "");
  return DISTANCE_ALIASES[s] || null;
};
