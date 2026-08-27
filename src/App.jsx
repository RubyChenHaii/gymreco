import { useState, useEffect } from "react";
import { LangCtx, T } from "./data/i18n.js";
import { INIT_LIBRARY, INIT_WORKOUTS } from "./data/initialData.js";
import { LIGHT, DARK, DarkCtx } from "./theme.js";
import { lsGet, lsSet } from "./hooks/useStorage.js";
import { StatusBar, BottomNav } from "./components/ui.jsx";
import { HomeTab }    from "./tabs/HomeTab.jsx";
import { LogTab }     from "./tabs/LogTab.jsx";
import { HistoryTab } from "./tabs/HistoryTab.jsx";
import { DetailTab, DayDetailTab } from "./tabs/DetailTab.jsx";
import { LibraryTab } from "./tabs/LibraryTab.jsx";
import { AboutTab }   from "./tabs/AboutTab.jsx";

export default function App() {
  const [tab,       setTab]       = useState("home");
  const [prevTab,   setPrevTab]   = useState("home");
  const navigate = (newTab) => { setPrevTab(tab); setTab(newTab); };

  const [workouts,  setWorkouts]  = useState(() => lsGet("wt_workouts", INIT_WORKOUTS));
  const [library,   setLibrary]   = useState(() => lsGet("wt_library",  INIT_LIBRARY));
  const [detailId,  setDetailId]  = useState(null);
  const [detailDate,setDetailDate]= useState(null);
  const [libItemId, setLibItemId] = useState(null);
  const [lang,      setLang]      = useState(() => lsGet("wt_lang", "zh"));
  const [darkMode,  setDarkMode]  = useState(() => lsGet("wt_dark", false));
  const [toast,     setToast]     = useState(null);

  const theme = darkMode ? DARK : LIGHT;
  const detailWorkout = workouts.find(w => w.id === detailId) || null;

  useEffect(() => { lsSet("wt_workouts", workouts); }, [workouts]);
  useEffect(() => { lsSet("wt_library",  library);  }, [library]);
  useEffect(() => { lsSet("wt_lang",     lang);     }, [lang]);
  useEffect(() => { lsSet("wt_dark",     darkMode); }, [darkMode]);

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

  const openLibItem        = (id) => { setLibItemId(id); setTab("library"); };
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
  const handleEditWorkout   = (id) => { setDetailId(id); navigate("detail"); };
  const handleImport        = (newWorkouts, newLibrary) => {
    setWorkouts(newWorkouts);
    setLibrary(newLibrary);
    showToast(lang === "zh" ? "✅ 資料已成功匯入！" : "✅ Data imported successfully!");
  };
const handleReset = () => {
    setWorkouts(INIT_WORKOUTS);
    setLibrary(INIT_LIBRARY);
    showToast(lang === "zh" ? "✅ 已還原為預設範例資料" : "✅ Restored to default sample data");
  };
  const handleClear = () => {
    setWorkouts([]);
    setLibrary([]);
    showToast(lang === "zh" ? "✅ 所有資料已清除" : "✅ All data cleared");
  };

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  return (
    <DarkCtx.Provider value={darkMode}>
      <LangCtx.Provider value={lang}>
        <div style={{ display:"flex", justifyContent:"center", alignItems:"center", minHeight:"100dvh",
          background: isMobile ? theme.bg : "#1C1C1E",
          fontFamily: "-apple-system,'SF Pro Text','Helvetica Neue',sans-serif" }}>
          <div style={isMobile ? {
            width:"100%", height:"100dvh", background:theme.card,
            display:"flex", flexDirection:"column", overflow:"hidden",
          } : {
            width:393, height:852, background:theme.card, borderRadius:52,
            overflow:"hidden", display:"flex", flexDirection:"column", position:"relative",
            boxShadow:"0 0 0 1px rgba(255,255,255,0.1),0 0 0 10px #2C2C2E,0 0 0 11px rgba(255,255,255,0.07),0 40px 100px rgba(0,0,0,0.7)",
          }}>
            {!isMobile && <StatusBar />}
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
                ? <DetailTab
                    workout={detailWorkout}
                    library={library}
                    onBack={() => setTab(prevTab)}
                    onOpenLibItem={openLibItem}
                    onUpdateWorkout={handleUpdateWorkout}
                    onDeleteWorkout={(id) => {
                      handleDeleteWorkout(id);
                      const remaining = workouts.filter(w => w.id !== id && w.date === detailDate);
                      setTab(remaining.length > 0 ? "daydetail" : "history");
                    }} />
              : tab === "daydetail"
                ? <DayDetailTab
                    dayWorkouts={[...workouts.filter(w => w.date === detailDate)].reverse()}
                    library={library}
                    onBack={() => setTab("history")}
                    onOpenLibItem={openLibItem}
                    onEditWorkout={handleEditWorkout} />
              : tab === "log"
                ? <LogTab library={library} onSave={handleSave} onAddToLibrary={handleAddToLibrary} showToast={showToast} />
              : tab === "history"
                ? <HistoryTab workouts={workouts} library={library} onOpenDay={openDayDetail} />
              : tab === "library"
                ? <LibraryTab library={library} setLibrary={setLibrary} openItemId={libItemId} setOpenItemId={setLibItemId} />
              : tab === "about"
                ? <AboutTab workouts={workouts} library={library} onImport={handleImport} onReset={handleReset} onClear={handleClear}/>
              : <HomeTab workouts={workouts} library={library} setTab={navigate} lang={lang} setLang={setLang} darkMode={darkMode} setDarkMode={setDarkMode} openDayDetail={openDayDetail} />}
            </div>
            {tab !== "detail" && tab !== "daydetail" && <BottomNav tab={tab} setTab={setTab} />}
          </div>
        </div>
      </LangCtx.Provider>
    </DarkCtx.Provider>
  );
}

