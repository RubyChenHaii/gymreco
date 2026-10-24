import { fs } from "../theme.js";
import { useState, useRef, useLayoutEffect } from "react";
import { useC } from "../theme.js";

// 找最近的可捲動祖先（LogTab / DetailTab 外層 overflowY:auto 的容器）
const getScrollParent = (el) => {
  let p = el?.parentElement;
  while (p) {
    const oy = getComputedStyle(p).overflowY;
    if ((oy === "auto" || oy === "scroll") && p.scrollHeight > p.clientHeight) return p;
    p = p.parentElement;
  }
  return null;
};

// ── 共用外觀 ──────────────────────────────────────────────
// 編輯（AutoGrowTextarea）與顯示（CollapsibleText）共用同一套框的樣式，兩邊看起來才會一致
// tone："feeling"（預設，橘色淡底＋橘色細框，用於「當次感受」）｜"plain"（灰色淡底＋灰色細框，預留給器材、筆記等欄位）
const boxStyle = (C, tone) => ({
  width:"100%", boxSizing:"border-box", borderRadius:10, padding:"10px 12px",
  fontSize:fs(13), lineHeight:1.7, color:C.sub, fontFamily:"inherit",
  ...(tone === "plain"
    ? { background:C.f3, border:`1px solid ${C.sep}` }
    : { background:`${C.orange}08`, border:`1px solid ${C.orange}25` }),
});
const accentColor = (C, tone) => tone === "plain" ? C.label : C.orange;

// ── 編輯用：會隨內容自動增高的 textarea ──────────────────
// 用法與一般 <textarea> 相同（value / onChange / placeholder…）
// 最小高度用 minHeight 設定（預設 64）；不要在 style 傳 height，高度由這個元件控制
export function AutoGrowTextarea({ value, tone = "feeling", minHeight = 64, style = {}, onFocus, ...rest }) {
  const C = useC();
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const sp = getScrollParent(el);
    const prevTop = sp ? sp.scrollTop : 0;      // 量測前記住捲動位置
    el.style.height = "auto";
    const borders = el.offsetHeight - el.clientHeight;
    el.style.height = el.scrollHeight + borders + "px";
    if (sp) sp.scrollTop = prevTop;             // 高度塌縮又長回來後還原，避免畫面跳動
  }, [value]);

  const handleFocus = (e) => {
    onFocus?.(e);
    // 等鍵盤動畫與 App 外殼高度調整完，再把欄位捲到可視區中間
    setTimeout(() => ref.current?.scrollIntoView({ block: "center", behavior: "smooth" }), 350);
  };

  return (
    <textarea ref={ref} value={value} rows={1} onFocus={handleFocus}
      style={{ ...boxStyle(C, tone), minHeight, outline:"none", overflow:"hidden", resize:"none", ...style }}
      {...rest} />
  );
}

// ── 顯示用：可收合的文字框 ───────────────────────────────
// - 預設收合，只顯示前 collapsedLines 行；內容沒超過這個行數時，不顯示箭頭、也不能展開
// - label 選填：有的話在框的上方顯示標題列（顏色跟著 tone），超過行數時右側出現箭頭，點標題列或內容框都能展開/收合
// - 行數截斷用 CSS line-clamp：padding 放在外層、截斷設定放在內層，否則第 N+1 行的字會從 padding 區域露出來
export function CollapsibleText({ text, label, tone = "feeling", collapsedLines = 5 }) {
  const C = useC();
  const [open, setOpen] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const bodyRef = useRef(null);

  // 只在「收合狀態」量測：內容實際高度 > 截斷後的可視高度，代表有被截掉
  // 展開時量不到（沒有截斷），但展開本身就代表先前已確定超過，所以保留原值；重新收合時會再量一次
  useLayoutEffect(() => {
    const el = bodyRef.current;
    if (!el || open) return;
    setOverflowing(el.scrollHeight > el.clientHeight + 1);
  }, [text, open]);

  const toggle = () => { if (overflowing) setOpen(v => !v); };
  const accent = accentColor(C, tone);

  const clampStyle = open ? {} : {
    display:"-webkit-box", WebkitLineClamp:collapsedLines, WebkitBoxOrient:"vertical", overflow:"hidden",
  };

  return (
    <>
      {label && (
        <button onClick={toggle} aria-expanded={open} disabled={!overflowing}
          style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", background:"none", border:"none", padding:0, marginBottom:2, cursor:overflowing ? "pointer" : "default", textAlign:"left" }}>
          <span style={{ fontSize:fs(11), fontWeight:600, color:accent, letterSpacing:0.4 }}>{label}</span>
          {overflowing && (
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition:"transform 0.2s", flexShrink:0 }}>
              <path d="M6 9l6 6 6-6"/>
            </svg>
          )}
        </button>
      )}
      <div onClick={toggle} style={{ ...boxStyle(C, tone), cursor:overflowing ? "pointer" : "default" }}>
        <div ref={bodyRef} style={{ whiteSpace:"pre-wrap", ...clampStyle }}>{text}</div>
      </div>
    </>
  );
}