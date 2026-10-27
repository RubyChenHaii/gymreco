#!/usr/bin/env node
// GymReco 資料轉換工具：把備份 JSON 內「舊版重量組次」轉成新版「重量 / 圈數」資料結構。
//
//   舊：weightSets: [{ weight: "15kg", reps: [10, 5, 5] }]
//   新：setKind: "weight" | "laps"
//       weightSets: [{ value: 15, unit: "kg", note: "", reps: [10, 5, 5] }]
//
// 處理範圍：workouts[].exercises[] 與 library[].history[] 裡 mode 為 weight_sets 的紀錄。
// 已經是新結構的組別（有 unit 欄位）會原樣保留，所以重複執行是安全的。
//
// 用法：
//   node scripts/migrate-data.js <備份.json> [選項]
//
// 選項：
//   --out <路徑>        輸出位置（預設：<備份>.migrated.json，不會覆蓋原檔）
//   --write             真的寫入檔案；未加此選項時只預覽，不會動到任何檔案
//   --answers <檔.json> 預先給定答案（略過互動提問；格式見下方「答案檔」）
//   --help, -h          顯示說明
//
// 自動轉換規則（字串偵測）：
//   "15kg" / "70 lbs" / "400m"      → 數字 + 單位（kg、lb → 重量模式；m、km、mi → 圈數模式）
//   "60kg 左右各15kg"                → 數字 + 單位，整串原文保留在 note
//   "BW" / "自重" / "bodyweight"     → value 0、kg、原文放進 note（動作部位為「有氧」時改為詢問，因為可能是游泳/跑步的圈數）
// 無法自動判斷的情況（沒有單位的數字、看不懂的文字、同一動作同時出現重量與距離單位…）會停下來詢問。
// 同一個「動作 + 原始字串」只問一次，答案套用到所有出現的地方。
//
// 提問時可輸入：
//   Enter              採用括號內的建議值
//   60 kg              數字 + 單位；沒有 | 時，原始字串會保留成 note
//   25 m | 泳池每趟25m  用 | 另外指定 note；| 後留空表示不要 note
//   s                  略過這一種（保持舊格式，App 開啟時仍會盡力轉換）
//
// 答案檔（--answers）：JSON 物件，key 為提示中顯示的代號，例如
//   { "kind:lib14": "laps", "lib14|BW": "25 m | 泳池每趟25m" }
//
// 另外也會把「距離 / 配速」紀錄（length_pace）每段的 unit 統一成固定代碼 m / km / mi：
//   "KM"、"公里"、"miles"… 依別名表自動轉換；認不得的字串會詢問（代號 "unit:<原字串>"），同一種字串只問一次
//
// ⚠️ 解析規則與 src/utils/setUtils.js 的 parseLegacyWeight、DISTANCE_ALIASES 保持一致（本檔為 CommonJS，無法直接 import ESM）
const fs = require("fs");
const path = require("path");

const WEIGHT_UNITS = ["kg", "lb"];
const DISTANCE_UNITS = ["m", "km", "mi"];
const USAGE = "用法：node scripts/migrate-data.js <備份.json> [--out 路徑] [--write] [--answers 答案.json]";

function fail(msg) {
  console.error(`\n❌ migrate-data 失敗：${msg}\n`);
  process.exit(1);
}

// ── 解析規則（同 setUtils.js）──────────────────────────────
const BW_RE = /^(bw|body\s*-?\s*weight|self\s*-?\s*weight|自重|徒手|體重)$/i;
const UNIT_ALIASES = {
  kg: "kg", kgs: "kg", "公斤": "kg", lb: "lb", lbs: "lb", "磅": "lb",
  m: "m", "公尺": "m", "米": "m", km: "km", "公里": "km", mi: "mi", mile: "mi", miles: "mi",
};
const DISTANCE_ALIASES = {
  m: "m", meter: "m", meters: "m", metre: "m", metres: "m", "公尺": "m", "米": "m",
  km: "km", kms: "km", kilometer: "km", kilometers: "km", kilometre: "km", kilometres: "km", "公里": "km", "千米": "km",
  mi: "mi", mile: "mi", miles: "mi", "英里": "mi",
};
const normDistanceUnit = (raw) => DISTANCE_ALIASES[String(raw ?? "").trim().toLowerCase().replace(/\.$/, "")] || null;
const LEGACY_RE = /^(\d+(?:\.\d+)?)\s*(kgs|kg|lbs|lb|miles|mile|mi|km|m|公斤|公里|公尺|磅|米)(?![a-zA-Z])(.*)$/i;
const unitsOf = (kind) => (kind === "laps" ? DISTANCE_UNITS : WEIGHT_UNITS);
const normUnit = (u) => UNIT_ALIASES[u.toLowerCase()] || UNIT_ALIASES[u];

