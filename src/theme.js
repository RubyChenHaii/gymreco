import { createContext, useContext } from "react";

export const LIGHT = {
  bg:"#F2F2F7", card:"#FFFFFF", text:"#474754", sub:"#48484A",
  label:"#8E8E93", sep:"#E5E5EA", blue:"#007AFF", green:"#34C759",
  red:"#FF3B30", orange:"#FF9500", indigo:"#5856D6", yellow:"#FFCC00", Bshadow:"rgba(130, 211, 255, 0.92)",
  f5:"rgba(0,0,0,0.05)", f3:"rgba(116, 113, 113, 0.03)",
};

export const DARK = {
  bg:"#1C1C1E", card:"#2C2C2E", text:"#F2F2F7", sub:"#EBEBF5",
  label:"#8E8E93", sep:"#3A3A3C", blue:"#0A84FF", green:"#30D158",
  red:"#FF453A", orange:"#FF9F0A", indigo:"#6E6CF0", yellow:"#FFD60A", Bshadow:"rgba(0,122,255,0.3)",
  f5:"rgba(255,255,255,0.08)", f3:"rgba(255,255,255,0.04)",
};

export const DarkCtx = createContext(false);
export const useDark = () => useContext(DarkCtx);
// 所有元件透過 useC() 取得當前主題色
export const useC = () => useContext(DarkCtx) ? DARK : LIGHT;

// ── 月曆漸層資料 Context ──────────────────────────────────────────
// 「本月各顏色出現天數」統計與目前瀏覽月份，統一在 App.jsx 算一次、往下提供，
// 避免多處元件（首頁月曆、未來可能的裝飾性 Button/Card）各自重複計算
export const CalendarGradientCtx = createContext({
  topColors: [], colorTotal: 0, viewDate: new Date(), setViewDate: () => {},
});
export const useCalendarGradient = () => useContext(CalendarGradientCtx);

// ── 共用 Design Token：spacing / radius / 字級 ──────────────────
// 這些數值是依據目前各檔案實際使用頻率整理出來的常見值，
// 並非全新設計；目的是讓之後新增/重構的元件有統一依據可循，
// 現有畫面的 inline style 不會因為新增這些常數而自動改變，
// 要套用到既有元件是後續里程碑（M2 起）逐步進行的工作。

export const RADIUS = {
  xs: 6,    // 小型徽章、標籤（例：星期幾標籤）
  sm: 8,    // icon 按鈕、輸入框
  md: 10,   // NumberPicker、中型按鈕
  lg: 12,   // 一般按鈕、對話框
  xl: 16,   // 卡片、主要 CTA 按鈕
  pill: 20, // Bottom sheet 頂部圓角、圓形切換鈕
};

// ── 次層頁首（Log / Routine）共用最小高度 ──────────────────────
// Log 頁首有「副標題＋標題」兩行，Routine 只有「置中標題」一行，若各自讓 padding + 內容自然撐開，高度會對不齊。
// 兩邊頭部都套用同一個 minHeight 當地板，內容較少的一邊會被撐到同樣高度，並靠原本的 alignItems 置中，不會顯得刻意拉開。
export const SUBHEADER_MIN_HEIGHT = 64;

export const SPACING = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12,
  xxl: 16,
  xxxl: 20,
};

export const FONT = {
  caption: 11,   // 標籤、輔助文字
  footnote: 12,
  body: 13,      // 內文預設字級
  callout: 14,
  subhead: 15,
  headline: 16,
  title3: 17,    // 對話框標題、Sheet 標題
  title2: 20,    // 頁面小標題
  title1: 26,    // 首頁統計數字
  largeTitle: 28, // 頁面大標題
};

