import { fs } from "../theme.js";
import { useState , useRef, useEffect } from "react";
import { useLang, T, MG_EN } from "../data/i18n.js";
import { MG_OPTIONS, COLOR_OPTS, WEEKDAYS, WEEKDAY_CN, MONTHS_EN, RECORDING_MODES } from "../data/constants.js";
import { useC } from "../theme.js";
import { todayStr, localDate, uid } from "../utils/date.js";
import { Div, Card } from "../components/ui.jsx";
import { WeightSetEditor } from "../components/WeightSetEditor.jsx";
import { LengthPaceEditor } from "../components/LengthPaceEditor.jsx";
import { isRoutineComplete, wouldPendingRowsAddDay } from "../utils/routineUtils.js";
import { BottomSheet } from "../components/BottomSheet.jsx";
import { GLASS_SURFACE_SHADOW, SUBHEADER_MIN_HEIGHT } from "../theme.js";
import { Button } from "../components/Button.jsx";
import { ExerciseFieldsGroup } from "../components/SelectionControls.jsx";
import { loadLogDraft, saveLogDraft, clearLogDraft } from "../utils/logDraft.js";
import { AutoGrowTextarea } from "../components/AutoGrowTextarea.jsx";
import { upgradeWeightSets, upgradeLengthPace, hasEmptyCore } from "../utils/setUtils.js";

