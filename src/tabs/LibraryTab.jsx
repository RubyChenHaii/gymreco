import { useState, useRef, useEffect } from "react";
import { useLang, T, MG_EN } from "../data/i18n.js";
import { MG_OPTIONS, COLOR_OPTS, RECORDING_MODES } from "../data/constants.js";
import { useC } from "../theme.js";
import { uid, fmtDate } from "../utils/date.js";
import { Div, Card, SLabel } from "../components/ui.jsx";
import { calcOverallPace, fmtDistance, fmtPace } from "../utils/paceUtils.js";


function LibItemDetail({ item, onUpdate, onDelete, onBack }) {
  const lang = useLang(); const t = T[lang]; const C = useC();
  const lastH = item.history.length > 0 ? item.history[item.history.length - 1] : null;
  const lastMode = lastH?.mode || item.recordingMode || "weight_sets";
  // 優先順序: 上一筆紀錄自己的 mode (尊重歷史紀錄的真實記錄方式) > 沒有歷史紀錄時，改看這個動作目前設定的 recordingMode (反映使用者建立/切換時的意圖) > 兩者都沒有(最舊資料):保底視為 weight_sets
  const [editNote,    setEditNote]    = useState(item.note);
  const [editName,    setEditName]    = useState(item.name);
  const [editMG,      setEditMG]      = useState(item.muscleGroup);
  const [editColor,   setEditColor]   = useState(item.color);
  const [editRecMode, setEditRecMode] = useState(item.recordingMode || "weight_sets");
  const [editingMeta, setEM]          = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const saveTimer = useRef(null);
  const noteRef   = useRef(null);

  // 每次 editNote 改變（包含初始 mount）都重新計算高度
  useEffect(() => {
    if (noteRef.current) {
      noteRef.current.style.height = "auto";
      noteRef.current.style.height = noteRef.current.scrollHeight + "px";
    }
  }, [editNote]);


  const noteDirty = editNote !== item.note;
  const metaDirty = editName !== item.name || editMG !== item.muscleGroup || editColor !== item.color || editRecMode !== (item.recordingMode || "weight_sets");
  const anyDirty  = noteDirty || metaDirty;

  const save = () => {
    // 延遲到下一個 tick，避免 setState 阻塞主執行緒
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      onUpdate({ ...item, note: editNote, name: editName, muscleGroup: editMG, color: editColor, recordingMode: editRecMode });
    }, 0);
  };

  const mgLabel = lang === "en" ? MG_EN[editMG] || editMG : editMG;

  return (
    <div style={{ flex:1, overflowY:"auto", background:C.bg, display:"flex", flexDirection:"column" }}>
      {confirmDelete && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:300, padding:"20px" }}>
          <div style={{ background:C.card, borderRadius:16, padding:"24px 20px", width:"100%", maxWidth:320 }}>
            <div style={{ fontSize:17, fontWeight:700, color:C.text, marginBottom:10, textAlign:"center" }}>{lang === "zh" ? "刪除動作" : "Delete Exercise"}</div>
            <div style={{ fontSize:14, color:C.sub, marginBottom:20, textAlign:"center", lineHeight:1.6 }}>
              {lang === "zh" ? `確定要刪除「${item.name}」嗎？相關的訓練歷史紀錄不受影響，但此動作無法復原。` : `Delete "${item.name}"? Training history won't be affected, but this cannot be undone.`}
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setConfirmDelete(false)} style={{ flex:1, padding:"12px", background:C.f5, border:"none", borderRadius:12, fontSize:15, fontWeight:600, color:C.sub, cursor:"pointer" }}>{lang === "zh" ? "取消" : "Cancel"}</button>
              <button onClick={onDelete} style={{ flex:1, padding:"12px", background:C.red, border:"none", borderRadius:12, fontSize:15, fontWeight:600, color:"#fff", cursor:"pointer" }}>{lang === "zh" ? "刪除" : "Delete"}</button>
            </div>
          </div>
        </div>
      )}
      <div style={{ padding:"8px 20px 14px", background:C.card, borderBottom:`1px solid ${C.sep}`, display:"flex", alignItems:"center", gap:10 }}>
        <button onClick={onBack} style={{ background:"none", border:"none", cursor:"pointer", padding:"4px 0", color:C.blue, fontSize:16, fontWeight:500 }}>‹</button>
        <div style={{ flex:1, display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:12, height:12, borderRadius:"50%", background:editColor }} />
          <span style={{ fontSize:17, fontWeight:700, color:C.text }}>{editName}</span>
          <span style={{ fontSize:12, color:editColor, background:`${editColor}15`, borderRadius:6, padding:"2px 8px", fontWeight:600 }}>{mgLabel}</span>
        </div>
        <button onClick={() => setEM(v => !v)} style={{ background:editingMeta?`${C.blue}15`:C.f5, border:"none", borderRadius:8, padding:"6px 12px", fontSize:12, fontWeight:600, color:editingMeta?C.blue:C.sub, cursor:"pointer" }}>
          {editingMeta ? t.libItemDone : t.libItemEdit}
        </button>
      </div>
      <div style={{ flex:1, overflowY:"auto" }}>
        {editingMeta && (
          <div style={{ padding:"16px 16px 0" }}>
          <Card style={{ marginBottom:16, padding:"16px" }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:10 }}>{t.libItemEditTitle}</div>
            <input value={editName} onChange={e => setEditName(e.target.value)} placeholder={t.addName}
              style={{ width:"100%", background:C.f5, border:`1px solid ${C.sep}`, borderRadius:10, padding:"10px 12px", fontSize:15, color:C.text, boxSizing:"border-box", outline:"none", fontFamily:"inherit", marginBottom:10 }} />
            <div style={{ fontSize:11, fontWeight:600, color:C.label, letterSpacing:0.4, marginBottom:6 }}>{t.libItemMuscle}</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:10 }}>
              {MG_OPTIONS.map(mg => (
                <button key={mg} onClick={() => setEditMG(mg)} style={{ background:editMG===mg?C.blue:"none", border:`1px solid ${editMG===mg?C.blue:C.sep}`, borderRadius:20, padding:"4px 12px", fontSize:12, color:editMG===mg?"#fff":C.sub, cursor:"pointer" }}>
                  {lang === "en" ? MG_EN[mg] || mg : mg}
                </button>
              ))}
            </div>
            <div style={{ fontSize:11, fontWeight:600, color:C.label, letterSpacing:0.4, marginBottom:6 }}>{t.libItemColor}</div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:14 }}>
              {COLOR_OPTS.map(col => (
                <button key={col} onClick={() => setEditColor(col)} style={{ width:28, height:28, borderRadius:"50%", background:col, border:editColor===col?`3px solid ${C.text}`:"3px solid transparent", cursor:"pointer", padding:0, boxSizing:"border-box" }} />
              ))}
            </div>
            <div style={{ fontSize:11, fontWeight:600, color:C.label, letterSpacing:0.4, marginBottom:8 }}>{t.recModeLabel}</div>
            <div style={{ display:"flex", gap:8, marginBottom:8 }}>
              {RECORDING_MODES.map(m => (
                <button key={m} onClick={() => setEditRecMode(m)}
                  style={{ flex:1, background:editRecMode===m?C.blue:"none", border:`1px solid ${editRecMode===m?C.blue:C.sep}`, borderRadius:10, padding:"8px 10px", fontSize:13, fontWeight:600, color:editRecMode===m?"#fff":C.sub, cursor:"pointer" }}>
                  {m === "weight_sets" ? t.recModeWeightSets : t.recModeLengthPace}
                </button>
              ))}
            </div>
            <div style={{ fontSize:11, color:C.label, lineHeight:1.6, marginBottom:14 }}>{t.recModeSwitchHint}</div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={save} disabled={!anyDirty} style={{ flex:1, padding:"10px", background:!anyDirty?"#C7C7CC":C.blue, border:"none", borderRadius:12, color:"#fff", fontSize:14, fontWeight:600, cursor:!anyDirty?"not-allowed":"pointer" }}>{t.libItemSave}</button>
              <button onClick={() => setConfirmDelete(true)} style={{ padding:"10px 14px", background:"none", border:`1.5px solid ${C.red}`, borderRadius:12, color:C.red, fontSize:14, fontWeight:600, cursor:"pointer" }}>{t.libItemDelete}</button>
            </div>
          </Card>
          </div>
        )}

        <div style={{ background:`${editColor}0C`, borderBottom:`3px dotted ${editColor}65`, borderBottomLeftRadius:20, borderBottomRightRadius:20, padding:"16px 16px 4px" }}>
        <SLabel>{t.libLastEquip}</SLabel>
        <Card style={{ marginBottom:16 }}>
          <div style={{ padding:"14px 16px" }}>
            <div style={{ fontSize:11, color:C.blue, marginBottom:8 }}>{t.libLastEquipSub}</div>
            {lastH?.equipment
              ? <div style={{ fontSize:13, color:C.sub, lineHeight:1.6, whiteSpace:"pre-wrap" }}>{lastH.equipment}</div>
              : <div style={{ fontSize:13, color:C.label, fontStyle:"italic" }}>{t.libLastEquipPlaceholder}</div>
            }
          </div>
        </Card>

        <SLabel>{lastMode === "length_pace" ? t.libLastLengthPace : t.libLastSets}</SLabel>
        <Card style={{ marginBottom:16 }}>
          <div style={{ padding:"14px 16px" }}>
            <div style={{ fontSize:11, color:C.blue, marginBottom:10 }}>{t.libLastSetsSub}</div>
            {!lastH ? (
             <div style={{ fontSize:13, color:C.label, fontStyle:"italic" }}>{t.libHistoryEmpty}</div>
           ) : lastMode === "length_pace" ? (
             <>
               {(lastH.lengthPace || []).map((seg, si) => (
                 <div key={si} style={{ marginBottom:6, fontSize:13, color:C.text }}>
                   <span style={{ fontWeight:700 }}>{fmtDistance(seg.distance)} {seg.unit}</span>
                   <span style={{ color:C.label, marginLeft:8 }}>@ {fmtPace(seg.paceMin, seg.paceSec)}/{seg.unit}</span>
                 </div>
               ))}
               {lastH.lengthPace && calcOverallPace(lastH.lengthPace) && (() => {
                const overall = calcOverallPace(lastH.lengthPace);
                  return (
                   <div style={{ fontSize:11, color:C.blue, marginTop:4 }}>
                     {t.lpOverallPace}：{fmtDistance(overall.totalDistance)} {overall.unit} · {fmtPace(overall.paceMin, overall.paceSec)}/{overall.unit}
                   </div>
                  );
               })()}
             </>
           ) : (
             (lastH.weightSets || []).map((ws, wi) => (
               <div key={wi} style={{ marginBottom:8 }}>
                 <span style={{ fontSize:13, fontWeight:700, color:C.text, marginRight:10 }}>{ws.weight}</span>
                 <span style={{ fontSize:12, color:C.label }}>{ws.reps.join(" / ")} {t.repsUnit}</span>
                 <span style={{ fontSize:11, color:C.label, marginLeft:8 }}>{t.totalReps} {ws.reps.reduce((a,b)=>a+b,0)} {t.repsUnit}</span>
               </div>
             ))
           )}
          </div>
        </Card>

        <SLabel>{t.libNoteTitle}</SLabel>
        <Card style={{ marginBottom:16 }}>
          <div style={{ padding:"14px 16px" }}>
            <div style={{ fontSize:11, color:C.label, marginBottom:8 }}>{t.libNoteSub}</div>
            <textarea
              ref={noteRef}
              value={editNote}
              onChange={e => setEditNote(e.target.value)}
              placeholder={t.libNotePlaceholder}
              style={{ width:"100%", background:"none", border:"none", fontSize:14,
                color:C.sub, resize:"none", boxSizing:"border-box", outline:"none",
                fontFamily:"inherit", lineHeight:1.7, display:"block", overflow:"hidden" }}
            />
          </div>
          {noteDirty && (
            <div style={{ padding:"0 16px 14px" }}>
              <button onClick={save} style={{ width:"100%", padding:"11px", background:C.blue, border:"none", borderRadius:12, color:"#fff", fontSize:14, fontWeight:600, cursor:"pointer" }}>{t.libNoteSave}</button>
            </div>
          )}
        </Card>
        </div>

        <div style={{ padding:"16px" }}>
        <SLabel>{t.libHistoryTitle}（{item.history.length}）</SLabel>
        {item.history.length === 0 && <Card style={{ marginBottom:16 }}><div style={{ padding:"32px", textAlign:"center", color:C.label, fontSize:14 }}>{t.libHistoryEmpty}</div></Card>}
        {[...item.history].reverse().map((h, i) => (
          <Card key={i} style={{ marginBottom:10 }}>
            <div style={{ padding:"12px 16px 10px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:14, fontWeight:700, color:C.text }}>{fmtDate(h.date, lang)}</span>
              <span style={{ fontSize:12, color:C.label }}>{h.date}</span>
            </div>
            {h.equipment && (<><Div /><div style={{ padding:"8px 16px" }}><div style={{ fontSize:11, fontWeight:600, color:C.label, marginBottom:3 }}>{t.libEquip}</div><div style={{ fontSize:13, color:C.sub, whiteSpace:"pre-wrap" }}>{h.equipment}</div></div></>)}
            <Div />
            <div style={{ padding:"10px 16px" }}>
              {(h.mode || "weight_sets") === "length_pace" ? (
               <>
                 {(h.lengthPace || []).map((seg, si) => (
                   <div key={si} style={{ marginBottom:6 }}>
                     <span style={{ fontSize:13, fontWeight:700, color:C.text }}>{fmtDistance(seg.distance)} {seg.unit}</span>
                     <span style={{ fontSize:12, color:C.label, marginLeft:8 }}>@ {fmtPace(seg.paceMin, seg.paceSec)}/{seg.unit}</span>
                   </div>
                 ))}
                 {h.lengthPace && calcOverallPace(h.lengthPace) && (() => {
                   const overall = calcOverallPace(h.lengthPace);
                   return (
                     <div style={{ fontSize:11, color:C.blue, marginTop:2 }}>
                       {t.lpOverallPace}：{fmtDistance(overall.totalDistance)} {overall.unit} · {fmtPace(overall.paceMin, overall.paceSec)}/{overall.unit}
                     </div>
                   );
                 })()}
               </>
             ) : (
               (h.weightSets || []).map((ws, wi) => (
                 <div key={wi} style={{ marginBottom:8 }}>
                   <span style={{ fontSize:13, fontWeight:700, color:C.text, marginRight:10 }}>{ws.weight}</span>
                   <span style={{ fontSize:12, color:C.label }}>{ws.reps.join(" / ")} {t.repsUnit}</span>
                   <span style={{ fontSize:11, color:C.label, marginLeft:8 }}>{t.totalReps} {ws.reps.reduce((a, b) => a + b, 0)} {t.repsUnit}</span>
                 </div>
               ))
             )}
            </div>
            {h.feeling && (<><Div /><div style={{ padding:"8px 16px 12px" }}><div style={{ fontSize:11, fontWeight:600, color:C.orange, marginBottom:4 }}>{t.libHistoryFeeling}</div><div style={{ fontSize:13, color:C.sub, lineHeight:1.6, whiteSpace:"pre-wrap", background:`${C.orange}08`, borderRadius:8, padding:"8px 10px" }}>{h.feeling}</div></div></>)}
          </Card>
        ))}
        </div>
      </div>
    </div>
  );
}

