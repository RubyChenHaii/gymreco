import { useState, useEffect, useMemo } from "react";
import { LangCtx, T } from "./data/i18n.js";
import { INIT_LIBRARY, INIT_WORKOUTS } from "./data/initialData.js";
import { LIGHT, DARK, DarkCtx, CalendarGradientCtx } from "./theme.js";
import { lsGet, lsSet } from "./hooks/useStorage.js";
import { StatusBar, BottomNav } from "./components/ui.jsx";
import { SwipeBackView } from "./components/SwipeBackView.jsx";
import { HomeTab }    from "./tabs/HomeTab.jsx";
import { LogTab }     from "./tabs/LogTab.jsx";
import { HistoryTab } from "./tabs/HistoryTab.jsx";
import { DetailTab, DayDetailTab } from "./tabs/DetailTab.jsx";
import { LibraryTab } from "./tabs/LibraryTab.jsx";
import { RoutineTab } from "./tabs/RoutineTab.jsx";
import { AboutTab }   from "./tabs/AboutTab.jsx";

const SUB_TABS = ["detail", "daydetail", "routine"]; // 子頁：進入時要把來源頁推入導覽堆疊
export default function App() {
  const [tab,       setTab]       = useState("home");
  // 導覽堆疊：依序記錄每個子頁「進入前所在的頁面」，取代原本只能記一層的 prevTab
  const [navStack, setNavStack] = useState([]);
  // 目前的動作庫詳情是否從訓練頁（detail / daydetail）的「動作庫 →」進入；是的話返回要回到來源頁，而不是動作庫列表
  const [libItemFromSub, setLibItemFromSub] = useState(false);

  // 進入子頁 → 推入來源頁；切換到一般分頁 → 清空堆疊
  const navigate = (newTab) => {
    setNavStack(s => SUB_TABS.includes(newTab) ? [...s, tab] : []);
    setTab(newTab);
  };
  // 返回 steps 層（預設 1 層）；堆疊為空時保底回首頁
  const goBack = (steps = 1) => {
    const idx = Math.max(0, navStack.length - steps);
    setTab(navStack[idx] ?? "home");
    setNavStack(navStack.slice(0, idx));
  };
  // 底部分頁列切換：視為「重新開始」，清空堆疊與來源標記；點目前所在分頁則不處理
  const switchTab = (newTab) => {
    if (newTab === tab) return;
    setNavStack([]);
    setLibItemFromSub(false);
    setTab(newTab);
  };

  const [workouts,  setWorkouts]  = useState(() => lsGet("wt_workouts", INIT_WORKOUTS));
  const [library,   setLibrary]   = useState(() => lsGet("wt_library",  INIT_LIBRARY));
  const [routines,  setRoutines]  = useState(() => lsGet("wt_routines", []));
  const [detailId,  setDetailId]  = useState(null);
  const [detailDate,setDetailDate]= useState(null);
  const [libItemId, setLibItemId] = useState(null);
  const [lang,      setLang]      = useState(() => lsGet("wt_lang", "zh"));
  const [darkMode,  setDarkMode]  = useState(() => lsGet("wt_dark", false));
  const [homeStatPeriod, setHomeStatPeriod] = useState(() => lsGet("wt_homeStatPeriod", "week")); // 首頁右上角統計卡片要顯示週規則還是月規則的達標數
  const [calendarGradientMode, setCalendarGradientMode] = useState(() => lsGet("wt_calGradientMode", "animated")); // "animated" | "static" | "off"
  const [calendarGradientStyle, setCalendarGradientStyle] = useState(() => lsGet("wt_calGradientStyle", "linear")); // "linear" | "conic"
  const [calendarViewDate, setCalendarViewDate] = useState(new Date());
  const [toast,     setToast]     = useState(null);

  const theme = darkMode ? DARK : LIGHT;
  const detailWorkout = workouts.find(w => w.id === detailId) || null;

  useEffect(() => { lsSet("wt_workouts", workouts); }, [workouts]);
  useEffect(() => { lsSet("wt_library",  library);  }, [library]);
  useEffect(() => { lsSet("wt_routines", routines); }, [routines]);
  useEffect(() => { lsSet("wt_lang",     lang);     }, [lang]);
  useEffect(() => { lsSet("wt_dark",     darkMode); }, [darkMode]);
  useEffect(() => { lsSet("wt_homeStatPeriod", homeStatPeriod); }, [homeStatPeriod]);
  useEffect(() => { lsSet("wt_calGradientMode", calendarGradientMode); }, [calendarGradientMode]);
  useEffect(() => { lsSet("wt_calGradientStyle", calendarGradientStyle); }, [calendarGradientStyle]);
  const [swUpdateAvailable, setSwUpdateAvailable] = useState(false);
  useEffect(() => {
    const handleSwUpdate = () => setSwUpdateAvailable(true);
    window.addEventListener("sw-update-available", handleSwUpdate);
    return () => window.removeEventListener("sw-update-available", handleSwUpdate);
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleSave = (workout, noteUpdates) => {
    setWorkouts(p => [workout, ...p]);
    setLibrary(p => p.map(item => {
      const noteUpd = noteUpdates.find(u => u.libId === item.id);
      const usedEx  = workout.exercises.find(ex => ex.libId === item.id);
      if (!usedEx && !noteUpd) return item;
      const { libId, ...exData } = usedEx || {};
      return {
        ...item,
        note: noteUpd ? noteUpd.note : item.note,
        history: usedEx
          ? [...item.history, { date:workout.date, workoutId:workout.id, ...exData }]
          : item.history,
      };
    }));
    setTimeout(() => {
      setTab("home");
      showToast(T[lang].savedAlert);
    }, 0);
  };

  // 從訓練頁的「動作庫 →」進入：推入來源頁、標記來源，之後返回就會回到那一頁
  const openLibItem = (id) => {
    setNavStack(s => [...s, tab]);
    setLibItemFromSub(true);
    setLibItemId(id);
    setTab("library");
  };
  // 交給 LibraryTab 當 setOpenItemId 用：
  // - 傳入 id（動作庫列表點選）→ 一般進入，不算來自訓練頁
  // - 傳入 null（返回 / 刪除動作 / 右滑）→ 若來自訓練頁，就回到來源頁，否則只是回到動作庫列表
  const handleSetLibItem = (id) => {
    setLibItemId(id);
    if (id !== null) { setLibItemFromSub(false); return; }
    if (libItemFromSub) { setLibItemFromSub(false); goBack(); }
  };
  const handleAddToLibrary  = (newItem) => setLibrary(p => [...p, newItem]);
  const handleUpdateWorkout = (updated) => {
    setWorkouts(p => p.map(w => w.id === updated.id ? updated : w));
    // 延遲到下一個 tick，避免兩個 setState 同時觸發阻塞主執行緒
    setTimeout(() => {
      setLibrary(p => p.map(item => ({
        ...item,
        history: item.history.map(h => {
          if (h.workoutId !== updated.id) return h;
          const updatedEx = updated.exercises.find(ex => ex.libId === item.id);
          if (!updatedEx) return h;
          const { libId, ...exData } = updatedEx;
          return { ...h, ...exData };
        }),
      })));
    }, 0);
  };
  const handleDeleteWorkout = (id) => {
    setWorkouts(p => p.filter(w => w.id !== id));
    setTimeout(() => {
      setLibrary(p => p.map(item => ({
        ...item,
        history: item.history.filter(h => h.workoutId !== id),
      })));
    }, 0);
  };
  const openDayDetail       = (date) => { setDetailDate(date); navigate("daydetail"); };
  const openRoutines        = () => navigate("routine");
  const handleEditWorkout   = (id) => { setDetailId(id); navigate("detail"); };
  const handleImport        = (newWorkouts, newLibrary, newRoutines) => {
    setWorkouts(newWorkouts);
    setLibrary(newLibrary);
    setRoutines(newRoutines || []);
    showToast(lang === "zh" ? "✅ 資料已成功匯入！" : "✅ Data imported successfully!");
  };
const handleReset = () => {
    setWorkouts(INIT_WORKOUTS);
    setLibrary(INIT_LIBRARY);
    setRoutines([]);
    showToast(lang === "zh" ? "✅ 已還原為預設範例資料" : "✅ Restored to default sample data");
  };
  const handleClear = () => {
    setWorkouts([]);
    setLibrary([]);
    setRoutines([]);
    showToast(lang === "zh" ? "✅ 所有資料已清除" : "✅ All data cleared");
  };

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const calYr = calendarViewDate.getFullYear();
  const calMo = calendarViewDate.getMonth();
  const calDim = new Date(calYr, calMo + 1, 0).getDate();

  // 本月「顏色→出現天數」統計，供月曆背景漸層使用；同一天內同色只算一次
  const monthColorStats = useMemo(() => {
    const byDate = {};
    [...workouts].reverse().forEach(w => {
      if (!byDate[w.date]) byDate[w.date] = { exercises: [] };
      byDate[w.date].exercises.push(...w.exercises);
    });
    const dayCount = {};
    for (let d = 1; d <= calDim; d++) {
      const ds = `${calYr}-${String(calMo + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const w = byDate[ds];
      if (!w) continue;
      const seen = new Set();
      w.exercises.forEach(ex => {
        const it = library.find(l => l.id === ex.libId);
        if (it) seen.add(it.color);
      });
      seen.forEach(c => { dayCount[c] = (dayCount[c] || 0) + 1; });
    }
    const topColors = Object.entries(dayCount).sort((a, b) => b[1] - a[1]).slice(0, 4);
    const colorTotal = topColors.reduce((sum, [, count]) => sum + count, 0);
    return { topColors, colorTotal };
  }, [workouts, library, calYr, calMo, calDim]);

  return (
    <DarkCtx.Provider value={darkMode}>
      <LangCtx.Provider value={lang}>
        <CalendarGradientCtx.Provider value={{ ...monthColorStats, viewDate: calendarViewDate, setViewDate: setCalendarViewDate }}>
          <div style={{ display:"flex", justifyContent:"center", alignItems:"center", minHeight:"100dvh",
            background: isMobile ? theme.bg : "#1C1C1E",
            fontFamily: "-apple-system,'SF Pro Text','Helvetica Neue',sans-serif" }}>
            <div style={isMobile ? {
              width:"100%", height:"100dvh", background:theme.card,
              display:"flex", flexDirection:"column", overflow:"hidden",
              containerType:"inline-size",   // ← 新增：讓內部子元件可用 cqw 抓到「這個外殼」的實際寬度
            } : {
              width:393, height:852, background:theme.card, borderRadius:52,
              overflow:"hidden", display:"flex", flexDirection:"column", position:"relative",
              boxShadow:"0 0 0 1px rgba(255,255,255,0.1),0 0 0 10px #2C2C2E,0 0 0 11px rgba(255,255,255,0.07),0 40px 100px rgba(0,0,0,0.7)",
              containerType:"inline-size",   // ← 新增：同上，讓 Mac 預覽的固定外殼也套用同一套邏輯
            }}>
              {!isMobile && <StatusBar />}
              {swUpdateAvailable && (
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10,
                  padding:"10px 16px", background:theme.blue, color:"#fff", fontSize:13, fontWeight:600, flexShrink:0 }}>
                  <span>{T[lang].swUpdateMsg}</span>
                  <button onClick={() => window.location.reload()}
                    style={{ background:"rgba(255,255,255,0.25)", border:"none", borderRadius:8, padding:"5px 12px", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", flexShrink:0 }}>
                    {T[lang].swUpdateBtn}
                  </button>
                </div>
              )}
              {toast && (
                <div style={{ position:"absolute", top:60, left:"50%", transform:"translateX(-50%)",
                  background:"rgba(0,0,0,0.82)", color:"#fff", borderRadius:20, padding:"10px 20px",
                  fontSize:14, fontWeight:500, zIndex:400, whiteSpace:"nowrap",
                  boxShadow:"0 4px 16px rgba(0,0,0,0.3)" }}>
                  {toast}
                </div>
              )}
              <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", background:theme.bg }}>
                  {tab === "detail"
                  ? <SwipeBackView key="detail" onBack={() => goBack()}>
                      <DetailTab
                        workout={detailWorkout}
                        library={library}
                        onBack={() => goBack()}
                        onOpenLibItem={openLibItem}
                        onUpdateWorkout={handleUpdateWorkout}
                        onDeleteWorkout={(id) => {
                          handleDeleteWorkout(id);
                          const remaining = workouts.filter(w => w.id !== id && w.date === detailDate);
                          // 當天還有其他訓練 → 回當日總覽；已清空 → 連當日總覽也跳過，直接回到進入當日總覽之前的頁面
                          goBack(remaining.length > 0 ? 1 : 2);
                        }} />
                    </SwipeBackView>
                : tab === "daydetail"
                  ? <SwipeBackView key="daydetail" onBack={() => goBack()}>
                      <DayDetailTab
                        dayWorkouts={[...workouts.filter(w => w.date === detailDate)].reverse()}
                        library={library}
                        onBack={() => goBack()}
                        onOpenLibItem={openLibItem}
                        onEditWorkout={handleEditWorkout} />
                    </SwipeBackView>
                : tab === "log"
                  ? <LogTab library={library} routines={routines} workouts={workouts} onSave={handleSave} onAddToLibrary={handleAddToLibrary} showToast={showToast} onOpenRoutines={openRoutines} />
                : tab === "history"
                  ? <HistoryTab workouts={workouts} library={library} onOpenDay={openDayDetail} />
                : tab === "library"
                  ? <LibraryTab library={library} setLibrary={setLibrary} openItemId={libItemId} setOpenItemId={handleSetLibItem} />
                : tab === "routine"
                  ? <SwipeBackView key="routine" onBack={() => goBack()}>
                      <RoutineTab routines={routines} setRoutines={setRoutines} library={library} workouts={workouts} homeStatPeriod={homeStatPeriod} setHomeStatPeriod={setHomeStatPeriod} onBack={() => goBack()} />
                    </SwipeBackView>
                : tab === "about"
                  ? <AboutTab workouts={workouts} library={library} routines={routines} onImport={handleImport} onReset={handleReset} onClear={handleClear} calendarGradientMode={calendarGradientMode} setCalendarGradientMode={setCalendarGradientMode} calendarGradientStyle={calendarGradientStyle} setCalendarGradientStyle={setCalendarGradientStyle} />
                : <HomeTab workouts={workouts} library={library} routines={routines} homeStatPeriod={homeStatPeriod} setTab={navigate} lang={lang} setLang={setLang} darkMode={darkMode} setDarkMode={setDarkMode} openDayDetail={openDayDetail} calendarGradientMode={calendarGradientMode} calendarGradientStyle={calendarGradientStyle} />
                }
              </div>
              {tab !== "detail" && tab !== "daydetail" && tab !== "routine" && <BottomNav tab={tab} setTab={switchTab} />}
            </div>
          </div>
        </CalendarGradientCtx.Provider>
      </LangCtx.Provider>
    </DarkCtx.Provider>
  );
}

