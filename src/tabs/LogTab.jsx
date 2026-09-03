import { useState } from "react";
import { useLang, T, MG_EN } from "../data/i18n.js";
import { MG_OPTIONS, COLOR_OPTS, WEEKDAYS, WEEKDAY_CN, MONTHS_EN, RECORDING_MODES } from "../data/constants.js";
import { useC } from "../theme.js";
import { todayStr, localDate, uid } from "../utils/date.js";
import { Div, Card } from "../components/ui.jsx";
import { WeightSetEditor } from "../components/WeightSetEditor.jsx";
import { LengthPaceEditor } from "../components/LengthPaceEditor.jsx";
import { isRoutineComplete } from "../utils/routineUtils.js";

// LogTab 內嵌的規則總覽區塊：週/月分組顯示已建立規則的達標進度，並提供「+ 新增規則」入口
// 點擊任一規則列或「+ 新增規則」都會導向 RoutineTab 全螢幕畫面進行實際管理（新增/編輯/刪除）
function RoutineOverview({ routines, library, workouts, onOpenRoutines, t, C, lang }) {
  const groupLabel = (g) => lang === "zh" ? g : (MG_EN[g] || g);

  const weekRoutines  = routines.filter(r => r.period === "week");
  const monthRoutines = routines.filter(r => r.period === "month");

  const Row = ({ routine }) => {
    const result = isRoutineComplete(routine, workouts, library);
    const item = routine.matchType === "exercise" ? library.find(l => l.id === routine.matchValue) : null;
    const dotColor = routine.matchType === "color" ? routine.matchValue : (item ? item.color : null);
    const label = routine.matchType === "exercise"
      ? (item ? item.name : t.routineDeletedTag)
      : routine.matchType === "muscleGroup"
        ? groupLabel(routine.matchValue)
        : null;
    return (
      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 16px" }}>
        {dotColor && <div style={{ width:10, height:10, borderRadius:"50%", background:dotColor, flexShrink:0 }} />}
        <div style={{ flex:1, minWidth:0, fontSize:13, fontWeight:600, color:C.text, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
          {(routine.matchType === "exercise" ? t.routineMatchExercise : routine.matchType === "color" ? t.routineMatchColor : t.routineMatchGroup)}
          {label ? `：${label}` : ""}
        </div>
        {result.deleted ? (
          <span style={{ fontSize:11, fontWeight:600, color:C.label, fontStyle:"italic", flexShrink:0 }}>{t.routineDeletedTag}</span>
        ) : (
          <span style={{ fontSize:12, fontWeight:700, color: result.complete ? C.green : C.label, flexShrink:0 }}>
            {result.count}/{routine.targetCount} {result.complete ? "✓" : ""}
          </span>
        )}
      </div>
    );
  };

  if (routines.length === 0) {
    return (
      <Card onClick={onOpenRoutines} style={{ marginBottom:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 16px" }}>
          <span style={{ fontSize:14, fontWeight:700, color:C.text }}>{t.routineTitle}</span>
          <span style={{ color:C.label, fontSize:12, fontWeight:300 }}>{t.routineAddEntry}</span>
        </div>
      </Card>
    );
  }

  return (
    <div onClick={onOpenRoutines} style={{ marginBottom:16, cursor:"pointer" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8, paddingLeft:2 }}>
        <span style={{ fontSize:12, fontWeight:500, color:C.label, letterSpacing:0.4, textTransform:"uppercase" }}>{t.routineTitle}</span>
        <span style={{ color:C.label, fontSize:12, fontWeight:300 }}>{t.routineAddEntry}</span>
      </div>
      {weekRoutines.length > 0 && (
        <Card style={{ marginBottom:10, cursor:"pointer" }}>
          <div style={{ padding:"8px 16px 2px", fontSize:11, fontWeight:600, color:C.label }}>{t.routineWeekGroup}</div>
          {weekRoutines.map((r, i) => (<div key={r.id}>{i > 0 && <Div left={16} />}<Row routine={r} /></div>))}
        </Card>
      )}
      {monthRoutines.length > 0 && (
        <Card style={{ cursor:"pointer" }}>
          <div style={{ padding:"8px 16px 2px", fontSize:11, fontWeight:600, color:C.label }}>{t.routineMonthGroup}</div>
          {monthRoutines.map((r, i) => (<div key={r.id}>{i > 0 && <Div left={16} />}<Row routine={r} /></div>))}
        </Card>
      )}
    </div>
  );
}

export function LogTab({ library, routines, workouts, onSave, onAddToLibrary, showToast, onOpenRoutines }) {
  const lang = useLang(); const t = T[lang]; const C = useC();
  const [muscleGroups,    setMG]            = useState([]);
  const [showMGPicker,    setShowMG]        = useState(false);
  const [rows,            setRows]          = useState([]);
  const [showLibPicker,   setShowLib]       = useState(false);
  const [libSearch,       setLibSearch]     = useState("");
  const [selectedDate,    setSelectedDate]  = useState(todayStr());
  const [showDatePicker,  setShowDatePicker]= useState(false);

  // 新增動作 sheet 狀態
  const [showAddNew,   setShowAddNew]  = useState(false);
  const [newName,      setNewName]     = useState("");
  const [newMG,        setNewMG]       = useState(MG_OPTIONS[0]);
  const [newColor,     setNewColor]    = useState(COLOR_OPTS[0]);
  const [newRecMode,   setNewRecMode]  = useState(RECORDING_MODES[0]);

  const addRow = (libId) => {
    const item = library.find(l => l.id === libId);
    const mode  = item?.recordingMode || "weight_sets";  // 舊資料無此欄位 → 視為 weight_sets
    const lastH = item?.history.length > 0 ? item.history[item.history.length - 1] : null;
    // equipment 是兩種 mode 共用的欄位（跟資料結構無關），永遠沿用最近一次紀錄；
    // 只有 weightSets/lengthPace 這種「跟 mode 綁定」的資料，才需要比對 mode 是否一致才帶入
    const modeMatches = lastH && (lastH.mode || "weight_sets") === mode;
    setRows(p => [...p, {
      libId,
      mode,
      equipment:  lastH?.equipment || "",
      weightSets: mode === "weight_sets"
        ? (modeMatches && lastH.weightSets ? JSON.parse(JSON.stringify(lastH.weightSets)) : [{ weight:"", reps:[10,10,10] }])
        : [{ weight:"", reps:[10,10,10] }],   // 保留預設值以防之後切換模式時欄位不存在
      lengthPace: mode === "length_pace"
        ? (modeMatches && lastH.lengthPace ? JSON.parse(JSON.stringify(lastH.lengthPace)) : [{ distance:0, unit:"km", paceMin:0, paceSec:0 }])
        : [{ distance:0, unit:"km", paceMin:0, paceSec:0 }],
      feeling:    "",
      noteLocal:  item?.note || "",
      noteDirty:  false,
    }]);
    setShowLib(false); setLibSearch("");
  };

  const handleAddNew = () => {
    if (!newName.trim()) return;
    const newItem = { id: uid(), name: newName.trim(), muscleGroup: newMG, color: newColor, recordingMode: newRecMode, note:"", history:[] };
    onAddToLibrary(newItem);
    // 新增後直接加入本次訓練
    setRows(p => [...p, {
      libId: newItem.id,
      mode: newRecMode,
      equipment: "",
      weightSets: [{ weight:"", reps:[10,10,10] }],
      lengthPace: [{ distance:0, unit:"km", paceMin:0, paceSec:0 }],
      feeling: "",
      noteLocal: "",
      noteDirty: false,
    }]);
    setNewName(""); setNewMG(MG_OPTIONS[0]); setNewColor(COLOR_OPTS[0]); setNewRecMode(RECORDING_MODES[0]);
    setShowAddNew(false); setShowLib(false); setLibSearch("");
  };

  const upd = (i, patch) => setRows(p => p.map((r, j) => j === i ? { ...r, ...patch } : r));
  const del = (i) => setRows(p => p.filter((_, j) => j !== i));

  const filteredLib = library.filter(it => !libSearch || it.name.includes(libSearch) || it.muscleGroup.includes(libSearch) || (lang === "en" && (MG_EN[it.muscleGroup] || "").toLowerCase().includes(libSearch.toLowerCase())));
  const grouped = filteredLib.reduce((acc, it) => { if (!acc[it.muscleGroup]) acc[it.muscleGroup] = []; acc[it.muscleGroup].push(it); return acc; }, {});

  const handleSave = () => {
    if (rows.length === 0) { showToast(t.atLeastOne); return; }
    const sd = localDate(selectedDate);
    const workout = {
      id: uid(), date: selectedDate, weekday: WEEKDAYS[sd.getDay()],
      muscleGroups: muscleGroups.length > 0 ? muscleGroups : [...new Set(rows.map(r => library.find(l => l.id === r.libId)?.muscleGroup).filter(Boolean))],
      exercises: rows.map(r => ({
       libId: r.libId,
       mode: r.mode,
       equipment: r.equipment,
       ...(r.mode === "length_pace" ? { lengthPace: r.lengthPace } : { weightSets: r.weightSets }),
       feeling: r.feeling,
     })),
    };
    const noteUpdates = rows.filter(r => r.noteDirty).map(r => ({ libId: r.libId, note: r.noteLocal }));
    setRows([]); setMG([]); setSelectedDate(todayStr());
    setTimeout(() => onSave(workout, noteUpdates), 0);
  };

  const sd = localDate(selectedDate);
  const isToday = selectedDate === todayStr();
  const dateLabel = lang === "zh"
    ? `${sd.getMonth() + 1}/${sd.getDate()} ${WEEKDAY_CN[sd.getDay()]}`
    : `${sd.getMonth() + 1}/${sd.getDate()} ${WEEKDAYS[sd.getDay()].slice(0, 3)}`;

  return (
    <div style={{ flex:1, overflowY:"auto", background:C.bg }}>
      {/* 日期選擇器 Sheet */}
      {showDatePicker && (() => {
        const today = localDate(todayStr());
        const days = Array.from({ length:10 }, (_, i) => {
          const d = new Date(today); d.setDate(today.getDate() - (i + 1)); return d;
        });
        return (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", display:"flex", flexDirection:"column", zIndex:200 }}
            onClick={e => { if (e.target === e.currentTarget) setShowDatePicker(false); }}>
            <div style={{ marginTop:"auto", background:C.card, borderRadius:"20px 20px 0 0", maxHeight:"70vh", display:"flex", flexDirection:"column" }}>
              <div style={{ display:"flex", justifyContent:"center", padding:"12px 0 4px" }}>
                <div style={{ width:36, height:4, borderRadius:2, background:C.sep }} />
              </div>
              <div style={{ padding:"8px 20px 12px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:`1px solid ${C.sep}` }}>
                <span style={{ fontSize:17, fontWeight:700, color:C.text }}>{lang === "zh" ? "選擇日期" : "Select Date"}</span>
                <button onClick={() => setShowDatePicker(false)} style={{ background:C.f5, border:"none", borderRadius:"50%", width:28, height:28, color:C.label, fontSize:16, cursor:"pointer" }}>×</button>
              </div>
              <div style={{ overflowY:"auto", padding:"8px 16px 32px" }}>
                <div style={{ fontSize:12, color:C.label, textAlign:"center", padding:"8px 0 12px", lineHeight:1.6 }}>
                  {lang === "zh" ? "補登日期僅限前 10 日之內" : "Back-logging is limited to the past 10 days"}
                </div>
                {days.map(d => {
                  const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                  const isSelected = ds === selectedDate;
                  const isT = ds === todayStr();
                  const dow = d.getDay();
                  const label = lang === "zh"
                    ? `${d.getMonth() + 1}月${d.getDate()}日　${WEEKDAY_CN[dow]}`
                    : `${MONTHS_EN[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}　${WEEKDAYS[dow].slice(0, 3)}`;
                  return (
                    <button key={ds} onClick={() => { setSelectedDate(ds); setShowDatePicker(false); }}
                      style={{ width:"100%", padding:"13px 16px", marginBottom:4, background:isSelected?C.blue:C.f5, border:isSelected?"none":`1px solid ${C.sep}`, borderRadius:12, cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", boxSizing:"border-box" }}>
                      <span style={{ fontSize:15, fontWeight:isSelected?700:400, color:isSelected?"#fff":C.text }}>{label}</span>
                      {isT && <span style={{ fontSize:11, fontWeight:600, color:isSelected?"rgba(255,255,255,0.8)":C.blue, background:isSelected?"rgba(255,255,255,0.2)":`${C.blue}15`, borderRadius:6, padding:"2px 8px" }}>
                        {lang === "zh" ? "今天" : "Today"}
                      </span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      <div style={{ padding:"8px 20px 14px", background:C.card, borderBottom:`1px solid ${C.sep}`, display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
        <div>
          <div style={{ fontSize:13, color:C.label, marginBottom:1 }}>{t.logSubtitle}</div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ fontSize:20, fontWeight:700, color:C.text, letterSpacing:-0.3 }}>{dateLabel}</div>
            {!isToday && <span style={{ fontSize:11, fontWeight:600, color:C.orange, background:`${C.orange}15`, borderRadius:6, padding:"2px 8px" }}>{lang === "zh" ? "補登" : "Back-log"}</span>}
          </div>
        </div>
        <button onClick={() => setShowDatePicker(true)}
          style={{ background:C.f5, border:`1px solid ${C.sep}`, borderRadius:10, padding:"6px 12px", fontSize:13, color:C.sub, cursor:"pointer", marginBottom:4, fontWeight:500 }}>
          {lang === "zh" ? "更改日期" : "Change Date"}
        </button>
      </div>

      <div style={{ padding:"16px" }}>
        <RoutineOverview routines={routines} library={library} workouts={workouts} onOpenRoutines={onOpenRoutines} t={t} C={C} lang={lang} />
        {rows.map((row, i) => {
          const item = library.find(l => l.id === row.libId);
          if (!item) return null;
          const mgLabel = lang === "en" ? MG_EN[item.muscleGroup] || item.muscleGroup : item.muscleGroup;
          return (
            <Card key={i} style={{ background:`${item.color}0C`, borderTop:`2px dashed ${item.color}50`, borderBottom:`2px dashed ${item.color}50`, marginBottom:15 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, padding:"14px 16px 12px" }}>
                <div style={{ width:10, height:10, borderRadius:"50%", background:item.color, flexShrink:0 }} />
                <span style={{ flex:1, fontSize:16, fontWeight:700, color:C.text }}>{item.name}</span>
                <span style={{ fontSize:11, color:item.color, background:`${item.color}15`, borderRadius:6, padding:"2px 8px", fontWeight:600 }}>{mgLabel}</span>
                <button onClick={() => del(i)} style={{ background:"none", border:"none", cursor:"pointer", color:C.red, fontSize:13, fontWeight:500 }}>{t.logRemove}</button>
              </div>
              <Div />
              <div style={{ padding:"12px 16px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                  <div style={{ fontSize:11, fontWeight:600, color:C.label, letterSpacing:0.4 }}>{t.logEquipLabel}</div>
                  {row.equipment && <div style={{ fontSize:10, color:C.blue, background:`${C.blue}10`, borderRadius:6, padding:"2px 8px" }}>{t.logEquipHint}</div>}
                </div>
                <textarea value={row.equipment} onChange={e => upd(i, { equipment: e.target.value })} placeholder={t.logEquipPlaceholder}
                  style={{ width:"100%", background:C.f3, border:`1px solid ${C.sep}`, borderRadius:10, padding:"10px 12px", fontSize:13, color:C.sub, resize:"none", height:54, boxSizing:"border-box", outline:"none", fontFamily:"inherit", lineHeight:1.5 }} />
              </div>
              <Div />
              <div style={{ padding:"12px 16px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                  <div style={{ fontSize:11, fontWeight:600, color:C.label, letterSpacing:0.4 }}>
                    {row.mode === "length_pace" ? t.logLengthPaceLabel : t.logSetsLabel}
                  </div>
                  {row.mode === "length_pace"
                    ? (row.lengthPace || []).some(lp => lp.distance) && <div style={{ fontSize:10, color:C.blue, background:`${C.blue}10`, borderRadius:6, padding:"2px 8px" }}>{t.logSetsHint}</div>
                    : (row.weightSets || []).some(ws => ws.weight) && <div style={{ fontSize:10, color:C.blue, background:`${C.blue}10`, borderRadius:6, padding:"2px 8px" }}>{t.logSetsHint}</div>}
                </div>
                {row.mode === "length_pace"
                  ? <LengthPaceEditor lengthPace={row.lengthPace} onChange={lp => upd(i, { lengthPace: lp })} />
                  : <WeightSetEditor weightSets={row.weightSets} onChange={ws => upd(i, { weightSets: ws })} />}
              </div>
              <Div />
              <div style={{ padding:"12px 16px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:4 }}>
                  <div>
                    <div style={{ fontSize:11, fontWeight:600, color:C.label, letterSpacing:0.4 }}>{t.logKnowledgeLabel}</div>
                    <div style={{ fontSize:10, color:C.label, marginTop:1 }}>{t.logKnowledgeSub}</div>
                  </div>
                  {row.noteDirty && <span style={{ fontSize:10, color:C.orange, fontWeight:600, background:`${C.orange}15`, borderRadius:6, padding:"2px 8px" }}>{t.logKnowledgeDirty}</span>}
                </div>
                <textarea value={row.noteLocal} onChange={e => upd(i, { noteLocal: e.target.value, noteDirty: true })} placeholder={t.logKnowledgePlaceholder}
                  style={{ width:"100%", background:C.f3, border:`1px solid ${C.sep}`, borderRadius:10, padding:"10px 12px", fontSize:13, color:C.sub, resize:"none", height:90, boxSizing:"border-box", outline:"none", fontFamily:"inherit", lineHeight:1.6 }} />
              </div>
              <Div />
              <div style={{ padding:"12px 16px" }}>
                <div style={{ fontSize:11, fontWeight:600, color:C.orange, letterSpacing:0.4, marginBottom:2 }}>{t.logFeelingLabel}</div>
                <div style={{ fontSize:10, color:C.label, marginBottom:6 }}>{t.logFeelingSub}</div>
                <textarea value={row.feeling} onChange={e => upd(i, { feeling: e.target.value })} placeholder={t.logFeelingPlaceholder}
                  style={{ width:"100%", background:`${C.orange}08`, border:`1px solid ${C.orange}30`, borderRadius:10, padding:"10px 12px", fontSize:13, color:C.sub, resize:"none", height:64, boxSizing:"border-box", outline:"none", fontFamily:"inherit", lineHeight:1.6 }} />
              </div>
            </Card>
          );
        })}

        <button onClick={() => setShowLib(true)}
          style={{ width:"100%", padding:"15px", background:C.card, border:`2px dashed ${C.sep}`, borderRadius:16, color:C.blue, fontSize:15, fontWeight:600, cursor:"pointer", marginBottom:12, display:"flex", alignItems:"center", justifyContent:"center", gap:6, boxSizing:"border-box" }}>
          {t.logAddExercise}
        </button>
        <button onClick={handleSave} disabled={rows.length === 0}
          style={{ width:"100%", padding:"16px", background:rows.length>0?C.blue:"#C7C7CC", border:"none", borderRadius:16, color:"#fff", fontSize:17, fontWeight:600, cursor:rows.length>0?"pointer":"not-allowed", boxShadow:rows.length>0?"0 4px 16px rgba(0,122,255,0.3)":"none" }}>
          {t.logSave}
        </button>
      </div>

      {/* Library picker sheet */}
      {showLibPicker && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", display:"flex", flexDirection:"column", zIndex:200 }}
          onClick={e => { if (e.target === e.currentTarget) { setShowLib(false); setLibSearch(""); } }}>
          <div style={{ marginTop:"auto", background:C.card, borderRadius:"20px 20px 0 0", maxHeight:"75vh", display:"flex", flexDirection:"column" }}>
            <div style={{ display:"flex", justifyContent:"center", padding:"10px 0 4px" }}>
              <div style={{ width:36, height:4, borderRadius:2, background:"#C7C7CC" }} />
            </div>
            <div style={{ padding:"8px 20px 14px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:`1px solid ${C.sep}` }}>
              <span style={{ fontSize:17, fontWeight:600, color:C.text }}>{t.logPickerTitle}</span>
              <button onClick={() => { setShowLib(false); setLibSearch(""); }} style={{ background:C.f5, border:"none", borderRadius:"50%", width:28, height:28, color:C.label, fontSize:16, cursor:"pointer" }}>×</button>
            </div>
            <div style={{ padding:"12px 16px", borderBottom:`1px solid ${C.sep}` }}>
              <input value={libSearch} onChange={e => setLibSearch(e.target.value)} placeholder={t.logPickerSearch}
                style={{ width:"100%", background:C.bg, border:`1px solid ${C.sep}`, borderRadius:10, padding:"10px 14px", fontSize:15, color:C.text, boxSizing:"border-box", outline:"none", fontFamily:"inherit" }} />
            </div>
            <div style={{ overflowY:"auto", paddingBottom:20 }}>
              {/* 新增動作按鈕 */}
              <button onClick={() => setShowAddNew(true)}
                style={{ display:"flex", alignItems:"center", gap:12, width:"100%", padding:"14px 20px", background:"none", border:"none", borderBottom:`1px solid ${C.sep}`, cursor:"pointer", textAlign:"left" }}>
                <div style={{ width:28, height:28, borderRadius:"50%", background:`${C.blue}15`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <span style={{ color:C.blue, fontSize:18, lineHeight:1 }}>+</span>
                </div>
                <span style={{ fontSize:15, fontWeight:600, color:C.blue }}>{t.logAddNew}</span>
              </button>

              {Object.entries(grouped).map(([mg, items]) => (
                <div key={mg}>
                  <div style={{ padding:"12px 20px 6px", fontSize:11, fontWeight:600, color:C.label, letterSpacing:0.5 }}>
                    {lang === "en" ? MG_EN[mg] || mg : mg}
                  </div>
                  {items.map((it, i) => (
                    <div key={it.id}>
                      {i > 0 && <Div left={20} />}
                      <button onClick={() => addRow(it.id)}
                        style={{ display:"flex", alignItems:"center", gap:12, width:"100%", padding:"13px 20px", background:"none", border:"none", cursor:"pointer", textAlign:"left" }}>
                        <div style={{ width:10, height:10, borderRadius:"50%", background:it.color, flexShrink:0 }} />
                        <span style={{ flex:1, fontSize:16, color:C.text }}>{it.name}</span>
                        {it.history.length > 0 && <span style={{ fontSize:11, color:C.label }}>{t.logLastSeen} {it.history[it.history.length - 1].date}</span>}
                        <span style={{ color:C.blue, fontSize:20, lineHeight:1 }}>+</span>
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 新增動作 sheet */}
      {showAddNew && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", display:"flex", flexDirection:"column", zIndex:300 }}
          onClick={e => { if (e.target === e.currentTarget) setShowAddNew(false); }}>
          <div style={{ marginTop:"auto", background:C.card, borderRadius:"20px 20px 0 0", maxHeight:"80vh", display:"flex", flexDirection:"column" }}>
            <div style={{ display:"flex", justifyContent:"center", padding:"12px 0 4px" }}>
              <div style={{ width:36, height:4, borderRadius:2, background:C.sep }} />
            </div>
            <div style={{ padding:"8px 20px 14px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:`1px solid ${C.sep}` }}>
              <span style={{ fontSize:17, fontWeight:700, color:C.text }}>{t.logAddNewTitle}</span>
              <button onClick={() => setShowAddNew(false)} style={{ background:C.f5, border:"none", borderRadius:"50%", width:28, height:28, color:C.label, fontSize:16, cursor:"pointer" }}>×</button>
            </div>
            <div style={{ overflowY:"auto", padding:"16px 20px 32px" }}>
              <div style={{ fontSize:11, fontWeight:600, color:C.label, letterSpacing:0.4, marginBottom:6 }}>{t.addName}</div>
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder={t.addName}
                style={{ width:"100%", background:C.f5, border:`1px solid ${C.sep}`, borderRadius:10, padding:"10px 12px", fontSize:15, color:C.text, boxSizing:"border-box", outline:"none", fontFamily:"inherit", marginBottom:16 }} />

              <div style={{ fontSize:11, fontWeight:600, color:C.label, letterSpacing:0.4, marginBottom:8 }}>{t.recModeLabel}</div>
              <div style={{ display:"flex", gap:8, marginBottom:16 }}>
                {RECORDING_MODES.map(m => (
                  <button key={m} onClick={() => setNewRecMode(m)}
                    style={{ flex:1, background:newRecMode===m?C.blue:"none", border:`1px solid ${newRecMode===m?C.blue:C.sep}`, borderRadius:10, padding:"10px 12px", fontSize:13, fontWeight:600, color:newRecMode===m?"#fff":C.sub, cursor:"pointer" }}>
                    {m === "weight_sets" ? t.recModeWeightSets : t.recModeLengthPace}
                  </button>
                ))}
              </div>

              <div style={{ fontSize:11, fontWeight:600, color:C.label, letterSpacing:0.4, marginBottom:8 }}>{t.addMuscle}</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:16 }}>
                {MG_OPTIONS.map(mg => (
                  <button key={mg} onClick={() => setNewMG(mg)}
                    style={{ background:newMG===mg?C.blue:"none", border:`1px solid ${newMG===mg?C.blue:C.sep}`, borderRadius:20, padding:"5px 12px", fontSize:13, color:newMG===mg?"#fff":C.sub, cursor:"pointer" }}>
                    {lang === "en" ? MG_EN[mg] || mg : mg}
                  </button>
                ))}
              </div>

              <div style={{ fontSize:11, fontWeight:600, color:C.label, letterSpacing:0.4, marginBottom:8 }}>{t.addColor}</div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:24 }}>
                {COLOR_OPTS.map(col => (
                  <button key={col} onClick={() => setNewColor(col)}
                    style={{ width:28, height:28, borderRadius:"50%", background:col, border:newColor===col?`3px solid ${C.text}`:"3px solid transparent", cursor:"pointer", padding:0, boxSizing:"border-box" }} />
                ))}
              </div>

              <button onClick={handleAddNew} disabled={!newName.trim()}
                style={{ width:"100%", padding:"14px", background:newName.trim()?C.blue:"#C7C7CC", border:"none", borderRadius:14, color:"#fff", fontSize:15, fontWeight:600, cursor:newName.trim()?"pointer":"not-allowed" }}>
                {t.addBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
