import { useState } from "react";
import { useLang, T, MG_EN } from "../data/i18n.js";
import { WEEKDAYS, WEEKDAY_CN } from "../data/constants.js";
import { useC } from "../theme.js";
import { localDate } from "../utils/date.js";
import { Card } from "../components/ui.jsx";

export function HistoryTab({ workouts, library, onOpenDay }) {
  const lang = useLang(); const t = T[lang]; const C = useC();
  const [search, setSearch] = useState("");

  // ── 搜尋過濾 ──────────────────────────────────────────────
  const filtered = workouts.filter(w => {
    if (!search) return true;
    const names = w.exercises.map(ex => {
      const it = library.find(l => l.id === ex.libId);
      return it ? it.name + (MG_EN[it.muscleGroup] || "") : "";
    }).join("");
    return names.toLowerCase().includes(search.toLowerCase()) ||
      w.muscleGroups.some(g => g.includes(search) || (MG_EN[g] || "").toLowerCase().includes(search.toLowerCase()));
  });

  // ── 依日期分組 ────────────────────────────────────────────
  const byDate = {};
  filtered.forEach(w => {
    if (!byDate[w.date]) byDate[w.date] = { date: w.date, weekday: w.weekday, workouts: [] };
    byDate[w.date].workouts.push(w);
  });
  const dates = Object.keys(byDate).sort((a, b) => new Date(b) - new Date(a));

  // ── 依月份分組，最新月份在最前 ────────────────────────────
  const byMonth = {};
  dates.forEach(date => {
    const key = date.slice(0, 7); // "YYYY-MM"
    if (!byMonth[key]) byMonth[key] = [];
    byMonth[key].push(date);
  });
  const months = Object.keys(byMonth).sort((a, b) => b.localeCompare(a));

  // ── 預設：搜尋時展開全部；否則只展開最新月份 ──────────────
  const defaultOpen = search ? new Set(months) : new Set(months.slice(0, 1));
  const [openMonths, setOpenMonths] = useState(defaultOpen);

  // 搜尋時同步展開全部月份
  const toggleMonth = (key) => {
    setOpenMonths(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  // 月份標題文字
  const monthLabel = (key) => {
    const [yr, mo] = key.split("-");
    return lang === "zh"
      ? `${yr} 年 ${parseInt(mo)} 月`
      : new Date(parseInt(yr), parseInt(mo) - 1, 1).toLocaleString("en", { month:"long", year:"numeric" });
  };

  return (
    <div style={{ flex:1, overflowY:"auto", background:C.bg }}>
      <div style={{ padding:"8px 20px 14px", background:C.card, borderBottom:`1px solid ${C.sep}` }}>
        <div style={{ fontSize:28, fontWeight:700, color:C.text, letterSpacing:-0.5, marginBottom:10 }}>{t.historyTitle}</div>
        <div style={{ position:"relative" }}>
          <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:C.label, fontSize:15 }}>🔍</span>
          <input value={search} onChange={e => {
            setSearch(e.target.value);
            // 搜尋時展開全部月份
            if (e.target.value) setOpenMonths(new Set(months));
            else setOpenMonths(new Set(months.slice(0, 1)));
          }} placeholder={t.historySearch}
            style={{ width:"100%", background:C.bg, border:`1px solid ${C.sep}`, borderRadius:10, padding:"9px 12px 9px 36px", fontSize:15, color:C.text, boxSizing:"border-box", outline:"none", fontFamily:"inherit" }} />
        </div>
      </div>

      <div style={{ padding:"16px" }}>
        {months.length === 0 && (
          <div style={{ textAlign:"center", padding:"60px 0", color:C.label }}>
            <div style={{ fontSize:36, marginBottom:10 }}>📭</div>
            <div style={{ fontSize:15, fontWeight:500 }}>{t.historyEmpty}</div>
          </div>
        )}

        {months.map(monthKey => {
          const isOpen = openMonths.has(monthKey);
          const monthDates = byMonth[monthKey];
          const dayCount = monthDates.length;

          return (
            <div key={monthKey} style={{ marginBottom:8 }}>
              {/* 月份標題列 */}
              <button onClick={() => toggleMonth(monthKey)}
                style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between",
                  background:C.card, border:`0.5px solid ${C.sep}`, borderRadius:isOpen ? "12px 12px 0 0" : 12,
                  padding:"12px 16px", cursor:"pointer", marginBottom:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontSize:15, fontWeight:700, color:C.text }}>{monthLabel(monthKey)}</span>
                  <span style={{ fontSize:12, color:C.blue, background:`${C.blue}12`, borderRadius:6, padding:"2px 8px", fontWeight:500 }}>
                    {lang === "zh" ? `${dayCount} 日` : `${dayCount} day${dayCount > 1 ? "s" : ""}`}
                  </span>
                </div>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none"
                  stroke={C.label} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition:"transform 0.2s" }}>
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>

              {/* 該月訓練卡片 */}
              {isOpen && (
                <div style={{ paddingTop:8 }}>
                  {monthDates.map((date) => {
                    const day = byDate[date];
                    const d = localDate(date);
                    const wdLabel = lang === "zh" ? WEEKDAY_CN[d.getDay()] : WEEKDAYS[d.getDay()].slice(0, 3);
                    const allMGs = [...new Set(day.workouts.flatMap(w => w.muscleGroups))];
                    const allExercises = [...day.workouts].reverse().flatMap(w => w.exercises);
                    return (
                      <div key={date} onClick={() => onOpenDay(date)}
                        style={{ background:C.card, borderRadius:16, marginBottom:10,
                          boxShadow:"0 1px 4px rgba(0,0,0,0.12)", cursor:"pointer", padding:"14px 16px" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                            <span style={{ fontSize:15, fontWeight:700, color:C.text }}>{d.getMonth() + 1}/{d.getDate()}</span>
                            <span style={{ fontSize:12, fontWeight:500, color:C.blue, background:`${C.blue}12`, borderRadius:6, padding:"2px 8px" }}>{wdLabel}</span>
                            {allMGs.map(mg => (
                              <span key={mg} style={{ fontSize:12, fontWeight:500, color:C.indigo, background:`${C.indigo}12`, borderRadius:6, padding:"2px 8px" }}>
                                {lang === "en" ? MG_EN[mg] || mg : mg}
                              </span>
                            ))}
                          </div>
                          <svg viewBox="0 0 24 24" fill={C.sep} width="14" height="14"><path d="M10 6l6 6-6 6V6z"/></svg>
                        </div>
                        {allExercises.map((ex, i) => {
                          const it = library.find(l => l.id === ex.libId);
                          return (
                            <div key={i} style={{ display:"flex", alignItems:"baseline", gap:8, marginBottom:3 }}>
                              {it && <div style={{ width:7, height:7, borderRadius:"50%", background:it.color, flexShrink:0, marginBottom:1 }} />}
                              <span style={{ fontSize:14, fontWeight:500, color:C.text, flexShrink:0 }}>{it ? it.name : (lang === "en" ? "(Deleted)" : "(已刪除)")}</span>
                              <span style={{ fontSize:12, color:C.label, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                                {ex.weightSets.map(ws => `${ws.weight} x${ws.reps.join("/")}${t.repsUnit}`).join("  ")}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
