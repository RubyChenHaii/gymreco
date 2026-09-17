import { useState, useRef } from "react";
import { useC, useGlass, GLASS_BLUR } from "../theme.js";

const DRAG_CLOSE_THRESHOLD = 80; // 拖曳超過這個距離（px）放開才會觸發關閉，數值可自行調整靈敏度

// title 選填：不帶 title 時不顯示標題列（目前 5 處都有標題，先保留彈性）
// zIndex 預設 200，若這個 Sheet 需要疊在另一個 Sheet 之上（例如 LogTab 的新增動作 sheet），呼叫端傳 300
export function BottomSheet({ open, onClose, title, children, maxHeight = "75vh", zIndex = 200 }) {
  const C = useC();
  const glass = useGlass();
  const [dragY, setDragY] = useState(0);
  const dragging = useRef(false);
  const startY   = useRef(0);

  if (!open) return null;

  const handleTouchStart = (e) => {
    dragging.current = true;
    startY.current = e.touches[0].clientY;
  };
  const handleTouchMove = (e) => {
    if (!dragging.current) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0) setDragY(delta); // 只允許往下拖，往上不做效果
  };
  const handleTouchEnd = () => {
    dragging.current = false;
    if (dragY > DRAG_CLOSE_THRESHOLD) {
      onClose();
    }
    setDragY(0); // 不論是否觸發關閉，放開後面板都重置回原位（若已關閉，重置對畫面已無影響）
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", display:"flex", flexDirection:"column", zIndex }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        marginTop:"auto", borderRadius:"20px 20px 0 0", maxHeight, display:"flex", flexDirection:"column", overflow:"hidden",
        background:glass.background, backdropFilter:GLASS_BLUR, WebkitBackdropFilter:GLASS_BLUR, borderTop:glass.borderTop,
        transform:`translateY(${dragY}px)`,
        transition: dragging.current ? "none" : "transform 0.25s ease-out", // 拖曳中即時跟隨手指、放開後才有動畫回彈
      }}>
        {/* 下方區段爲 BottomSheet 頂端的「拖拉把手」，現在具備真實的可拖曳行為 */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          // style padding: 上方、左右、下方。
          style={{ display:"flex", justifyContent:"center", padding:"10px 0 4px", flexShrink:0, cursor:"grab", touchAction:"none" }}>
          <div style={{ width:36, height:4, borderRadius:2, background:C.sep }} />
        </div>
        {/* 下方區段爲標題列：包含 BottomSheet 左上角的 Title 及右上角的「關閉 X」按鈕 ，包在一個 div 中 */}
        {title && (
            <div style={{ padding:"3px 20px 20px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:`1px solid ${C.sep}`, flexShrink:0}}>
             <span style={{ fontSize:17, fontWeight:700, color:C.text }}>{title}</span>
                {/* 下方二行爲右上角的「關閉 X」按鈕樣式 */}
             <button onClick={onClose}
                style={{ background:C.f5, border:"none", borderRadius:"50%", width:28, height:28, color:C.label, fontSize:16, cursor:"pointer", flexShrink:0 }}>×</button>
            </div>
        )}
        {children}
      </div>
    </div>
  );
}