export function LibraryTab({ library, setLibrary, openItemId, setOpenItemId }) {
  const lang = useLang(); const t = T[lang]; const C = useC();
  const [showAdd,  setShowAdd]  = useState(false);
  const [newName,  setNewName]  = useState("");
  const [newMG,    setNewMG]    = useState(MG_OPTIONS[0]);
  const [newColor, setNewColor] = useState(COLOR_OPTS[0]);
  const [newRecMode, setNewRecMode] = useState(RECORDING_MODES[0]);
  const [search,   setSearch]   = useState("");

  const addItem = () => {
    if (!newName.trim()) return;
    setLibrary(p => [...p, { id: uid(), name: newName.trim(), muscleGroup: newMG, color: newColor, recordingMode: newRecMode, note:"", history:[] }]);
    setNewName(""); setNewRecMode(RECORDING_MODES[0]); setShowAdd(false);
  };

  if (openItemId) {
    const item = library.find(l => l.id === openItemId);
    if (item) return (
      <LibItemDetail item={item}
        onUpdate={updated => setLibrary(p => p.map(l => l.id === updated.id ? updated : l))}
        onDelete={() => { setLibrary(p => p.filter(l => l.id !== openItemId)); setOpenItemId(null); }}
        onBack={() => setOpenItemId(null)} />
    );
  }

  const filtered = library.filter(it => !search || it.name.toLowerCase().includes(search.toLowerCase()) || (MG_EN[it.muscleGroup] || "").toLowerCase().includes(search.toLowerCase()) || it.muscleGroup.includes(search));
  const grouped = filtered.reduce((acc, it) => { if (!acc[it.muscleGroup]) acc[it.muscleGroup] = []; acc[it.muscleGroup].push(it); return acc; }, {});

  return (
    <div style={{ flex:1, overflowY:"auto", background:C.bg }}>
      <div style={{ padding:"8px 20px 14px", background:C.card, borderBottom:`1px solid ${C.sep}`, display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
        <div>
          <div style={{ fontSize:13, color:C.label, marginBottom:2 }}>{t.libSubtitle}</div>
          <div style={{ fontSize:28, fontWeight:700, color:C.text, letterSpacing:-0.5 }}>{t.libTitle}</div>
        </div>
        <button onClick={() => setShowAdd(v => !v)} style={{ background:C.blue, border:"none", borderRadius:12, padding:"8px 16px", color:"#fff", fontSize:14, fontWeight:600, cursor:"pointer", marginBottom:4 }}>{t.libAdd}</button>
      </div>
      <div style={{ padding:"16px" }}>
        {showAdd && (
          <Card style={{ marginBottom:16, padding:"16px" }}>
            <div style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:12 }}>{t.addBtn}</div>
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder={t.addName}
              style={{ width:"100%", background:C.f5, border:`1px solid ${C.sep}`, borderRadius:10, padding:"10px 12px", fontSize:15, color:C.text, boxSizing:"border-box", outline:"none", fontFamily:"inherit", marginBottom:12 }} />
            <div style={{ fontSize:11, fontWeight:600, color:C.label, letterSpacing:0.4, marginBottom:6 }}>{t.recModeLabel}</div>
            <div style={{ display:"flex", gap:8, marginBottom:12 }}>
              {RECORDING_MODES.map(m => (
                <button key={m} onClick={() => setNewRecMode(m)}
                   style={{ flex:1, background:newRecMode===m?C.blue:"none", border:`1px solid ${newRecMode===m?C.blue:C.sep}`, borderRadius:10, padding:"8px 10px", fontSize:13, fontWeight:600, color:newRecMode===m?"#fff":C.sub, cursor:"pointer" }}>
                   {m === "weight_sets" ? t.recModeWeightSets : t.recModeLengthPace}
                </button>
              ))}
            </div>
            <div style={{ fontSize:11, fontWeight:600, color:C.label, letterSpacing:0.4, marginBottom:6 }}>{t.addMuscle}</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:12 }}>
              {MG_OPTIONS.map(mg => (
                <button key={mg} onClick={() => setNewMG(mg)} style={{ background:newMG===mg?C.blue:"none", border:`1px solid ${newMG===mg?C.blue:C.sep}`, borderRadius:20, padding:"5px 12px", fontSize:13, color:newMG===mg?"#fff":C.sub, cursor:"pointer" }}>
                  {lang === "en" ? MG_EN[mg] || mg : mg}
                </button>
              ))}
            </div>
            <div style={{ fontSize:11, fontWeight:600, color:C.label, letterSpacing:0.4, marginBottom:6 }}>{t.addColor}</div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:14 }}>
              {COLOR_OPTS.map(col => (
                <button key={col} onClick={() => setNewColor(col)} style={{ width:28, height:28, borderRadius:"50%", background:col, border:newColor===col?`3px solid ${C.text}`:"3px solid transparent", cursor:"pointer", padding:0, boxSizing:"border-box" }} />
              ))}
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={addItem} disabled={!newName.trim()} style={{ flex:1, padding:"11px", background:newName.trim()?C.blue:"#C7C7CC", border:"none", borderRadius:12, color:"#fff", fontSize:15, fontWeight:600, cursor:newName.trim()?"pointer":"not-allowed" }}>{t.addBtn}</button>
              <button onClick={() => {  setShowAdd(false); setNewName(""); setNewRecMode(RECORDING_MODES[0]); }} style={{ padding:"11px 20px", background:C.f5, border:"none", borderRadius:12, color:C.sub, fontSize:15, cursor:"pointer" }}>{t.addCancel}</button>
            </div>
          </Card>
        )}
        <div style={{ fontSize:12, color:C.label, lineHeight:1.6, marginBottom:12, padding:"10px 12px", background:C.f3, borderRadius:10, border:`1px solid ${C.sep}` }}>
          💡 {t.libCalendarHint}
        </div>
        <div style={{ position:"relative", marginBottom:16 }}>
          <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:C.label, fontSize:15 }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t.libSearch}
            style={{ width:"100%", background:C.card, border:`1px solid ${C.sep}`, borderRadius:12, padding:"10px 12px 10px 36px", fontSize:15, color:C.text, boxSizing:"border-box", outline:"none", fontFamily:"inherit", boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }} />
        </div>
        {Object.entries(grouped).map(([mg, items]) => (
          <div key={mg} style={{ marginBottom:16 }}>
            <SLabel>{lang === "en" ? MG_EN[mg] || mg : mg}</SLabel>
            <Card>
              {items.map((item, i) => (
                <div key={item.id}>
                  {i > 0 && <Div left={54} />}
                  <div onClick={() => setOpenItemId(item.id)} style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 16px", cursor:"pointer" }}>
                    <div style={{ width:12, height:12, borderRadius:"50%", background:item.color, flexShrink:0 }} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:15, fontWeight:500, color:C.text, marginBottom:1 }}>{item.name}</div>
                      <div style={{ fontSize:11, color:C.label }}>
                        {item.history.length > 0 ? `${item.history.length} ${t.libRecords} ${fmtDate(item.history[item.history.length - 1].date, lang)}` : t.libNoHistory}
                      </div>
                    </div>
                    {item.note && <span style={{ fontSize:11, color:C.blue, background:`${C.blue}10`, borderRadius:6, padding:"2px 8px", flexShrink:0 }}>{t.libHasNote}</span>}
                    <svg viewBox="0 0 24 24" fill={C.sep} width="14" height="14"><path d="M10 6l6 6-6 6V6z"/></svg>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        ))}
        {filtered.length === 0 && <div style={{ textAlign:"center", padding:"60px 0", color:C.label }}><div style={{ fontSize:36, marginBottom:10 }}>🗂️</div><div style={{ fontSize:15, fontWeight:500 }}>{t.libEmpty}</div></div>}
      </div>
    </div>
  );
}
