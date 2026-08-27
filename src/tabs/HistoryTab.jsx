import { useState } from "react";
import { useLang, T, MG_EN } from "../data/i18n.js";
import { WEEKDAYS, WEEKDAY_CN } from "../data/constants.js";
import { useC } from "../theme.js";
import { localDate } from "../utils/date.js";
import { Card } from "../components/ui.jsx";
import { fmtDistance, fmtPace } from "../utils/paceUtils.js";

// 格式化單天所有訓練為純文字

export function HistoryTab({ workouts, library, onOpenDay }) {
  const lang = useLang(); const t = T[lang]; const C = useC();
  const isZh = lang === "zh";
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

  // ── 依年份分組，最新年份在最前 ────────────────────────────
  const byYear = {};
  months.forEach(monthKey => {
    const yr = monthKey.slice(0, 4); // "YYYY"
    if (!byYear[yr]) byYear[yr] = [];
    byYear[yr].push(monthKey);
  });
  const years = Object.keys(byYear).sort((a, b) => b.localeCompare(a));

  // ── 展開狀態：年 & 月各自獨立 ────────────────────────────
  const defaultOpenYears  = search ? new Set(years) : new Set(years.slice(0, 1));
  const defaultOpenMonths = search ? new Set(months) : new Set(months.slice(0, 1));
  const [openYears,  setOpenYears]  = useState(defaultOpenYears);
  const [openMonths, setOpenMonths] = useState(defaultOpenMonths);

  const toggleYear = (yr) => {
    setOpenYears(prev => {
      const next = new Set(prev);
      next.has(yr) ? next.delete(yr) : next.add(yr);
      return next;
    });
  };
  const toggleMonth = (key) => {
    setOpenMonths(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  return (
    <div style={{ flex:1, overflowY:"auto", background:C.bg }}>
      <div style={{ padding:"8px 20px 14px", background:C.card, borderBottom:`1px solid ${C.sep}` }}>
        <div style={{ fontSize:28, fontWeight:700, color:C.text, letterSpacing:-0.5, marginBottom:10 }}>{t.historyTitle}</div>
        <div style={{ position:"relative" }}>
          <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:C.label, fontSize:15 }}>🔍</span>
          <input value={search} onChange={e => {
            setSearch(e.target.value);
            if (e.target.value) {
              setOpenYears(new Set(years));
              setOpenMonths(new Set(months));
            } else {
              setOpenYears(new Set(years.slice(0, 1)));
              setOpenMonths(new Set(months.slice(0, 1)));
            }
          }} placeholder={t.historySearch}
            style={{ width:"100%", background:C.bg, border:`1px solid ${C.sep}`, borderRadius:10, padding:"9px 12px 9px 36px", fontSize:15, color:C.text, boxSizing:"border-box", outline:"none", fontFamily:"inherit" }} />
        </div>
      </div>

      <div style={{ padding:"16px" }}>
        {years.length === 0 && (
          <div style={{ textAlign:"center", padding:"60px 0", color:C.label }}>
            <div style={{ fontSize:36, marginBottom:10 }}>📭</div>
            <div style={{ fontSize:15, fontWeight:500 }}>{t.historyEmpty}</div>
          </div>
        )}

        {years.map((yr, yrIdx) => {
          const isYearOpen = openYears.has(yr);
          const yearMonths = byYear[yr];
          const yearDayCount = yearMonths.reduce((sum, mk) => sum + byMonth[mk].length, 0);
          // 每年固定但不重複的顏色，依年份 hash 決定
          const YEAR_COLORS = ["#007AFF","#34C759","#FF9500","#AF52DE","#FF3B30","#5AC8FA","#FF2D55","#5856D6"];
          const yearColor = YEAR_COLORS[parseInt(yr) % YEAR_COLORS.length];
          return (
            <div key={yr} style={{ marginBottom:12 }}>
              {/* 年度大標題 */}
              <button onClick={() => toggleYear(yr)}
                style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between",
                  background:"none", border:"none", borderBottom:`1px solid ${C.sep}`,
                  padding:"10px 0 10px 4px", cursor:"pointer", marginBottom:8 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:3, height:18, borderRadius:2, background:`${yearColor}70`, flexShrink:0 }}/>
                  <span style={{ fontSize:18, fontWeight:700, color:C.text, letterSpacing:-0.3 }}>
                    {lang === "zh" ? `${yr} 年` : yr}
                  </span>
                  <span style={{ fontSize:11, fontWeight:500, color:C.label }}>
                    {lang === "zh" ? `${yearDayCount} 日` : `${yearDayCount} day${yearDayCount > 1 ? "s" : ""}`}
                  </span>
                </div>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none"
                  stroke={C.label} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  style={{ transform: isYearOpen ? "rotate(180deg)" : "rotate(0deg)", transition:"transform 0.2s" }}>
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>
              {isYearOpen && (
                <div>
                  {yearMonths.map(monthKey => {
                    const isMonthOpen = openMonths.has(monthKey);
                    const monthDates = byMonth[monthKey];
                    const dayCount = monthDates.length;
                    const [, mo] = monthKey.split("-");
                    const mLabel = lang === "zh"
                      ? `${parseInt(mo)} 月`
                      : new Date(parseInt(yr), parseInt(mo) - 1, 1).toLocaleString("en", { month:"long" });
                    return (
                      <div key={monthKey} style={{ marginBottom:10 }}>
                        {/* 月份標題 */}
                        <button onClick={() => toggleMonth(monthKey)}
                          style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between",
                            background:"none", border:"none",
                            padding:"6px 4px", cursor:"pointer", marginBottom: isMonthOpen ? 6 : 0 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                            <span style={{ fontSize:13, fontWeight:600, color:C.sub, letterSpacing:0.3 }}>{mLabel}</span>
                            <span style={{ fontSize:11, color:C.label }}>
                              {lang === "zh" ? `${dayCount} 日` : `${dayCount} day${dayCount > 1 ? "s" : ""}`}
                            </span>
                          </div>
                          <svg viewBox="0 0 24 24" width="12" height="12" fill="none"
                            stroke={C.label} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            style={{ transform: isMonthOpen ? "rotate(180deg)" : "rotate(0deg)", transition:"transform 0.2s" }}>
                            <path d="M6 9l6 6 6-6"/>
                          </svg>
                        </button>
                        {/* 該月訓練卡片 */}
                        {isMonthOpen && (
                          <div>
                            {monthDates.map(date => {
                              const day = byDate[date];
                              const d = localDate(date);
                              const wdLabel = lang === "zh" ? WEEKDAY_CN[d.getDay()] : WEEKDAYS[d.getDay()].slice(0, 3);
                              const allMGs = [...new Set(day.workouts.flatMap(w => w.muscleGroups))];
                              const allExercises = [...day.workouts].reverse().flatMap(w => w.exercises);
                              return (
                                <div key={date} onClick={() => onOpenDay(date)}
                                  style={{ margin:"0 0 8px", background:C.card, borderRadius:12,
                                    border:`1px solid ${C.sep}`, cursor:"pointer", padding:"12px 14px" }}>
                                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                                    <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                                      <span style={{ fontSize:14, fontWeight:700, color:C.text }}>{d.getMonth()+1}/{d.getDate()}</span>
                                      <span style={{ fontSize:11, fontWeight:500, color:C.blue, background:`${C.blue}12`, borderRadius:6, padding:"2px 7px" }}>{wdLabel}</span>
                                      {allMGs.map(mg => (
                                        <span key={mg} style={{ fontSize:11, fontWeight:500, color:C.indigo, background:`${C.indigo}12`, borderRadius:6, padding:"2px 7px" }}>
                                          {lang === "en" ? MG_EN[mg] || mg : mg}
                                        </span>
                                      ))}
                                    </div>
                                    <svg viewBox="0 0 24 24" fill={C.sep} width="13" height="13"><path d="M10 6l6 6-6 6V6z"/></svg>
                                  </div>
                                  {allExercises.map((ex, i) => {
                                    const it = library.find(l => l.id === ex.libId);
                                    const summary = (ex.mode || "weight_sets") === "length_pace"
                                     ? (ex.lengthPace || []).map(seg => `${fmtDistance(seg.distance)}${seg.unit} @${fmtPace(seg.paceMin, seg.paceSec)}`).join("  ")
                                     : (ex.weightSets || []).map(ws => `${ws.weight} ×${ws.reps.join("/")}${t.repsUnit}`).join("  ");
                                    return (
                                      <div key={i} style={{ display:"flex", alignItems:"baseline", gap:7, marginBottom:2 }}>
                                        {it && <div style={{ width:6, height:6, borderRadius:"50%", background:it.color, flexShrink:0 }} />}
                                        <span style={{ fontSize:13, fontWeight:500, color:C.text, flexShrink:0 }}>{it ? it.name : (lang === "en" ? "(Deleted)" : "(已刪除)")}</span>
                                        <span style={{ fontSize:11, color:C.label, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                                          {summary}
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
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}