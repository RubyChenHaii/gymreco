import { useState, useRef, useEffect } from "react";
import { useC } from "../theme.js";

const EDGE_WIDTH       = 16;    // 左側感應條寬度（px）
const START_THRESHOLD  = 6;     // 水平位移超過這個值才算「開始手勢」
const CLOSE_RATIO      = 0.35;  // 拖曳超過外殼寬度的 35% 放開就返回
const FLING_VELOCITY   = 0.5;   // 放開時速度（px/ms）超過此值也算返回（快速一甩）
const FLING_MIN_DIST   = 40;    // 搭配速度判斷的最小位移，避免手指抖動誤觸
const SETTLE_MS        = 220;   // 滑出 / 彈回動畫時間

// 子頁的「邊緣右滑返回」外殼：
// - 只在左側 EDGE_WIDTH 的透明感應條上監聽手勢，頁面本身的捲動/點擊完全不受影響
// - 拖曳時整頁跟手往右移，背後露出 theme.bg 底色（輕量版，不露出上一頁）
// - onBack 沿用各頁原本的返回函式，不改動既有導覽邏輯
export function SwipeBackView({ onBack, enabled = true, children }) {
  const C = useC();
  const [dx,   setDx]   = useState(0);
  const [mode, setMode] = useState("idle"); // "idle" | "dragging" | "settling"

  const wrapRef   = useRef(null);
  const onBackRef = useRef(onBack);
  const timerRef  = useRef(null);
  const g = useRef({ active:false, started:false, startX:0, startY:0, lastX:0, lastT:0, vel:0, width:0 });

  useEffect(() => { onBackRef.current = onBack; }, [onBack]);
  useEffect(() => () => clearTimeout(timerRef.current), []);

  const settle = (goBack) => {
    setMode("settling");
    setDx(goBack ? g.current.width : 0);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (goBack) onBackRef.current();
      setDx(0);
      setMode("idle");
    }, SETTLE_MS);
  };

  const onPointerDown = (e) => {
    if (!enabled || mode === "settling") return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    g.current = {
      active:true, started:false,
      startX:e.clientX, startY:e.clientY,
      lastX:e.clientX, lastT:e.timeStamp, vel:0,
      width: wrapRef.current ? wrapRef.current.offsetWidth : 0,
    };
  };

  const onPointerMove = (e) => {
    const s = g.current;
    if (!s.active) return;
    const moveX = e.clientX - s.startX;
    const moveY = e.clientY - s.startY;

    if (!s.started) {
      // 垂直位移明顯較大 → 視為捲動意圖，放棄這次手勢
      if (Math.abs(moveY) > Math.abs(moveX) && Math.abs(moveY) > START_THRESHOLD) { s.active = false; return; }
      if (moveX < START_THRESHOLD) return;
      s.started = true;
      setMode("dragging");
    }

    // 以指數平滑追蹤速度（px/ms）
    const dt = e.timeStamp - s.lastT;
    if (dt > 0) s.vel = 0.7 * s.vel + 0.3 * ((e.clientX - s.lastX) / dt);
    s.lastX = e.clientX; s.lastT = e.timeStamp;

    setDx(Math.max(0, Math.min(moveX, s.width)));
  };

  const onPointerUp = (e) => {
    const s = g.current;
    if (!s.active) return;
    s.active = false;
    if (!s.started) return;
    const moveX = Math.max(0, e.clientX - s.startX);
    const goBack = moveX > s.width * CLOSE_RATIO || (s.vel > FLING_VELOCITY && moveX > FLING_MIN_DIST);
    settle(goBack);
  };

  // 系統中斷手勢（例如瀏覽器接手垂直捲動）→ 彈回原位
  const onPointerCancel = () => {
    const s = g.current;
    if (!s.active) return;
    s.active = false;
    if (s.started) settle(false);
  };

  return (
    <div ref={wrapRef} style={{ flex:1, minHeight:0, display:"flex", flexDirection:"column", position:"relative", overflow:"hidden", background:C.bg }}>
      <div style={{
        flex:1, minHeight:0, display:"flex", flexDirection:"column", background:C.bg,
        // 靜止時必須是 "none"：任何 transform（即使 translateX(0)）都會讓內部 position:fixed 的
        // BottomSheet / ConfirmDialog 改以此容器定位，導致彈窗位置跑掉
        transform: mode === "idle" ? "none" : `translateX(${dx}px)`,
        transition: mode === "settling" ? `transform ${SETTLE_MS}ms ease-out` : "none",
        boxShadow: dx > 0 ? "-8px 0 24px rgba(0,0,0,0.18)" : "none",
      }}>
        {children}
      </div>
      {enabled && (
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          style={{ position:"absolute", left:0, top:0, bottom:0, width:EDGE_WIDTH, zIndex:50, touchAction:"pan-y" }} />
      )}
    </div>
  );
}