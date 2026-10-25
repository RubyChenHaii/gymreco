import { fs } from "../theme.js";
import { useState, useEffect } from "react";
import { useC } from "../theme.js";
import { useLang, T } from "../data/i18n.js";
import { RepsPicker } from "./RepsPicker.jsx";
import { InfoButton } from "./Button.jsx";
import { unitsOf, defaultUnitOf, SET_KINDS } from "../utils/setUtils.js";

// 「僅接受 ≥0 數字」的輸入框：內部保留字串（才能輸入到一半的 "1."），
// 對外只回報數字或 ""（空白）。外部值改變（例如切換模式、載入資料）時才同步回內部字串
function NumberField({ value, onChange, invalid, width = 64 }) {
  const C = useC();
  const [text, setText] = useState(value === "" || value == null ? "" : String(value));

  useEffect(() => {
    const cur = text === "" || text === "." ? "" : Number(text);
    const ext = value == null ? "" : value;
    if (cur !== ext) setText(ext === "" ? "" : String(ext));
  }, [value]); // eslint-disable-line

  const handle = (e) => {
    let s = e.target.value.replace(/[^0-9.]/g, "");
    const dot = s.indexOf(".");
    if (dot !== -1) s = s.slice(0, dot + 1) + s.slice(dot + 1).replace(/\./g, ""); // 只保留第一個小數點
    setText(s);
    onChange(s === "" || s === "." ? "" : Number(s));
  };

  return (
    <input value={text} onChange={handle} inputMode="decimal" placeholder="0"
      style={{ width, boxSizing:"border-box", flexShrink:0, background:C.f5, borderRadius:8, padding:"8px 8px",
        border: invalid ? `1.5px solid ${C.red}` : "1.5px solid transparent",
        fontSize:fs(14), fontWeight:700, color:C.text, outline:"none", fontFamily:"inherit", textAlign:"center" }} />
  );
}

