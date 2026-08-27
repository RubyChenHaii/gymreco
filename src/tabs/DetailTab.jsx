import { useState } from "react";
import { useLang, T, MG_EN } from "../data/i18n.js";
import { WEEKDAYS, WEEKDAY_CN } from "../data/constants.js";
import { useC } from "../theme.js";
import { localDate } from "../utils/date.js";
import { Div, Card } from "../components/ui.jsx";
import { WeightSetEditor } from "../components/WeightSetEditor.jsx";
import { LengthPaceEditor } from "../components/LengthPaceEditor.jsx";
import { calcOverallPace, fmtDistance, fmtPace } from "../utils/paceUtils.js";

export function DetailTab(props) {
  if (!props.workout) return null;
  return <DetailTabInner {...props} />;
}

function DetailTabInner({ workout, library, onBack, onOpenLibItem, onUpdateWorkout, onDeleteWorkout }) {
  const lang = useLang(); const t = T[lang]; const C = useC();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [rows, setRows] = useState(() =>
    workout.exercises.map(ex => ({
     ...ex,
     weightSets: ex.weightSets ? JSON.parse(JSON.stringify(ex.weightSets)) : undefined,
     lengthPace: ex.lengthPace ? JSON.parse(JSON.stringify(ex.lengthPace)) : undefined,
    }))
  );

  const d = localDate(workout.date);
  const wdLabel = lang === "zh" ? WEEKDAY_CN[d.getDay()] : WEEKDAYS[d.getDay()].slice(0, 3);

  const save = () => {
   const cleaned = rows.map(r => ({
     libId: r.libId,
     mode: r.mode || "weight_sets",
     equipment: r.equipment,
     ...((r.mode || "weight_sets") === "length_pace" ? { lengthPace: r.lengthPace } : { weightSets: r.weightSets }),
     feeling: r.feeling,
   }));
   onUpdateWorkout({ ...workout, exercises: cleaned });
   onBack();
 };
  const confirmDoDelete = () => { onDeleteWorkout(workout.id); };
  const updRow = (i, patch) => setRows(p => p.map((r, j) => j === i ? { ...r, ...patch } : r));

  return (
    <div style={{ flex:1, overflowY:"auto", background:C.bg }}>
      {confirmDelete && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:300, padding:"20px" }}>
          <div style={{ background:C.card, borderRadius:16, padding:"24px 20px", width:"100%", maxWidth:320 }}>
            <div style={{ fontSize:17, fontWeight:700, color:C.text, marginBottom:10, textAlign:"center" }}>{lang === "zh" ? "刪除紀錄" : "Delete Workout"}</div>
            <div style={{ fontSize:14, color:C.sub, marginBottom:20, textAlign:"center", lineHeight:1.6 }}>{t.detailDeleteConfirm}</div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setConfirmDelete(false)} style={{ flex:1, padding:"12px", background:C.f5, border:"none", borderRadius:12, fontSize:15, fontWeight:600, color:C.sub, cursor:"pointer" }}>{lang === "zh" ? "取消" : "Cancel"}</button>
              <button onClick={confirmDoDelete} style={{ flex:1, padding:"12px", background:C.red, border:"none", borderRadius:12, fontSize:15, fontWeight:600, color:"#fff", cursor:"pointer" }}>{lang === "zh" ? "刪除" : "Delete"}</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ padding:"8px 16px 14px", background:C.card, borderBottom:`1px solid ${C.sep}`, display:"flex", alignItems:"center", gap:8 }}>
        <button onClick={onBack} style={{ background:"none", border:"none", cursor:"pointer", padding:"4px 0", color:C.blue, fontSize:16, fontWeight:500, flexShrink:0 }}>
          {t.detailBack}
        </button>
        <div style={{ flex:1, textAlign:"center" }}>
          <div style={{ fontSize:16, fontWeight:600, color:C.text }}>{d.getMonth() + 1}/{d.getDate()} {wdLabel}</div>
          <div style={{ display:"flex", justifyContent:"center", gap:6, marginTop:4, flexWrap:"wrap" }}>
            {workout.muscleGroups.map(mg => (
              <span key={mg} style={{ fontSize:12, fontWeight:500, color:C.indigo, background:`${C.indigo}12`, borderRadius:6, padding:"2px 8px" }}>
                {lang === "en" ? MG_EN[mg] || mg : mg}
              </span>
            ))}
          </div>
        </div>
        <button onClick={() => setConfirmDelete(true)}
          style={{ background:"none", border:`1.5px solid ${C.red}`, borderRadius:8, padding:"5px 10px", fontSize:12, fontWeight:600, color:C.red, cursor:"pointer", flexShrink:0 }}>
          {lang === "zh" ? "刪除" : "Delete"}
        </button>
      </div>

      <div style={{ padding:"16px" }}>
        {rows.map((row, i) => {
          const it = library.find(l => l.id === row.libId);
          if (!it) return (
            <Card key={i} style={{ marginBottom:12 }}>
              <div style={{ padding:"14px 16px", display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:10, height:10, borderRadius:"50%", background:C.label, flexShrink:0 }} />
                <span style={{ fontSize:15, color:C.label, fontStyle:"italic" }}>{lang === "en" ? "(Exercise deleted from library)" : "（此動作已從動作庫刪除）"}</span>
              </div>
            </Card>
          );
          return (
            <Card key={i} style={{ marginBottom:12 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, padding:"14px 16px 12px" }}>
                <div style={{ width:10, height:10, borderRadius:"50%", background:it.color, flexShrink:0 }} />
                <span style={{ flex:1, fontSize:16, fontWeight:700, color:C.text }}>{it.name}</span>
                <button onClick={() => onOpenLibItem(it.id)} style={{ background:`${it.color}25`, border:"none", borderRadius:8, padding:"5px 12px", fontSize:12, fontWeight:600, color:it.color, cursor:"pointer" }}>{t.detailLibBtn}</button>
              </div>
              <Div />
              <div style={{ padding:"12px 16px" }}>
                <div style={{ fontSize:11, fontWeight:600, color:C.label, letterSpacing:0.4, marginBottom:6 }}>{t.detailEquip}</div>
                <textarea value={row.equipment} onChange={e => updRow(i, { equipment: e.target.value })} placeholder={t.logEquipPlaceholder}
                  style={{ width:"100%", background:C.f3, border:`1px solid ${C.sep}`, borderRadius:10, padding:"10px 12px", fontSize:13, color:C.sub, resize:"none", height:54, boxSizing:"border-box", outline:"none", fontFamily:"inherit", lineHeight:1.5 }} />
              </div>
              <Div />
              <div style={{ padding:"12px 16px" }}>
                <div style={{ fontSize:11, fontWeight:600, color:C.label, letterSpacing:0.4, marginBottom:10 }}>
                 {(row.mode || "weight_sets") === "length_pace" ? t.logLengthPaceLabel : t.detailSets}
                </div>
                {(row.mode || "weight_sets") === "length_pace"
                 ? <LengthPaceEditor lengthPace={row.lengthPace || []} onChange={lp => updRow(i, { lengthPace: lp })} />
                 : <WeightSetEditor weightSets={row.weightSets || []} onChange={ws => updRow(i, { weightSets: ws })} />}
              </div>
              <Div />
              <div style={{ padding:"12px 16px" }}>
                <div style={{ fontSize:11, fontWeight:600, color:C.orange, letterSpacing:0.4, marginBottom:2 }}>{t.detailFeeling}</div>
                <textarea value={row.feeling || ""} onChange={e => updRow(i, { feeling: e.target.value })} placeholder={t.logFeelingPlaceholder}
                  style={{ width:"100%", background:`${C.orange}08`, border:`1px solid ${C.orange}30`, borderRadius:10, padding:"10px 12px", fontSize:13, color:C.sub, resize:"none", height:64, boxSizing:"border-box", outline:"none", fontFamily:"inherit", lineHeight:1.6 }} />
              </div>
            </Card>
          );
        })}

        <button onClick={save}
          style={{ width:"100%", padding:"16px", background:C.blue, border:"none", borderRadius:16, color:"#fff", fontSize:15, fontWeight:600, cursor:"pointer", marginTop:4, boxShadow:`0 4px 16px ${C.blue}40` }}>
          {t.detailSaveEdit}
        </button>
      </div>
    </div>
  );
}

