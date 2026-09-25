import { useC, RADIUS, FONT } from "../theme.js";

const SIZE_STYLES = {
  lg: { padding:"16px",      fontSize:FONT.headline, radius:RADIUS.xl },
  md: { padding:"11px 16px", fontSize:FONT.callout,  radius:RADIUS.lg },
  sm: { padding:"8px 14px",  fontSize:FONT.body,     radius:RADIUS.md },
};

// variant 對應現有畫面裡實際出現過的按鈕語意：
// primary = 主要 CTA（藍底白字） ／ tinted = 次要強調（淡底＋邊框，如首頁開始訓練）
// outline = 對話框取消按鈕 ／ ghost = 淺灰底次要按鈕 ／ danger = 刪除等危險動作
export function Button({ children, onClick, variant="primary", size="lg", disabled=false, fullWidth=true, style={} }) {
  const C = useC();
  const s = SIZE_STYLES[size];

  const variantStyles = {
    primary: { background: disabled ? "#C7C7CC" : C.blue, color:"#fff",  border:"none" },
    tinted:  { background: C.f3,                          color:C.blue, border:`1px solid ${C.blue}55` },
    outline: { background:"none",                         color:C.sub,  border:`1px solid ${C.sep}` },
    ghost:   { background: C.f5,                           color:C.sub,  border:"none" },
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

// 給圓形 info 按鈕用（畫面裡的「i」提示) -- 已經導入四個需要info處：RoutineTab @2處, LibraryTab, LengthPaceEditor
export function InfoButton({ onClick, size=20, style={} }) {
  const C = useC();

  return (
    <button
      onClick={onClick}
      style={{
        width: size, height: size, borderRadius: "50%",
        background: `${C.blue}25`,
        border: "none", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 0, flexShrink: 0, 
        ...style,
      }}>
      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke={C.blue} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="13" x2="12" y2="18" />
        <circle cx="12" cy="7.5" r="1.5" fill={C.blue} stroke="none"/>
      </svg>
    </button>
  );
}

// 給圓形關閉按鈕用（畫面裡的「×」關閉）-- 待導入
export function CloseButton({ onClick, size=28, style={} }) {
  const C = useC();

  return (
    <button
      onClick={onClick}
      style={{ 
        width: size, height: size, borderRadius: "50%",
        background: C.f5,
        border: "none", cursor: "pointer", 
        color: C.label, fontSize: 16,
        flexShrink: 0,
        ...style,
      }}>
      ×
    </button>
  );
}