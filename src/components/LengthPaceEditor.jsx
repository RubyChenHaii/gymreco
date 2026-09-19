import { useState } from "react";
import { useC, fluidSize } from "../theme.js";
import { useLang, T } from "../data/i18n.js";
import { NumberPicker } from "./NumberPicker.jsx";
import { calcOverallPace, fmtDistance, fmtPace, splitDistance, joinDistance, timeToPace, paceToTime } from "../utils/paceUtils.js";

const DISTANCE_MIN = 0;     // 每段（整數位）距離下限
const DISTANCE_MAX = 10;    // 每段（整數位）距離上限；總距離已在下方「整體配速」加總顯示
const DIGIT_W = fluidSize(32, 45);   // 375px（iPhone SE）→32px；440px（iPhone 16 Pro Max）→45px
const TOTAL_MIN_MAX = 60;   // 「總時間」模式下分鐘滾輪上限（超過 1 小時建議改用多分段紀錄）

export function LengthPaceEditor({ lengthPace, onChange }) {
  const lang = useLang();
  const t    = T[lang];
  const C    = useC();
  const [showHint, setShowHint] = useState(false);

  // 全域輸入模式："pace"（直接輸入配速，預設）｜"time"（輸入總時間，自動換算配速）
  // 整組編輯器共用同一個模式，不會有「某段配速、某段總時間」混用的情況
  const [mode, setModeState] = useState("pace");
  // "time" 模式下，每段各自的總時間草稿（分/秒）；索引對應 lengthPace，新增/刪除分段時同步增減
  const [totalTimes, setTotalTimes] = useState(() => lengthPace.map(() => ({ min: 0, sec: 0 })));

  const updSeg = (i, patch) => onChange(lengthPace.map((seg, idx) => idx === i ? { ...seg, ...patch } : seg));

  const updDistance = (i, intPart, decPart) => {
    const distance = joinDistance(intPart, decPart);
    const patch = { distance };
    if (mode === "time") {
      const derived = timeToPace(totalTimes[i].min, totalTimes[i].sec, distance);
      if (derived) Object.assign(patch, derived);
    }
    updSeg(i, patch);
  };

  const updTotalTime = (i, field, val) => {
    const tt = { ...totalTimes[i], [field]: val };
    setTotalTimes(prev => prev.map((p, idx) => idx === i ? tt : p));
    const derived = timeToPace(tt.min, tt.sec, lengthPace[i].distance || 0);
    if (derived) updSeg(i, derived);
  };

  const del = (i) => {
    onChange(lengthPace.filter((_, idx) => idx !== i));
    setTotalTimes(prev => prev.filter((_, idx) => idx !== i));
  };

  // 新增分段：若已有前一段，直接繼承其數值（距離、單位、配速），使用者再自行調整
  // 沒有前一段時才用預設值——與 WeightSetEditor 的 addRep 邏輯一致
  const add = () => {
    const last = lengthPace[lengthPace.length - 1];
    const newSeg = last ? { ...last } : { distance: DISTANCE_MIN, unit: "km", paceMin: 0, paceSec: 0 };
    onChange([...lengthPace, newSeg]);
    setTotalTimes(prev => [...prev, paceToTime(newSeg.paceMin, newSeg.paceSec, newSeg.distance)]);
  };

  // 切換全域輸入模式；切到「總時間」時，用目前每段的 距離 × 配速 回推對應的總時間草稿，
  // 避免使用者一切換就看到空白的 0'00"
  const switchMode = (next) => {
    if (mode === next) return;
    if (next === "time") {
      setTotalTimes(lengthPace.map(seg => paceToTime(seg.paceMin, seg.paceSec, seg.distance)));
    }
    setModeState(next);
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

      {/* 全域輸入模式切換：配速 ｜ 總時間（整組分段共用，不逐段重複） */}
      <div style={{ display:"flex", gap:6, marginBottom:12 }}>
        {[["pace", t.lpModePace], ["time", t.lpModeTime]].map(([m, label]) => (
          <button key={m} onClick={() => switchMode(m)}
            style={{ padding:"5px 12px", borderRadius:8, fontSize:12, fontWeight:650, cursor:"pointer",
              background: mode === m ? C.blue : "none", color: mode === m ? "#fff" : C.sub,
              border:`1px solid ${mode === m ? C.blue : C.sep}` }}>
            {label}
          </button>
        ))}
      </div>

      {lengthPace.map((seg, i) => {
        const { intPart, decPart } = splitDistance(seg.distance || 0);
        const tt = totalTimes[i] || { min: 0, sec: 0 };
        return (
          <div key={i} style={{ marginBottom:14 }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap", rowGap:8 }}>
              {/* 群組一：距離＋單位＋@ */}
              <div style={{ display:"flex", alignItems:"center", gap:5, flexShrink:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                  <NumberPicker value={intPart} onChange={v => updDistance(i, v, decPart)} min={DISTANCE_MIN} max={DISTANCE_MAX} width={DIGIT_W} />
                  <span style={{ fontSize:16, color:C.label, fontWeight:700 }}>.</span>
                  <NumberPicker value={decPart} onChange={v => updDistance(i, intPart, v)} min={0} max={9} width={DIGIT_W} />
                </div>
                <input value={seg.unit} onChange={e => updSeg(i, { unit: e.target.value })} placeholder={t.lpUnitPlaceholder}
                  style={{ width: fluidSize(30, 40), background:C.f5, border:"none", borderRadius:10, padding:"8px 4px", fontSize:12, fontWeight:600, color:C.text, outline:"none", fontFamily:"inherit", textAlign:"center" }} />
                <span style={{ fontSize:13, color:C.label }}>@</span>
              </div>

              {/* 群組二：依全域模式顯示「配速」或「總時間」滾輪＋刪除鈕 */}
              {mode === "pace" ? (
                <div style={{ display:"flex", alignItems:"center", gap:5, flexShrink:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                    <NumberPicker value={seg.paceMin} onChange={v => updSeg(i, { paceMin: v })} min={0} max={30} width={DIGIT_W} />
                    <span style={{ fontSize:13, color:C.label }}>'</span>
                    <NumberPicker value={seg.paceSec} onChange={v => updSeg(i, { paceSec: v })} min={0} max={59} width={DIGIT_W} />
                    <span style={{ fontSize:13, color:C.label }}>"</span>
                  </div>
                  {/* 明確標註這組滾輪是「每單位距離的配速」，不是總時間 */}
                  <span style={{ fontSize:11, color:C.label, fontWeight:550 }}>/{seg.unit || "km"}</span>
                  <button onClick={() => del(i)} style={{ background:"none", border:"none", color:C.label, fontSize:20, cursor:"pointer", padding:"0 1px", lineHeight:1 }}>×</button>
                </div>
              ) : (
                <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                    <NumberPicker value={tt.min} onChange={v => updTotalTime(i, "min", v)} min={0} max={TOTAL_MIN_MAX} width={DIGIT_W} />
                    <span style={{ fontSize:13, color:C.label }}>'</span>
                    <NumberPicker value={tt.sec} onChange={v => updTotalTime(i, "sec", v)} min={0} max={59} width={DIGIT_W} />
                    <span style={{ fontSize:13, color:C.label }}>"</span>
                  </div>
                  <span style={{ fontSize:12, color:C.label }}>{t.lpTotalTimeSuffix}</span>
                  <button onClick={() => del(i)} style={{ background:"none", border:"none", color:C.label, fontSize:20, cursor:"pointer", padding:"0 1px", lineHeight:1 }}>×</button>
                </div>
              )}
            </div>

            {/* 總時間模式：即時顯示換算後的配速，讓使用者確認換算結果 */}
            {mode === "time" && (
              <div style={{ fontSize:11, color:C.blue, marginTop:6, paddingLeft:2 }}>
                {t.lpDerivedPace}：{fmtPace(seg.paceMin || 0, seg.paceSec || 0)}/{seg.unit || "km"}
              </div>
            )}
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