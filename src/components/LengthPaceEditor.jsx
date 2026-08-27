import { useState } from "react";
import { useC } from "../theme.js";
import { useLang, T } from "../data/i18n.js";
import { NumberPicker } from "./NumberPicker.jsx";
import { calcOverallPace, fmtDistance, fmtPace, splitDistance, joinDistance } from "../utils/paceUtils.js";

const DISTANCE_MIN = 0;     // 每段（整數位）距離下限
const DISTANCE_MAX = 10;    // 每段（整數位）距離上限；總距離已在下方「整體配速」加總顯示
const DIGIT_W = 40;         // 統一所有數字滾輪的寬度（距離整數位/小數位、配速分/秒）

export function LengthPaceEditor({ lengthPace, onChange }) {
  const lang = useLang();
  const t    = T[lang];
  const C    = useC();
  const [showHint, setShowHint] = useState(false);

  const upd = (i, field, val) => onChange(lengthPace.map((seg, idx) => idx === i ? { ...seg, [field]: val } : seg));
  const updDistance = (i, intPart, decPart) => upd(i, "distance", joinDistance(intPart, decPart));
  const del = (i) => onChange(lengthPace.filter((_, idx) => idx !== i));

  // 新增分段：若已有前一段，直接繼承其數值（距離、單位、配速），使用者再自行調整
  // 沒有前一段時才用預設值——與 WeightSetEditor 的 addRep 邏輯一致
  const add = () => {
    const last = lengthPace[lengthPace.length - 1];
    onChange([...lengthPace, last
      ? { ...last }
      : { distance: DISTANCE_MIN, unit: "km", paceMin: 0, paceSec: 0 }]);
  };

  const overall = calcOverallPace(lengthPace);
  const unitsMismatch = lengthPace.length > 1 && !overall;

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8, paddingLeft:2 }}>
        <span style={{ fontSize:12, color:C.label }}>{t.lpSegments}</span>
        <button onClick={() => setShowHint(v => !v)}
          style={{ width:18, height:18, borderRadius:"50%", background:`${C.blue}25`, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", padding:0, flexShrink:0 }}>
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke={C.blue} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="13" x2="12" y2="18"/>
            <circle cx="12" cy="7.5" r="1.5" fill={C.blue} stroke="none"/>
          </svg>
        </button>
      </div>
      {showHint && (
        <div style={{ fontSize:11, color:C.blue, opacity:0.85, marginBottom:10, paddingLeft:2 }}>{t.lpFieldsHint}</div>
      )}

      {lengthPace.map((seg, i) => {
        const { intPart, decPart } = splitDistance(seg.distance || 0);
        return (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14, flexWrap:"wrap", rowGap:8 }}>
            {/* 群組一：距離＋單位＋@ */}
            <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:3 }}>
                <NumberPicker value={intPart} onChange={v => updDistance(i, v, decPart)} min={DISTANCE_MIN} max={DISTANCE_MAX} width={DIGIT_W} />
                <span style={{ fontSize:16, color:C.label, fontWeight:700 }}>.</span>
                <NumberPicker value={decPart} onChange={v => updDistance(i, intPart, v)} min={0} max={9} width={DIGIT_W} />
              </div>
              <input value={seg.unit} onChange={e => upd(i, "unit", e.target.value)} placeholder={t.lpUnitPlaceholder}
                style={{ width:40, background:C.f5, border:"none", borderRadius:8, padding:"8px 6px", fontSize:13, fontWeight:600, color:C.text, outline:"none", fontFamily:"inherit", textAlign:"center" }} />
              <span style={{ fontSize:13, color:C.label }}>@</span>
            </div>
            {/* 群組二：配速＋刪除鈕 */}
            <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:3 }}>
                <NumberPicker value={seg.paceMin} onChange={v => upd(i, "paceMin", v)} min={0} max={30} width={DIGIT_W} />
                <span style={{ fontSize:13, color:C.label }}>'</span>
                <NumberPicker value={seg.paceSec} onChange={v => upd(i, "paceSec", v)} min={0} max={59} width={DIGIT_W} />
                <span style={{ fontSize:13, color:C.label }}>"</span>
              </div>
              <button onClick={() => del(i)} style={{ background:"none", border:"none", color:C.label, fontSize:20, cursor:"pointer", padding:"0 2px", lineHeight:1 }}>×</button>
            </div>
          </div>
        );
      })}

      <button onClick={add} style={{ display:"flex", alignItems:"center", gap:4, background:"none", border:`1.5px dashed ${C.sep}`, borderRadius:10, padding:"8px 14px", color:C.blue, fontSize:13, fontWeight:600, cursor:"pointer", marginTop:4, marginBottom:12 }}>
        {t.lpAddSegment}
      </button>

      {lengthPace.length > 0 && (
        <div style={{ padding:"10px 12px", borderRadius:10, fontSize:13, fontWeight:600,
          background: unitsMismatch ? `${C.red}10` : `${C.blue}10`,
          border: `1px solid ${unitsMismatch ? C.red : C.blue}30`,
          color: unitsMismatch ? C.red : C.blue }}>
          {unitsMismatch
            ? t.lpMixedUnit
            : overall
              ? `${t.lpOverallPace}：${fmtDistance(overall.totalDistance)} ${overall.unit} · ${fmtPace(overall.paceMin, overall.paceSec)}/${overall.unit}`
              : null}
        </div>
      )}
    </div>
  );
}