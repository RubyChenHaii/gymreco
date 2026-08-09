// ── GymReco 共用匯出工具 ─────────────────────────────────────
// 供 AboutTab 呼叫，無第三方依賴

// 動作庫前言 section
export const buildLibrarySection = (library, isZh) => {
  const lines = [];
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
  return lines.join("\n");
};

// 單日訓練 section（供日後擴充單日匯出用）
export const buildDaySection = (date, dayWorkouts, library, isZh) => {
  const lines = [];
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
  return lines.join("\n");
};

// 觸發 .md 下載
export const downloadMD = (content, filename) => {
  const blob = new Blob([content], { type:"text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  a.click(); URL.revokeObjectURL(url);
};

// 從 workouts 建立 byDate 分組（日期正序，每天內訓練從舊到新）
export const groupByDate = (workouts) => {
  const byDate = {};
  // workouts 新在前，reverse 後從舊到新 push，確保每天內順序正確
  [...workouts].reverse().forEach(w => {
    if (!byDate[w.date]) byDate[w.date] = [];
    byDate[w.date].push(w);
  });
  // 將 byDate 依日期正序重新組裝
  return Object.fromEntries(
    Object.entries(byDate).sort(([a], [b]) => a.localeCompare(b))
  );
};

// 主要匯出函式：依 scope 決定範圍
// scope: "all" | "YYYY" | "YYYY-MM"
export const exportMDByScope = ({ scope, workouts, library, isZh, todayStr }) => {
  // 篩選範圍
  const filtered = workouts.filter(w => {
    if (scope === "all") return true;
    return w.date.startsWith(scope);
  });

  if (filtered.length === 0) return;

  const byDate = groupByDate(filtered);
  const lines = [];

  // 標題
  const scopeLabel = (() => {
    if (scope === "all") return isZh ? "完整訓練日誌" : "Full Workout Log";
    if (scope.length === 4) return isZh ? `${scope} 年訓練日誌` : `${scope} Workout Log`;
    const [yr, mo] = scope.split("-");
    return isZh ? `${yr} 年 ${parseInt(mo)} 月訓練日誌` : `${new Date(parseInt(yr), parseInt(mo)-1).toLocaleString("en",{month:"long"})} ${yr} Log`;
  })();

  lines.push(`# GymReco ${scopeLabel}`);
  lines.push(`${isZh ? "匯出時間" : "Exported"}: ${new Date().toISOString()}\n`);

  // 全部匯出時才加動作庫前言
  if (scope === "all") {
    lines.push(buildLibrarySection(library, isZh));
    lines.push(`---\n`);
    lines.push(`## ${isZh ? "完整訓練紀錄" : "Full Training Log"}\n`);
  }

  // 每日內容
  Object.entries(byDate).forEach(([date, dayWorkouts]) => {
    lines.push(buildDaySection(date, dayWorkouts, library, isZh));
  });

  // 檔名
  const filename = scope === "all"
    ? `gymreco-log-${todayStr}.md`
    : `gymreco-${scope}-log.md`;

  downloadMD(lines.join("\n"), filename);
};