export function WeightSetEditor({ weightSets, onChange, kind = "weight", onKindChange }) {
  const lang = useLang();
  const t    = T[lang];
  const C    = useC();
  const [showHint, setShowHint] = useState(false);

  const upd    = (wi, patch)   => onChange(weightSets.map((ws, i) => i===wi ? { ...ws, ...patch } : ws));
  const updRep = (wi, ri, val) => onChange(weightSets.map((ws, i) => i===wi ? { ...ws, reps:ws.reps.map((r, j) => j===ri ? val : r) } : ws));
  const addRep = (wi)          => onChange(weightSets.map((ws, i) => i===wi ? { ...ws, reps:[...ws.reps, ws.reps[ws.reps.length-1] || 10] } : ws));
  const delRep = (wi, ri)      => onChange(weightSets.map((ws, i) => i===wi ? { ...ws, reps:ws.reps.filter((_, j) => j!==ri) } : ws));
  const del    = (wi)          => onChange(weightSets.filter((_, i) => i!==wi));
  // 新增重量組：沿用前一組的單位，沒有前一組才用該模式的預設單位
  const add    = ()            => onChange([...weightSets, { value:"", unit: weightSets.length ? weightSets[weightSets.length-1].unit : defaultUnitOf(kind), note:"", reps:[10] }]);

  // 切換模式：數值與自由文字原樣保留；單位若不屬於新模式（例如 kg → m）就換成新模式的預設單位
  const switchKind = (next) => {
    if (next === kind) return;
    onChange(weightSets.map(ws => ({ ...ws, unit: unitsOf(next).includes(ws.unit) ? ws.unit : defaultUnitOf(next) })));
    onKindChange?.(next);
  };

  const kindLabel = (k) => k === "laps" ? t.weKindLaps : t.weKindWeight;
  const repLabel  = kind === "laps" ? t.weLapsCount : t.weSets;

  return (
    <div>
      {/* 模式切換：重量 ｜ 圈數（整個動作共用，不逐組重複）＋ 說明按鈕 */}
      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:showHint ? 6 : 12 }}>
        {SET_KINDS.map(k => (
          <button key={k} onClick={() => switchKind(k)}
            style={{ padding:"5px 12px", borderRadius:8, fontSize:fs(12), fontWeight:650, cursor:"pointer",
              background: kind === k ? C.blue : "none", color: kind === k ? "#fff" : C.sub,
              border:`1px solid ${kind === k ? C.blue : C.sep}` }}>
            {kindLabel(k)}
          </button>
        ))}
        <InfoButton size={18} onClick={() => setShowHint(v => !v)} />
      </div>
      {showHint && (
        <div style={{ fontSize:fs(11), color:C.blue, opacity:0.85, marginBottom:12, paddingLeft:2, lineHeight:1.7, whiteSpace:"pre-line" }}>
          {t.weKindHint}
        </div>
      )}

      {weightSets.map((ws, wi) => {
        const units = unitsOf(kind);
        const unitOptions = units.includes(ws.unit) || !ws.unit ? units : [...units, ws.unit]; // 保底：資料裡的單位不在清單內時也要能顯示
        const invalid = ws.value === "" || ws.value == null;
        return (
          <div key={wi} style={{ marginBottom:16 }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
              {/* 左：實質資料（必填）＝ 數字 ＋ 單位 */}
              <NumberField value={ws.value} invalid={invalid} onChange={v => upd(wi, { value: v })} />
              <select value={ws.unit || defaultUnitOf(kind)} onChange={e => upd(wi, { unit: e.target.value })}
                style={{ flexShrink:0, background:C.f5, border:"none", borderRadius:8, padding:"8px 4px", fontSize:fs(13), fontWeight:600, color:C.text, outline:"none", fontFamily:"inherit", textAlign:"center" }}>
                {unitOptions.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              {/* 中：視覺分隔 */}
              <div style={{ width:1, alignSelf:"stretch", background:C.sep, margin:"2px 8px", flexShrink:0 }} />
              {/* 右：自由文字（選填），刻意縮短 */}
              <input value={ws.note || ""} onChange={e => upd(wi, { note: e.target.value })}
                placeholder={kind === "laps" ? t.weNotePlaceholderLaps : t.weNotePlaceholderWeight}
                style={{ flex:1, minWidth:0, background:C.f3, border:`1px solid ${C.sep}`, borderRadius:8, padding:"8px 8px", fontSize:fs(12), color:C.sub, outline:"none", fontFamily:"inherit" }} />
              <button onClick={() => del(wi)} style={{ background:"none", border:"none", color:C.label, fontSize:fs(20), cursor:"pointer", padding:"0 2px", lineHeight:1, flexShrink:0 }}>×</button>
            </div>
            <div style={{ fontSize:fs(12), color:C.label, marginBottom:8, paddingLeft:2 }}>{repLabel}</div>
            <div style={{ display:"flex", alignItems:"flex-end", flexWrap:"wrap", gap:8, paddingLeft:2 }}>
              {ws.reps.map((r, ri) => (
                <div key={ri} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                  <RepsPicker value={r} onChange={val => updRep(wi, ri, val)} />
                  {ws.reps.length > 1 && (
                    <button onClick={() => delRep(wi, ri)}
                      style={{ width:20, height:20, borderRadius:"50%", background:C.label, border:"none", color:"#fff", fontSize:fs(11), cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", padding:0, lineHeight:1 }}>×</button>
                  )}
                </div>
              ))}
              <button onClick={() => addRep(wi)}
                style={{ width:52, height:36*5, background:"none", border:`1.5px dashed ${C.sep}`, borderRadius:10, color:C.blue, fontSize:fs(22), cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", alignSelf:"flex-start" }}>+</button>
            </div>
          </div>
        );
      })}
      <button onClick={add} style={{ display:"flex", alignItems:"center", gap:4, background:"none", border:`1.5px dashed ${C.sep}`, borderRadius:10, padding:"8px 14px", color:C.blue, fontSize:fs(13), fontWeight:600, cursor:"pointer", marginTop:4 }}>
        {t.weAddSet}
      </button>
    </div>
  );
}