// ── 響應式尺寸工具（Container Query 版）──────────────────────
// 依「兩個參考寬度／對應數值」線性內插，轉換成 CSS clamp() 字串。
// 用 cqw（container query width）取代 vw：cqw 抓的是「最近的、設定了 container-type 的祖先容器」寬度，
// 不是整個瀏覽器視窗——不管是 Mac 預覽固定 393px 的手機外殼，iPhone SE 的 375px，iPhone Pro Max 的 440px，
// 還是真機上貼齊裝置寬度的外殼，都能拿到正確的參考寬度。
// 使用前必須確保外層有祖先元素設定了 containerType:"inline-size"（見 App.jsx 手機外殼 div）。
export const fluidSize = (minPx, maxPx, minCq = 375, maxCq = 440) => {
  const slope = (maxPx - minPx) / (maxCq - minCq);
  const base = minPx - slope * minCq;
  const cqCoeff = slope * 100;
  return `clamp(${minPx}px, calc(${base.toFixed(2)}px + ${cqCoeff.toFixed(2)}cqw), ${maxPx}px)`;
};

// ── 玻璃感（Glassmorphism）Token ──────────────────────────
// 用於浮動於內容之上的元素（Bottom Sheet 面板、對話框），讓底下內容若隱若現地透出
// 純 CSS backdrop-filter 實現，無第三方依賴；
// iOS Safari 需要同時加上 WebkitBackdropFilter 前綴才會生效，兩者缺一不可
export const GLASS_BLUR = "blur(15px) saturate(180%)"; // saturate 是刻意加的：模糊會讓顏色變灰濁，拉高飽和度可以讓透出來的顏色維持鮮豔

// 用於玻璃面板（BottomSheet）內的按鈕/清單項目，
// 讓它們跟半透明的玻璃底色之間，靠陰影製造出立體區隔，而非依賴顏色本身的對比
// 刻意做得很淺（8% 不透明度、1px 位移），只是提供「有沒有浮起來」的感覺，不會搶走視覺焦點
export const GLASS_SURFACE_SHADOW = "0 1px 3px rgba(0,0,0,0.08)";

// ── Card 立體感 Token ──────────────────────────────────────────
// 雙層陰影（近距離小模糊 + 遠距離大模糊）+ 頂部細緻高光，取代原本單層平面陰影
// 深色模式陰影加深、高光透明度降低，避免深色卡片上過曝
const CARD_SHADOW_LIGHT = "inset 0 1px 0 rgba(255,255,255,0.8), 0 1px 2px rgba(0,0,0,0.07), 0 6px 16px rgba(0,0,0,0.14)"; // 頂部高光, 近距離小陰影, 遠距離大陰影
const CARD_SHADOW_DARK  = "inset 0 1px 0 rgba(255,255,255,0.08), 0 1px 2px rgba(0,0,0,0.3), 0 6px 20px rgba(0,0,0,0.25)"; // 頂部高光, 近距離小陰影, 遠距離大陰影
export const useCardShadow = () => useDark() ? CARD_SHADOW_DARK : CARD_SHADOW_LIGHT;

const GLASS_LIGHT = { background:"rgba(242,242,247,0.78)", borderTop:"1px solid rgba(255,255,255,0.6)" };
const GLASS_DARK  = { background:"rgba(44,44,46,0.72)",    borderTop:"1px solid rgba(255,255,255,0.1)" };

export const useGlass = () => useDark() ? GLASS_DARK : GLASS_LIGHT;

// ── 色彩主題底色轉換工具 ──────────────────────────────────────
// 統一「動作顏色 → 半透明底色/邊框」的轉換規則，供 Card 元件與
// LibraryTab 的獨立色彩區塊共用，避免同一套視覺邏輯散落在多個檔案裡各自複製。
// alpha 使用十六進位色碼透明度後綴（00~FF），跟現有 COLOR_OPTS 的純色字串直接拼接。
export const TINT_BG_ALPHA     = "0C"; // 底色透明度，約 4.7%
export const TINT_BORDER_ALPHA = "60"; // 邊框透明度，約 37.6%（原本 50/60/65 不等，這次統一）

// ── 首頁月曆背景漸層 Token ──────────────────────────────────────
// 依「本月各顏色出現天數」比例混合出的動態底色
// 這個透明度是起始值，深色/淺色模式下實際效果可能不同，可依需要再拆成 LIGHT/DARK 兩組獨立微調
export const CALENDAR_GRADIENT_ALPHA = "40"; // 約 25% 不透明度

export const withAlpha = (hexColor, alphaHex) => `${hexColor}${alphaHex}`;
