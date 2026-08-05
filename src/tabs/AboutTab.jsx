import { useState, useRef } from "react";
import { useLang, T } from "../data/i18n.js";
import { useC } from "../theme.js";
import { Card, SLabel } from "../components/ui.jsx";

// ── 版本號：每次發布只需改這一行 ──────────────────────────────
const APP_VERSION = "1.9.2";

export function AboutTab({ workouts, library, onImport, onReset, onClear }) {
  const lang = useLang(); const t = T[lang]; const C = useC();
  const isZh = lang === "zh";
  const [importConfirm,  setImportConfirm]  = useState(null);
  const [importError,    setImportError]    = useState(null);
  const [resetConfirm,   setResetConfirm]   = useState(false);
  const [clearConfirm,   setClearConfirm]   = useState(false);
  const fileInputRef = useRef(null);

  // ── 匯出 Markdown ─────────────────────────────────────────
  const todayStr = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  })();
  const exportMD = () => {
    const sorted = [...workouts].sort((a, b) => a.date.localeCompare(b.date));
    const byDate = {};
    sorted.forEach(w => {
      if (!byDate[w.date]) byDate[w.date] = [];
      byDate[w.date].push(w);
    });
    const lines = [];

    // ── 標題 ──────────────────────────────────────────────────
    lines.push(`# GymReco ${isZh ? "訓練日誌" : "Workout Log"}`);
    lines.push(`${isZh ? "匯出時間" : "Exported"}: ${new Date().toISOString()}\n`);

    // ── 動作列表及筆記（前言，不在每日重複） ──────────────────
    lines.push(`## ${isZh ? "動作庫與知識筆記" : "Exercise Library & Notes"}`);
    lines.push(isZh
      ? "_以下為所有動作的基本資訊與知識筆記，每日訓練紀錄中不再重複。_\n"
      : "_All exercise notes are listed here and will not be repeated in the daily logs below._\n");
    library.forEach(lib => {
      lines.push(`### ${lib.name}${lib.muscleGroup ? ` _(${lib.muscleGroup})_` : ""}`);
      if (lib.note) {
        lib.note.split("\n").filter(Boolean).forEach(l => lines.push(`> ${l}`));
      } else {
        lines.push(isZh ? "> _(尚無筆記)_" : "> _(No notes)_");
      }
      lines.push("");
    });

    // ── 每日訓練紀錄 ──────────────────────────────────────────
    lines.push(`---\n`);
    lines.push(`## ${isZh ? "訓練紀錄" : "Workout Log"}\n`);
    Object.entries(byDate).forEach(([date, dayWorkouts]) => {
      lines.push(`### ${date}`);
      dayWorkouts.forEach((w, i) => {
        if (dayWorkouts.length > 1) {
          lines.push(`#### ${isZh ? `第 ${i+1} 次訓練` : `Session ${i+1}`}`);
        }
        w.exercises.forEach(ex => {
          const lib = library.find(l => l.id === ex.libId);
          const name = lib ? lib.name : (isZh ? "(已刪除)" : "(Deleted)");
          lines.push(`\n**${name}**`);
          if (ex.equipment) lines.push(`- **${isZh ? "器材" : "Equipment"}**: ${ex.equipment}`);
          ex.weightSets.forEach((ws, si) => {
            lines.push(`- **Set ${si+1}**: ${ws.weight} × ${ws.reps.join("/")} reps`);
          });
          if (ex.feeling) lines.push(`- **${isZh ? "感受" : "Feeling"}**: ${ex.feeling}`);
        });
      });
      lines.push("");
    });

    const blob = new Blob([lines.join("\n")], { type:"text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `gymreco-log-${todayStr}.md`;
    a.click(); URL.revokeObjectURL(url);
  };

  const exportJSON = () => {
    const data = { version: APP_VERSION, exportedAt: new Date().toISOString(), workouts, library };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type:"application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `gymreco-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImportError(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);

        // 第一層：基本結構檢查
        if (!parsed.workouts || !parsed.library ||
            !Array.isArray(parsed.workouts) || !Array.isArray(parsed.library)) {
          throw new Error("invalid");
        }

        // 第二層：每筆 workout 必須有合法欄位
        for (const w of parsed.workouts) {
          if (typeof w.id !== "string" && typeof w.id !== "number") throw new Error("invalid");
          if (typeof w.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(w.date)) throw new Error("invalid");
          if (!Array.isArray(w.exercises)) throw new Error("invalid");
          if (!Array.isArray(w.muscleGroups)) throw new Error("invalid");
        }

        // 第三層：每筆 library item 必須有合法欄位
        for (const l of parsed.library) {
          if (typeof l.id !== "string" && typeof l.id !== "number") throw new Error("invalid");
          if (typeof l.name !== "string") throw new Error("invalid");
          if (!Array.isArray(l.history)) throw new Error("invalid");
        }

        setImportConfirm(parsed);
      } catch(err) {
        setImportError(isZh ? "檔案格式不正確，請選擇 GymReco 匯出的 JSON 檔案。" : "Invalid file format. Please select a JSON file exported from GymReco.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const confirmImport = () => { onImport(importConfirm.workouts, importConfirm.library); setImportConfirm(null); };

  return (
    <div style={{ flex:1, overflowY:"auto", background:C.bg }}>
      {importConfirm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:300, padding:"20px" }}>
          <div style={{ background:C.card, borderRadius:16, padding:"24px 20px", width:"100%", maxWidth:320 }}>
            <div style={{ fontSize:17, fontWeight:700, color:C.text, marginBottom:10, textAlign:"center" }}>{isZh ? "確認匯入" : "Confirm Import"}</div>
            <div style={{ fontSize:14, color:C.sub, marginBottom:8, textAlign:"center", lineHeight:1.6 }}>
              {isZh ? `找到 ${importConfirm.workouts.length} 筆訓練紀錄、${importConfirm.library.length} 個動作。` : `Found ${importConfirm.workouts.length} workouts and ${importConfirm.library.length} exercises.`}
            </div>
            <div style={{ fontSize:13, color:C.red, marginBottom:20, textAlign:"center", lineHeight:1.6, background:`${C.red}10`, borderRadius:10, padding:"8px 12px" }}>
              {isZh ? "⚠️ 這將覆蓋你目前所有的資料，此動作無法復原。" : "⚠️ This will overwrite all your current data. This cannot be undone."}
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setImportConfirm(null)} style={{ flex:1, padding:"12px", background:C.f5, border:"none", borderRadius:12, fontSize:15, fontWeight:600, color:C.sub, cursor:"pointer" }}>{isZh ? "取消" : "Cancel"}</button>
              <button onClick={confirmImport} style={{ flex:1, padding:"12px", background:C.blue, border:"none", borderRadius:12, fontSize:15, fontWeight:600, color:"#fff", cursor:"pointer" }}>{isZh ? "確認匯入" : "Import"}</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ padding:"8px 20px 16px", background:C.card, borderBottom:`1px solid ${C.sep}` }}>
        <div style={{ fontSize:13, color:C.label, marginBottom:2 }}>{isZh ? "關於" : "About"}</div>
        <div style={{ fontSize:28, fontWeight:700, color:C.text, letterSpacing:-0.5 }}>GymReco</div>
      </div>
      <div style={{ padding:"16px" }}>
        <Card style={{ marginBottom:16 }}>
          <div style={{ padding:"28px 16px", display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}>
            <img src={process.env.PUBLIC_URL + "/logo192.png"} alt="GymReco"
              style={{ width:72, height:72, borderRadius:18, boxShadow:"0 4px 16px rgba(0,0,0,0.15)", objectFit:"cover" }} />
            <div style={{ fontSize:20, fontWeight:700, color:C.text }}>GymReco</div>
            <div style={{ fontSize:13, color:C.label }}>Version {APP_VERSION}</div>
          </div>
        </Card>

        <SLabel>{isZh ? "簡介" : "Description"}</SLabel>
        <Card style={{ marginBottom:16 }}>
          <div style={{ padding:"14px 16px", fontSize:14, color:C.sub, lineHeight:1.8 }}>
            {isZh
              ? "GymReco 是一款手機優先的健身紀錄 App，讓你在重訓時快速記錄動作、重量與組次。支援個人動作庫管理、知識筆記累積，以及訓練日曆總覽。所有資料存於本機，不需要帳號。"
              : "GymReco is a mobile-first PWA workout tracker. Quickly log exercises, weights, and sets during your training. Features a personal exercise library with knowledge notes and a training calendar. All data is stored locally — no account required."}
          </div>
        </Card>

        <SLabel>{isZh ? "作者" : "Author"}</SLabel>
        <Card style={{ marginBottom:16 }}>
          <div style={{ padding:"14px 16px", display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:"50%", background:`linear-gradient(135deg,${C.blue},${C.indigo})`, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:18, fontWeight:700, flexShrink:0 }}>R</div>
            <div>
              <div style={{ fontSize:15, fontWeight:600, color:C.text }}>Ruby Chen</div>
              <div style={{ fontSize:12, color:C.label, marginTop:2 }}>@rubychenhaii</div>
            </div>
          </div>
        </Card>

        <SLabel>{isZh ? "連結" : "Links"}</SLabel>
        <Card style={{ marginBottom:16 }}>
          <a href="https://github.com/rubychenhaii/gymreco" target="_blank" rel="noopener noreferrer"
            style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 16px", textDecoration:"none" }}>
            <div style={{ width:32, height:32, borderRadius:8, background:"#1C1C1E", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="#fff"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.744 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:600, color:C.text }}>GitHub</div>
              <div style={{ fontSize:12, color:C.label }}>rubychenhaii/gymreco</div>
            </div>
            <svg viewBox="0 0 24 24" fill={C.sep} width="14" height="14"><path d="M10 6l6 6-6 6V6z"/></svg>
          </a>
        </Card>

        <Card style={{ marginBottom:16 }}>
          <div style={{ padding:"14px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:14, color:C.text }}>{isZh ? "授權" : "License"}</span>
            <span style={{ fontSize:14, color:C.label }}>MIT © 2026 Ruby Chen</span>
          </div>
        </Card>

        <SLabel>{t.exportTitle}</SLabel>
        <Card style={{ marginBottom:16 }}>
          <div style={{ padding:"14px 16px 6px" }}>
            <div style={{ fontSize:12, color:C.label, marginBottom:12 }}>{t.exportSub}</div>
            <button onClick={exportJSON}
              style={{ width:"100%", padding:"12px 16px", background:C.blue, border:"none", borderRadius:12, color:"#fff", fontSize:14, fontWeight:600, cursor:"pointer", marginBottom:10, textAlign:"left", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div>{t.exportJSON}</div>
                <div style={{ fontSize:11, fontWeight:400, opacity:0.8, marginTop:2 }}>{t.exportJSONSub}</div>
              </div>
              <span style={{ fontSize:18 }}>↓</span>
            </button>
            <button onClick={exportMD}
              style={{ width:"100%", padding:"12px 16px", background:C.f5, border:`1px solid ${C.sep}`, borderRadius:12, color:C.text, fontSize:14, fontWeight:600, cursor:"pointer", marginBottom:10, textAlign:"left", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div>{t.exportMD}</div>
                <div style={{ fontSize:11, fontWeight:400, color:C.label, marginTop:2 }}>{t.exportMDSub}</div>
              </div>
              <span style={{ fontSize:18, color:C.label }}>↓</span>
            </button>
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileSelect} style={{ display:"none" }} />
            <button onClick={() => fileInputRef.current.click()}
              style={{ width:"100%", padding:"12px 16px", background:C.f5, border:`1.5px dashed ${C.sep}`, borderRadius:12, color:C.sub, fontSize:14, fontWeight:600, cursor:"pointer", marginBottom:4, textAlign:"left", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div>{isZh ? "匯入 JSON（還原備份）" : "Import JSON (Restore Backup)"}</div>
                <div style={{ fontSize:11, fontWeight:400, color:C.label, marginTop:2 }}>{isZh ? "將覆蓋目前所有資料" : "Will overwrite all current data"}</div>
              </div>
              <span style={{ fontSize:18, color:C.label }}>↑</span>
            </button>
            {importError && <div style={{ fontSize:12, color:C.red, marginTop:6, paddingLeft:4 }}>{importError}</div>}
          </div>
        </Card>

        <SLabel>{t.maintenanceTitle}</SLabel>
        <Card style={{ marginBottom:32 }}>
          <div style={{ padding:"14px 16px" }}>
            {/* Reset */}
            <button onClick={() => setResetConfirm(true)}
              style={{ width:"100%", padding:"12px 16px", background:C.f5, border:`1px solid ${C.sep}`, borderRadius:12, color:C.text, fontSize:14, fontWeight:600, cursor:"pointer", marginBottom:10, textAlign:"left", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div>{t.resetBtn}</div>
                <div style={{ fontSize:11, fontWeight:400, color:C.label, marginTop:2 }}>{t.resetSub}</div>
              </div>
              <span style={{ fontSize:16 }}>↺</span>
            </button>
            {/* Clear */}
            <button onClick={() => setClearConfirm(true)}
              style={{ width:"100%", padding:"12px 16px", background:`${C.blue}15`, border:`1.5px solid ${C.blue}`, borderRadius:12, color:C.blue, fontSize:14, fontWeight:600, cursor:"pointer", textAlign:"left", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div>{t.clearBtn}</div>
                <div style={{ fontSize:11, fontWeight:400, color:`${C.blue}99`, marginTop:2 }}>{t.clearSub}</div>
              </div>
              <span style={{ fontSize:16 }}>✕</span>
            </button>
          </div>
        </Card>

        {/* Reset 確認對話框 */}
        {resetConfirm && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:300, padding:"20px" }}>
            <div style={{ background:C.card, borderRadius:16, padding:"24px 20px", width:"100%", maxWidth:320 }}>
              <div style={{ fontSize:17, fontWeight:700, color:C.text, marginBottom:10, textAlign:"center" }}>{t.resetConfirmTitle}</div>
              <div style={{ fontSize:14, color:C.sub, marginBottom:20, textAlign:"center", lineHeight:1.6 }}>{t.resetConfirmMsg}</div>
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={() => setResetConfirm(false)} style={{ flex:1, padding:"12px", background:C.f5, border:"none", borderRadius:12, fontSize:15, fontWeight:600, color:C.sub, cursor:"pointer" }}>{t.confirmCancel}</button>
                <button onClick={() => { onReset(); setResetConfirm(false); }} style={{ flex:1, padding:"12px", background:C.blue, border:"none", borderRadius:12, fontSize:15, fontWeight:600, color:"#fff", cursor:"pointer" }}>{t.confirmProceed}</button>
              </div>
            </div>
          </div>
        )}

        {/* Clear 確認對話框 */}
        {clearConfirm && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:300, padding:"20px" }}>
            <div style={{ background:C.card, borderRadius:16, padding:"24px 20px", width:"100%", maxWidth:320 }}>
              <div style={{ fontSize:17, fontWeight:700, color:C.blue, marginBottom:10, textAlign:"center" }}>{t.clearConfirmTitle}</div>
              <div style={{ fontSize:14, color:C.sub, marginBottom:20, textAlign:"center", lineHeight:1.6 }}>{t.clearConfirmMsg}</div>
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={() => setClearConfirm(false)} style={{ flex:1, padding:"12px", background:C.f5, border:"none", borderRadius:12, fontSize:15, fontWeight:600, color:C.sub, cursor:"pointer" }}>{t.confirmCancel}</button>
                <button onClick={() => { onClear(); setClearConfirm(false); }} style={{ flex:1, padding:"12px", background:C.blue, border:"none", borderRadius:12, fontSize:15, fontWeight:600, color:"#fff", cursor:"pointer" }}>{t.confirmProceed}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
