import { useC } from "../theme.js";
import { useLang, T, MG_EN } from "../data/i18n.js";
import { COLOR_OPTS, MG_OPTIONS, RECORDING_MODES } from "../data/constants.js";
import { Button } from "./Button.jsx";

// SegmentedControl：純受控分段選擇器，取代專案內 7+ 處重複手刻的「一排互斥選項」按鈕
// options 格式：[{ value, label }]；value/onChange 外部控制，元件本身不持有狀態
// 選項按鈕呼叫 Button 的 segment / segmentOutline variant，樣式統一由 Button.jsx 管理
// size："md"（預設）｜"sm"（文字較長、需要塞 3 個選項時用，例：RoutineTab 比對條件）
const SIZE_STYLES = {
  md: { padding:"9px 10px", fontSize:13 },
  sm: { padding:"9px 8px",  fontSize:12 },
};

export function SegmentedControl({ options, value, onChange, size = "md", disabled = false }) {
  const s = SIZE_STYLES[size];
  return (
    <div style={{ display:"flex", gap:8, opacity: disabled ? 0.4 : 1, transition:"opacity 0.2s" }}>
      {options.map(opt => {
        const active = value === opt.value;
        return (
          <Button key={opt.value}
            variant={active ? "segment" : "segmentOutline"}
            fullWidth={false}
            disabled={disabled}
            onClick={() => onChange(opt.value)}
            style={{ flex:1, padding:s.padding, fontSize:s.fontSize, borderRadius:10 }}>
            {opt.label}
          </Button>
        );
      })}
    </div>
  );
}

// ColorPicker：GymReco 固定色盤（COLOR_OPTS）共用元件
export function ColorPicker({ value, onChange, size = 28 }) {
  const C = useC();
  return (
    <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
      {COLOR_OPTS.map(col => (
        <button key={col} onClick={() => onChange(col)}
          style={{ width:size, height:size, borderRadius:"50%", background:col,
            border: value===col ? `3px solid ${C.text}` : "3px solid transparent",
            cursor:"pointer", padding:0, boxSizing:"border-box" }} />
      ))}
    </div>
  );
}

// ChipGroup：膠囊形單選標籤，options 格式與 SegmentedControl 一致
export function ChipGroup({ options, value, onChange }) {
  const C = useC();
  return (
    <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
      {options.map(opt => {
        const active = value === opt.value;
        return (
          <button key={opt.value} onClick={() => onChange(opt.value)}
            style={{ background:active?C.blue:"none", border:`1px solid ${active?C.blue:C.sep}`,
              borderRadius:20, padding:"5px 12px", fontSize:13, color:active?"#fff":C.sub, cursor:"pointer" }}>
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ExerciseFieldsGroup：「新增/編輯動作」的欄位區塊複合元件
// 固定順序：名稱 → 紀錄模式 → 訓練部位 → 顏色
// 只負責欄位本身；底部按鈕（新增/取消、儲存/刪除...）由各呼叫端自行用 Button 組裝
export function ExerciseFieldsGroup({
  name, onNameChange,
  recMode, onRecModeChange, recModeHint,   // recModeHint：選填，紀錄模式切換的額外說明（目前僅 LibraryTab 編輯表單使用）
  muscleGroup, onMuscleGroupChange,
  color, onColorChange,
}) {
  const lang = useLang(); const t = T[lang]; const C = useC();
  const mgLabel = (mg) => lang === "en" ? MG_EN[mg] || mg : mg;

  return (
    <>
      <input value={name} onChange={e => onNameChange(e.target.value)} placeholder={t.addName}
        style={{ width:"100%", background:C.f5, border:`1px solid ${C.sep}`, borderRadius:10, padding:"10px 12px", fontSize:15, color:C.text, boxSizing:"border-box", outline:"none", fontFamily:"inherit", marginBottom:14 }} />

      <div style={{ fontSize:11, fontWeight:650, color:C.label, letterSpacing:0.4, marginBottom:7 }}>{t.recModeLabel}</div>
      <SegmentedControl
        options={RECORDING_MODES.map(m => ({ value:m, label: m==="weight_sets" ? t.recModeWeightSets : t.recModeLengthPace }))}
        value={recMode} onChange={onRecModeChange} />
      {recModeHint && <div style={{ fontSize:11, color:C.label, lineHeight:1.6, marginTop:5 }}>{recModeHint}</div>}
      <div style={{ marginTop:15, marginBottom:15 }}>
        <div style={{ fontSize:11, fontWeight:650, color:C.label, letterSpacing:0.4, marginBottom:6 }}>{t.addMuscle}</div>
        <ChipGroup options={MG_OPTIONS.map(mg => ({ value:mg, label:mgLabel(mg) }))} value={muscleGroup} onChange={onMuscleGroupChange} />
      </div>

      <div style={{ fontSize:11, fontWeight:650, color:C.label, letterSpacing:0.4, marginBottom:7 }}>{t.addColor}</div>
      <ColorPicker value={color} onChange={onColorChange} />
    </>
  );
}