function parseLegacyWeight(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return null;
  if (BW_RE.test(s)) return { kind: "weight", value: 0, unit: "kg", note: s, bodyweight: true };
  const m = s.match(LEGACY_RE);
  if (!m) return null;
  const unit = normUnit(m[2]);
  if (!unit) return null;
  const rest = m[3].trim();
  return { kind: DISTANCE_UNITS.includes(unit) ? "laps" : "weight", value: Number(m[1]), unit, note: rest ? s : "" };
}

// ── 參數 ───────────────────────────────────────────────────
const opts = { input: null, out: null, write: false, answers: null };
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === "--help" || a === "-h") { console.log(USAGE); process.exit(0); }
  else if (a === "--out") opts.out = path.resolve(argv[++i] || fail("--out 後面需要路徑"));
  else if (a === "--write") opts.write = true;
  else if (a === "--answers") opts.answers = argv[++i] || fail("--answers 後面需要檔案路徑");
  else if (a.startsWith("-")) fail(`不認得的選項 ${a}\n${USAGE}`);
  else if (!opts.input) opts.input = a;
  else fail(`多餘的參數 ${a}`);
}
if (!opts.input) fail(USAGE);
if (!opts.out) opts.out = opts.input.replace(/\.json$/i, "") + ".migrated.json";

let data;
try { data = JSON.parse(fs.readFileSync(opts.input, "utf8")); }
catch (e) { fail(`讀取或解析 ${opts.input} 失敗：${e.message}`); }
if (!Array.isArray(data.workouts) || !Array.isArray(data.library)) fail("備份檔結構不正確（需要 workouts、library 陣列）");

let presetAnswers = {};
if (opts.answers) {
  try { presetAnswers = JSON.parse(fs.readFileSync(opts.answers, "utf8")); }
  catch (e) { fail(`讀取答案檔 ${opts.answers} 失敗：${e.message}`); }
}

const libById = new Map(data.library.map((l) => [String(l.id), l]));
const libLabel = (id) => libById.get(String(id))?.name ?? `(已刪除:${id})`;
const isCardio = (id) => libById.get(String(id))?.muscleGroup === "有氧";

// ── 蒐集要處理的紀錄 ───────────────────────────────────────
// target = { entry, libId, where }
const targets = [];
data.workouts.forEach((w) => (w.exercises || []).forEach((ex) => {
  if ((ex.mode || "weight_sets") === "weight_sets" && Array.isArray(ex.weightSets)) targets.push({ entry: ex, libId: String(ex.libId), where: `訓練 ${w.date}` });
}));
data.library.forEach((item) => (item.history || []).forEach((h) => {
  if ((h.mode || "weight_sets") === "weight_sets" && Array.isArray(h.weightSets)) targets.push({ entry: h, libId: String(item.id), where: `動作庫歷史 ${h.date}` });
}));
const isNew = (g) => g.unit !== undefined;
const legacyTargets = targets.filter((t) => t.entry.weightSets.some((g) => !isNew(g)));

// ── 第一輪：推斷每個動作的模式（weight / laps）──────────────
const votes = new Map(); // libId -> Set(kind)
const vote = (id, kind) => { if (!votes.has(id)) votes.set(id, new Set()); votes.get(id).add(kind); };
targets.forEach((t) => {
  if (t.entry.setKind === "laps" || t.entry.setKind === "weight") vote(t.libId, t.entry.setKind);
  t.entry.weightSets.forEach((g) => {
    if (isNew(g)) return;
    const p = parseLegacyWeight(g.weight);
    if (!p || (p.bodyweight && isCardio(t.libId))) return; // 有氧動作的 BW 不能當作「重量」的證據
    vote(t.libId, p.kind);
  });
});

// ── 提問工具 ───────────────────────────────────────────────
let rl = null;
const interactive = process.stdin.isTTY && process.stdout.isTTY;
async function ask(key, prompt, validate) {
  if (key in presetAnswers) {
    const r = validate(String(presetAnswers[key]));
    if (r.ok) return r.value;
    fail(`答案檔中 "${key}" 的值無效：${r.err}`);
  }
  if (!interactive) fail(`有無法自動轉換的資料需要指定（代號 "${key}"），但目前不是互動終端機。請在終端機中執行，或用 --answers 提供答案。`);
  if (!rl) rl = require("readline/promises").createInterface({ input: process.stdin, output: process.stdout });
  for (;;) {
    const ans = await rl.question(prompt);
    const r = validate(ans);
    if (r.ok) return r.value;
    console.log(`  ⚠️ ${r.err}，請重新輸入`);
  }
}

