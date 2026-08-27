// ── 配速相關計算工具 ──────────────────────────────────────────
// 供 LengthPaceEditor、LibraryTab、DetailTab、exportUtils 共用

// 將 distance 數值拆成整數位 / 小數位（0.1 為單位），供 NumberPicker 顯示
export const splitDistance = (distance) => {
  const d = distance || 0;
  const intPart = Math.floor(d);
  let decPart = Math.round((d - intPart) * 10);
  if (decPart === 10) return { intPart: intPart + 1, decPart: 0 };
  return { intPart, decPart };
};

// 將整數位 / 小數位合併回 distance 數值
export const joinDistance = (intPart, decPart) => intPart + decPart / 10;

// 格式化距離顯示，例如 5 → "5"，5.5 → "5.5"
export const fmtDistance = (n) => {
  const rounded = Math.round(n * 10) / 10;
  return rounded % 1 === 0 ? String(rounded) : rounded.toFixed(1);
};

// 格式化配速顯示，例如 (6, 5) → 6'05"
export const fmtPace = (min, sec) => `${min}'${String(sec).padStart(2, "0")}"`;

// 計算整體配速
// 輸入：lengthPace = [{ distance, unit, paceMin, paceSec }, ...]
// 若各段 unit 不一致（去除前後空白後比對），回傳 null
// 回傳：{ totalDistance, unit, paceMin, paceSec } 或 null
export const calcOverallPace = (lengthPace) => {
  if (!lengthPace || lengthPace.length === 0) return null;

  const baseUnit = (lengthPace[0].unit || "").trim();
  const unitsMatch = lengthPace.every(seg => (seg.unit || "").trim() === baseUnit);
  if (!unitsMatch || !baseUnit) return null;

  const totalDistance = lengthPace.reduce((sum, seg) => sum + (seg.distance || 0), 0);
  if (totalDistance <= 0) return null;

  const totalSeconds = lengthPace.reduce((sum, seg) => {
    const segSeconds = (seg.paceMin || 0) * 60 + (seg.paceSec || 0);
    return sum + (seg.distance || 0) * segSeconds;
  }, 0);

  const avgSecPerUnit = totalSeconds / totalDistance;
  let paceMin = Math.floor(avgSecPerUnit / 60);
  let paceSec = Math.round(avgSecPerUnit % 60);
  if (paceSec === 60) { paceMin += 1; paceSec = 0; } // 秒數四捨五入進位保護

  return {
    totalDistance: Math.round(totalDistance * 10) / 10,
    unit: lengthPace[0].unit,
    paceMin,
    paceSec,
  };
};