import { useC, RADIUS, FONT } from "../theme.js";

const SIZE_STYLES = {
  lg: { padding:"16px",      fontSize:FONT.headline, radius:RADIUS.xl },
  md: { padding:"11px 16px", fontSize:FONT.callout,  radius:RADIUS.lg },
  sm: { padding:"8px 14px",  fontSize:FONT.body,     radius:RADIUS.md },
};

// variant 對應現有畫面裡實際出現過的按鈕語意：
// primary = 主要 CTA（藍底白字）／tinted = 次要強調（淡底＋邊框，如首頁開始訓練）
// outline = 對話框取消按鈕／ghost = 淺灰底次要按鈕／danger = 刪除等危險動作
export function Button({ children, onClick, variant="primary", size="lg", disabled=false, fullWidth=true, style={} }) {
  const C = useC();
  const s = SIZE_STYLES[size];

  const variantStyles = {
    primary: { background: disabled ? "#C7C7CC" : C.blue, color:"#fff",  border:"none" },
    tinted:  { background: C.f3,                          color:C.blue, border:`2px solid ${C.blue}55` },
    outline: { background:"none",                         color:C.sub,  border:`1px solid ${C.sep}` },
    ghost:   { background:C.f5,                           color:C.sub,  border:"none" },
    danger:  { background: disabled ? "#C7C7CC" : C.red,  color:"#fff", border:"none" },
  };

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        width: fullWidth ? "100%" : "auto",
        padding: s.padding,
        borderRadius: s.radius,
        fontSize: s.fontSize,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        boxSizing:"border-box",
        ...variantStyles[variant],
        ...style,   // 允許個別畫面覆蓋（例如特殊 boxShadow、字重），不用每個變體都預先窮舉
      }}>
      {children}
    </button>
  );
}

// 給圓形 icon-only 按鈕用（既有畫面裡的「i」提示、Bottom sheet 的「×」關閉鈕等）
export function IconButton({ children, onClick, size=28, background, style={} }) {
  const C = useC();
  return (
    <button onClick={onClick}
      style={{
        width:size, height:size, borderRadius:"50%",
        background: background || C.f5,
        border:"none", cursor:"pointer",
        display:"flex", alignItems:"center", justifyContent:"center",
        padding:0, flexShrink:0,
        color:C.label, fontSize:size * 0.6,
        ...style,
      }}>
      {children}
    </button>
  );
}