export function DayDetailTab({ dayWorkouts, library, onBack, onOpenLibItem, onEditWorkout }) {
  const lang = useLang(); const t = T[lang]; const C = useC();
  const isZh = lang === "zh";
  const [copyDone, setCopyDone] = useState(false);
  if (!dayWorkouts || dayWorkouts.length === 0) return null;

  // dayWorkouts 從 App.jsx 傳入時已是舊→新順序（已 reverse），直接使用
  const sorted = dayWorkouts;
  const d = localDate(sorted[0].date);
  const wdLabel = lang === "zh" ? WEEKDAY_CN[d.getDay()] : WEEKDAYS[d.getDay()].slice(0, 3);
  const allMGs = [...new Set(sorted.flatMap(w => w.muscleGroups))];

  const copyDay = async () => {
    const date = sorted[0].date;
    const lines = [];
    lines.push(`📋 GymReco ${date}`);
    lines.push("=".repeat(28));
    sorted.forEach((w, wi) => {
      if (sorted.length > 1) {
        lines.push(`\n${isZh ? `第 ${wi+1} 次訓練` : `Session ${wi+1}`}`);
        lines.push("-".repeat(20));
      }
      w.exercises.forEach(ex => {
        const lib = library.find(l => l.id === ex.libId);
        const name = lib ? lib.name : (isZh ? "(已刪除)" : "(Deleted)");
        const mg   = lib ? lib.muscleGroup : "";
        lines.push(`\n[${name}${mg ? ` / ${mg}` : ""}]`);
        if (ex.equipment) lines.push(`  ${isZh ? "器材" : "Equipment"}: ${ex.equipment}`);
        if ((ex.mode || "weight_sets") === "length_pace") {
          (ex.lengthPace || []).forEach((seg, i) => {
            lines.push(`  ${isZh ? "分段" : "Segment"} ${i+1}: ${fmtDistance(seg.distance)} ${seg.unit} @ ${fmtPace(seg.paceMin, seg.paceSec)}/${seg.unit}`);
          });
          const overall = ex.lengthPace && calcOverallPace(ex.lengthPace);
          if (overall) lines.push(`  ${isZh ? "整體配速" : "Overall Pace"}: ${fmtDistance(overall.totalDistance)} ${overall.unit} · ${fmtPace(overall.paceMin, overall.paceSec)}/${overall.unit}`);
        } else {
          (ex.weightSets || []).forEach((ws, i) => {
            lines.push(`  Set ${i+1}: ${ws.weight} × ${ws.reps.join("/")}`);
          });
        }
        if (ex.feeling) lines.push(`  ${isZh ? "感受" : "Feeling"}: ${ex.feeling}`);
      });
    });
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopyDone(true);
      setTimeout(() => setCopyDone(false), 2500);
    } catch(e) { console.warn("Clipboard failed:", e); }
  };

  return (
    <div style={{ flex:1, overflowY:"auto", background:C.bg }}>
      <div style={{ padding:"8px 16px 14px", background:C.card, borderBottom:`1px solid ${C.sep}`, display:"flex", alignItems:"center", gap:8 }}>
        <button onClick={onBack} style={{ background:"none", border:"none", cursor:"pointer", padding:"4px 0", color:C.blue, fontSize:16, fontWeight:500, flexShrink:0 }}>{t.detailBack}</button>
        <div style={{ flex:1, textAlign:"center" }}>
          <div style={{ fontSize:16, fontWeight:600, color:C.text }}>{d.getMonth() + 1}/{d.getDate()} {wdLabel}</div>
          <div style={{ display:"flex", justifyContent:"center", gap:6, marginTop:4, flexWrap:"wrap" }}>
            {allMGs.map(mg => (
              <span key={mg} style={{ fontSize:12, fontWeight:500, color:C.indigo, background:`${C.indigo}12`, borderRadius:6, padding:"2px 8px" }}>
                {lang === "en" ? MG_EN[mg] || mg : mg}
              </span>
            ))}
          </div>
        </div>
        <div style={{ width:46 }} />
      </div>
      <div style={{ padding:"16px" }}>
        {sorted.map((workout, wi) => (
          <div key={workout.id}>
            {sorted.length > 1 && (
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8, marginTop:wi > 0 ? 8 : 0 }}>
                <div style={{ height:1, flex:1, background:C.sep }} />
                <span style={{ fontSize:11, fontWeight:600, color:C.label, letterSpacing:0.4 }}>
                  {lang === "zh" ? `第 ${wi + 1} 次訓練` : `Session ${wi + 1}`}
                </span>
                <div style={{ height:1, flex:1, background:C.sep }} />
              </div>
            )}
            {workout.exercises.map((ex, i) => {
              const it = library.find(l => l.id === ex.libId);
              if (!it) return (
                <Card key={i} style={{ marginBottom:12 }}>
                  <div style={{ padding:"14px 16px", display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:10, height:10, borderRadius:"50%", background:C.label, flexShrink:0 }} />
                    <span style={{ fontSize:15, color:C.label, fontStyle:"italic" }}>{lang === "en" ? "(Exercise deleted)" : "（此動作已從動作庫刪除）"}</span>
                  </div>
                </Card>
              );
              return (
                <Card key={i} style={{ background:`${it.color}0C`, borderLeft:`2px solid ${it.color}60`, borderRight:`2px solid ${it.color}60`, marginBottom:15 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, padding:"14px 16px 12px" }}>
                    <div style={{ width:10, height:10, borderRadius:"50%", background:it.color, flexShrink:0 }} />
                    <span style={{ flex:1, fontSize:17, fontWeight:700, color:C.text }}>{it.name}</span>
                    <button onClick={() => onOpenLibItem(it.id)} style={{ background:`${it.color}25`, border:"none", borderRadius:8, padding:"5px 12px", fontSize:12, fontWeight:600, color:it.color, cursor:"pointer" }}>{t.detailLibBtn}</button>
                  </div>
                  {ex.equipment && (<><Div /><div style={{ padding:"10px 16px" }}><div style={{ fontSize:11, fontWeight:600, color:C.label, letterSpacing:0.4, marginBottom:4 }}>{t.detailEquip}</div><div style={{ fontSize:13, color:C.sub, lineHeight:1.6, whiteSpace:"pre-wrap" }}>{ex.equipment}</div></div></>)}
                  <Div />
                  <div style={{ padding:"10px 16px" }}>
                    <div style={{ fontSize:11, fontWeight:600, color:C.label, letterSpacing:0.4, marginBottom:10 }}>
                      {(ex.mode || "weight_sets") === "length_pace" ? t.logLengthPaceLabel : t.detailSets}
                    </div>
                    {(ex.mode || "weight_sets") === "length_pace" ? (
                      <>
                        {(ex.lengthPace || []).map((seg, si) => (
                          <div key={si} style={{ marginBottom:8 }}>
                            <span style={{ fontSize:13, fontWeight:700, color:C.text }}>{fmtDistance(seg.distance)} {seg.unit}</span>
                            <span style={{ fontSize:12, color:C.label, marginLeft:8 }}>@ {fmtPace(seg.paceMin, seg.paceSec)}/{seg.unit}</span>
                          </div>
                        ))}
                        {ex.lengthPace && calcOverallPace(ex.lengthPace) && (() => {
                          const overall = calcOverallPace(ex.lengthPace);
                          return (
                            <div style={{ fontSize:12, color:C.blue, marginTop:4 }}>
                              {t.lpOverallPace}：{fmtDistance(overall.totalDistance)} {overall.unit} · {fmtPace(overall.paceMin, overall.paceSec)}/{overall.unit}
                            </div>
                          );
                        })()}
                      </>
                    ) : (
                      (ex.weightSets || []).map((ws, wi2) => (
                        <div key={wi2} style={{ marginBottom:10 }}>
                          <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:5 }}>{ws.weight}</div>
                          <div style={{ display:"flex", flexWrap:"wrap", gap:6, paddingLeft:4 }}>
                            {ws.reps.map((r, ri) => (<div key={ri} style={{ background:C.f5, borderRadius:8, padding:"6px 14px", fontSize:15, fontWeight:600, color:C.text }}>{r}<span style={{ fontSize:11, color:C.label, marginLeft:1 }}>{t.repsUnit}</span></div>))}
                            <div style={{ display:"flex", alignItems:"center", padding:"0 6px", fontSize:13, color:C.label }}>{t.totalReps} {ws.reps.reduce((a, b) => a + b, 0)} {t.repsUnit}</div>
                          </div>
                        </div>
                      ))
                    )}                    
                  </div>
                  {it.note && (<><Div /><div style={{ padding:"10px 16px" }}><div style={{ fontSize:11, fontWeight:600, color:C.label, letterSpacing:0.4, marginBottom:2 }}>{t.detailKnowledge}</div><div style={{ fontSize:10, color:C.label, marginBottom:6 }}>{t.detailKnowledgeSub}</div><div style={{ fontSize:13, color:C.sub, lineHeight:1.7, whiteSpace:"pre-wrap", background:C.f3, borderRadius:10, padding:"10px 12px" }}>{it.note}</div></div></>)}
                  {ex.feeling && (<><Div /><div style={{ padding:"10px 16px 14px" }}><div style={{ fontSize:11, fontWeight:600, color:C.orange, letterSpacing:0.4, marginBottom:2 }}>{t.detailFeeling}</div><div style={{ fontSize:13, color:C.sub, lineHeight:1.7, whiteSpace:"pre-wrap", background:`${C.orange}08`, border:`1px solid ${C.orange}25`, borderRadius:10, padding:"10px 12px" }}>{ex.feeling}</div></div></>)}
                </Card>
              );
            })}
            <button onClick={() => onEditWorkout(workout.id)}
              style={{ width:"100%", padding:"12px", background:`${C.f3}`, borderRadius:16, border:`1px solid ${C.blue}50`, fontSize:15, fontWeight:600, color:`${C.sub}`, cursor:"pointer", marginBottom:15, boxShadow:`0 0px 8px ${C.Bshadow}` }}>
              {lang === "zh" ? "編輯此訓練" : "Edit This Session"}
            </button>
          </div>
        ))}
        
        {/* 複製本日訓練內容 — 整頁最底部，一個按鈕 */}
        <button onClick={copyDay}
          style={{
            width:"100%", padding:"13px",
            background: copyDone ? `${C.green}15` : C.f5,
            border: `1px solid ${copyDone ? C.green : C.sep}`,
            borderRadius:14, fontSize:14, fontWeight:600,
            color: copyDone ? C.green : C.label,
            cursor:"pointer", marginTop:4,
            display:"flex", alignItems:"center", justifyContent:"center", gap:8,
            transition:"all 0.2s",
          }}>
          <span>{copyDone ? "✓" : "⎘"}</span>
          <span>{copyDone ? t.copyDayDone : t.copyDayBtn}</span>
        </button>
      </div>
    </div>
  );
}
