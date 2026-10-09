#!/usr/bin/env node
// GymReco 範例資料工具：把「匯出 JSON 備份」轉成 src/data/initialData.js，並可順便調整每筆訓練的日期。
//
// 用法：
//   node scripts/export-initial-data.js <備份.json> [選項]
//
// 選項：
//   --out <路徑>         輸出位置（預設 src/data/initialData.js；搭配 --write 時會直接覆蓋，請先 commit 或備份）
//   --shift-days <N>     所有訓練日期整批平移 N 天（可為負數）
//   --set <id>=<日期>    指定單筆訓練的新日期，可重複使用（日期格式見下）
//   --edit, -e           互動模式：逐筆列出訓練，逐筆輸入新日期
//   --write              真的寫入檔案；未加此選項時只預覽，不會動到任何檔案
//   --help, -h           顯示說明
//
// 日期格式（--set 與互動模式通用）：
//   2026-10-08    完整日期
//   10-08 或 10/8  只改月/日，年份沿用該筆原本的年份
//   +3 / -2       相對該筆「目前日期」往後 / 往前 N 天
//
// 處理順序：--shift-days → --set → --edit
// 同步規則：訓練日期變動時，會同步更新該筆 weekday，以及 library 內對應（workoutId 相同）的 history 日期，
//          並重新排序（workouts 新→舊、history 舊→新），與 App 儲存資料時的排序一致。
// 規律（routines）原樣輸出：週/月進度是依「今天」即時計算，與範例日期無關。
const fs = require("fs");
const path = require("path");

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DEFAULT_OUT = path.join(__dirname, "..", "src", "data", "initialData.js");
const USAGE = "用法：node scripts/export-initial-data.js <備份.json> [--out 路徑] [--shift-days N] [--set id=日期]... [--edit] [--write]";

function fail(msg) {
  console.error(`\n❌ export-initial-data 失敗：${msg}\n`);
  process.exit(1);
}

// ── 日期工具（一律用本機時間，避免時區偏移）────────────────
const pad2 = (n) => String(n).padStart(2, "0");
const parseYMD = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const fmtYMD = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const weekdayOf = (s) => WEEKDAYS[parseYMD(s).getDay()];
const shiftDays = (s, n) => { const d = parseYMD(s); d.setDate(d.getDate() + n); return fmtYMD(d); };
// 組出日期；2/30 這類不存在的日期回傳 null
const build = (y, m, d) => {
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d ? fmtYMD(dt) : null;
};
// 解析使用者輸入的日期；無法辨識回傳 null
const resolveDate = (input, current) => {
  const s = input.trim();
  let m;
  if ((m = s.match(/^([+-])(\d+)$/))) return shiftDays(current, (m[1] === "-" ? -1 : 1) * Number(m[2]));
  if ((m = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/))) return build(+m[1], +m[2], +m[3]);
  if ((m = s.match(/^(\d{1,2})[-/](\d{1,2})$/))) return build(Number(current.slice(0, 4)), +m[1], +m[2]);
  return null;
};

// ── 參數解析 ─────────────────────────────────────────────
const opts = { input: null, out: DEFAULT_OUT, shift: 0, sets: [], edit: false, write: false };
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === "--help" || a === "-h") { console.log(USAGE); process.exit(0); }
  else if (a === "--out") opts.out = path.resolve(argv[++i] || fail("--out 後面需要路徑"));
  else if (a === "--shift-days") {
    const n = Number(argv[++i]);
    if (!Number.isInteger(n)) fail("--shift-days 後面需要整數，例如 --shift-days 30 或 --shift-days -7");
    opts.shift = n;
  }
  else if (a === "--set") opts.sets.push(argv[++i] || fail("--set 後面需要 id=日期，例如 --set 6=10-08"));
  else if (a === "--edit" || a === "-e") opts.edit = true;
  else if (a === "--write") opts.write = true;
  else if (a.startsWith("-")) fail(`不認得的選項 ${a}\n${USAGE}`);
  else if (!opts.input) opts.input = a;
  else fail(`多餘的參數 ${a}`);
}
if (!opts.input) fail(USAGE);

// ── 讀取並檢查備份 ───────────────────────────────────────
let data;
try {
  data = JSON.parse(fs.readFileSync(opts.input, "utf8"));
} catch (e) {
  fail(`讀取或解析 ${opts.input} 失敗：${e.message}`);
}
if (!Array.isArray(data.workouts) || !Array.isArray(data.library) || (data.routines !== undefined && !Array.isArray(data.routines))) {
  fail("備份檔結構不正確（需要 workouts、library 陣列，routines 為選填陣列）");
}
const workouts = JSON.parse(JSON.stringify(data.workouts));
const library  = JSON.parse(JSON.stringify(data.library));
const routines = data.routines || [];
for (const w of workouts) {
  if (typeof w.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(w.date) || !build(...w.date.split("-").map(Number))) {
    fail(`訓練 id=${w.id} 的日期格式不正確：${w.date}`);
  }
}
const originalDates = new Map(workouts.map(w => [String(w.id), w.date]));

