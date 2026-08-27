import { useRef, useEffect, useMemo } from "react";
import { useC } from "../theme.js";

const ITEM_H  = 36;
const VISIBLE = 5;

export function NumberPicker({ value, onChange, min = 1, max = 50, width = 52 }) {
  const C         = useC();
  const listRef   = useRef(null);
  const scrollTimer  = useRef(null);
  const isScrolling  = useRef(false);

  const nums = useMemo(() => Array.from({ length: max - min + 1 }, (_, i) => i + min), [min, max]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = (value - min) * ITEM_H;
    return () => clearTimeout(scrollTimer.current);
  }, []); // eslint-disable-line

  // value 從外部改變時同步捲動位置——但只在「目前捲動位置實際對不上」時才強制介入，
  // 避免在使用者仍在慣性捲動時被拉回，這是先前卡住問題的主要嫌疑點
  useEffect(() => {
    if (!listRef.current || isScrolling.current) return;
    const currentIdx = Math.round(listRef.current.scrollTop / ITEM_H);
    const targetIdx  = value - min;
    if (currentIdx !== targetIdx) {
      listRef.current.scrollTop = targetIdx * ITEM_H;
    }
  }, [value]); // eslint-disable-line

  const onScroll = () => {
    if (!listRef.current) return;
    isScrolling.current = true;
    clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => {
      if (!listRef.current) return;
      const idx     = Math.round(listRef.current.scrollTop / ITEM_H);
      const clamped = Math.max(0, Math.min(nums.length - 1, idx));
      onChange(nums[clamped]);
      isScrolling.current = false;
    }, 150);
  };

  return (
    <div style={{ position:"relative", width, height:ITEM_H*VISIBLE, overflow:"hidden", borderRadius:10, background:C.f5, border:`1.5px solid ${C.sep}`, flexShrink:0 }}>
      <div style={{ position:"absolute", top:"50%", left:0, right:0, height:ITEM_H, transform:"translateY(-50%)", background:`${C.blue}18`, borderTop:`1.5px solid ${C.blue}40`, borderBottom:`1.5px solid ${C.blue}40`, pointerEvents:"none", zIndex:2 }} />
      <div style={{ position:"absolute", top:0,    left:0, right:0, height:ITEM_H*1.5, background:`linear-gradient(to bottom,${C.f5},transparent)`, pointerEvents:"none", zIndex:2 }} />
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:ITEM_H*1.5, background:`linear-gradient(to top,${C.f5},transparent)`,    pointerEvents:"none", zIndex:2 }} />
      <div ref={listRef} onScroll={onScroll}
        style={{
          height:"100%", overflowY:"scroll", scrollbarWidth:"none", WebkitOverflowScrolling:"touch",
          paddingTop:ITEM_H*2, paddingBottom:ITEM_H*2,
          scrollSnapType:"y mandatory",
          overscrollBehavior:"contain",   // 新增：防止捲到底時把捲動權「讓」給外層頁面
          touchAction:"pan-y",            // 新增：明確告知瀏覽器這是獨立的垂直捲動區域
          boxSizing:"border-box",
        }}>
        <style>{`.num-picker-scroll::-webkit-scrollbar{display:none}`}</style>
        <div className="num-picker-scroll">
          {nums.map(n => (
            <div key={n} style={{
              height:ITEM_H, display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:n===value?17:14, fontWeight:n===value?700:400,
              color:n===value?C.blue:C.label, transition:"all 0.15s",
              scrollSnapAlign:"center",
            }}>
              {n}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}