export const COLOR_OPTS = [
  "#FF6B6B","#EA0000","#FF9500","#FFCC00",
  "#34C759","#5AC8FA","#007AFF","#5856D6","#AF52DE","#8E8E93",
];

// 資料結構版本（整數，與 AboutTab 的 APP_VERSION 無關）：匯出的 JSON 備份會帶上它，匯入時據此判斷是否讀得懂。
// 只有「資料形狀」改變時才遞增；定義見 utils/migrateData.js 檔頭。
// ⚠️ 與 scripts/migrate-data.js 內的 SCHEMA_VERSION 必須保持一致（腳本是 CommonJS，無法直接 import 此檔）
export const SCHEMA_VERSION = 1;

export const MG_OPTIONS  = ["胸肌","背部","腿部","肩部","手臂","腹部","核心","臀部","有氧","伸展運動","其他"];
export const WEEKDAYS    = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
export const WEEKDAY_CN  = ["週日","週一","週二","週三","週四","週五","週六"];
export const MONTHS_EN   = ["January","February","March","April","May","June","July","August","September","October","November","December"];
export const RECORDING_MODES = ["weight_sets", "length_pace"]; // 動作紀錄模式：weight_sets（重量/組數，適合重訓負重動作）、length_pace（距離/配速，適合跑步游泳等有氧運動）

export const ROUTINE_PERIODS     = ["week", "month"]; // 規則週期：每週 / 每月
export const ROUTINE_MATCH_TYPES = ["exercise", "color", "muscleGroup"]; // 規則比對條件：指定動作 / 指定顏色 / 指定訓練部位