// ── 第二輪：逐一決定 ───────────────────────────────────────
const kindByLib = new Map();
const groupAnswers = new Map(); // `${libId}|${raw}` -> { value, unit, note } | "skip"
const log = [];                 // 摘要用
const asked = new Set();
const unitAnswers = new Map();  // `unit:<原字串>` -> 代碼 | "skip"        // 實際問過使用者（或由答案檔回答）的 key，用來輸出可重複使用的答案檔

(async () => {
  // 2a. 每個動作的模式
  const libIds = [...new Set(legacyTargets.map((t) => t.libId))];
  for (const id of libIds) {
    const set = votes.get(id);
    if (set && set.size === 1) { kindByLib.set(id, [...set][0]); continue; }
    const why = !set || set.size === 0 ? "資料中沒有可判斷的單位" : "同時出現重量與距離單位";
    const samples = [...new Set(legacyTargets.filter((t) => t.libId === id).flatMap((t) => t.entry.weightSets.filter((g) => !isNew(g)).map((g) => String(g.weight))))].slice(0, 6);
    console.log(`\n❓「${libLabel(id)}」（部位：${libById.get(id)?.muscleGroup ?? "?"}）— ${why}\n   舊資料內容：${samples.map((s) => `"${s}"`).join("、")}`);
    const kind = await ask(`kind:${id}`, `   這個動作應使用哪種模式？ [1] 重量(weight)  [2] 圈數(laps)  [s] 略過 > `, (a) => {
      const s = a.trim().toLowerCase();
      if (s === "1" || s === "weight") return { ok: true, value: "weight" };
      if (s === "2" || s === "laps") return { ok: true, value: "laps" };
      if (s === "s") return { ok: true, value: "skip" };
      return { ok: false, err: "請輸入 1、2 或 s" };
    });
    kindByLib.set(id, kind);
    log.push(`kind:${id} (${libLabel(id)}) → ${kind}`);
  }

  // 2b. 每一種「動作 + 原始字串」
  const parseAnswer = (raw, kind) => (a) => {
    const s = a.trim();
    if (s.toLowerCase() === "s") return { ok: true, value: "skip" };
    const [head, ...tail] = s.split(/[|｜]/);
    const m = head.trim().match(/^(\d+(?:\.\d+)?)\s*([A-Za-z公里尺斤磅米]+)$/);
    if (!m) return { ok: false, err: "格式應為「數字 單位」，例如 60 kg" };
    const unit = normUnit(m[2]);
    if (!unit || !unitsOf(kind).includes(unit)) return { ok: false, err: `單位需為 ${unitsOf(kind).join(" / ")}` };
    const note = tail.length ? tail.join("|").trim() : String(raw).trim();
    return { ok: true, value: { value: Number(m[1]), unit, note } };
  };

  const resolveGroup = async (libId, g) => {
    const raw = String(g.weight ?? "");
    const kind = kindByLib.get(libId);
    const key = `${libId}|${raw}`;
    if (groupAnswers.has(key)) return groupAnswers.get(key);

    const p = parseLegacyWeight(raw);
    const autoOk = p && p.kind === kind && !(p.bodyweight && isCardio(libId));
    if (autoOk) { const r = { value: p.value, unit: p.unit, note: p.note }; groupAnswers.set(key, r); return r; }

    const num = raw.match(/\d+(?:\.\d+)?/);
    const suggestion = num ? `${num[0]} ${unitsOf(kind)[0]}` : (p?.bodyweight && kind === "weight" ? `0 kg` : "");
    console.log(`\n❓ 無法自動轉換 [${libId}|${raw}]「${libLabel(libId)}」${kind === "laps" ? "（圈數模式：數字＝每圈距離）" : "（重量模式）"}\n   原始字串："${raw}"`);
    const ans = await ask(key, `   請輸入「數字 單位 [| note]」${suggestion ? `（Enter＝${suggestion}）` : ""}、或 s 略過 > `, (a) => {
      if (a.trim() === "" && suggestion) return parseAnswer(raw, kind)(suggestion);
      return parseAnswer(raw, kind)(a);
    });
    groupAnswers.set(key, ans);
    asked.add(key);
    log.push(`${key} → ${ans === "skip" ? "略過" : `${ans.value} ${ans.unit}${ans.note ? ` | ${ans.note}` : ""}`}`);
    return ans;
  };

  // 2c. 套用
  let convertedGroups = 0, skippedGroups = 0, convertedEntries = 0, partialEntries = 0;
  for (const t of legacyTargets) {
    const kind = kindByLib.get(t.libId);
    if (kind === "skip") { skippedGroups += t.entry.weightSets.filter((g) => !isNew(g)).length; partialEntries++; continue; }
    const out = [];
    let allDone = true;
    for (const g of t.entry.weightSets) {
      if (isNew(g)) { out.push(g); continue; }
      const r = await resolveGroup(t.libId, g);
      if (r === "skip") { out.push(g); allDone = false; skippedGroups++; continue; }
      out.push({ value: r.value, unit: r.unit, note: r.note, reps: g.reps });
      convertedGroups++;
    }
    t.entry.weightSets = out;
    if (allDone) { t.entry.setKind = kind; convertedEntries++; } else partialEntries++;
  }
  // 已是新結構但缺 setKind 的紀錄補上
  targets.forEach((t) => {
    if (!t.entry.setKind && t.entry.weightSets.length && t.entry.weightSets.every(isNew)) t.entry.setKind = kindByLib.get(t.libId) && kindByLib.get(t.libId) !== "skip" ? kindByLib.get(t.libId) : "weight";
  });
  // 2d. 距離 / 配速紀錄：單位統一成固定代碼
  const lpSegs = [];
  data.workouts.forEach((w) => (w.exercises || []).forEach((ex) => {
    if (ex.mode === "length_pace" && Array.isArray(ex.lengthPace)) ex.lengthPace.forEach((seg) => lpSegs.push(seg));
  }));
  data.library.forEach((item) => (item.history || []).forEach((h) => {
    if (h.mode === "length_pace" && Array.isArray(h.lengthPace)) h.lengthPace.forEach((seg) => lpSegs.push(seg));
  }));
  let unitFixed = 0, unitSkipped = 0;
  for (const seg of lpSegs) {
    const raw = String(seg.unit ?? "");
    if (DISTANCE_UNITS.includes(raw)) continue;                 // 已是代碼
    let code = normDistanceUnit(raw);
    if (!code) {
      const key = `unit:${raw}`;
      if (!unitAnswers.has(key)) {
        console.log(`\n❓ 無法辨識的距離單位 "${raw}"（距離 / 配速紀錄）`);
        const ans = await ask(key, `   請輸入單位 [1] km  [2] mi  [3] m  [s] 略過 > `, (a) => {
          const v = a.trim().toLowerCase();
          if (v === "1" || v === "km") return { ok: true, value: "km" };
          if (v === "2" || v === "mi") return { ok: true, value: "mi" };
          if (v === "3" || v === "m") return { ok: true, value: "m" };
          if (v === "s") return { ok: true, value: "skip" };
          return { ok: false, err: "請輸入 1、2、3 或 s" };
        });
        unitAnswers.set(key, ans);
        log.push(`${key} → ${ans}`);
      }
      code = unitAnswers.get(key);
      if (code === "skip") { unitSkipped++; continue; }
    }
    seg.unit = code;
    unitFixed++;
  }

  if (rl) rl.close();

  // ── 摘要 ─────────────────────────────────────────────────
  console.log(`\n📦 共 ${targets.length} 筆重量組次紀錄，其中 ${legacyTargets.length} 筆含舊格式`);
  console.log(`✅ 已轉換 ${convertedEntries} 筆紀錄（${convertedGroups} 組）`);
  if (skippedGroups > 0) console.log(`⚠️  ${skippedGroups} 組被略過，維持舊格式（App 仍可顯示，開啟編輯時會盡力轉換）`);
  if (lpSegs.length > 0) console.log(`📏 距離 / 配速：共 ${lpSegs.length} 段，統一單位 ${unitFixed} 段${unitSkipped ? `，略過 ${unitSkipped} 段（維持原字串）` : ""}`);
  if (legacyTargets.length === 0) console.log("ℹ️  沒有需要轉換的舊資料");
  if (log.length) {
    console.log("\n你的選擇（可存成 --answers 答案檔重複使用）：");
    const ans = {};
    log.forEach((l) => console.log("   " + l));
    kindByLib.forEach((v, id) => { if (votes.get(id)?.size !== 1) ans[`kind:${id}`] = v; });
    groupAnswers.forEach((v, k) => { if (asked.has(k)) ans[k] = v === "skip" ? "s" : `${v.value} ${v.unit} | ${v.note}`; });
    unitAnswers.forEach((v, k) => { ans[k] = v === "skip" ? "s" : v; });
    console.log("\n" + JSON.stringify(ans, null, 2));
  }

  if (!opts.write) {
    console.log(`\n🔍 預覽模式：未寫入任何檔案。確認無誤後，加上 --write 才會輸出到 ${opts.out}`);
  } else {
    if (path.resolve(opts.out) === path.resolve(opts.input)) console.log("⚠️  輸出位置與輸入相同，原檔將被覆蓋");
    fs.writeFileSync(opts.out, JSON.stringify(data, null, 2) + "\n", "utf8");
    console.log(`\n✅ 已輸出 ${opts.out}\n   接著可用 npm run init-data 轉成範例資料，或直接在 App「關於」頁匯入這份 JSON。`);
  }
})();
