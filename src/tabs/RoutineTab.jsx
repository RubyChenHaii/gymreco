import { useState } from "react";
import { useLang, T, MG_EN } from "../data/i18n.js";
import { MG_OPTIONS, COLOR_OPTS, ROUTINE_PERIODS, ROUTINE_MATCH_TYPES } from "../data/constants.js";
import { useC } from "../theme.js";
import { Div, Card, SLabel } from "../components/ui.jsx";
import { NumberPicker } from "../components/NumberPicker.jsx";
import { uid } from "../utils/date.js";
import { isRoutineComplete, MAX_ROUTINES } from "../utils/routineUtils.js";

const emptyForm = () => ({ period: "week", matchType: "exercise", matchValue: "", targetCount: 3 });

export function RoutineTab({ routines, setRoutines, library, workouts, homeStatPeriod, setHomeStatPeriod, onBack }) {
  const lang = useLang(); const t = T[lang]; const C = useC();
  const isZh = lang === "zh";

  const [form,        setForm]        = useState(emptyForm());
  const [editingId,   setEditingId]   = useState(null); // null = 新增模式，否則為正在編輯的規則 id
  const [showExPicker,setShowExPicker]= useState(false);
  const [exSearch,    setExSearch]    = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showHomeStatHint, setShowHomeStatHint] = useState(false);
  const [showDedupHint, setShowDedupHint] = useState(false);

  const atMax = routines.length >= MAX_ROUTINES && editingId === null;

  const periodLabel    = (p) => p === "week" ? t.routinePeriodWeek : t.routinePeriodMonth;
  const matchTypeLabel = (m) => m === "exercise" ? t.routineMatchExercise : m === "color" ? t.routineMatchColor : t.routineMatchGroup;
  const groupLabel     = (g) => isZh ? g : (MG_EN[g] || g);

  const startNew  = () => { setEditingId(null); setForm(emptyForm()); };
  const startEdit = (routine) => {
    setEditingId(routine.id);
    setForm({ period: routine.period, matchType: routine.matchType, matchValue: routine.matchValue, targetCount: routine.targetCount });
  };

  const setMatchType = (mt) => setForm(f => ({ ...f, matchType: mt, matchValue: "" }));

  const canSave = form.matchValue !== "" && form.targetCount > 0 && (editingId !== null || !atMax);

  const save = () => {
    if (!canSave) return;
    if (editingId) {
      setRoutines(p => p.map(r => r.id === editingId ? { ...r, ...form } : r));
    } else {
      setRoutines(p => [...p, { id: uid(), ...form }]);
    }
    startNew();
  };

  const doDelete = (id) => {
    setRoutines(p => p.filter(r => r.id !== id));
    if (editingId === id) startNew();
    setConfirmDeleteId(null);
  };

  const selectedExercise = form.matchType === "exercise" ? library.find(l => l.id === form.matchValue) : null;

  const filteredLib = library.filter(it =>
    !exSearch || it.name.toLowerCase().includes(exSearch.toLowerCase()) ||
    it.muscleGroup.includes(exSearch) || (MG_EN[it.muscleGroup] || "").toLowerCase().includes(exSearch.toLowerCase())
  );
  const groupedLib = filteredLib.reduce((acc, it) => { if (!acc[it.muscleGroup]) acc[it.muscleGroup] = []; acc[it.muscleGroup].push(it); return acc; }, {});

  const weekRoutines  = routines.filter(r => r.period === "week");
  const monthRoutines = routines.filter(r => r.period === "month");

  const renderRow = (routine) => {
    const result = isRoutineComplete(routine, workouts, library);
    const item = routine.matchType === "exercise" ? library.find(l => l.id === routine.matchValue) : null;
    const dotColor = routine.matchType === "color" ? routine.matchValue : (item ? item.color : null);
    const label = routine.matchType === "exercise"
      ? (item ? item.name : t.routineDeletedTag)
      : routine.matchType === "muscleGroup"
        ? groupLabel(routine.matchValue)
        : null; // color 類型不顯示文字標籤，只用色點表示
        
    return (
      <div key={routine.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 16px" }}>
        <div onClick={() => startEdit(routine)} style={{ flex:1, minWidth:0, display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}>
          {dotColor && <div style={{ width:11, height:11, borderRadius:"50%", background:dotColor, flexShrink:0 }} />}
          <div style={{ minWidth:0 }}>
            <div style={{ fontSize:14, fontWeight:600, color:C.text, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
              {matchTypeLabel(routine.matchType)}{label ? `：${label}` : ""}
            </div>
            <div style={{ fontSize:12, color:C.label, marginTop:2 }}>
              {periodLabel(routine.period)} × {routine.targetCount} {t.routineTargetUnit}
            </div>
          </div>
        </div>
        <div style={{ flexShrink:0, textAlign:"right" }}>
          {result.deleted ? (
            <span style={{ fontSize:11, fontWeight:600, color:C.label, fontStyle:"italic" }}>{t.routineDeletedTag}</span>
          ) : (
            <span style={{ fontSize:12, fontWeight:700, color: result.complete ? C.green : C.label }}>
              {result.count}/{routine.targetCount} {result.complete ? "✓" : ""}
            </span>
          )}
        </div>
        <button onClick={() => setConfirmDeleteId(routine.id)}
          style={{ background:"none", border:"none", color:C.label, fontSize:18, cursor:"pointer", padding:"0 2px", lineHeight:1, flexShrink:0 }}>×</button>
      </div>
    );
  };

  return (
    <div style={{ flex:1, overflowY:"auto", background:C.bg, display:"flex", flexDirection:"column" }}>

      {/* 刪除確認 */}
      {confirmDeleteId && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:300, padding:"20px" }}>
          <div style={{ background:C.card, borderRadius:16, padding:"24px 20px", width:"100%", maxWidth:320 }}>
            <div style={{ fontSize:17, fontWeight:700, color:C.text, marginBottom:10, textAlign:"center" }}>{t.routineDeleteConfirmTitle}</div>
            <div style={{ fontSize:14, color:C.sub, marginBottom:20, textAlign:"center", lineHeight:1.6 }}>{t.routineDeleteConfirmMsg}</div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setConfirmDeleteId(null)} style={{ flex:1, padding:"12px", background:C.f5, border:"none", borderRadius:12, fontSize:15, fontWeight:600, color:C.sub, cursor:"pointer" }}>{t.confirmCancel}</button>
              <button onClick={() => doDelete(confirmDeleteId)} style={{ flex:1, padding:"12px", background:C.red, border:"none", borderRadius:12, fontSize:15, fontWeight:600, color:"#fff", cursor:"pointer" }}>{t.confirmProceed}</button>
            </div>
          </div>
        </div>
      )}

      {/* 動作選擇 Bottom Sheet */}
      {showExPicker && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", display:"flex", flexDirection:"column", zIndex:200 }}
          onClick={e => { if (e.target === e.currentTarget) { setShowExPicker(false); setExSearch(""); } }}>
          <div style={{ marginTop:"auto", background:C.card, borderRadius:"20px 20px 0 0", maxHeight:"75vh", display:"flex", flexDirection:"column" }}>
            <div style={{ display:"flex", justifyContent:"center", padding:"10px 0 4px" }}>
              <div style={{ width:36, height:4, borderRadius:2, background:C.sep }} />
            </div>
            <div style={{ padding:"8px 20px 14px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:`1px solid ${C.sep}` }}>
              <span style={{ fontSize:17, fontWeight:600, color:C.text }}>{t.routineMatchExercise}</span>
              <button onClick={() => { setShowExPicker(false); setExSearch(""); }} style={{ background:C.f5, border:"none", borderRadius:"50%", width:28, height:28, color:C.label, fontSize:16, cursor:"pointer" }}>×</button>
            </div>
            <div style={{ padding:"12px 16px", borderBottom:`1px solid ${C.sep}` }}>
              <input value={exSearch} onChange={e => setExSearch(e.target.value)} placeholder={t.routineSearchExercise}
                style={{ width:"100%", background:C.bg, border:`1px solid ${C.sep}`, borderRadius:10, padding:"10px 14px", fontSize:15, color:C.text, boxSizing:"border-box", outline:"none", fontFamily:"inherit" }} />
            </div>
            <div style={{ overflowY:"auto", paddingBottom:20 }}>
              {Object.entries(groupedLib).map(([mg, items]) => (
                <div key={mg}>
                  <div style={{ padding:"12px 20px 6px", fontSize:11, fontWeight:600, color:C.label, letterSpacing:0.5 }}>{groupLabel(mg)}</div>
                  {items.map((it, i) => (
                    <div key={it.id}>
                      {i > 0 && <Div left={20} />}
                      <button onClick={() => { setForm(f => ({ ...f, matchValue: it.id })); setShowExPicker(false); setExSearch(""); }}
                        style={{ display:"flex", alignItems:"center", gap:12, width:"100%", padding:"13px 20px", background:"none", border:"none", cursor:"pointer", textAlign:"left" }}>
                        <div style={{ width:10, height:10, borderRadius:"50%", background:it.color, flexShrink:0 }} />
                        <span style={{ flex:1, fontSize:16, color:C.text }}>{it.name}</span>
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{ padding:"8px 16px 14px", background:C.card, borderBottom:`1px solid ${C.sep}`, display:"flex", alignItems:"center", gap:8 }}>
        <button onClick={onBack} style={{ background:"none", border:"none", cursor:"pointer", padding:"4px 0", color:C.blue, fontSize:16, fontWeight:500, flexShrink:0 }}>{t.detailBack}</button>
        <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
          <span style={{ fontSize:20, fontWeight:700, color:C.text }}>{t.routineTitle}</span>
          <button onClick={() => setShowDedupHint(v => !v)}
            style={{ width:20, height:20, borderRadius:"50%", background:`${C.blue}25`, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", padding:0, flexShrink:0 }}>
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke={C.blue} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="13" x2="12" y2="18"/>
              <circle cx="12" cy="7.5" r="1.5" fill={C.blue} stroke="none"/>
            </svg>
          </button>
        </div>
        <div style={{ width:25 }} />
      </div>
      {showDedupHint && (
        <div style={{ fontSize:12, color:C.blue, opacity:0.85, textAlign:"center", padding:"12px 16px 12px", background:C.card, whiteSpace:"pre-line", lineHeight:1.8 }}>
          {t.routineDedupHint}
        </div>
      )}
      
      <div style={{ padding:"16px" }}>
        <div style={{ borderBottom:`1px solid ${C.sub}20`, paddingBottom:5, marginBottom:20 }}>
          {/* 週規律 */}
          <SLabel>{t.routineWeekGroup}</SLabel>
          <Card style={{ marginBottom:15 }}>
            {weekRoutines.length === 0
              ? <div style={{ padding:"24px", textAlign:"center", color:C.label, fontSize:13 }}>{t.routineEmpty}</div>
              : weekRoutines.map((r, i) => (<div key={r.id}>{i > 0 && <Div left={16} />}{renderRow(r)}</div>))}
          </Card>

          {/* 月規律 */}
          <SLabel>{t.routineMonthGroup}</SLabel>
          <Card style={{ marginBottom:15 }}>
            {monthRoutines.length === 0
              ? <div style={{ padding:"24px", textAlign:"center", color:C.label, fontSize:13 }}>{t.routineEmpty}</div>
              : monthRoutines.map((r, i) => (<div key={r.id}>{i > 0 && <Div left={16} />}{renderRow(r)}</div>))}
          </Card>
        </div>

        {/* 新增規律 */}
        <Card style={{ padding:"16px", marginBottom:20 }}>
          <div style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:14 }}>
            {editingId ? t.routineEdit : t.routineNew}
          </div>

          <div style={{ fontSize:11, fontWeight:600, color:C.label, letterSpacing:0.4, marginBottom:8 }}>{t.routinePeriodLabel}</div>
          <div style={{ display:"flex", gap:8, marginBottom:16 }}>
            {ROUTINE_PERIODS.map(p => (
              <button key={p} onClick={() => setForm(f => ({ ...f, period: p }))}
                style={{ flex:1, background:form.period===p?C.blue:"none", border:`1px solid ${form.period===p?C.blue:C.sep}`, borderRadius:10, padding:"9px 10px", fontSize:13, fontWeight:600, color:form.period===p?"#fff":C.sub, cursor:"pointer" }}>
                {periodLabel(p)}
              </button>
            ))}
          </div>

          <div style={{ fontSize:11, fontWeight:600, color:C.label, letterSpacing:0.4, marginBottom:8 }}>{t.routineMatchTypeLabel}</div>
          <div style={{ display:"flex", gap:8, marginBottom:14 }}>
            {ROUTINE_MATCH_TYPES.map(m => (
              <button key={m} onClick={() => setMatchType(m)}
                style={{ flex:1, background:form.matchType===m?C.blue:"none", border:`1px solid ${form.matchType===m?C.blue:C.sep}`, borderRadius:10, padding:"9px 8px", fontSize:12, fontWeight:600, color:form.matchType===m?"#fff":C.sub, cursor:"pointer" }}>
                {matchTypeLabel(m)}
              </button>
            ))}
          </div>

          {form.matchType === "exercise" && (
            <button onClick={() => setShowExPicker(true)}
              style={{ width:"100%", display:"flex", alignItems:"center", gap:10, background:C.f5, border:`1px solid ${C.sep}`, borderRadius:10, padding:"11px 12px", marginBottom:16, cursor:"pointer", boxSizing:"border-box" }}>
              {selectedExercise
                ? <><div style={{ width:10, height:10, borderRadius:"50%", background:selectedExercise.color, flexShrink:0 }} /><span style={{ fontSize:14, fontWeight:600, color:C.text }}>{selectedExercise.name}</span></>
                : <span style={{ fontSize:14, color:C.label }}>{t.routinePickExercisePlaceholder}</span>}
              <span style={{ marginLeft:"auto", color:C.label, fontSize:14 }}>›</span>
            </button>
          )}

          {form.matchType === "color" && (
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:16 }}>
              {COLOR_OPTS.map(col => (
                <button key={col} onClick={() => setForm(f => ({ ...f, matchValue: col }))}
                  style={{ width:30, height:30, borderRadius:"50%", background:col, border:form.matchValue===col?`3px solid ${C.text}`:"3px solid transparent", cursor:"pointer", padding:0, boxSizing:"border-box" }} />
              ))}
            </div>
          )}

          {form.matchType === "muscleGroup" && (
            <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:16 }}>
              {MG_OPTIONS.map(mg => (
                <button key={mg} onClick={() => setForm(f => ({ ...f, matchValue: mg }))}
                  style={{ background:form.matchValue===mg?C.blue:"none", border:`1px solid ${form.matchValue===mg?C.blue:C.sep}`, borderRadius:20, padding:"5px 12px", fontSize:13, color:form.matchValue===mg?"#fff":C.sub, cursor:"pointer" }}>
                  {groupLabel(mg)}
                </button>
              ))}
            </div>
          )}

          <div style={{ fontSize:11, fontWeight:600, color:C.label, letterSpacing:0.4, marginBottom:8 }}>{t.routineTargetLabel}</div>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
            <NumberPicker value={form.targetCount} onChange={v => setForm(f => ({ ...f, targetCount: v }))} min={1} max={30} width={52} />
            <span style={{ fontSize:13, color:C.label }}>{t.routineTargetUnit}</span>
          </div>

          {atMax && <div style={{ fontSize:12, color:C.orange, marginBottom:12, lineHeight:1.6 }}>{t.routineMaxReached}</div>}

          <div style={{ display:"flex", gap:8 }}>
            <button onClick={save} disabled={!canSave}
              style={{ flex:1, padding:"11px", background:canSave?C.blue:"#C7C7CC", border:"none", borderRadius:12, color:"#fff", fontSize:14, fontWeight:600, cursor:canSave?"pointer":"not-allowed" }}>
              {t.routineSave}
            </button>
            {editingId && (
              <button onClick={startNew}
                style={{ padding:"11px 16px", background:"none", border:`1px solid ${C.sep}`, borderRadius:12, color:C.sub, fontSize:14, fontWeight:600, cursor:"pointer" }}>
                {t.routineCancelEdit}
              </button>
            )}
          </div>
        </Card>

        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:showHomeStatHint?4:8, paddingLeft:2 }}>
          <span style={{ fontSize:12, fontWeight:500, color:C.label, letterSpacing:0.4, textTransform:"uppercase" }}>{t.homeStatSectionTitle}</span>
          <button onClick={() => setShowHomeStatHint(v => !v)}
            style={{ width:16, height:16, borderRadius:"50%", background:`${C.blue}25`, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", padding:0, flexShrink:0 }}>
            <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke={C.blue} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="13" x2="12" y2="18"/>
              <circle cx="12" cy="7.5" r="1.5" fill={C.blue} stroke="none"/>
            </svg>
          </button>
        </div>
        {showHomeStatHint && (
          <div style={{ fontSize:11, color:C.blue, opacity:0.85, marginBottom:8, paddingLeft:2 }}>{t.homeStatSectionHint}</div>
        )}
        <div style={{ display:"flex", gap:8, marginBottom:20 }}>
          {ROUTINE_PERIODS.map(p => (
            <button key={p} onClick={() => setHomeStatPeriod(p)}
              style={{ flex:1, background:homeStatPeriod===p?C.blue:"none", border:`1px solid ${homeStatPeriod===p?C.blue:C.sep}`, borderRadius:10, padding:"9px 10px", fontSize:13, fontWeight:600, color:homeStatPeriod===p?"#fff":C.sub, cursor:"pointer" }}>
              {periodLabel(p)}
            </button>
          ))}
        </div>
        
        
      </div>
    </div>
  );
}
