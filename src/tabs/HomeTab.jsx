import { useState } from "react";
import { useLang, T, MG_EN } from "../data/i18n.js";
import { MONTHS_EN, WEEKDAYS, WEEKDAY_CN } from "../data/constants.js";
import { useC } from "../theme.js";
import { todayStr, localDate, fmtDate } from "../utils/date.js";
import { Div, Card, SLabel } from "../components/ui.jsx";

function Calendar({ workouts, library, onDayClick }) {
  const lang = useLang(); const t = T[lang]; const C = useC();
  const [vd, setVd] = useState(new Date());
  const yr = vd.getFullYear(), mo = vd.getMonth();
  const firstDay = new Date(yr, mo, 1).getDay();
  const dim = new Date(yr, mo + 1, 0).getDate();
  const todStr = todayStr();

  const byDate = {};
  workouts.forEach(w => {
    if (!byDate[w.date]) byDate[w.date] = { date: w.date, exercises: [] };
    byDate[w.date].exercises.push(...w.exercises);
  });

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= dim; d++) cells.push(d);

  return (
    <Card style={{ marginBottom: 16 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 16px 10px" }}>
        <button onClick={() => setVd(new Date(yr, mo - 1, 1))} style={{ background:"none", border:"none", cursor:"pointer", fontSize:20, color:C.blue, padding:"0 4px", lineHeight:1 }}>‹</button>
        <span style={{ fontSize:15, fontWeight:700, color:C.text }}>
          {lang === "zh" ? `${yr} 年 ${mo + 1} 月` : `${MONTHS_EN[mo]} ${yr}`}
        </span>
        <button onClick={() => setVd(new Date(yr, mo + 1, 1))} style={{ background:"none", border:"none", cursor:"pointer", fontSize:20, color:C.blue, padding:"0 4px", lineHeight:1 }}>›</button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", padding:"0 10px 6px" }}>
        {t.weekdays.map((d, i) => (
          <div key={d} style={{ textAlign:"center", fontSize:11, fontWeight:600, color:i===0?C.red:i===6?`${C.blue}99`:C.label, padding:"2px 0" }}>{d}</div>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", padding:"0 10px 14px", gap:"2px 0" }}>
        {cells.map((day, idx) => {
          if (!day) return <div key={`_${idx}`} />;
          const ds = `${yr}-${String(mo + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const w = byDate[ds];
          const isToday = ds === todStr;
          const dow = (firstDay + day - 1) % 7;
          return (
            <div key={day} onClick={() => w && onDayClick(ds)}
              style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3, padding:"4px 2px", cursor:w?"pointer":"default", borderRadius:10 }}>
              <span style={{ fontSize:13, fontWeight:isToday?700:400, width:26, height:26, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:"50%",
                background:isToday?C.blue:"transparent",
                color:isToday?"#fff":dow===0?C.red:dow===6?`${C.blue}99`:C.text }}>
                {day}
              </span>
              {w && (
                <div style={{ display:"flex", gap:2, justifyContent:"center", flexWrap:"wrap", maxWidth:28 }}>
                  {/* 每種顏色只顯示一次，依出現順序排列，最多3個點 */}
                  {w.exercises
                    .map(ex => library.find(l => l.id === ex.libId))
                    .filter(Boolean)
                    .filter((it, _, arr) => arr.findIndex(x => x.color === it.color) === arr.indexOf(it))
                    .slice(0, 3)
                    .map((it, i) => (
                      <div key={i} style={{ width:5, height:5, borderRadius:"50%", background:it.color }} />
                    ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export function HomeTab({ workouts, library, setTab, lang, setLang, darkMode, setDarkMode, openDayDetail }) {
  const t = T[lang]; const C = useC();
  const now = new Date(), weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
  const thisWeek = workouts.filter(w => localDate(w.date) >= weekAgo);

  // 最近紀錄：以日為單位，去除同日重複，取最近 3 天
  const recentDates = [...new Set(
    [...workouts].sort((a, b) => localDate(b.date) - localDate(a.date)).map(w => w.date)
  )].slice(0, 3);
  const recentByDate = recentDates.map(date => {
    const dayWorkouts = workouts.filter(w => w.date === date);
    const allMGs = [...new Set(dayWorkouts.flatMap(w => w.muscleGroups))];
    const allExercises = [...dayWorkouts].reverse().flatMap(w => w.exercises);
    const weekday = dayWorkouts[0].weekday;
    return { date, weekday, allMGs, allExercises };
  });

  return (
    <div style={{ flex:1, overflowY:"auto", background:C.bg }}>
      <div style={{ padding:"8px 20px 16px", background:C.card, borderBottom:`1px solid ${C.sep}`, display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
        <div>
          <div style={{ fontSize:13, color:C.label, marginBottom:2 }}>{t.homeSubtitle}</div>
          <div style={{ fontSize:28, fontWeight:700, color:C.text, letterSpacing:-0.5 }}>{t.homeTitle}</div>
        </div>
        <div style={{ display:"flex", gap:8, marginBottom:4 }}>
          <button onClick={() => setDarkMode(d => !d)}
            style={{ background:C.f5, border:`1px solid ${C.sep}`, borderRadius:20, padding:"5px 12px", fontSize:15, cursor:"pointer" }}>
            {darkMode ? "☀️" : "🌙"}
          </button>
          <button onClick={() => setLang(l => l === "zh" ? "en" : "zh")}
            style={{ background:C.f5, border:`1px solid ${C.sep}`, borderRadius:20, padding:"5px 14px", fontSize:13, fontWeight:600, color:C.sub, cursor:"pointer", letterSpacing:0.3 }}>
            {t.langBtn}
          </button>
        </div>
      </div>
      <div style={{ padding:"16px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
          <Card style={{ padding:"14px 16px" }}>
            <div style={{ fontSize:26, fontWeight:700, color:C.text }}>{thisWeek.length}<span style={{ fontSize:13, fontWeight:500, color:C.label }}> {t.times}</span></div>
            <div style={{ fontSize:12, color:C.label, marginTop:2 }}>{t.statWeekCount}</div>
          </Card>
          <Card style={{ padding:"14px 16px" }}>
            <div style={{ fontSize:26, fontWeight:700, color:C.text }}>{library.length}<span style={{ fontSize:13, fontWeight:500, color:C.label }}> {t.pieces}</span></div>
            <div style={{ fontSize:12, color:C.label, marginTop:2 }}>{t.statLibCount}</div>
          </Card>
        </div>
        <SLabel>{t.sectionCalendar}</SLabel>
        <Calendar workouts={workouts} library={library} onDayClick={date => openDayDetail(date)} />
        <SLabel>{t.sectionRecent}</SLabel>
        <Card style={{ marginBottom:16 }}>
          {recentByDate.length === 0 && <div style={{ padding:"32px", textAlign:"center", color:C.label, fontSize:14 }}>{t.emptyRecent}</div>}
          {recentByDate.map((day, i) => (
            <div key={day.date}>
              {i > 0 && <Div left={20} />}
              <div onClick={() => openDayDetail(day.date)} style={{ padding:"14px 16px", cursor:"pointer", display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ flexShrink:0 }}>
                  <div style={{ fontSize:11, fontWeight:600, color:C.blue, background:`${C.blue}15`, borderRadius:6, padding:"2px 8px" }}>
                    {lang === "zh" ? WEEKDAY_CN[WEEKDAYS.indexOf(day.weekday)] : day.weekday.slice(0, 3)}
                  </div>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                    <span style={{ fontSize:15, fontWeight:600, color:C.text }}>
                      {lang === "zh" ? day.allMGs.join("・") : day.allMGs.map(mg => MG_EN[mg] || mg).join(" · ")}
                    </span>
                    <span style={{ fontSize:12, color:C.label }}>{fmtDate(day.date, lang)}</span>
                  </div>
                  <div style={{ fontSize:12, color:C.label }}>
                    {day.allExercises.map(ex => { const it = library.find(l => l.id === ex.libId); return it ? it.name : (lang === "en" ? "(Deleted)" : "(已刪除)"); }).join(lang === "zh" ? "、" : ", ")}
                  </div>
                </div>
                <svg viewBox="0 0 24 24" fill={C.sep} width="14" height="14"><path d="M10 6l6 6-6 6V6z"/></svg>
              </div>
            </div>
          ))}
        </Card>
        <button onClick={() => setTab("log")} style={{ width:"100%", padding:"16px", background:C.blue, border:"none", borderRadius:16, color:"#fff", fontSize:16, fontWeight:600, cursor:"pointer", boxShadow:"0 4px 16px rgba(0,122,255,0.3)" }}>
          {t.btnStartToday}
        </button>
      </div>
    </div>
  );
}
