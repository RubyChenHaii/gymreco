import { fs } from "../theme.js";
import { useC } from "../theme.js";
import { useLang, T } from "../data/i18n.js";
import { RepsPicker } from "./RepsPicker.jsx";

export function WeightSetEditor({ weightSets, onChange }) {
  const lang = useLang();
  const t    = T[lang];
  const C    = useC();

  const upd    = (wi, field, val) => onChange(weightSets.map((ws, i) => i===wi ? { ...ws, [field]:val } : ws));
  const updRep = (wi, ri, val)    => onChange(weightSets.map((ws, i) => i===wi ? { ...ws, reps:ws.reps.map((r, j) => j===ri ? val : r) } : ws));
  const addRep = (wi)             => onChange(weightSets.map((ws, i) => i===wi ? { ...ws, reps:[...ws.reps, ws.reps[ws.reps.length-1] || 10] } : ws));
  const delRep = (wi, ri)         => onChange(weightSets.map((ws, i) => i===wi ? { ...ws, reps:ws.reps.filter((_, j) => j!==ri) } : ws));
  const del    = (wi)             => onChange(weightSets.filter((_, i) => i!==wi));
  const add    = ()               => onChange([...weightSets, { weight:"", reps:[10] }]);

  return (
    <div>
      {weightSets.map((ws, wi) => (
        <div key={wi} style={{ marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
            <input value={ws.weight} onChange={e => upd(wi, "weight", e.target.value)} placeholder={t.weightPlaceholder}
              style={{ flex:1, background:C.f5, border:"none", borderRadius:8, padding:"8px 10px", fontSize:fs(14), fontWeight:600, color:C.text, outline:"none", fontFamily:"inherit" }} />
            <button onClick={() => del(wi)} style={{ background:"none", border:"none", color:C.label, fontSize:fs(20), cursor:"pointer", padding:"0 2px", lineHeight:1 }}>×</button>
          </div>
          <div style={{ fontSize:fs(12), color:C.label, marginBottom:8, paddingLeft:2 }}>{t.weSets}</div>
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
      ))}
      <button onClick={add} style={{ display:"flex", alignItems:"center", gap:4, background:"none", border:`1.5px dashed ${C.sep}`, borderRadius:10, padding:"8px 14px", color:C.blue, fontSize:fs(13), fontWeight:600, cursor:"pointer", marginTop:4 }}>
        {t.weAddSet}
      </button>
    </div>
  );
}