// ── 互動模式 ─────────────────────────────────────────────
const describe = (w) => {
  const names = w.exercises.map(ex => library.find(l => l.id === ex.libId)?.name ?? "(已刪除)").join("、");
  return `${w.date} ${weekdayOf(w.date).slice(0, 3)}  id=${w.id}\n  ${names}`;
};

async function interactiveEdit() {
  if (!process.stdin.isTTY) fail("--edit 需要在終端機中互動執行");
  const rl = require("readline/promises").createInterface({ input: process.stdin, output: process.stdout });
  console.log("\n逐筆調整日期：Enter＝保留；2026-10-08 / 10-08 / 10/8＝指定日期；+3 / -2＝平移天數；q＝結束（其餘保留）\n");
  try {
    for (let i = 0; i < workouts.length; i++) {
      const w = workouts[i];
      for (;;) {
        const ans = (await rl.question(`[${i + 1}/${workouts.length}] ${describe(w)}\n  新日期> `)).trim();
        if (ans === "") break;
        if (ans.toLowerCase() === "q") return;
        const to = resolveDate(ans, w.date);
        if (!to) { console.log("  ⚠️ 無法辨識，請重新輸入"); continue; }
        w.date = to;
        console.log(`  → ${to}（${weekdayOf(to).slice(0, 3)}）`);
        break;
      }
    }
  } finally {
    rl.close();
  }
}

// ── 主流程 ───────────────────────────────────────────────
(async () => {
  // 1. 整批平移
  if (opts.shift !== 0) workouts.forEach(w => { w.date = shiftDays(w.date, opts.shift); });

  // 2. --set 指定單筆
  for (const spec of opts.sets) {
    const eq = spec.indexOf("=");
    if (eq < 1) fail(`--set 格式不正確：${spec}（應為 id=日期）`);
    const idStr = spec.slice(0, eq), value = spec.slice(eq + 1);
    const w = workouts.find(x => String(x.id) === idStr);
    if (!w) fail(`找不到 id=${idStr} 的訓練。現有 id：${workouts.map(x => x.id).join(", ")}`);
    const to = resolveDate(value, w.date);
    if (!to) fail(`--set ${spec}：無法辨識日期「${value}」`);
    w.date = to;
  }

  // 3. 互動逐筆
  if (opts.edit) await interactiveEdit();

  // 4. 同步：weekday、library history、排序
  const changed = workouts.filter(w => w.date !== originalDates.get(String(w.id)));
  const newDateById = new Map(workouts.map(w => [String(w.id), w.date]));
  let orphanCount = 0;
  if (changed.length > 0) {
    changed.forEach(w => { w.weekday = weekdayOf(w.date); });
    workouts.sort((a, b) => b.date.localeCompare(a.date));   // 新→舊（穩定排序，同日維持原順序）
    library.forEach(item => {
      (item.history || []).forEach(h => {
        const nd = newDateById.get(String(h.workoutId));
        if (nd) h.date = nd;
      });
      (item.history || []).sort((a, b) => a.date.localeCompare(b.date)); // 舊→新
    });
  }
  library.forEach(item => (item.history || []).forEach(h => {
    if (!newDateById.has(String(h.workoutId))) orphanCount++;
  }));

  // 5. 摘要
  if (changed.length === 0) {
    console.log("\nℹ️  沒有任何訓練日期被修改");
  } else {
    console.log(`\n📅 共調整 ${changed.length} 筆訓練日期：`);
    changed.forEach(w => console.log(`   id=${w.id}  ${originalDates.get(String(w.id))} → ${w.date}（${w.weekday.slice(0, 3)}）`));
  }
  if (orphanCount > 0) console.log(`⚠️  有 ${orphanCount} 筆 library history 找不到對應的訓練（workoutId 不存在），日期未更動`);

  // 6. 輸出
  // 把 JSON 的 "key": 還原成 key:，讓輸出接近手寫風格（只處理「行首的屬性名稱」，字串內容不受影響）
  const toJs = (v) => JSON.stringify(v, null, 2).replace(/^(\s*)"([A-Za-z_$][\w$]*)":/gm, "$1$2:");
  const out = `// ⚠️ 本檔由 scripts/export-initial-data.js 依備份 JSON（${path.basename(opts.input)}）轉換產生

export const INIT_LIBRARY = ${toJs(library)};

export const INIT_WORKOUTS = ${toJs(workouts)};

export const INIT_ROUTINES = ${toJs(routines)};
`;
  if (!opts.write) {
    console.log("\n🔍 預覽模式：未寫入任何檔案。確認無誤後，加上 --write 才會真的輸出。");
  } else {
    fs.mkdirSync(path.dirname(opts.out), { recursive: true });
    fs.writeFileSync(opts.out, out, "utf8");
    console.log(`\n✅ 已輸出 ${opts.out}`);
  }
  console.log(`   動作 ${library.length} 個、訓練 ${workouts.length} 筆、規律 ${routines.length} 條`);
})();