// LogTab 內嵌的規則總覽區塊：週/月分組顯示已建立規則的達標進度，並提供「+ 新增規則」入口
// 點擊任一規則列或「+ 新增規則」都會導向 RoutineTab 全螢幕畫面進行實際管理（新增/編輯/刪除）
function RoutineOverview({ routines, library, workouts, onOpenRoutines, t, C, lang, pendingRows, selectedDate }) {
  const groupLabel = (g) => lang === "zh" ? g : (MG_EN[g] || g);

  const weekRoutines  = routines.filter(r => r.period === "week");
  const monthRoutines = routines.filter(r => r.period === "month");

  const Row = ({ routine }) => {
    const result = isRoutineComplete(routine, workouts, library);
    // 若規則尚未達標，檢查「本次尚未儲存的訓練」是否會讓它多算 1 天
    const pendingGain = !result.deleted && !result.complete &&
      wouldPendingRowsAddDay(routine, pendingRows, library, selectedDate, workouts);
    const item = routine.matchType === "exercise" ? library.find(l => l.id === routine.matchValue) : null;
    const dotColor = routine.matchType === "color" ? routine.matchValue : (item ? item.color : null);
    const label = routine.matchType === "exercise"
      ? (item ? item.name : t.routineDeletedTag)
      : routine.matchType === "muscleGroup"
        ? groupLabel(routine.matchValue)
        : null;
    const displayCount = pendingGain ? result.count + 1 : result.count;
    const statusColor  = pendingGain ? C.yellow : (result.complete ? C.green : C.label);
    return (
      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 16px" }}>
        {dotColor && <div style={{ width:10, height:10, borderRadius:"50%", background:dotColor, flexShrink:0 }} />}
        <div style={{ flex:1, minWidth:0, fontSize:fs(13), fontWeight:600, color:C.text, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
          {(routine.matchType === "exercise" ? t.routineMatchExercise : routine.matchType === "color" ? t.routineMatchColor : t.routineMatchGroup)}
          {label ? `：${label}` : ""}
        </div>
        {result.deleted ? (
          <span style={{ fontSize:fs(11), fontWeight:600, color:C.label, fontStyle:"italic", flexShrink:0 }}>{t.routineDeletedTag}</span>
        ) : (
          <span style={{ fontSize:fs(12), fontWeight:700, color:statusColor, flexShrink:0 }}>
            {displayCount}/{routine.targetCount} {result.complete ? "✓" : ""}
          </span>
        )}
      </div>
    );
  };

  if (routines.length === 0) {
    return (
      <Card onClick={onOpenRoutines} style={{ marginBottom:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 16px" }}>
          <span style={{ fontSize:fs(14), fontWeight:700, color:C.text }}>{t.routineTitle}</span>
          <span style={{ color:C.label, fontSize:fs(12), fontWeight:300 }}>{t.routineAddEntry}</span>
        </div>
      </Card>
    );
  }

  return (
    <div onClick={onOpenRoutines} style={{ borderBottom:`1px solid ${C.sub}20`, paddingBottom:10, marginBottom:20, cursor:"pointer" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8, paddingLeft:2 }}>
        <span style={{ fontSize:fs(12), fontWeight:500, color:C.label, letterSpacing:0.4, textTransform:"uppercase" }}>{t.routineTitle}</span>
        <span style={{ color:C.label, fontSize:fs(12), fontWeight:300 }}>{t.routineAddEntry}</span>
      </div>
      {weekRoutines.length > 0 && (
        <Card style={{ marginBottom:10, cursor:"pointer" }}>
          <div style={{ padding:"8px 16px 2px", fontSize:fs(11), fontWeight:600, color:C.label }}>{t.routineWeekGroup}</div>
          {weekRoutines.map((r, i) => (<div key={r.id}>{i > 0 && <Div left={16} />}<Row routine={r} /></div>))}
        </Card>
      )}
      {monthRoutines.length > 0 && (
        <Card style={{ marginBottom:10, cursor:"pointer" }}>
          <div style={{ padding:"8px 16px 2px", fontSize:fs(11), fontWeight:600, color:C.label }}>{t.routineMonthGroup}</div>
          {monthRoutines.map((r, i) => (<div key={r.id}>{i > 0 && <Div left={16} />}<Row routine={r} /></div>))}
        </Card>
      )}
    </div>
  );
}

export function LogTab({ library, routines, workouts, onSave, onAddToLibrary, showToast, onOpenRoutines }) {
  const lang = useLang(); const t = T[lang]; const C = useC();
    // 只在元件第一次掛載時讀一次草稿（切換分頁、App 重啟後回到這裡，都會從這裡還原）
  const [initialDraft] = useState(() => loadLogDraft(library));
  const [muscleGroups,    setMG]            = useState([]);
  const [showMGPicker,    setShowMG]        = useState(false);
  const [rows,            setRows]          = useState(() => initialDraft?.rows ?? []);
  const [showLibPicker,   setShowLib]       = useState(false);
  const [libSearch,       setLibSearch]     = useState("");
  const [selectedDate,    setSelectedDate]  = useState(() => initialDraft?.selectedDate ?? todayStr());
  const [showDatePicker,  setShowDatePicker]= useState(false);

  // 新增動作 sheet 狀態
  const [showAddNew,   setShowAddNew]  = useState(false);
  const [newName,      setNewName]     = useState("");
  const [newMG,        setNewMG]       = useState(MG_OPTIONS[0]);
  const [newColor,     setNewColor]    = useState(COLOR_OPTS[0]);
  const [newRecMode,   setNewRecMode]  = useState(RECORDING_MODES[0]);

  // 草稿自動儲存：rows 或日期有任何改變就寫入。
  // 用 ref 記住「上一次的內容」：剛還原草稿、尚未修改時內容相同 → 不寫入，
  // 這樣「只是打開看」不會更新最後修改時間，3 小時期限才會是從真正的最後一次修改算起
  const lastDraftJson = useRef(JSON.stringify({ rows, selectedDate }));
  useEffect(() => {
    const json = JSON.stringify({ rows, selectedDate });
    if (json === lastDraftJson.current) return;
    lastDraftJson.current = json;
    saveLogDraft({ rows, selectedDate });
  }, [rows, selectedDate]);

  const addRow = (libId) => {
    const item = library.find(l => l.id === libId);
    const mode  = item?.recordingMode || "weight_sets";  // 舊資料無此欄位 → 視為 weight_sets
    const lastH = item?.history.length > 0 ? item.history[item.history.length - 1] : null;
    // equipment 是兩種 mode 共用的欄位（跟資料結構無關），永遠沿用最近一次紀錄；
    // 只有 weightSets/lengthPace 這種「跟 mode 綁定」的資料，才需要比對 mode 是否一致才帶入
    const modeMatches = lastH && (lastH.mode || "weight_sets") === mode;
    // 沿用上次的重量/圈數模式與數值；舊版紀錄（weight 字串）盡力轉成新結構
    const lastSets = mode === "weight_sets" && modeMatches && lastH.weightSets
      ? upgradeWeightSets(JSON.parse(JSON.stringify(lastH.weightSets)), lastH.setKind)
      : { setKind:"weight", weightSets:[{ value:"", unit:"kg", note:"", reps:[10,10,10] }] };
    setRows(p => [...p, {
      libId,
      mode,
      equipment:  lastH?.equipment || "",
      setKind:    lastSets.setKind,
      weightSets: lastSets.weightSets,   // length_pace 動作也帶預設值，以防之後切換模式時欄位不存在
      lengthPace: mode === "length_pace"
        ? (modeMatches && lastH.lengthPace ? upgradeLengthPace(JSON.parse(JSON.stringify(lastH.lengthPace))) : [{ distance:0, unit:"km", paceMin:0, paceSec:0 }])
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
      setKind: "weight",
      weightSets: [{ value:"", unit:"kg", note:"", reps:[10,10,10] }],
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
    if (hasEmptyCore(rows)) { showToast(t.weValueRequired); return; }
    const sd = localDate(selectedDate);
    const workout = {
      id: uid(), date: selectedDate, weekday: WEEKDAYS[sd.getDay()],
      muscleGroups: muscleGroups.length > 0 ? muscleGroups : [...new Set(rows.map(r => library.find(l => l.id === r.libId)?.muscleGroup).filter(Boolean))],
      exercises: rows.map(r => ({
       libId: r.libId,
       mode: r.mode,
       equipment: r.equipment,
       ...(r.mode === "length_pace" ? { lengthPace: r.lengthPace } : { weightSets: r.weightSets, setKind: r.setKind || "weight" }),
       feeling: r.feeling,
     })),
    };
    const noteUpdates = rows.filter(r => r.noteDirty).map(r => ({ libId: r.libId, note: r.noteLocal }));
    clearLogDraft();   // 同步清除：存檔後立刻回首頁，首頁不能還讀到舊草稿
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
          <BottomSheet open={showDatePicker} onClose={() => setShowDatePicker(false)}
            title={lang === "zh" ? "選擇日期" : "Select Date"}>
           <div style={{ overflowY:"auto", padding:"8px 16px 32px" }}>
             <div style={{ fontSize:fs(12), color:C.label, textAlign:"center", padding:"8px 0 12px", lineHeight:1.6 }}>
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
                   style={{ width:"100%", padding:"13px 16px", marginBottom:4, background:isSelected?C.blue:C.f5, border:isSelected?"none":`1px solid ${C.sep}`, borderRadius:12, cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", boxSizing:"border-box", boxShadow: isSelected ? "none" : GLASS_SURFACE_SHADOW }}>
                   <span style={{ fontSize:fs(15), fontWeight:isSelected?700:400, color:isSelected?"#fff":C.text }}>{label}</span>
                   {isT && <span style={{ fontSize:fs(11), fontWeight:600, color:isSelected?"rgba(255,255,255,0.8)":C.blue, background:isSelected?"rgba(255,255,255,0.2)":`${C.blue}15`, borderRadius:6, padding:"2px 8px" }}>
                     {lang === "zh" ? "今天" : "Today"}
                    </span>}
                 </button>
               );
             })}
           </div>
         </BottomSheet>
       );
      })()}

      <div style={{ padding:"8px 20px 14px", minHeight:SUBHEADER_MIN_HEIGHT, boxSizing:"border-box", background:C.card, borderBottom:`1px solid ${C.sep}`, display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
        <div>
          <div style={{ fontSize:fs(13), color:C.label, marginBottom:1 }}>{t.logSubtitle}</div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ fontSize:fs(20), fontWeight:700, color:C.text, letterSpacing:-0.3 }}>{dateLabel}</div>
            {!isToday && <span style={{ fontSize:fs(11), fontWeight:600, color:C.orange, background:`${C.orange}15`, borderRadius:6, padding:"2px 8px" }}>{lang === "zh" ? "補登" : "Back-log"}</span>}
          </div>
        </div>
        <Button variant="ghost" size="sm" fullWidth={false} onClick={() => setShowDatePicker(true)}
          style={{ padding:"6px 12px", fontWeight:500, border:`1px solid ${C.sep}`, marginBottom:4 }}>
          {lang === "zh" ? "更改日期" : "Change Date"}
        </Button>
      </div>

      <div style={{ padding:"16px" }}>
        <RoutineOverview routines={routines} library={library} workouts={workouts} onOpenRoutines={onOpenRoutines} t={t} C={C} lang={lang} pendingRows={rows} selectedDate={selectedDate} />
        {rows.map((row, i) => {
          const item = library.find(l => l.id === row.libId);
          if (!item) return null;
          const mgLabel = lang === "en" ? MG_EN[item.muscleGroup] || item.muscleGroup : item.muscleGroup;
          return (
            //下方樣式為LogTab中，點按「+ 新增動作」後，會在LogTab內嵌的可編輯UI。
            <Card key={i} tint={{ color: item.color, border:"top-bottom", borderStyle:"dashed" }} style={{ marginBottom:15 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, padding:"14px 16px 12px" }}>
                <div style={{ width:10, height:10, borderRadius:"50%", background:item.color, flexShrink:0 }} />
                <span style={{ flex:1, fontSize:fs(16), fontWeight:700, color:C.text }}>{item.name}</span>
                <span style={{ fontSize:fs(11), color:item.color, background:`${item.color}15`, borderRadius:6, padding:"2px 8px", fontWeight:600 }}>{mgLabel}</span>
                <button onClick={() => del(i)} style={{ background:"none", border:"none", cursor:"pointer", color:C.red, fontSize:fs(13), fontWeight:500 }}>{t.logRemove}</button>
              </div>
              <Div />
              <div style={{ padding:"12px 16px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                  <div style={{ fontSize:fs(11), fontWeight:600, color:C.label, letterSpacing:0.4 }}>{t.logEquipLabel}</div>
                  {row.equipment && <div style={{ fontSize:fs(10), color:C.blue, background:`${C.blue}10`, borderRadius:6, padding:"2px 8px" }}>{t.logEquipHint}</div>}
                </div>
                <AutoGrowTextarea tone="plain" minHeight={54} value={row.equipment} onChange={e => upd(i, { equipment: e.target.value })} placeholder={t.logEquipPlaceholder} />
              </div>
              <Div />
              <div style={{ padding:"12px 16px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                  <div style={{ fontSize:fs(11), fontWeight:600, color:C.label, letterSpacing:0.4 }}>
                    {row.mode === "length_pace" ? t.logLengthPaceLabel : t.logSetsLabel}
                  </div>
                  {row.mode === "length_pace"
                    ? (row.lengthPace || []).some(lp => lp.distance) && <div style={{ fontSize:fs(10), color:C.blue, background:`${C.blue}10`, borderRadius:6, padding:"2px 8px" }}>{t.logSetsHint}</div>
                    : (row.weightSets || []).some(ws => ws.value !== "" && ws.value != null) && <div style={{ fontSize:fs(10), color:C.blue, background:`${C.blue}10`, borderRadius:6, padding:"2px 8px" }}>{t.logSetsHint}</div>}
                </div>
                {row.mode === "length_pace"
                  ? <LengthPaceEditor lengthPace={row.lengthPace} onChange={lp => upd(i, { lengthPace: lp })} />
                  : <WeightSetEditor weightSets={row.weightSets} kind={row.setKind || "weight"} onKindChange={k => upd(i, { setKind: k })} onChange={ws => upd(i, { weightSets: ws })} />}
              </div>
              <Div />
              <div style={{ padding:"12px 16px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:4 }}>
                  <div>
                    <div style={{ fontSize:fs(11), fontWeight:600, color:C.label, letterSpacing:0.4 }}>{t.logKnowledgeLabel}</div>
                    <div style={{ fontSize:fs(10), color:C.label, marginTop:1 }}>{t.logKnowledgeSub}</div>
                  </div>
                  {row.noteDirty && <span style={{ fontSize:fs(10), color:C.orange, fontWeight:600, background:`${C.orange}15`, borderRadius:6, padding:"2px 8px" }}>{t.logKnowledgeDirty}</span>}
                </div>
                <AutoGrowTextarea tone="plain" minHeight={90} value={row.noteLocal} onChange={e => upd(i, { noteLocal: e.target.value, noteDirty: true })} placeholder={t.logKnowledgePlaceholder} />
              </div>
              <Div />
              <div style={{ padding:"12px 16px" }}>
                <div style={{ fontSize:fs(11), fontWeight:600, color:C.orange, letterSpacing:0.4, marginBottom:2 }}>{t.logFeelingLabel}</div>
                <div style={{ fontSize:fs(10), color:C.label, marginBottom:6 }}>{t.logFeelingSub}</div>
                <AutoGrowTextarea value={row.feeling} onChange={e => upd(i, { feeling: e.target.value })} placeholder={t.logFeelingPlaceholder} />
              </div>
            </Card>
          );
        })}

        <Button variant="dashed" size="lg" onClick={() => setShowLib(true)}
          style={{ padding:"15px", fontSize:fs(15), marginBottom:12 }}>
          {t.logAddExercise}
        </Button>
        {rows.length > 0 && hasEmptyCore(rows) && (
          <div style={{ fontSize:fs(12), color:C.red, textAlign:"center", marginBottom:8, lineHeight:1.6 }}>{t.weValueRequired}</div>
        )}
        <Button variant="primary" size="lg" disabled={rows.length === 0 || hasEmptyCore(rows)} onClick={handleSave}
          style={{ fontSize:fs(17), boxShadow: rows.length > 0 ? "0 4px 16px rgba(0,122,255,0.3)" : "none" }}>
          {t.logSave}
        </Button>
      </div>

      {/* Library picker BottomSheet */}
      <BottomSheet open={showLibPicker} onClose={() => { setShowLib(false); setLibSearch(""); }} title={t.logPickerTitle}>
        <div style={{ padding:"12px 16px", borderBottom:`1px solid ${C.sep}` }}>
          <input value={libSearch} onChange={e => setLibSearch(e.target.value)} placeholder={t.logPickerSearch}
          style={{ width:"100%", background:C.bg, border:`1px solid ${C.sep}`, borderRadius:10, padding:"10px 14px", fontSize:fs(15), color:C.text, boxSizing:"border-box", outline:"none", fontFamily:"inherit" }} />
        </div>
          <div style={{ overflowY:"auto", paddingBottom:20 }}>
             {/* 新增動作按鈕 */}
            <button onClick={() => setShowAddNew(true)}
              style={{ display:"flex", alignItems:"center", gap:12, width:"100%", padding:"14px 20px", background:"none", border:"none", borderBottom:`1px solid ${C.sep}`, cursor:"pointer", textAlign:"left" }}>
              <div style={{ width:28, height:28, borderRadius:"50%", background:`${C.blue}15`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                 <span style={{ color:C.blue, fontSize:fs(18), lineHeight:1 }}>+</span>
              </div>
              <span style={{ fontSize:fs(15), fontWeight:600, color:C.blue }}>{t.logAddNew}</span>
            </button>

            {Object.entries(grouped).map(([mg, items]) => (
              <div key={mg}>
                <div style={{ padding:"12px 20px 6px", fontSize:fs(11), fontWeight:600, color:C.label, letterSpacing:0.5 }}>
                  {lang === "en" ? MG_EN[mg] || mg : mg}
                 </div>
                {items.map((it, i) => (
                  <div key={it.id}>
                    {i > 0 && <Div left={20} />}
                    <button onClick={() => addRow(it.id)}
                      style={{ display:"flex", alignItems:"center", gap:12, width:"100%", padding:"13px 20px", background:"none", border:"none", cursor:"pointer", textAlign:"left" }}>
                       <div style={{ width:10, height:10, borderRadius:"50%", background:it.color, flexShrink:0 }} />
                      <span style={{ flex:1, fontSize:fs(16), color:C.text }}>{it.name}</span>
                      {it.history.length > 0 && <span style={{ fontSize:fs(11), color:C.label }}>{t.logLastSeen} {it.history[it.history.length - 1].date}</span>}
                      <span style={{ color:C.blue, fontSize:fs(20), lineHeight:1 }}>+</span>
                    </button>
                   </div>
                ))}
              </div>
            ))}
          </div>
      </BottomSheet>

      {/* 新增動作 BottomSheet */}
      <BottomSheet open={showAddNew} onClose={() => setShowAddNew(false)} title={t.logAddNewTitle} maxHeight="80vh" zIndex={300}>
        <div style={{ overflowY:"auto", padding:"16px 20px 32px" }}>
          <ExerciseFieldsGroup
            name={newName} onNameChange={setNewName}
            recMode={newRecMode} onRecModeChange={setNewRecMode}
            muscleGroup={newMG} onMuscleGroupChange={setNewMG}
            color={newColor} onColorChange={setNewColor}
          />
          <Button variant="primary" size="lg" disabled={!newName.trim()} onClick={handleAddNew} style={{ marginTop:18 }}>{t.addBtn}</Button>
        </div>
      </BottomSheet>
    </div>
  );
}
