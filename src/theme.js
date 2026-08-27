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
