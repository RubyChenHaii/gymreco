import { createContext, useContext } from "react";

export const LIGHT = {
  bg:"#F2F2F7", card:"#FFFFFF", text:"#474754", sub:"#48484A",
  label:"#8E8E93", sep:"#E5E5EA", blue:"#007AFF", green:"#34C759",
  red:"#FF3B30", orange:"#FF9500", indigo:"#5856D6", Bshadow:"rgba(130, 211, 255, 0.92)",
  f5:"rgba(0,0,0,0.05)", f3:"rgba(116, 113, 113, 0.03)",
};

export const DARK = {
  bg:"#1C1C1E", card:"#2C2C2E", text:"#F2F2F7", sub:"#EBEBF5",
  label:"#8E8E93", sep:"#3A3A3C", blue:"#0A84FF", green:"#30D158",
  red:"#FF453A", orange:"#FF9F0A", indigo:"#6E6CF0", Bshadow:"rgba(0,122,255,0.3)",
  f5:"rgba(255,255,255,0.08)", f3:"rgba(255,255,255,0.04)",
};

export const DarkCtx = createContext(false);
export const useDark = () => useContext(DarkCtx);
// 所有元件透過 useC() 取得當前主題色
export const useC = () => useContext(DarkCtx) ? DARK : LIGHT;

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

// ── 玻璃感（Glassmorphism）Token ──────────────────────────
// 用於浮動於內容之上的元素（Bottom Sheet 面板、對話框），讓底下內容若隱若現地透出
// 純 CSS backdrop-filter 實現，無第三方依賴；
// iOS Safari 需要同時加上 WebkitBackdropFilter 前綴才會生效，兩者缺一不可
export const GLASS_BLUR = "blur(15px) saturate(180%)"; // saturate 是刻意加的：模糊會讓顏色變灰濁，拉高飽和度可以讓透出來的顏色維持鮮豔

// 用於玻璃面板（BottomSheet）內的按鈕/清單項目，
// 讓它們跟半透明的玻璃底色之間，靠陰影製造出立體區隔，而非依賴顏色本身的對比
// 刻意做得很淺（8% 不透明度、1px 位移），只是提供「有沒有浮起來」的感覺，不會搶走視覺焦點
export const GLASS_SURFACE_SHADOW = "0 1px 3px rgba(0,0,0,0.08)";

const GLASS_LIGHT = { background:"rgba(242,242,247,0.78)", borderTop:"1px solid rgba(255,255,255,0.6)" };
const GLASS_DARK  = { background:"rgba(44,44,46,0.72)",    borderTop:"1px solid rgba(255,255,255,0.1)" };

export const useGlass = () => useDark() ? GLASS_DARK : GLASS_LIGHT;

// ── 色彩主題底色轉換工具 ──────────────────────────────────────
// 統一「動作顏色 → 半透明底色/邊框」的轉換規則，供 Card 元件與
// LibraryTab 的獨立色彩區塊共用，避免同一套視覺邏輯散落在多個檔案裡各自複製。
// alpha 使用十六進位色碼透明度後綴（00~FF），跟現有 COLOR_OPTS 的純色字串直接拼接。
export const TINT_BG_ALPHA     = "0C"; // 底色透明度，約 4.7%
export const TINT_BORDER_ALPHA = "60"; // 邊框透明度，約 37.6%（原本 50/60/65 不等，這次統一）

export const withAlpha = (hexColor, alphaHex) => `${hexColor}${alphaHex}`;
